from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from bson.objectid import ObjectId
from sklearn.decomposition import TruncatedSVD
from sklearn.metrics.pairwise import cosine_similarity
from dotenv import load_dotenv
from datetime import datetime, date
import pandas as pd
import numpy as np
import os

# ------------------------------------------------------------------------------
# Flask + CORS (front sur http://localhost:80)
# ------------------------------------------------------------------------------
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": ["http://localhost"]}}, supports_credentials=True)

# ------------------------------------------------------------------------------
# MongoDB
# ------------------------------------------------------------------------------
load_dotenv()
MONGO_URI = os.getenv("MONGO_URI", "mongodb://crafthub-mongo:27017/craft_hub")
DB_NAME = os.getenv("MONGO_DB", "craft_hub")

try:
    client = MongoClient(MONGO_URI)
    db = client[DB_NAME]
    client.server_info()
    print("Connected to MongoDB successfully")
except Exception as e:
    print(f"Failed to connect to MongoDB: {e}")
    raise

# ------------------------------------------------------------------------------
# Utils
# ------------------------------------------------------------------------------
def serialize_object(obj):
    """
    Sérialise récursivement:
      - ObjectId  -> str
      - datetime/date -> ISO 8601
      - bytes (ex: images.data) -> None
    Nettoie aussi 'images.data' dans les documents.
    """
    if isinstance(obj, dict):
        clean = {}
        for k, v in obj.items():
            if k == "images" and isinstance(v, list):
                images = []
                for it in v:
                    if isinstance(it, dict):
                        it2 = {kk: vv for kk, vv in it.items() if kk != "data"}  # retire le binaire
                        images.append(serialize_object(it2))
                    else:
                        images.append(serialize_object(it))
                clean[k] = images
            else:
                clean[k] = serialize_object(v)
        return clean
    if isinstance(obj, list):
        return [serialize_object(x) for x in obj]
    if isinstance(obj, ObjectId):
        return str(obj)
    if isinstance(obj, (datetime, date)):
        return obj.isoformat()
    if isinstance(obj, bytes):
        return None
    return obj


def get_interaction_data():
    """Retourne DataFrame: userId, productId, rating."""
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
        rows = list(db.payments.aggregate(pipeline))
        print(f"Interaction data rows: {len(rows)}")
        return pd.DataFrame(rows) if rows else pd.DataFrame()
    except Exception as e:
        print(f"Error in get_interaction_data: {e}")
        return pd.DataFrame()


def prepare_matrix(df: pd.DataFrame):
    try:
        pivot = df.pivot_table(index="userId", columns="productId", values="rating").fillna(0)
        print(f"Matrix shape: {pivot.shape}")
        return pivot if not pivot.empty else pd.DataFrame()
    except Exception as e:
        print(f"Error in prepare_matrix: {e}")
        return pd.DataFrame()


def get_user_purchased_products(user_id: str):
    try:
        payments = db.payments.find({"userId": ObjectId(user_id)})
        purchased = [str(it.get("_id")) for pay in payments for it in pay.get("items", []) if it.get("_id")]
        print(f"Purchased products for user {user_id}: {purchased}")
        return purchased
    except Exception as e:
        print(f"Error in get_user_purchased_products: {e}")
        return []


def get_user_categories(user_id: str):
    """Top catégories d’achats de l’utilisateur (fallback)."""
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
            {"$group": {"_id": "$product.category", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}}
        ]
        rows = list(db.payments.aggregate(pipeline))
        print(f"User categories: {rows}")
        return [r["_id"] for r in rows if r.get("_id")]
    except Exception as e:
        print(f"Error in get_user_categories: {e}")
        return []


def get_products_by_category(categories, limit: int = 5):
    try:
        if not categories:
            print("No categories provided for product lookup")
            return []
        products = list(
            db.products.find(
                {"category": {"$in": categories}, "stock": {"$gt": 0}},
                {"images.data": 0}
            ).limit(limit)
        )
        data = serialize_object(products)
        print(f"Products by category: {data}")
        return data
    except Exception as e:
        print(f"Error in get_products_by_category: {e}")
        return []

# ------------------------------------------------------------------------------
# Health & Debug
# ------------------------------------------------------------------------------
@app.route("/health", methods=["GET"])
def health():
    try:
        client.server_info()
        return jsonify({"status": "healthy", "mongodb": "connected"}), 200
    except Exception as e:
        return jsonify({"status": "unhealthy", "mongodb": "disconnected", "error": str(e)}), 503


