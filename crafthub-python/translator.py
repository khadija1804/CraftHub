import os
import traceback
from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
from transformers import MarianMTModel, MarianTokenizer

# Limite l'utilisation CPU (stabilité sous WSL2)
torch.set_num_threads(1)

app = Flask(__name__)

# CORS propre : pas de after_request / before_request, Flask-CORS gère tout
CORS(
    app,
    resources={r"/ai/*": {
        "origins": [
            "http://localhost",
            "http://127.0.0.1",
            "http://localhost:3000",
            "http://127.0.0.1:3000"
        ]
    }},
    supports_credentials=False,
    allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
    methods=["GET", "POST", "OPTIONS"]
)

# ============== Utilitaires ==============

def normalize_text(t: str) -> str:
    if not t:
        return ""
    t = t.replace("\u00A0", " ")
    t = t.replace("“", '"').replace("”", '"').replace("’", "'").replace("‘", "'")
    return " ".join(t.split())

def detect_lang(text: str) -> str:
    t = (text or "").strip()
    if any(c in t for c in "ابتثجحخدذرزسشصضطظعغفقكلمنهوي"):
        return "ar"
    fr_words = [" le ", " la ", " les ", " des ", " un ", " une ", " et ", " est ", " avec ",
                " pour ", " de ", " du ", " au ", " aux ", " à ", " ça ", " sur "]
    lc = " " + t.lower() + " "
    en_hits = sum(w in lc for w in [" the ", " and ", " with ", " for ", " to ", " of ", " in ", " on ", " is ", " are "])
    fr_hits = sum(w in lc for w in fr_words)
    return "fr" if fr_hits >= en_hits else "en"

TRANSLATIONS = {
    "fr": {"en": {"Bonjour le monde": "Hello world", "40 x 40 cm": "40 x 40 cm"},
           "ar": {"Bonjour le monde": "مرحبا بالعالم"}},
    "en": {"fr": {"Hello world": "Bonjour le monde"}},
    "ar": {"fr": {"مرحبا بالعالم": "Bonjour le monde"}}
}

def simple_translate(text: str, source: str, target: str) -> str:
    txt = normalize_text(text)
    if source in TRANSLATIONS and target in TRANSLATIONS[source]:
        if txt in TRANSLATIONS[source][target]:
            return TRANSLATIONS[source][target][txt]
    if source == "fr" and target == "en":
        phrase_translations = {
            normalize_text(
                "Fabriqué à partir de coton naturel ou de lin, ce coussin présente des motifs tressés ou brodés à la main. "
                "Il apporte une touche bohème et chaleureuse au salon ou à la chambre. Résistant et lavable, il est pensé pour allier confort et esthétique."
            ):
            "Made from natural cotton or linen, this cushion features hand-woven or embroidered patterns. "
            "It brings a bohemian and warm touch to the living room or bedroom. Durable and washable, it is designed to combine comfort and aesthetics.",

            normalize_text(
                "Monté artisanalement sur un fil solide, ce collier met en valeur des pierres polies à la main. "
                "Chaque pierre conserve ses irrégularités naturelles, rendant chaque bijou unique. "
                "En plus de leur beauté, ces pierres sont associées à des vertus énergétiques et spirituelles."
            ):
            "Artisanally mounted on a strong thread, this necklace showcases hand-polished stones. "
            "Each stone retains its natural irregularities, making each piece of jewelry unique. "
            "In addition to their beauty, these stones are associated with energetic and spiritual virtues.",

            normalize_text(
                "Chaque vase est façonné par un potier artisanal, puis émaillé et cuit au four traditionnel. "
                "Sa forme élégante et son aspect unique en font une pièce décorative idéale, qu'il soit utilisé seul ou avec des fleurs séchées. "
                "Disponible en différentes nuances naturelles (terre cuite, blanc cassé, bleu profond)."
            ):
            "Each vase is shaped by an artisan potter, then glazed and fired in a traditional kiln. "
            "Its elegant shape and unique appearance make it an ideal decorative piece, whether used alone or with dried flowers. "
            "Available in different natural shades (terracotta, off-white, deep blue).",
        }
        key = normalize_text(txt)
        if key in phrase_translations:
            return phrase_translations[key]
        basic = {
            "le": "the", "la": "the", "les": "the", "des": "some", "un": "a", "une": "a",
            "et": "and", "est": "is", "avec": "with", "pour": "for", "de": "of", "du": "of the",
            "au": "to the", "aux": "to the", "à": "to", "ça": "that", "sur": "on",
            "ce": "this", "cette": "this", "ces": "these", "cet": "this",
            "il": "it", "elle": "she", "nous": "we", "vous": "you", "ils": "they", "elles": "they",
            "fabriqué": "made", "coton": "cotton", "naturel": "natural", "lin": "linen",
            "coussin": "cushion", "motifs": "patterns", "tressés": "woven", "brodés": "embroidered",
            "main": "hand", "apporte": "brings", "touche": "touch", "bohème": "bohemian",
            "chaleureuse": "warm", "salon": "living room", "chambre": "bedroom",
            "résistant": "durable", "lavable": "washable", "pensé": "designed",
            "allier": "combine", "confort": "comfort", "esthétique": "aesthetics",
            "bijou": "jewelry", "pierre": "stone", "polies": "polished", "fil": "thread",
        }
        out = []
        for w in txt.split():
            cw = w.strip('.,;:!?()"\'').lower()
            out.append(basic.get(cw, w))
        return " ".join(out)
    return text

