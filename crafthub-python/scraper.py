# scraper.py — estimation réaliste multi-sources (eBay + Amazon + Google Shopping)
# --------------------------------------------------------------------------------
# POST /estimate-price-from-scrape  { "name": "..." }
# -> {
#   "estimated_price": number|null,
#   "suggested_low": number|null,
#   "suggested_high": number|null,
#   "stats": { "median","q1","q3","low","high","min","max","count" },
#   "offers": [ { "title","url","price","source","domain","sim" } ],
#   "samples": [ { "link","snippet_price_usd":[...] } ],   # rétro-compat
#   "message": string|null
# }
# --------------------------------------------------------------------------------

from flask import Flask, request, jsonify
from flask_cors import CORS
import os, re, math, logging, html as _html
import requests
import unicodedata
from dotenv import load_dotenv

load_dotenv()  # charge .env (SERPAPI_KEY)

# ============== App & Logs ==============
app = Flask(__name__)
CORS(app, resources={r"/estimate-price-from-scrape": {"origins": ["http://localhost:3000", "http://localhost:5173"]}})
logging.basicConfig(level=logging.INFO, filename='scraping.log', format="%(asctime)s - %(levelname)s - %(message)s")
log = logging.getLogger("scraper-multi")

# ============== Réseau / limites ==============
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
    "Accept-Language": "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7",
}
TIMEOUT = 10
MAX_DETAIL_PAGES_PER_SOURCE = 4
MAX_TOTAL_REQUESTS = 18

# ============== Devises & prix ==============
FX = {'USD': 1.0, 'EUR': 1.10, 'GBP': 1.30}
PRICE_MIN, PRICE_MAX = 0.5, 5000.0

PRICE_RE_GENERIC = re.compile(
    r'[\$£€]\s?(\d{1,4}(?:[.,]\d{1,2})?)\b|'             # $ 12.34 / € 9,99 / £ 25
    r'\b(\d{1,4}(?:[.,]\d{1,2})?)\s?(?:usd|eur|gbp)\b',  # 12.34 usd / 15 eur
    re.IGNORECASE
)
MULTIPACK_HINT = re.compile(r'\b(x\s?\d+|lot\s+de\s+\d+|pack\s?\d+|\d+\s?(?:pcs|pieces?))\b', re.I)

def _detect_currency(text: str):
    t = text.lower()
    if '€' in t or ' eur' in t:
        return 'EUR'
    if '£' in t or ' gbp' in t:
        return 'GBP'
    return 'USD'

def _prices_from_text_usd(text: str):
    t = text.lower()
    cur = _detect_currency(t)
    fx = FX.get(cur, 1.0)
    out = []
    for m in PRICE_RE_GENERIC.findall(t):
        amt = m[0] or m[1]
        if not amt:
            continue
        try:
            val = float(amt.replace(',', '.').replace(' ', ''))
            if PRICE_MIN <= val <= PRICE_MAX:
                out.append(round(val * fx, 2))
        except Exception:
            pass
    return out

def _domain(url: str):
    try:
        return re.sub(r'^www\.', '', requests.utils.urlparse(url).hostname or '')
    except Exception:
        return ''

# ============== BoW + cosine ==============
def _tok(s: str):
    s = (s or '').lower()
    s = unicodedata.normalize('NFD', s)        # retire les diacritiques
    s = re.sub(r'[\u0300-\u036f]', '', s)
    s = re.sub(r'[^a-z0-9\s]', ' ', s)
    return [w for w in s.split() if w]

def _bow(tokens):
    d = {}
    for t in tokens:
        d[t] = d.get(t, 0) + 1
    return d

def _cos(a, b):
    keys = set(a) | set(b)
    dot = sum(a.get(k, 0) * b.get(k, 0) for k in keys)
    na = math.sqrt(sum(v*v for v in a.values()))
    nb = math.sqrt(sum(v*v for v in b.values()))
    return (dot / (na*nb)) if (na and nb) else 0.0

