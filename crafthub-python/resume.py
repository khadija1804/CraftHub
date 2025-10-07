from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import time
import re

# Gestion optionnelle de transformers
try:
    from transformers import pipeline
    TRANSFORMERS_AVAILABLE = True
except ImportError:
    print("Warning: Transformers not available, summarization features will be limited")
    TRANSFORMERS_AVAILABLE = False

# Configuration du logging
logging.basicConfig(level=logging.INFO, filename='app.log')
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, origins="*")

# Gérer CORS manuellement pour toutes les réponses
@app.after_request
def after_request(response):
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add("Access-Control-Allow-Headers", "Content-Type, Authorization")
    response.headers.add("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    return response

@app.route('/', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'ok', 
        'service': 'resume',
        'model_loaded': summarizer is not None,
        'model_loading': model_loading
    })

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
model_loading = False

def load_model_async():
    global summarizer, model_loading
    if TRANSFORMERS_AVAILABLE and not model_loading:
        model_loading = True
        try:
            logger.info("Chargement du modèle distilbart-cnn-12-6 en arrière-plan...")
            # Utiliser le modèle distilbart-cnn-12-6 (meilleure qualité)
            summarizer = pipeline("summarization", model="sshleifer/distilbart-cnn-12-6", framework="pt")
            logger.info("✅ Modèle chargé avec succès!")
        except Exception as e:
            logger.error(f"❌ Échec du chargement du modèle : {e}")
            summarizer = None
        finally:
            model_loading = False

# Démarrer le chargement en arrière-plan
import threading
threading.Thread(target=load_model_async, daemon=True).start()

@app.route('/summarize', methods=['POST'])
# @limiter.limit("100 per minute")  # Temporairement désactivé pour debug
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

        # Utiliser un résumé basique si le modèle n'est pas disponible
        logger.info("Utilisation du résumé basique (modèle non disponible)")
        words = review.split()
        if len(words) <= 20:
            summary = review
        else:
            # Prendre les premiers mots et les derniers mots
            first_part = ' '.join(words[:10])
            last_part = ' '.join(words[-10:])
            summary = f"{first_part}... {last_part}"
        
        processing_time = time.time() - start_time
        return jsonify({
            'summary': summary,
            'processing_time': round(processing_time, 2),
            'method': 'basic'
        })

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