import os
import time
import re
import logging
from typing import Optional

from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

# ---- Transformers (optionnel) ----
try:
    from transformers import pipeline
    TRANSFORMERS_AVAILABLE = True
except Exception as e:
    print("Warning: Transformers not available -> fallback basic summaries only:", e)
    TRANSFORMERS_AVAILABLE = False

# ----------------- Config logging -----------------
logging.basicConfig(level=logging.INFO, filename='app.log')
logger = logging.getLogger("resume")

# ----------------- App -----------------
app = Flask(__name__)
CORS(app, origins="*")

@app.after_request
def after_request(response):
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add("Access-Control-Allow-Headers", "Content-Type, Authorization")
    response.headers.add("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    return response

# ------------- Rate limit (v3) --------------
app.config["RATELIMIT_DEFAULT"] = "100 per minute"
app.config["RATELIMIT_STORAGE_URI"] = "memory://"
limiter = Limiter(key_func=get_remote_address, app=app)  # suffisant; pas besoin de init_app

# ----------------- Model load -----------------
summarizer = None
model_loading = False
MODEL_ID = os.getenv("MODEL_ID", "sshleifer/distilbart-cnn-12-6").strip()
# Pour éviter les requêtes réseau si le modèle est préchargé dans l'image
TRANSFORMERS_OFFLINE = os.getenv("TRANSFORMERS_OFFLINE", "1") in ("1", "true", "True")

def create_summarizer(model_id: str) -> Optional[object]:
    """
    Essaie de créer le pipeline avec quelques retries.
    Si TRANSFORMERS_OFFLINE=1, ne tente que le cache local.
    """
    if not TRANSFORMERS_AVAILABLE:
        return None

    retries = 3
    last_err = None
    for attempt in range(1, retries + 1):
        try:
            logger.info(f"[load] Initialisation pipeline (try {attempt}/{retries}) model={model_id} "
                        f"offline={TRANSFORMERS_OFFLINE}")
            # Paramètres pensés pour vitesse + déterminisme
            pl = pipeline(
                "summarization",
                model=model_id,
                framework="pt"
            )
            logger.info("[load] ✅ Modèle chargé")
            return pl
        except Exception as e:
            last_err = e
            logger.warning(f"[load] Échec init modèle (tentative {attempt}) : {e}")
            time.sleep(1.0 * attempt)
    logger.error(f"[load] ❌ Impossible de charger le modèle après {retries} tentatives : {last_err}")
    return None

def load_model_once():
    global summarizer, model_loading
    if model_loading or summarizer is not None:
        return
    model_loading = True
    try:
        summarizer = create_summarizer(MODEL_ID)
    finally:
        model_loading = False

# Charger au démarrage (synchrone pour éviter le premier appel lent)
load_model_once()

# ----------------- Routes -----------------
@app.route("/", methods=["GET"])
def health_check():
    return jsonify({
        "status": "ok",
        "service": "resume",
        "model_loaded": summarizer is not None,
        "model_id": MODEL_ID,
        "model_loading": model_loading,
        "offline": TRANSFORMERS_OFFLINE
    }), 200

@app.route("/summarize", methods=["POST"])
@limiter.limit("100 per minute")
def summarize():
    t0 = time.time()

    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400

    data = request.get_json(silent=True) or {}
    review = data.get("review")
    # Optionnel: autoriser model_id dans la requête pour A/B (sinon ENV)
    requested_model = (data.get("model_id") or "").strip()
    model_id = requested_model or MODEL_ID

    if not review:
        return jsonify({"error": "No review provided"}), 400
    if not isinstance(review, str):
        return jsonify({"error": "Review must be a string"}), 400
    if len(review) > 5000:
        return jsonify({"error": "Review too long (max 5000 characters)"}), 400

    # Si pas de modèle, fallback basique (même esprit que ton code initial)
    if summarizer is None:
        logger.info("⚠️ Fallback résumé basique (modèle non disponible)")
        words = review.split()
        if len(words) <= 20:
            summary = review
        else:
            first_part = " ".join(words[:10])
            last_part = " ".join(words[-10:])
            summary = f"{first_part}... {last_part}"
        return jsonify({
            "summary": summary,
            "processing_time": round(time.time() - t0, 3),
            "method": "basic",
            "model_id": None
        }), 200

    # Longueurs dynamiques (borne min/max)
    word_count = max(1, len(review.split()))
    min_length = max(10, int(word_count * 0.25))
    max_length = max(min_length + 10, int(word_count * 0.55))
    # Clamp pour éviter les extrêmes
    min_length = min(min_length, 120)
    max_length = min(max_length, 220)

    try:
        result = summarizer(
            review,
            min_length=min_length,
            max_length=max_length,
            # Vitesse + stabilité
            do_sample=False,
            num_beams=4,
            early_stopping=True,
            truncation=True,
            no_repeat_ngram_size=3,
            length_penalty=1.0
        )
        summary = (result[0].get("summary_text") or "").strip()

        # Termine proprement la phrase si besoin
        if not re.search(r"[.!?]$", summary) and len(summary.split()) > 2:
            sentences = re.split(r"[.!?]+", summary)
            summary = (sentences[0].strip() + ".") if sentences else summary

        # Capitalisation douce
        if summary:
            summary = summary[0].upper() + summary[1:]

        return jsonify({
            "summary": summary,
            "processing_time": round(time.time() - t0, 3),
            "method": "transformers",
            "model_id": model_id,
            "min_length": min_length,
            "max_length": max_length
        }), 200

    except Exception as e:
        logger.error(f"Erreur lors du résumé : {e}")
        return jsonify({"error": "Processing failed, please try again later"}), 500

# ----------------- Main -----------------
if __name__ == "__main__":
    if summarizer is None:
        logger.error("Le modèle n'a pas été chargé : fallback basique uniquement.")
    app.run(host="0.0.0.0", port=5003, debug=False)