# ============== Stats robustes ==============
def _median(arr):
    if not arr:
        return None
    s = sorted(arr)
    m = len(s) // 2
    return s[m] if len(s) % 2 else (s[m-1] + s[m]) / 2

def _quantile(arr, q):
    if not arr:
        return None
    s = sorted(arr)
    pos = (len(s)-1) * q
    base = int(pos)
    rest = pos - base
    return s[base] + rest * (s[base+1] - s[base]) if base+1 < len(s) else s[base]

def _iqr_bounds(arr, k=1.5):
    q1 = _quantile(arr, 0.25)
    q3 = _quantile(arr, 0.75)
    if q1 is None or q3 is None:
        return None, None, q1, q3
    iqr = q3 - q1
    return q1 - k*iqr, q3 + k*iqr, q1, q3

# ============== FR ↔ EN local pour le NOM ==============
WORD_MAP_FR_EN = {
    "huile d'olive":"olive oil","bois":"wood","céramique":"ceramic","ceramique":"ceramic",
    "métal":"metal","verre":"glass","cuir":"leather","lin":"linen","argile":"clay",
    "savon":"soap","bougie":"candle","plat":"dish","assiette":"plate","tasse":"mug",
    "lampe":"lamp","bol":"bowl"
}
WORD_MAP_EN_FR = {v: k for k, v in WORD_MAP_FR_EN.items()}

def _looks_fr(s: str):
    return bool(re.search(r"[àâçéèêëîïôùûüÿœ]", s.lower()))

def _map_words_once(s: str, mapping: dict):
    out = s
    for a, b in mapping.items():
        out = re.sub(rf'\b{re.escape(a)}\b', b, out, flags=re.IGNORECASE)
    return out

def _build_variants(name: str):
    base = (name or "").strip()
    if not base:
        return []
    low = base.lower()
    variants = [base]
    if _looks_fr(low):
        en = _map_words_once(low, WORD_MAP_FR_EN)
        if en != low:
            variants.append(en)
    else:
        fr = _map_words_once(low, WORD_MAP_EN_FR)
        if fr != low:
            variants.append(fr)
    seen, out = set(), []
    for v in variants:
        if v and v not in seen:
            seen.add(v)
            out.append(v)
    return out[:2]

# ============== Réseau util ==============
_request_count = 0
def _fetch(url):
    global _request_count
    if _request_count >= MAX_TOTAL_REQUESTS:
        return ""
    _request_count += 1
    try:
        r = requests.get(url, headers=HEADERS, timeout=TIMEOUT)
        if r.status_code == 200 and r.text:
            return r.text
    except Exception:
        return ""
    return ""

# ============== eBay (listing + détail) ==============
def _ebay_search_us(q: str):
    url = f"https://www.ebay.com/sch/i.html?_nkw={requests.utils.quote(q)}&_sop=12&LH_BIN=1&_ipg=60"
    return url, _fetch(url)

def _ebay_search_fr(q: str):
    url = f"https://www.ebay.fr/sch/i.html?_nkw={requests.utils.quote(q)}&_sop=12&LH_BIN=1&_ipg=60"
    return url, _fetch(url)

def _extract_titles_links(html_text: str):
    items = []
    for m in re.finditer(
        r'<a[^>]+class="s-item__link"[^>]+href="([^"]+)"[^>]*>\s*<h3[^>]*class="s-item__title"[^>]*>(.*?)</h3>',
        html_text, flags=re.I | re.S
    ):
        url = _html.unescape(m.group(1))
        title = _html.unescape(re.sub(r'<[^>]+>', '', m.group(2))).strip()
        items.append((title, url))
    if not items:
        links = re.findall(r'<a[^>]+href="(https://www\.ebay\.[^"]+/itm/[^"]+)"', html_text, flags=re.I)
        for u in dict.fromkeys(links):
            items.append(('', _html.unescape(u)))
    seen = set()
    out = []
    for t, u in items:
        if u not in seen:
            seen.add(u)
            out.append((t, u))
    return out

