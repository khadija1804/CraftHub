# app.py (corrigé)

from flask import Flask, request, jsonify
from flask_cors import CORS

# ✅ Import du vrai générateur IA (instance globale)
#    Défini dans real_ai_service.py : real_ai_generator.generate_seo_description(keywords, contexte)
from real_ai_service import real_ai_generator

app = Flask(__name__)
# Configuration CORS pour permettre les requêtes depuis le frontend React
CORS(app, origins="*")

# Gérer les requêtes OPTIONS (preflight) et CORS
@app.after_request
def after_request(response):
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add("Access-Control-Allow-Headers", "Content-Type, Authorization")
    response.headers.add("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    return response

@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        # Réponse immédiate pour le preflight CORS
        return jsonify({"message": "Preflight OK"})

@app.route('/ai/generate-rag', methods=['POST', 'OPTIONS'])
def generate_rag():
    try:
        if request.method == 'OPTIONS':
            # Laisse after_request ajouter les bons headers
            return jsonify({"message": "Preflight OK"})

        data = request.get_json(silent=True) or {}
        keywords = data.get('keywords', [])
        contexte_produit = data.get('contexteProduitMinimal', {})

        # ✅ Appel du générateur IA varié (catégories, intros, CTA, mots-clés, etc.)
        description_html = real_ai_generator.generate_seo_description(keywords, contexte_produit)

        return jsonify({
            'descriptionHtml': description_html,
            'success': True
        })

    except Exception as e:
        return jsonify({
            'error': f'Erreur lors de la génération: {str(e)}',
            'success': False
        }), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'OK', 'message': 'Service AI actif'})

if __name__ == '__main__':
    print("🚀 Démarrage du serveur RAG sur le port 5011...")
    app.run(host='0.0.0.0', port=5011, debug=True)
