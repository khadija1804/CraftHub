from flask import Flask, request, jsonify
import cv2
import numpy as np
from PIL import Image
import io
from flask_cors import CORS
import logging
import time

app = Flask(__name__)
CORS(app)
logging.basicConfig(level=logging.INFO, filename='image_analysis.log', format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Seuil strict de netteté
MIN_SHARPNESS = 150

@app.route('/analyze-image', methods=['POST', 'OPTIONS'])
def analyze_image():
    if request.method == 'OPTIONS':
        return jsonify({}), 200
    
    if 'images' not in request.files:
        return jsonify({'error': 'Aucun fichier image uploadé.'}), 400

    images = request.files.getlist('images')  # Récupère toutes les images
    if not images:
        return jsonify({'error': 'Aucune image sélectionnée.'}), 400

    quality_results = []
    for i, image_file in enumerate(images):
        image_data = image_file.read()
        image = cv2.imdecode(np.frombuffer(image_data, np.uint8), cv2.IMREAD_COLOR)

        if image is None:
            return jsonify({'error': f'Image {i + 1} invalide ou corrompue.'}), 400

        # Analyse de la netteté
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        sharpness = cv2.Laplacian(gray, cv2.CV_64F).var()
        logger.info(f"Image {i + 1} - Netteté détectée : {sharpness}")

        if sharpness < MIN_SHARPNESS:
            return jsonify({'error': f'Image {i + 1} floue, non acceptée. Netteté insuffisante.'}), 400

        # Informations supplémentaires (optionnel)
        height, width = image.shape[:2]
        clarity = gray.var()
        quality_results.append({
            'index': i + 1,
            'sharpness': sharpness,
            'clarity': clarity,
            'resolution': f"{width}x{height}"
        })

        # Classification simple (exemple)
        avg_color = np.mean(image, axis=(0, 1))
        r, g, b = avg_color
        classification = "Rouge dominant" if r > g + b + 50 else "Vert dominant" if g > r + b + 50 else "Bleu dominant" if b > r + g + 50 else "Multicolore"
        logger.info(f"Image {i + 1} - Classification : {classification}")

    # Si toutes les images passent, renvoie les résultats
    return jsonify({
        'message': 'Toutes les images acceptées',
        'quality': quality_results
    }), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5007, debug=True)