_LISTING_PRICE_HINTS = [
    r'class="s-item__price">([^<]+)<',
    r'"price"\s*:\s*"(\d+(?:[.,]\d{1,2})?)"',
    r'"priceCurrency"\s*:\s*"[A-Z]{3}"[^}]*"price"\s*:\s*"(\d+(?:[.,]\d{1,2})?)"',
]

def _parse_listing_prices(html_text: str):
    prices = _prices_from_text_usd(html_text)
    for pat in _LISTING_PRICE_HINTS:
        for m in re.findall(pat, html_text, flags=re.I):
            prices += _prices_from_text_usd(_html.unescape(m))
    return prices

def _parse_item_detail(html_text: str):
    prices = []
    for cur, amt in re.findall(
        r'"priceCurrency"\s*:\s*"([A-Z]{3})"\s*,\s*"price"\s*:\s*"(\d+(?:[.,]\d{1,2})?)"',
        html_text, flags=re.I
    ):
        try:
            val = float(amt.replace(',', '.'))
            if PRICE_MIN <= val <= PRICE_MAX:
                fx = FX.get(cur.upper(), 1.0)
                prices.append(round(val * fx, 2))
        except Exception:
            pass
    if not prices:
        prices += _prices_from_text_usd(html_text)

    title = None
    m = re.search(r'"name"\s*:\s*"([^"]+)"', html_text)
    if m:
        title = _html.unescape(m.group(1)).strip()
    if not title:
        m = re.search(r'<title[^>]*>([^<]+)</title>', html_text, flags=re.I)
        if m:
            title = _html.unescape(m.group(1)).strip()
    return prices, (title or '').strip()

# ============== Google Shopping (SerpAPI) ==============
def _fetch_google_shopping(query: str, limit: int = 12):
    key = os.getenv("SERPAPI_KEY", "")
    if not key:
        print("[GSHOP] SERPAPI_KEY manquante")
        return []

    url = "https://serpapi.com/search.json"
    params = {
        "engine": "google_shopping",
        "q": query,
        "hl": "fr",
        "gl": "fr",
        "api_key": key,
        "num": limit
    }
    try:
        r = requests.get(url, params=params, timeout=12)
        r.raise_for_status()
        results = r.json()
    except Exception as e:
        print("[GSHOP] HTTP error:", e)
        return []

    products = results.get("shopping_results", []) or []
    print(f"[GSHOP] shopping_results: {len(products)} items")

    offers = []
    for p in products[:limit]:
        title = (p.get("title") or p.get("name") or "").strip()
        link  = (p.get("link") or p.get("product_link") or "").strip()
        price = None

        if p.get("extracted_price") is not None:
            try:
                price = float(p["extracted_price"])
            except Exception:
                price = None
        if price is None and p.get("price"):
            try:
                clean = re.sub(r"[^\d.,]", "", str(p["price"]))
                price = float(clean.replace(",", "."))
            except Exception:
                price = None

        if link and title:
            offers.append({
                "title": title,
                "url": link,
                "price": price,
                "currency": "EUR",
                "source": "gshopping",
                "domain": _domain(link)
            })
    print(f"[GSHOP] offers built: {len(offers)}")

    return offers