@app.route("/recommend/ping", methods=["GET"])
def recommend_ping():
    return jsonify({"ok": True}), 200

# ------------------------------------------------------------------------------
# Recommandations
# ------------------------------------------------------------------------------
@app.route("/recommend", methods=["POST"])
@app.route("/recommend/", methods=["POST"])
def recommend():
    try:
        print(f"Received /recommend request - Headers: {dict(request.headers)}")
        data = request.get_json(silent=True) or {}
        print(f"Received /recommend request - Data: {data}")

        user_id = data.get("userId")
        if not user_id:
            return jsonify({"recommendations": [], "message": "User ID is required"}), 200

        if not (isinstance(user_id, str) and len(user_id) == 24 and all(c in "0123456789abcdefABCDEF" for c in user_id)):
            return jsonify({"recommendations": [], "message": "Invalid user id"}), 200

        # 1) Interactions
        df = get_interaction_data()
        if df.empty:
            cats = get_user_categories(user_id)
            prods = get_products_by_category(cats)
            return jsonify({"recommendations": prods or [], "message": "No interactions yet"}), 200

        # 2) Matrice
        matrix = prepare_matrix(df)
        if matrix.empty:
            cats = get_user_categories(user_id)
            prods = get_products_by_category(cats)
            return jsonify({"recommendations": prods or [], "message": "Sparse matrix"}), 200

        user_id_str = str(user_id)

        # Cold-start (peu d'utilisateurs) → évite SVD instable
        if matrix.shape[0] < 2:
            cats = get_user_categories(user_id)
            prods = get_products_by_category(cats)
            return jsonify({"recommendations": prods or [], "message": "Cold-start"}), 200

        if user_id_str not in matrix.index:
            cats = get_user_categories(user_id)
            prods = get_products_by_category(cats)
            return jsonify({"recommendations": prods or [], "message": "User not in matrix"}), 200

        # 3) SVD + similarité
        purchased_products = get_user_purchased_products(user_id)
        n_components = max(1, min(2, matrix.shape[1] - 1))
        svd = TruncatedSVD(n_components=n_components, random_state=42)
        matrix_reduced = svd.fit_transform(matrix)
        similarity = cosine_similarity(matrix_reduced)

        user_idx = matrix.index.get_loc(user_id_str)
        similar_users_idx = np.argsort(similarity[user_idx])[::-1][1:6]
        similar_user_ids = matrix.index[similar_users_idx]

        scores = matrix.loc[similar_user_ids].sum()
        top_ids = scores.sort_values(ascending=False).head(5).index.tolist()

        # Filtre ids valides & non achetés
        valid_recos = [
            pid for pid in top_ids
            if isinstance(pid, str)
            and len(pid) == 24
            and all(c in "0123456789abcdefABCDEF" for c in pid)
            and pid not in purchased_products
        ]

        # Compléter par fallback catégories si besoin
        if len(valid_recos) < 5:
            cats = get_user_categories(user_id)
            cat_prods = get_products_by_category(cats, limit=5)
            cat_ids = [str(p["_id"]) for p in cat_prods if str(p["_id"]) not in purchased_products]
            valid_recos = list(dict.fromkeys(valid_recos + cat_ids))[:5]

        if not valid_recos:
            return jsonify({"recommendations": [], "message": "No recommendations yet"}), 200

        # 4) Lecture produits
        obj_ids = [ObjectId(pid) for pid in valid_recos if len(pid) == 24]
        products = list(db.products.find({"_id": {"$in": obj_ids}}, {"images.data": 0}))
        if not products:
            return jsonify({"recommendations": [], "message": "No products available"}), 200

        return jsonify({"recommendations": serialize_object(products)}), 200

    except Exception as e:
        print(f"Error in recommend route: {str(e)}")
        # on renvoie 200 + payload d'erreur côté JSON pour ne pas casser le front
        return jsonify({"recommendations": [], "error": f"Internal server error: {str(e)}"}), 200

# ------------------------------------------------------------------------------
# Run
# ------------------------------------------------------------------------------
if __name__ == "__main__":
    # écoute sur 5001 (docker-compose: "5001:5001")
    app.run(debug=True, host="0.0.0.0", port=5001)
