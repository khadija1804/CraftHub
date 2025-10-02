# translator.py
import os
import traceback
from flask import Flask, request, jsonify
from flask_cors import CORS

# --- Hugging Face MarianMT (FR<->EN) ---
from transformers import MarianMTModel, MarianTokenizer
import torch

app = Flask(__name__)
# Autorise ton front React local
CORS(app, resources={r"/*": {"origins": ["http://localhost:3000"]}})

# =========================
#  Utilitaires & modèles
# =========================

def normalize_text(t: str) -> str:
    """Nettoie légèrement le texte pour éviter les faux négatifs (NBSP, guillemets, espaces)."""
    if not t:
        return ""
    t = t.replace("\u00A0", " ")  # NBSP -> espace normal
    # guillemets typographiques -> guillemets simples
    t = t.replace("“", '"').replace("”", '"').replace("’", "'").replace("‘", "'")
    return " ".join(t.split())  # compresser espaces

def detect_lang(text: str) -> str:
    """Heuristique simple FR/EN/AR."""
    t = (text or "").strip()
    if any(c in t for c in "ابتثجحخدذرزسشصضطظعغفقكلمنهوي"):  # arabe : simple heuristique
        return "ar"
    fr_words = [" le ", " la ", " les ", " des ", " un ", " une ", " et ", " est ", " avec ",
                " pour ", " de ", " du ", " au ", " aux ", " à ", " ça ", " sur "]
    lc = " " + t.lower() + " "
    en_hits = sum(w in lc for w in [" the ", " and ", " with ", " for ", " to ", " of ", " in ", " on ", " is ", " are "])
    fr_hits = sum(w in lc for w in fr_words)
    return "fr" if fr_hits >= en_hits else "en"

# Dictionnaire ultra-simple pour fallback (utile pour FR<->AR ou cas non couverts)
TRANSLATIONS = {
    "fr": {
        "en": {
            "Bonjour le monde": "Hello world",
            "40 x 40 cm": "40 x 40 cm",
        },
        "ar": {
            "Bonjour le monde": "مرحبا بالعالم",
        }
    },
    "en": {
        "fr": {
            "Hello world": "Bonjour le monde",
        }
    },
    "ar": {
        "fr": {
            "مرحبا بالعالم": "Bonjour le monde",
        }
    }
}

def simple_translate(text: str, source: str, target: str) -> str:
    """
    Fallback très simple :
    1) correspondance exacte via TRANSLATIONS
    2) quelques phrases FR connues -> EN
    3) mini glossaire mot-à-mot (limité)
    """
    txt = normalize_text(text)

    # 1) Dico direct exact
    if source in TRANSLATIONS and target in TRANSLATIONS[source]:
        if txt in TRANSLATIONS[source][target]:
            return TRANSLATIONS[source][target][txt]

    # 2) Phrases FR -> EN (exemples de ton projet)
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

        # 3) Mini glossaire (mot à mot) – très limité
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

    # Par défaut : renvoyer le texte
    return text

# Charger les modèles Marian une fois (au démarrage)
# Conseil : lance d’abord warmup_download.py pour mettre en cache les modèles.
tok_fr_en = MarianTokenizer.from_pretrained("Helsinki-NLP/opus-mt-fr-en")
mdl_fr_en = MarianMTModel.from_pretrained("Helsinki-NLP/opus-mt-fr-en")

tok_en_fr = MarianTokenizer.from_pretrained("Helsinki-NLP/opus-mt-en-fr")
mdl_en_fr = MarianMTModel.from_pretrained("Helsinki-NLP/opus-mt-en-fr")

def translate_fr_en(text: str) -> str:
    text = text or ""
    batch = tok_fr_en([text], return_tensors="pt", truncation=True)
    gen = mdl_fr_en.generate(**batch, max_new_tokens=400)
    return tok_fr_en.decode(gen[0], skip_special_tokens=True)

def translate_en_fr(text: str) -> str:
    text = text or ""
    batch = tok_en_fr([text], return_tensors="pt", truncation=True)
    gen = mdl_en_fr.generate(**batch, max_new_tokens=400)
    return tok_en_fr.decode(gen[0], skip_special_tokens=True)

# =========================
#           API
# =========================

@app.route("/ai/translate", methods=["POST", "OPTIONS"])
def translate():
    if request.method == "OPTIONS":
        return ("", 204)
    try:
        data = request.get_json(silent=True) or {}
        text = (data.get("text") or "").strip()
        target = (data.get("target") or "").lower()   # ex: "en"
        source = (data.get("source") or "").lower()   # peut être vide/null

        # --- LOG clair de la requête ---
        print(f"REQ text[:60]={text[:60]!r} source={source!r} target={target!r}")

        if not text or not target:
            return jsonify({"error": "Fields 'text' and 'target' are required"}), 400

        # Détection auto si source non fournie
        if not source:
            source = detect_lang(text)

        # Si même langue, renvoyer tel quel
        if source == target:
            return jsonify({
                "translation": text,
                "source": source,
                "target": target,
                "note": "Same language"
            }), 200

        # Paires supportées
        supported_directions = [("fr", "en"), ("en", "fr"), ("fr", "ar"), ("ar", "fr")]
        if (source, target) not in supported_directions:
            return jsonify({"error": f"Translation from {source} to {target} not supported yet"}), 400

        # Choix du moteur
        if (source, target) == ("fr", "en"):
            translation = translate_fr_en(text)
        elif (source, target) == ("en", "fr"):
            translation = translate_en_fr(text)
        else:
            # FR<->AR et autres directions simples : fallback
            translation = simple_translate(text, source, target)

        print(f"🎯 Traduction finale: '{translation}'")
        return jsonify({"translation": translation, "source": source, "target": target}), 200

    except Exception:
        print("❌ ERREUR /ai/translate")
        traceback.print_exc()
        return jsonify({"error": "Internal error during translation"}), 500

if __name__ == "__main__":
    # IMPORTANT : pas de reloader ni debug pour éviter double-chargement des modèles
    print("🚀 Serveur de traduction sur http://localhost:5010/ai/translate")
    app.run(host="0.0.0.0", port=5010, debug=False, use_reloader=False)