# ============== Amazon (SerpAPI) ==============
def _fetch_amazon(query: str, limit: int = 12):
    key = os.getenv("SERPAPI_KEY", "")
    if not key:
        print("[AMAZON] SERPAPI_KEY manquante")
        return []

    url = "https://serpapi.com/search.json"
    params = {
        "engine": "amazon",
        "amazon_domain": "amazon.fr",
        "type": "search",
        "k": query,          # IMPORTANT : 'k' et NON 'q'
        "page": 1,
        "api_key": key,
        "num": limit
    }
    try:
        r = requests.get(url, params=params, timeout=12)
        r.raise_for_status()
        results = r.json()
    except Exception as e:
        print("[AMAZON] HTTP error:", e)
        return []

    if isinstance(results, dict) and results.get("error"):
        print("[AMAZON] API error:", results.get("error"))
        return []

    products = results.get("organic_results", []) or results.get("search_results", []) or []
    print(f"[AMAZON] results: {len(products)} items")

    offers = []
    for p in products[:limit]:
        title = (p.get("title") or "").strip()
        link = (p.get("link") or "").strip()
        price = None

        if isinstance(p.get("price"), dict) and p["price"].get("value") is not None:
            try:
                price = float(p["price"]["value"])
            except Exception:
                price = None
        if price is None and p.get("price"):
            try:
                clean = re.sub(r"[^\d.,]", "", str(p["price"]))
                price = float(clean.replace(",", "."))
            except Exception:
                price = None

        if link and title:
            offers.append({
                "title": title, "url": link, "price": price,
                "currency": "EUR", "source": "amazon", "domain": _domain(link)
            })
    return offers

# ============== Cœur : estimation par NOM ==============
def estimate_by_name(name: str):
    global _request_count
    _request_count = 0

    variants = _build_variants(name)
    if not variants:
        return {"estimated_price": None, "samples": [], "offers": [], "message": "Nom vide."}

    bow_name = _bow(_tok(name))
    collected_prices = []
    offers_all = []
    samples = []

    for q in variants:
        # -------- eBay --------
        for src in (_ebay_search_us, _ebay_search_fr):
            list_url, list_html = src(q)
            if not list_html:
                continue

            list_prices = _parse_listing_prices(list_html)
            if list_prices:
                collected_prices.extend(list_prices[:20])
                if len(samples) < 5:
                    samples.append({"link": list_url, "snippet_price_usd": list_prices[:3]})

            items = _extract_titles_links(list_html)
            for title, link in items[:MAX_DETAIL_PAGES_PER_SOURCE]:
                detail_html = _fetch(link)
                if not detail_html:
                    continue
                p_detail, t_detail = _parse_item_detail(detail_html)
                title_final = (t_detail or title or '').strip()

                # (Désactivé pour debug) Filtre multipack
                # if MULTIPACK_HINT.search(title_final):
                #     continue

                sim = _cos(bow_name, _bow(_tok(title_final)))
                if sim >= 0.2:
                    if p_detail:
                        collected_prices.extend(p_detail[:2])
                    offers_all.append({
                        "title": title_final or "Offre concurrente",
                        "url": link,
                        "price": p_detail[0] if p_detail else None,
                        "currency": "USD",
                        "source": "ebay",
                        "domain": _domain(link),
                        "sim": round(sim, 3)
                    })

        # -------- Amazon (SerpAPI) --------
        try:
            az = _fetch_amazon(q)
            print(f"[DEBUG] Amazon results for '{q}': {len(az)}")
            for o in az:
                title_o = o.get("title", "")
                # if MULTIPACK_HINT.search(title_o):
                #     continue
                sim = _cos(bow_name, _bow(_tok(title_o)))
                if sim >= 0.1:  # seuil abaissé
                    offers_all.append({**o, "sim": round(sim, 3)})
                    if o.get("price") is not None:
                        collected_prices.append(float(o["price"]) * FX.get(o.get("currency", "EUR"), 1.0))
        except Exception as e:
            print("[DEBUG] Amazon adapter error:", e)

        # -------- Google Shopping (SerpAPI) --------
        try:
            gs = _fetch_google_shopping(q)
            print(f"[DEBUG] GShopping results for '{q}': {len(gs)}")
            for o in gs:
                title_o = o.get("title", "")
                # if MULTIPACK_HINT.search(title_o):
                #     continue
                sim = _cos(bow_name, _bow(_tok(title_o)))
                if sim >= 0.1:  # seuil abaissé
                    offers_all.append({**o, "sim": round(sim, 3)})
                    if o.get("price") is not None:
                        collected_prices.append(float(o["price"]) * FX.get(o.get("currency", "EUR"), 1.0))
        except Exception as e:
            print("[DEBUG] GShopping adapter error:", e)

        if len(collected_prices) >= 120 or _request_count >= MAX_TOTAL_REQUESTS:
            break

    # -------- Stats robustes --------
    prices = [p for p in collected_prices if PRICE_MIN <= p <= PRICE_MAX]
    if not prices and not offers_all:
        return {
            "estimated_price": None, "suggested_low": None, "suggested_high": None,
            "stats": {"median": None, "q1": None, "q3": None, "low": None, "high": None, "min": None, "max": None, "count": 0},
            "offers": [], "samples": samples, "message": "Aucun prix pertinent trouvé."
        }

    med = _median(prices) if prices else None
    low, high, q1, q3 = _iqr_bounds(prices) if prices else (None, None, None, None)
    pmin = min(prices) if prices else None
    pmax = max(prices) if prices else None

    core = prices
    if low is not None and high is not None:
        core = [p for p in prices if low <= p <= high]
    if not core and prices:
        core = prices

    estimated = round(_median(core), 2) if core else None

    suggested_low = suggested_high = None
    if estimated is not None:
        band_low = estimated * 0.85
        band_high = estimated * 1.15
        if q1 is not None:
            band_low = max(band_low, q1)
        if q3 is not None:
            band_high = min(band_high, q3)
        if band_low > band_high:
            band_low, band_high = min(band_low, band_high), max(band_low, band_high)
        suggested_low = round(band_low, 2)
        suggested_high = round(band_high, 2)

    # tri par pertinence texte décroissante
    offers_all.sort(key=lambda x: x.get("sim", 0.0), reverse=True)

    return {
        "estimated_price": float(estimated) if estimated is not None else None,
        "suggested_low": float(suggested_low) if suggested_low is not None else None,
        "suggested_high": float(suggested_high) if suggested_high is not None else None,
        "stats": {
            "median": float(med) if med is not None else None,
            "q1": float(q1) if q1 is not None else None,
            "q3": float(q3) if q3 is not None else None,
            "low": float(low) if low is not None else None,
            "high": float(high) if high is not None else None,
            "min": float(pmin) if pmin is not None else None,
            "max": float(pmax) if pmax is not None else None,
            "count": len(prices)
        },
        "offers": offers_all,
        "samples": samples,
        "message": None
    }

