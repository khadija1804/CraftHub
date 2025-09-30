# CraftHub Python AI Service

Service Python pour la génération de descriptions SEO avec IA.

## 🚀 Installation

1. **Créer un environnement virtuel :**
```bash
cd crafthub-python
python -m venv venv
```

2. **Activer l'environnement virtuel :**
```bash
# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

3. **Installer les dépendances :**
```bash
pip install -r requirements.txt
```

## 🏃‍♂️ Démarrage

**Démarrer le serveur Flask :**
```bash
python app.py
```

Le serveur sera accessible sur `http://localhost:5010`

## 🧪 Tests

**Test du service SEO :**
```bash
python test_seo.py
```

**Test de variété des descriptions :**
```bash
python test_variety.py
```

**Test direct du générateur :**
```bash
python direct_test.py
```

## 📁 Structure

- `app.py` - Serveur Flask principal
- `real_ai_service.py` - Service de génération SEO avec IA
- `test_*.py` - Scripts de test
- `requirements.txt` - Dépendances Python

## 🔧 API Endpoints

### POST /ai/generate-rag
Génère une description SEO à partir de mots-clés.

**Paramètres :**
```json
{
  "keywords": ["mot1", "mot2", "mot3"],
  "contexteProduitMinimal": {
    "nom": "Nom du produit",
    "categorie": "Catégorie",
    "prix": 100
  }
}
```

**Réponse :**
```json
{
  "descriptionHtml": "<h3>Description SEO...</h3>",
  "success": true
}
```

### GET /health
Vérifie l'état du service.

## 🤖 Modèle IA

Le service utilise un modèle de langage pré-entraîné pour générer des descriptions SEO variées et pertinentes.

## 📝 Logs

Les logs sont disponibles dans :
- `image_analysis.log` - Logs d'analyse d'images
- `scraping.log` - Logs de scraping
