# translator.py
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM, pipeline
from huggingface_hub import snapshot_download
import traceback

# --- OFFLINE stricte ---
os.environ.setdefault("HF_HUB_OFFLINE", "1")
os.environ.setdefault("TRANSFORMERS_OFFLINE", "1")

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": ["http://localhost:3000"]}})

# Pour stabiliser, on commence UNIQUEMENT par fr->en
PIPES = {("fr", "en"): None}

def build_pipeline_from_cache(model_id: str):
    """
    Charge explicitement tokenizer + model en lecture cache uniquement,
    puis construit un pipeline de traduction SANS aucun accès réseau.
    """
    print(f"⏳ Vérification du cache pour {model_id} ...")
    # Garantit que les fichiers existent dans le cache (ne télécharge pas en OFFLINE)
    snapshot_download(repo_id=model_id)
    print("📦 Cache OK. Chargement local_files_only=True ...")

    # Chargement explicite, 100% local
    tok = AutoTokenizer.from_pretrained(model_id, local_files_only=True, use_fast=True)
    mdl = AutoModelForSeq2SeqLM.from_pretrained(model_id, local_files_only=True)

    print("🔧 Construction du pipeline ...")
    # On passe les objets pour éviter qu'il essaie de résoudre des chemins réseau
    pipe = pipeline(
        task="translation",
        model=mdl,
        tokenizer=tok,
        device="cpu",
    )
    print(f"✅ Pipeline prêt pour {model_id}")
    return pipe

def get_pipe(src: str, tgt: str):
    key = (src, tgt)
    if key not in PIPES:
        return None
    if PIPES[key] is None:
        model_id = "Helsinki-NLP/opus-mt-fr-en"
        try:
            PIPES[key] = build_pipeline_from_cache(model_id)
        except Exception:
            print("❌ ERREUR pendant la construction du pipeline :")
            traceback.print_exc()
            raise
    return PIPES[key]

def detect_lang(text: str) -> str:
    t = text.strip()
    if any(c in t for c in "ابتثجحخدذرزسشصضطظعغفقكلمنهوي"):  # heuristique arabe
        return "ar"
    fr_words = [" le "," la "," les "," des "," un "," une "," et "," est "," avec "," pour "," de "," du "," au "," aux "," à "," ça "," sur "]
    lc = " " + t.lower() + " "
    en_hits = sum(w in lc for w in [" the "," and "," with "," for "," to "," of "," in "," on "," is "," are "])
    fr_hits = sum(w in lc for w in fr_words)
    return "fr" if fr_hits >= en_hits else "en"

@app.route("/ai/translate", methods=["POST", "OPTIONS"])
def translate():
    if request.method == "OPTIONS":
        return ("", 204)
    try:
        data = request.get_json(silent=True) or {}
        text = (data.get("text") or "").strip()
        target = (data.get("target") or "").lower()  # "en"
        source = (data.get("source") or "").lower()

        if not text or not target:
            return jsonify({"error": "Fields 'text' and 'target' are required"}), 400

        if not source:
            source = detect_lang(text)

        if source == target:
            return jsonify({"translation": text, "source": source, "target": target, "note": "Same language"}), 200

        if (source, target) != ("fr", "en"):
            return jsonify({"error": "Only fr->en enabled for now"}), 400

        pipe = get_pipe(source, target)
        if not pipe:
            return jsonify({"error": f"Unsupported language pair {source}->{target}"}), 400

        # Découpage simple si très long
        chunks = [text[i:i+2000] for i in range(0, len(text), 2000)] or [text]
        out = []
        for ch in chunks:
            res = pipe(ch, max_length=512)
            out.append(res[0]["translation_text"])
        translation = " ".join(out).strip()
        return jsonify({"translation": translation, "source": source, "target": target}), 200

    except Exception:
        print("❌ ERREUR /ai/translate")
        traceback.print_exc()
        return jsonify({"error": "Internal error during translation"}), 500

if __name__ == "__main__":
    # IMPORTANT : pas de reloader ni debug
    print("🚀 Serveur de traduction sur http://localhost:5010/ai/translate")
    app.run(host="0.0.0.0", port=5010, debug=False, use_reloader=False)
