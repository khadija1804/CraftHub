# -*- coding: utf-8 -*-
from flask import Flask, request, jsonify
from flask_cors import CORS
import logging, time, io, os
from typing import Dict, Any, List, Tuple, Optional

import numpy as np
from PIL import Image, ImageStat

# ───────────────────────────────────────────────────────────────────────────────
# OpenCV (optionnel)
# ───────────────────────────────────────────────────────────────────────────────
try:
    import cv2
    OPENCV_AVAILABLE = True
except Exception:
    print("⚠️ OpenCV non disponible : heuristiques réduites.")
    OPENCV_AVAILABLE = False

# ───────────────────────────────────────────────────────────────────────────────
# App & Logs
# ───────────────────────────────────────────────────────────────────────────────
app = Flask(__name__)
CORS(app)

# Configuration du logger pour afficher dans la console ET dans le fichier
logging.basicConfig(
    level=logging.INFO,
    filename='image_analysis.log',
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("image-analyzer")

# Ajouter un handler pour la console (stdout/stderr) pour voir les logs dans Docker
console_handler = logging.StreamHandler()
console_handler.setLevel(logging.INFO)
console_handler.setFormatter(logging.Formatter('%(asctime)s - %(levelname)s - %(message)s'))
logger.addHandler(console_handler)

# ───────────────────────────────────────────────────────────────────────────────
# Paramètres
# ───────────────────────────────────────────────────────────────────────────────
MIN_SHARPNESS = 150.0  # seuil de rejet pour la netteté (analyse traditionnelle)
VIOLENCE_THRESHOLD = float(os.getenv("VIOLENCE_THRESHOLD", "0.5"))  # seuil de rejet violence (CLIP uniquement)

# Étiquettes pour zero-shot CLIP (violence/agression)
VIOLENCE_LABELS = [
    "violent scene",
    "domestic violence",
    "aggression",
    "fight",
    "assault",
    "threat",
    "weapon",
    "blood",
    "screaming",
    "abuse",
]

# ───────────────────────────────────────────────────────────────────────────────
# Lazy-loading des modèles (ne bloque pas le démarrage)
# ───────────────────────────────────────────────────────────────────────────────
_vit = None; _vit_tried = False; _vit_loaded = False
_resnet = None; _resnet_tried = False; _resnet_loaded = False
_detr = None; _detr_tried = False; _detr_loaded = False
_clip = None; _clip_tried = False; _clip_loaded = False

def _safe_import_transformers():
    try:
        from transformers import pipeline  # noqa: F401
        return True
    except Exception as e:
        logger.warning(f"Transformers indisponible: {e}")
        return False

def get_vit():
    global _vit, _vit_tried, _vit_loaded
    if _vit is not None or _vit_tried:
        return _vit
    _vit_tried = True
    if not _safe_import_transformers():
        return None
    try:
        from transformers import pipeline
        _vit = pipeline("image-classification", model="google/vit-base-patch16-224", device=-1)
        _vit_loaded = True
        logger.info("✅ ViT chargé (google/vit-base-patch16-224)")
    except Exception as e:
        logger.warning(f"❌ ViT non chargé: {e}")
        _vit = None
    return _vit

def get_resnet():
    global _resnet, _resnet_tried, _resnet_loaded
    if _resnet is not None or _resnet_tried:
        return _resnet
    _resnet_tried = True
    if not _safe_import_transformers():
        return None
    try:
        from transformers import pipeline
        _resnet = pipeline("image-classification", model="microsoft/resnet-50", device=-1)
        _resnet_loaded = True
        logger.info("✅ ResNet-50 chargé")
    except Exception as e:
        logger.warning(f"❌ ResNet non chargé: {e}")
        _resnet = None
    return _resnet

def get_detr():
    global _detr, _detr_tried, _detr_loaded
    if _detr is not None or _detr_tried:
        return _detr
    _detr_tried = True
    if not _safe_import_transformers():
        return None
    try:
        from transformers import pipeline
        _detr = pipeline("object-detection", model="facebook/detr-resnet-50", device=-1)
        _detr_loaded = True
        logger.info("✅ DETR chargé")
    except Exception as e:
        logger.warning(f"❌ DETR non chargé: {e}")
        _detr = None
    return _detr

def get_clip():
    global _clip, _clip_tried, _clip_loaded
    if _clip is not None or _clip_tried:
        return _clip
    _clip_tried = True
    if not _safe_import_transformers():
        return None
    try:
        from transformers import pipeline
        _clip = pipeline("zero-shot-image-classification", model="openai/clip-vit-base-patch32", device=-1)
        _clip_loaded = True
        logger.info("✅ CLIP zero-shot chargé")
    except Exception as e:
        logger.warning(f"❌ CLIP non chargé: {e}")
        _clip = None
    return _clip

# ───────────────────────────────────────────────────────────────────────────────
# Utilitaires image
# ───────────────────────────────────────────────────────────────────────────────
def pil_from_bytes(data: bytes) -> Image.Image:
    return Image.open(io.BytesIO(data)).convert("RGB")

def np_from_pil(im: Image.Image) -> np.ndarray:
    return np.array(im)

def sharpness_laplacian(np_bgr: np.ndarray) -> float:
    gray = cv2.cvtColor(np_bgr, cv2.COLOR_BGR2GRAY)
    return float(cv2.Laplacian(gray, cv2.CV_64F).var())

def exposure_metrics(np_rgb: np.ndarray) -> Tuple[float, float]:
    lum = float(np.mean(np_rgb))
    contrast = float(np.std(np_rgb))
    return lum, contrast

def k_palette_pil(im: Image.Image, k: int = 5) -> List[Tuple[int, int, int]]:
    pal = im.convert("P", palette=Image.ADAPTIVE, colors=k)
    palette = pal.getpalette()
    color_counts = pal.getcolors()
    if not color_counts:
        return []
    color_counts.sort(reverse=True, key=lambda x: x[0])
    result = []
    for count, idx in color_counts[:k]:
        r = palette[3*idx + 0]; g = palette[3*idx + 1]; b = palette[3*idx + 2]
        result.append((int(r), int(g), int(b)))
    return result

def brightness_saturation(np_rgb: np.ndarray) -> Tuple[float, float]:
    brightness = float(np.mean(np_rgb))
    sat = float(np.mean(np.std(np_rgb, axis=2)))
    return brightness, sat

# ───────────────────────────────────────────────────────────────────────────────
# 1) Classification d’objets (ViT) → top 5
# ───────────────────────────────────────────────────────────────────────────────
def classify_objects(pil_img: Image.Image) -> Optional[Dict[str, Any]]:
    vit = get_vit()
    if vit is None:
        return None
    preds = vit(pil_img)
    top5 = preds[:5] if isinstance(preds, list) else []
    return {
        "top_predictions": top5,
        "main_object": top5[0]["label"] if top5 else None,
        "confidence": top5[0]["score"] if top5 else 0.0
    }

# ───────────────────────────────────────────────────────────────────────────────
# 2) Qualité d’image (ResNet-50 “présent” + heuristiques pour le score)
# ───────────────────────────────────────────────────────────────────────────────
def assess_quality(pil_img: Image.Image, np_bgr_opt: Optional[np.ndarray]) -> Dict[str, Any]:
    if np_bgr_opt is not None and OPENCV_AVAILABLE:
        sharp = sharpness_laplacian(np_bgr_opt)
    else:
        gray = pil_img.convert("L")
        sharp = float(ImageStat.Stat(gray).var[0])

    np_rgb = np_from_pil(pil_img)
    lum, contrast = exposure_metrics(np_rgb)

    sharp_norm = min(sharp / 300.0, 1.0)
    lum_norm = 1.0 - min(abs(lum - 128.0) / 128.0, 1.0)
    contrast_norm = min(contrast / 64.0, 1.0)
    quality_score = round(0.5 * sharp_norm + 0.25 * lum_norm + 0.25 * contrast_norm, 3)

    recos = []
    if sharp < 150:   recos.append("L’image semble floue : stabiliser la caméra ou augmenter la lumière.")
    if lum < 50:      recos.append("Image sous-exposée : ajouter de l’éclairage.")
    if lum > 200:     recos.append("Image surexposée : réduire l’éclairage ou l’ISO.")
    if contrast < 20: recos.append("Contraste faible : améliorer les conditions de prise de vue.")

    resnet_note = None
    resnet = get_resnet()
    if resnet is not None:
        try:
            out = resnet(pil_img)
            resnet_note = out[:1]
        except Exception as e:
            logger.warning(f"resnet-50 predict error: {e}")

    return {
        "quality_score": quality_score,
        "sharpness": sharp,
        "exposure": lum,
        "contrast": contrast,
        "recommendations": recos,
        "model_hint": resnet_note
    }

# ───────────────────────────────────────────────────────────────────────────────
# 3) Couleurs dominantes via objets (DETR) → fallback palette globale
# ───────────────────────────────────────────────────────────────────────────────
def analyze_colors(pil_img: Image.Image) -> Dict[str, Any]:
    np_rgb = np_from_pil(pil_img)
    brightness, sat = brightness_saturation(np_rgb)

    objects_colors = []
    detr = get_detr()
    if detr is not None:
        try:
            dets = detr(pil_img)
            for det in (dets[:3] if isinstance(dets, list) else []):
                box = det.get("box", {})
                xmin, ymin, xmax, ymax = [int(box.get(k, 0)) for k in ("xmin","ymin","xmax","ymax")]
                xmin, ymin = max(0, xmin), max(0, ymin)
                xmax, ymax = min(np_rgb.shape[1], xmax), min(np_rgb.shape[0], ymax)
                if xmax > xmin and ymax > ymin:
                    crop = pil_img.crop((xmin, ymin, xmax, ymax))
                    palette = k_palette_pil(crop, k=3)
                    objects_colors.append({
                        "label": det.get("label"),
                        "score": det.get("score"),
                        "palette": palette
                    })
        except Exception as e:
            logger.warning(f"DETR analyze error: {e}")

    dominant_palette = k_palette_pil(pil_img, k=5)
    return {
        "dominant_colors": dominant_palette,
        "brightness": brightness,
        "saturation": sat,
        "object_palettes": objects_colors,
        "color_harmony": "approx_adaptive"
    }

# ───────────────────────────────────────────────────────────────────────────────
# 4) Violence/agression → CLIP SEULEMENT (pas d'heuristiques)
# ───────────────────────────────────────────────────────────────────────────────
def violence_score(pil_img: Image.Image, np_rgb: np.ndarray) -> dict:
    reasons = []
    clip_max = 0.0
    clip_raw = None

    logger.info("🔍 Chargement du modèle CLIP...")
    clip = get_clip()
    if clip is not None:
        try:
            logger.info("✅ CLIP chargé, analyse en cours...")
            logger.info(f"📋 Labels à vérifier: {VIOLENCE_LABELS}")
            out = clip(pil_img, candidate_labels=VIOLENCE_LABELS, hypothesis_template="This is {}.")
            clip_raw = out
            logger.info(f"📊 Résultats CLIP bruts: {out}")
            if isinstance(out, list) and len(out) > 0:
                clip_max = float(out[0]["score"])
                top_label = out[0].get('label', 'unknown')
                logger.info(f"⚠️ Score max CLIP: {clip_max:.4f} pour label '{top_label}'")
                reasons.append(f"CLIP:{top_label}={clip_max:.2f}")
                # Log les top 5 résultats
                for i, result in enumerate(out[:5], 1):
                    logger.info(f"  {i}. {result.get('label', 'unknown')}: {result.get('score', 0.0):.4f}")
            else:
                logger.warning("⚠️ CLIP a retourné une liste vide")
        except Exception as e:
            logger.error(f"❌ Erreur CLIP violence: {e}")
            logger.exception(e)
    else:
        logger.warning("⚠️ CLIP non disponible, aucun score de violence ne sera calculé")
        # Si CLIP n'est pas disponible, on accepte l'image (seuil à 0)
        return {"score": 0.0, "reasons": ["CLIP non disponible"], "clip_raw": None}

    # AVANT: Score basé uniquement sur CLIP
    # PAS d'heuristiques supplémentaires (rouge excessif, densité d'arêtes, etc.)
    return {"score": float(clip_max), "reasons": reasons, "clip_raw": clip_raw}

# ───────────────────────────────────────────────────────────────────────────────
# 5) Règles de sécurité générales (non-violence)
# ───────────────────────────────────────────────────────────────────────────────
def rule_based_safety(np_rgb: np.ndarray) -> Tuple[bool, Dict[str, Any]]:
    H, W = np_rgb.shape[:2]
    flags, reasons = [], []
    score = 0.9

    dark_ratio = float(np.sum(np.mean(np_rgb, axis=2) < 50)) / float(H*W)
    bright_ratio = float(np.sum(np.mean(np_rgb, axis=2) > 240)) / float(H*W)
    if dark_ratio > 0.4:
        flags += ["image_trop_sombre"]; reasons.append("Grande proportion sombre"); score = min(score, 0.4)
    if bright_ratio > 0.6:
        flags += ["image_trop_claire"]; reasons.append("Grande proportion très claire"); score = min(score, 0.5)

    if OPENCV_AVAILABLE:
        try:
            gray = cv2.cvtColor(np_rgb, cv2.COLOR_RGB2GRAY)
            face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
            faces = face_cascade.detectMultiScale(gray, 1.1, 4)
            for (x,y,w,h) in faces:
                roi = gray[y:y+h, x:x+w]
                m = float(np.mean(roi))
                if m < 50 or m > 200:
                    flags += ["detresse_possible"]; reasons.append("Visage très sombre/clair (détresse possible)")
                    score = min(score, 0.4); break
        except Exception:
            pass

    is_safe = len(flags) == 0
    if is_safe:
        return True, {"is_safe": True, "safety_score": score, "flagged_content": [], "reason": "OK (heuristique)"}
    else:
        return False, {"is_safe": False, "safety_score": score, "flagged_content": flags, "reason": "; ".join(reasons)}

# ───────────────────────────────────────────────────────────────────────────────
# Pipeline complet d'analyse d'une image (1..N)
# ───────────────────────────────────────────────────────────────────────────────
def analyze_one_image(image_bytes: bytes) -> Dict[str, Any]:
    logger.info("🔍 Début analyse de l'image")
    
    try:
        pil_img = pil_from_bytes(image_bytes)
        logger.info(f"✅ Image ouverte avec succès (PIL): {pil_img.size}, mode: {pil_img.mode}")
    except Exception as e:
        logger.error(f"❌ Erreur lors de l'ouverture de l'image avec PIL: {e}")
        raise

    np_bgr = None
    if OPENCV_AVAILABLE:
        try:
            np_bgr = cv2.imdecode(np.frombuffer(image_bytes, np.uint8), cv2.IMREAD_COLOR)
            if np_bgr is not None:
                logger.info(f"✅ Image décodée avec OpenCV: {np_bgr.shape}")
            else:
                logger.warning("⚠️ OpenCV n'a pas pu décoder l'image")
        except Exception as e:
            logger.warning(f"⚠️ Erreur OpenCV decode: {e}")

    logger.info("📊 Classification objets...")
    object_cls = classify_objects(pil_img)  # None si ViT non dispo
    
    logger.info("🔍 Analyse de qualité...")
    qual = assess_quality(pil_img, np_bgr)
    
    logger.info("🎨 Analyse des couleurs...")
    colors = analyze_colors(pil_img)

    logger.info("🔒 Vérification sécurité...")
    safe_ok, safety = rule_based_safety(np_from_pil(pil_img))

    logger.info("⚔️ Analyse violence avec CLIP...")
    viol = violence_score(pil_img, np_from_pil(pil_img))
    logger.info(f"📊 Violence score: {viol['score']}, threshold: {VIOLENCE_THRESHOLD}")
    if viol.get("clip_raw"):
        logger.info(f"📋 Résultats CLIP: {viol['clip_raw']}")
    
    if viol["score"] >= VIOLENCE_THRESHOLD:
        logger.warning(f"❌ REJET violence: {viol['score']} >= {VIOLENCE_THRESHOLD}")
        return {"accepted": False, 
                "error": "Image rejetée : contenu violent/agressif détecté.",
                "rejection_reason": "contenu_inapproprie",
                "violence": {"score": viol["score"], "reasons": viol["reasons"]}}

    sharp = qual.get("sharpness", 0.0)
    logger.info(f"📐 Netteté: {sharp}, minimum requis: {MIN_SHARPNESS}")
    
    if sharp < MIN_SHARPNESS:
        logger.warning(f"❌ REJET netteté: {sharp} < {MIN_SHARPNESS}")
        return {"accepted": False, 
                "error": "Image floue, netteté insuffisante.", 
                "rejection_reason": "nettete_insuffisante",
                "traditional_sharpness": sharp}

    logger.info(f"🔒 Sécurité OK: {safe_ok}")
    if not safe_ok:
        logger.warning(f"❌ REJET sécurité: {safety.get('reason', 'unknown')}")
        return {"accepted": False, 
                "error": "Contenu potentiellement inapproprié.", 
                "rejection_reason": "contenu_inapproprie",
                "safety": safety}

    overall = "excellent" if sharp > 200 else ("good" if sharp > 150 else "acceptable")
    logger.info(f"✅ Image acceptée - Qualité globale: {overall}")

    return {
        "accepted": True,
        "object_classification": object_cls,
        "quality_analysis": qual,
        "color_analysis": colors,
        "safety_check": safety,
        "violence_check": {"score": viol["score"], "reasons": viol["reasons"]},
        "overall_quality": overall
    }

# ───────────────────────────────────────────────────────────────────────────────
# Routes
# ───────────────────────────────────────────────────────────────────────────────
@app.route('/healthz', methods=['GET'])
def health_check():
    """Endpoint de santé (ne force pas le chargement des modèles)"""
    return jsonify({
        'status': 'healthy',
        'vit_loaded': _vit_loaded, 'vit_tried': _vit_tried,
        'resnet50_loaded': _resnet_loaded, 'resnet50_tried': _resnet_tried,
        'detr_loaded': _detr_loaded, 'detr_tried': _detr_tried,
        'clip_loaded': _clip_loaded, 'clip_tried': _clip_tried,
        'opencv_available': OPENCV_AVAILABLE,
        'timestamp': time.time()
    }), 200

@app.route('/analyze-image', methods=['POST', 'OPTIONS'])
def analyze_image():
    if request.method == 'OPTIONS':
        return jsonify({}), 200

    logger.info("=" * 80)
    logger.info("🔍 DÉBUT ANALYSE IMAGE(S)")
    logger.info("=" * 80)
    
    if 'images' not in request.files:
        logger.warning("❌ Aucun fichier image uploadé")
        return jsonify({'error': 'Aucun fichier image uploadé.'}), 400

    images = request.files.getlist('images')
    if not images:
        logger.warning("❌ Aucune image sélectionnée")
        return jsonify({'error': 'Aucune image sélectionnée.'}), 400

    logger.info(f"📸 Nombre d'images à analyser: {len(images)}")
    
    # Afficher le statut des modèles CLIP
    clip_status = get_clip()
    if clip_status is not None:
        logger.info("✅ CLIP est chargé et disponible")
    else:
        logger.warning("⚠️ CLIP n'est pas chargé")
    
    results = []
    for i, image_file in enumerate(images, 1):
        try:
            filename = image_file.filename or f"image_{i}"
            file_size = len(image_file.read())
            image_file.seek(0)  # Reset file pointer
            logger.info(f"-" * 80)
            logger.info(f"📷 Analyse de l'image {i}/{len(images)}: {filename} ({file_size} bytes)")
            logger.info(f"-" * 80)
            
            image_data = image_file.read()
            logger.info(f"📦 Taille des données: {len(image_data)} bytes")
            
            out = analyze_one_image(image_data)
            
            if not out.get("accepted", False):
                logger.warning(f"❌ Image {i} rejetée: {out.get('error', 'unknown')}")
                logger.warning(f"📋 Reason: {out.get('rejection_reason', 'none')}")
                if 'violence' in out:
                    logger.warning(f"⚔️ Violence details: {out['violence']}")
                return jsonify({'error': f'Image {i} rejetée', 'details': out}), 400
            
            results.append({'index': i, **out})
            logger.info(f"✅ Image {i} acceptée avec succès!")
            
        except Exception as e:
            logger.error(f"❌ Erreur lors de l'analyse de l'image {i}")
            logger.exception(e)
            return jsonify({'error': f'Image {i} invalide ou corrompue.', 'exception': str(e)}), 400

    logger.info("=" * 80)
    logger.info(f"✅ ANALYSE TERMINÉE - {len(results)} image(s) acceptée(s)")
    logger.info("=" * 80)
    
    return jsonify({
        'message': 'Toutes les images analysées avec succès',
        'analysis_results': results,
        'total_images': len(results)
    }), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5007, debug=True)