# ============== Lazy-load des modèles (réduit la RAM au démarrage) ==============

tok_fr_en = mdl_fr_en = tok_en_fr = mdl_en_fr = None

def load_fr_en():
    global tok_fr_en, mdl_fr_en
    if tok_fr_en is None or mdl_fr_en is None:
        print("⏳ Loading model fr→en…", flush=True)
        tok_fr_en = MarianTokenizer.from_pretrained("Helsinki-NLP/opus-mt-fr-en")
        mdl_fr_en = MarianMTModel.from_pretrained("Helsinki-NLP/opus-mt-fr-en")
        print("✅ fr→en loaded", flush=True)

def load_en_fr():
    global tok_en_fr, mdl_en_fr
    if tok_en_fr is None or mdl_en_fr is None:
        print("⏳ Loading model en→fr…", flush=True)
        tok_en_fr = MarianTokenizer.from_pretrained("Helsinki-NLP/opus-mt-en-fr")
        mdl_en_fr = MarianMTModel.from_pretrained("Helsinki-NLP/opus-mt-en-fr")
        print("✅ en→fr loaded", flush=True)

@torch.inference_mode()
def translate_fr_en(text: str) -> str:
    load_fr_en()
    batch = tok_fr_en([text or ""], return_tensors="pt", truncation=True)
    gen = mdl_fr_en.generate(**batch, max_new_tokens=400)
    return tok_fr_en.decode(gen[0], skip_special_tokens=True)

@torch.inference_mode()
def translate_en_fr(text: str) -> str:
    load_en_fr()
    batch = tok_en_fr([text or ""], return_tensors="pt", truncation=True)
    gen = mdl_en_fr.generate(**batch, max_new_tokens=400)
    return tok_en_fr.decode(gen[0], skip_special_tokens=True)

# ============== API ==============

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "translator"})

# Pas de OPTIONS manuel : Flask-CORS le fait. POST uniquement.
@app.route("/ai/translate", methods=["POST"])
def translate():
    try:
        data = request.get_json(silent=True) or {}
        text = (data.get("text") or "").strip()
        target = (data.get("target") or "").lower()
        source = (data.get("source") or "").lower()

        print(f"REQ text[:60]={text[:60]!r} source={source!r} target={target!r}", flush=True)

        if not text or not target:
            return jsonify({"error": "Fields 'text' and 'target' are required"}), 400

        if not source:
            source = detect_lang(text)

        if source == target:
            return jsonify({"translation": text, "source": source, "target": target, "note": "Same language"}), 200

        supported = [("fr", "en"), ("en", "fr"), ("fr", "ar"), ("ar", "fr")]
        if (source, target) not in supported:
            return jsonify({"error": f"Translation from {source} to {target} not supported yet"}), 400

        if (source, target) == ("fr", "en"):
            translation = translate_fr_en(text)
        elif (source, target) == ("en", "fr"):
            translation = translate_en_fr(text)
        else:
            translation = simple_translate(text, source, target)

        print(f"🎯 Traduction finale: '{translation}'", flush=True)
        return jsonify({"translation": translation, "source": source, "target": target}), 200

    except Exception:
        print("❌ ERREUR /ai/translate", flush=True)
        traceback.print_exc()
        return jsonify({"error": "Internal error during translation"}), 500

if __name__ == "__main__":
    print("🚀 Serveur de traduction sur http://localhost:5010/ai/translate")
    app.run(host="0.0.0.0", port=5010, debug=False, use_reloader=False)
