from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from sklearn.metrics.pairwise import cosine_similarity
import pandas as pd
import numpy as np
from dotenv import load_dotenv
import os
from bson.objectid import ObjectId
from sklearn.decomposition import TruncatedSVD
# Initialize Flask app
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": ["http://localhost:3000", "*"]}}, supports_credentials=True)

# Load environment variables
load_dotenv()

# Connect to MongoDB
try:
    client = MongoClient(os.getenv('MONGO_URI', 'mongodb://localhost:27017/craft_hub'))
    db = client['craft_hub']
    client.server_info()  # Test connection
    print("Connected to MongoDB successfully")
except Exception as e:
    print(f"Failed to connect to MongoDB: {e}")
    exit(1)

# Handle CORS preflight requests
@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        print("Received OPTIONS preflight request")
        response = jsonify({"message": "Preflight OK"})
        response.headers.add("Access-Control-Allow-Origin", "http://localhost:3000")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type, Authorization")
        response.headers.add("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        return response

# Test endpoint to verify connectivity
@app.route('/test', methods=['POST', 'OPTIONS'])
def test():
    print("Received request on /test endpoint")
    data = request.get_json(silent=True)
    headers = dict(request.headers)
    print(f"Test endpoint - Headers: {headers}")
    print(f"Test endpoint - Data: {data}")
    return jsonify({"message": "Test request received", "data": data, "headers": headers}), 200

# Serialize MongoDB ObjectId and handle bytes
def serialize_object(obj):
    if isinstance(obj, dict):
        return {key: serialize_object(value) for key, value in obj.items() if not (isinstance(value, bytes) and key == 'data')}
    elif isinstance(obj, list):
        return [serialize_object(item) for item in obj if item]  # Filter out None
    elif isinstance(obj, ObjectId):
        return str(obj)
    elif isinstance(obj, bytes):
        return None
    return obj

# Get interaction data
def get_interaction_data():
    try:
        pipeline = [
            {"$unwind": "$items"},
            {"$project": {
                "userId": {"$toString": "$userId"},
                "productId": {"$toString": "$items._id"},
                "rating": {"$literal": 4}
            }},
            {"$match": {"productId": {"$exists": True, "$ne": None}}}
        ]
        payments = list(db.payments.aggregate(pipeline))
        print(f"Interaction data rows: {len(payments)}")
        return pd.DataFrame(payments) if payments else pd.DataFrame()
    except Exception as e:
        print(f"Error in get_interaction_data: {e}")
        return pd.DataFrame()

# Prepare user-product matrix
def prepare_matrix(df):
    try:
        pivot_table = df.pivot_table(index='userId', columns='productId', values='rating').fillna(0)
        print(f"Matrix shape: {pivot_table.shape}")
        return pivot_table if not pivot_table.empty else pd.DataFrame()
    except Exception as e:
        print(f"Error in prepare_matrix: {e}")
        return pd.DataFrame()

# Get purchased products
def get_user_purchased_products(user_id):
    try:
        payments = db.payments.find({"userId": ObjectId(user_id)})
        purchased_ids = [str(item.get('_id')) for payment in payments for item in payment.get('items', []) if item.get('_id')]
        print(f"Purchased products for user {user_id}: {purchased_ids}")
        return purchased_ids
    except Exception as e:
        print(f"Error in get_user_purchased_products: {e}")
        return []

# Get user categories
def get_user_categories(user_id):
    try:
        pipeline = [
            {"$match": {"userId": ObjectId(user_id)}},
            {"$unwind": "$items"},
            {"$lookup": {
                "from": "products",
                "localField": "items._id",
                "foreignField": "_id",
                "as": "product"
            }},
            {"$unwind": {"path": "$product", "preserveNullAndEmptyArrays": True}},
            {"$match": {"product": {"$ne": None}}},
            {"$group": {
                "_id": "$product.category",
                "count": {"$sum": 1}
            }},
            {"$sort": {"count": -1}}
        ]
        categories = list(db.payments.aggregate(pipeline))
        print(f"User categories: {categories}")
        return [cat['_id'] for cat in categories if cat['_id'] and cat['_id'] != "null"]
    except Exception as e:
        print(f"Error in get_user_categories: {e}")
        return []

# Get products by category
def get_products_by_category(categories):
    try:
        if not categories:
            print("No categories provided for product lookup")
            return []
        products = list(db.products.find({
            "category": {"$in": categories},
            "stock": {"$gt": 0}  # Ajout pour éviter les produits épuisés
        }, {'images.data': 0}).limit(5))
        serialized_products = serialize_object(products)
        print(f"Products by category: {serialized_products}")
        return serialized_products
    except Exception as e:
        print(f"Error in get_products_by_category: {e}")
        return []

# Recommendation endpoint
@app.route('/recommend', methods=['POST', 'OPTIONS'])
def recommend():
    try:
        headers = dict(request.headers)
        print(f"Received /recommend request - Headers: {headers}")
        data = request.get_json(silent=True)
        print(f"Received /recommend request - Data: {data}")

        if not data:
            print("No JSON data provided")
            return jsonify({'error': 'No JSON data provided'}), 400

        user_id = data.get('userId')
        if not user_id:
            print("No userId provided in request")
            return jsonify({'error': 'User ID is required'}), 400

        if not isinstance(user_id, str) or len(user_id) != 24 or not all(c in '0123456789abcdefABCDEF' for c in user_id):
            print(f"Invalid userId format: {user_id}")
            return jsonify({'error': 'Valid User ID (24-character ObjectId) required'}), 400

        df = get_interaction_data()
        if df.empty:
            print("No interaction data available, falling back to category-based recommendations")
            user_categories = get_user_categories(user_id)
            recommended_products = get_products_by_category(user_categories)
            if not recommended_products:
                return jsonify({'message': 'No recommendations yet, explore products!'}), 404
            return jsonify({'recommendations': recommended_products}), 200

        matrix = prepare_matrix(df)
        if matrix.empty:
            print("Empty user-product matrix, falling back to category-based recommendations")
            user_categories = get_user_categories(user_id)
            recommended_products = get_products_by_category(user_categories)
            if not recommended_products:
                return jsonify({'message': 'No recommendations yet, explore products!'}), 404
            return jsonify({'recommendations': recommended_products}), 200

        user_id_str = str(user_id)
        if user_id_str not in matrix.index:
            print(f"User {user_id_str} not found in matrix, using category-based recommendations")
            user_categories = get_user_categories(user_id)
            recommended_products = get_products_by_category(user_categories)
            if not recommended_products:
                return jsonify({'message': 'No recommendations yet, explore products!'}), 404
            return jsonify({'recommendations': recommended_products}), 200

        purchased_products = get_user_purchased_products(user_id)
        # Appliquer SVD avec n_components adapté à la taille de la matrice
        n_components = min(2, matrix.shape[1] - 1)  # Utiliser au plus 2 ou moins si la matrice est trop petite
        if n_components < 1:
            n_components = 1
        svd = TruncatedSVD(n_components=n_components, random_state=42)
        matrix_reduced = svd.fit_transform(matrix)
        similarity = cosine_similarity(matrix_reduced)
        user_idx = matrix.index.get_loc(user_id_str)
        similar_users = np.argsort(similarity[user_idx])[::-1][1:6]
        print(f"Similar users indices: {similar_users}")

        similar_user_ids = matrix.index[similar_users]
        user_purchases = matrix.loc[similar_user_ids].sum()
        recommendations = user_purchases.sort_values(ascending=False).head(5).index.tolist()
        print(f"Raw recommendations: {recommendations}")

        # Filtrer les IDs valides (24 caractères hexadécimaux) et non achetés
        valid_recommendations = [
            pid for pid in recommendations
            if pid not in purchased_products and
            isinstance(pid, str) and
            len(pid) == 24 and
            all(c in '0123456789abcdefABCDEF' for c in pid)
        ]
        print(f"Valid recommendations after filtering: {valid_recommendations}")

        if len(valid_recommendations) < 5:
            user_categories = get_user_categories(user_id)
            category_products = get_products_by_category(user_categories)
            category_ids = [str(prod['_id']) for prod in category_products if str(prod['_id']) not in purchased_products]
            valid_recommendations.extend(category_ids[:5 - len(valid_recommendations)])
            valid_recommendations = list(dict.fromkeys(valid_recommendations))  # Remove duplicates

        if not valid_recommendations:
            print("No valid recommendations found")
            return jsonify({'message': 'No new product recommendations found'}), 404

        # Filtrer à nouveau pour s'assurer que seuls les IDs valides sont convertis en ObjectId
        valid_object_ids = [pid for pid in valid_recommendations if len(pid) == 24 and all(c in '0123456789abcdefABCDEF' for c in pid)]
        if not valid_object_ids:
            print("No valid ObjectIds found for query")
            return jsonify({'message': 'No valid product IDs for recommendation'}), 404

        recommended_products = list(db.products.find({
            '_id': {'$in': [ObjectId(pid) for pid in valid_object_ids]}
        }, {'images.data': 0}))

        if not recommended_products:
            print("No products found for recommended IDs")
            return jsonify({'message': 'No products available for recommendation'}), 404

        serialized_products = serialize_object(recommended_products)
        print(f"Returning recommendations: {serialized_products}")

        return jsonify({'recommendations': serialized_products}), 200
    except Exception as e:
        print(f"Error in recommend route: {str(e)}")
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=5001)