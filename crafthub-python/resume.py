from flask import Flask, request, jsonify
from transformers import pipeline
from flask_cors import CORS
import logging
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import time
import re

# Configuration du logging
logging.basicConfig(level=logging.INFO, filename='app.log')
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# ---- Flask-Limiter v3.x ----
app.config["RATELIMIT_DEFAULT"] = "100 per minute"
app.config["RATELIMIT_STORAGE_URI"] = "memory://"

limiter = Limiter(
    key_func=get_remote_address,   # IMPORTANT: mot-clé
    app=app                       # on attache l'app ici (donc pas besoin de init_app)
)

limiter.init_app(app)

# Charger le modèle avec gestion d'erreur
summarizer = None
try:
    logger.info("Tentative de chargement du modèle distilbart-cnn-12-6...")
    summarizer = pipeline("summarization", model="sshleifer/distilbart-cnn-12-6", framework="pt")
    logger.info("Modèle chargé avec succès.")
except Exception as e:
    logger.error(f"Échec du chargement du modèle : {e}")
    summarizer = None

@app.route('/summarize', methods=['POST'])
@limiter.limit("100 per minute")
def summarize():
    start_time = time.time()

    if not request.is_json:
        return jsonify({'error': 'Request must be JSON'}), 400

    data = request.get_json()
    review = data.get('review')

    if not review:
        return jsonify({'error': 'No review provided'}), 400
    if not isinstance(review, str):
        return jsonify({'error': 'Review must be a string'}), 400
    if len(review) > 5000:
        return jsonify({'error': 'Review too long (max 5000 characters)'}), 400

    if summarizer is None:
        return jsonify({'error': 'Service de summarization indisponible, veuillez réessayer plus tard.'}), 503

    try:
        word_count = len(review.split())
        min_length = max(10, int(word_count * 0.3))  # Minimum 10 mots ou 30%
        max_length = max(30, int(word_count * 0.7))  # Maximum 30 mots ou 70%
        result = summarizer(
            review,
            min_length=min_length,
            max_length=max_length,
            do_sample=True,
            temperature=1.0,
            num_beams=10,
            early_stopping=True,
            truncation=True,
            no_repeat_ngram_size=3,
            length_penalty=1.5
        )
        summary = result[0]['summary_text'].strip()
        if not re.search(r'[.!?]$', summary) and len(summary.split()) > 2:
            logger.warning(f"Résumé potentiellement tronqué : {summary}")
            sentences = re.split(r'[.!?]+', summary)
            summary = sentences[0].strip() + '.' if sentences else summary
        summary = summary.replace('. ', '. ').capitalize()
    except Exception as e:
        logger.error(f"Erreur lors du résumé : {e}")
        return jsonify({'error': 'Processing failed, please try again later'}), 500

    elapsed_time = time.time() - start_time
    logger.info(f"Requête traitée en {elapsed_time:.2f} secondes, résumé : {summary}")
    return jsonify({'summary': summary}), 200

if __name__ == '__main__':
    if summarizer is None:
        logger.error("Le modèle n'a pas été chargé, l'application continue mais le service de summarization est désactivé.")
    app.run(host='0.0.0.0', port=5003, debug=False)