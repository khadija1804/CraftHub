from flask import Flask, request, jsonify
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app)

@app.route('/ai/generate-rag', methods=['POST'])
def generate_rag():
    try:
        data = request.get_json()
        keywords = data.get('keywords', [])
        contexte_produit = data.get('contexteProduitMinimal', {})
        
        # Simulation d'une génération SEO basique
        nom_produit = contexte_produit.get('nom', 'Produit artisanal')
        categorie = contexte_produit.get('categorie', 'Artisanat')
        prix = contexte_produit.get('prix', 0)
        
        # Génération d'une description SEO basique
        description_html = f"""
        <h3>✨ {nom_produit}</h3>
        <p><strong>Catégorie :</strong> {categorie}</p>
        <p><strong>Prix :</strong> {prix}€</p>
        
        <h4>🎨 Description Artisanale</h4>
        <p>Découvrez ce magnifique {nom_produit.lower()} créé avec passion et savoir-faire artisanal. 
        Chaque pièce est unique et reflète l'attention portée aux détails.</p>
        
        <h4>🔍 Mots-clés SEO intégrés :</h4>
        <ul>
        {''.join([f'<li><strong>{keyword}</strong></li>' for keyword in keywords])}
        </ul>
        
        <h4>🌟 Caractéristiques</h4>
        <ul>
        <li>✅ Fait main avec amour</li>
        <li>✅ Matériaux de qualité</li>
        <li>✅ Unique et original</li>
        <li>✅ Respectueux de l'environnement</li>
        </ul>
        
        <p><em>Parfait pour offrir ou pour vous faire plaisir !</em></p>
        """
        
        return jsonify({
            'descriptionHtml': description_html,
            'success': True
        })
        
    except Exception as e:
        return jsonify({
            'error': f'Erreur lors de la génération: {str(e)}',
            'success': False
        }), 500

@app.route('/ai/translate', methods=['POST'])
def translate():
    try:
        data = request.get_json()
        text = data.get('text', '')
        target = data.get('target', 'fr')
        source = data.get('source', 'auto')
        
        # Simulation de traduction basique
        return jsonify({
            'translation': f"[Traduit] {text}",
            'source': source,
            'target': target
        })
        
    except Exception as e:
        return jsonify({
            'error': f'Erreur lors de la traduction: {str(e)}'
        }), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'OK', 'message': 'Service AI actif'})

if __name__ == '__main__':
    print("🚀 Démarrage du serveur AI sur le port 5010...")
    app.run(host='0.0.0.0', port=5010, debug=True)