# ============== API ==============
@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "engine": "ebay + amazon(serpapi) + gshopping(serpapi) + similarity + iqr",
        "max_requests": MAX_TOTAL_REQUESTS,
        "follow_details_per_source": MAX_DETAIL_PAGES_PER_SOURCE
    }), 200

@app.route("/estimate-price-from-scrape", methods=["POST", "OPTIONS"])
def estimate_price():
    if request.method == "OPTIONS":
        return jsonify({}), 200

    data = request.get_json(silent=True) or {}
    name = (data.get("name") or data.get("product_name") or "").strip()
    if not name:
        return jsonify({'error': 'Field "name" is required.', 'received': {'name': name}}), 400

    GENERIC = {"savon","soap","bougie","candle","assiette","plate","tasse","mug","lampe","lamp","bol","bowl","plat","dish"}
    if len(name) < 4 or name.lower() in GENERIC:
        return jsonify({
            "estimated_price": None, "suggested_low": None, "suggested_high": None,
            "stats": {"median": None, "q1": None, "q3": None, "low": None, "high": None, "min": None, "max": None, "count": 0},
            "offers": [], "samples": [],
            "message": "Nom trop générique — ajoute 1–2 mots (ex: ‘savon olive marseille 125g’, ‘bol en bois artisanal’)."
        }), 200

    res = estimate_by_name(name)
    return jsonify(res), 200

@app.errorhandler(Exception)
def handle_exception(e):
    log.error(f"Unhandled exception: {e}")
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == "__main__":
    # Petit log pour vérifier la clé
    print("SERPAPI_KEY loaded? ->", bool(os.getenv("SERPAPI_KEY")))
    app.run(host="0.0.0.0", port=5005, debug=True, use_reloader=False)
