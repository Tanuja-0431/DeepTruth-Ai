"""
Deepfake Detection API - Flask backend
"""
import os
import uuid
import logging
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
from db import get_contact_collection

from config import (
    MODEL_PATH,
    MAX_IMAGE_SIZE,
    MAX_VIDEO_SIZE,
    ALLOWED_IMAGE_EXT,
    ALLOWED_VIDEO_EXT,
)
from model_loader import load_model, get_gpu_info
from predictor_service import predict_image, predict_video
from metrics_service import get_metrics_data

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def classify_result(fake_prob):
    """Multi-level confidence classification. Does NOT touch prediction logic."""
    if fake_prob > 0.5:
        label = "FAKE"
        confidence = "HIGH"
        summary = "Strong indicators of deepfake manipulation detected."
    elif fake_prob > 0.2:
        label = "SUSPICIOUS"
        confidence = "MEDIUM"
        summary = "Some inconsistencies detected. Content may be manipulated."
    elif fake_prob > 0.01:
        label = "MINOR AI TRACE"
        confidence = "LOW"
        summary = "Very weak AI artifacts detected. Likely real but not fully certain."
    else:
        label = "REAL"
        confidence = "HIGH"
        summary = "Content appears authentic with no significant deepfake indicators."
    return label, confidence, summary

app = Flask(__name__)
CORS(app)
app.config["MAX_CONTENT_LENGTH"] = 100 * 1024 * 1024  # 100 MB

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)



def _ext(path):
    return os.path.splitext(secure_filename(path or ""))[1].lower()


def _validate_image(file):
    ext = _ext(file.filename)
    if ext not in ALLOWED_IMAGE_EXT:
        return False, f"Invalid image format. Allowed: {list(ALLOWED_IMAGE_EXT)}"
    file.seek(0, 2)
    size = file.tell()
    file.seek(0)
    if size > MAX_IMAGE_SIZE:
        return False, f"File too large. Max {MAX_IMAGE_SIZE // (1024*1024)} MB"
    return True, None


def _validate_video(file):
    ext = _ext(file.filename)
    if ext not in ALLOWED_VIDEO_EXT:
        return False, f"Invalid video format. Allowed: {list(ALLOWED_VIDEO_EXT)}"
    file.seek(0, 2)
    size = file.tell()
    file.seek(0)
    if size > MAX_VIDEO_SIZE:
        return False, f"File too large. Max {MAX_VIDEO_SIZE // (1024*1024)} MB"
    return True, None


@app.before_request
def init_model():
    try:
        load_model()
    except Exception as e:
        logger.warning(f"Model init: {e}")


@app.route("/", methods=["GET"])
def index():
    return jsonify({
        "message": "Deepfake Detection API",
        "docs": "Use the frontend at http://localhost:5173",
        "endpoints": ["/health", "/predict/image", "/predict/video", "/metrics"],
    })


@app.route("/health", methods=["GET"])
def health():
    gpu = get_gpu_info()
    return jsonify({
        "status": "ok",
        "gpu": gpu,
        "model_loaded": os.path.exists(MODEL_PATH),
    })


@app.route("/predict/image", methods=["POST"])
def predict_image_endpoint():
    if "file" not in request.files and "image" not in request.files:
        return jsonify({"error": "No file provided"}), 400
    file = request.files.get("file") or request.files.get("image")
    ok, err = _validate_image(file)
    if not ok:
        return jsonify({"error": err}), 400

    try:
        import cv2
        import numpy as np
        buf = np.frombuffer(file.read(), dtype=np.uint8)
        img = cv2.imdecode(buf, cv2.IMREAD_COLOR)
        if img is None:
            return jsonify({"error": "Could not decode image"}), 400

        prob = predict_image(img)
        label, confidence, summary = classify_result(prob)

        return jsonify({
            "fake_probability": round(prob, 4),
            "result": label,
            "confidence": confidence,
            "summary": summary,
            "frames_processed": 1,
        })
    except Exception as e:
        logger.exception("Image prediction failed")
        return jsonify({"error": str(e)}), 500


@app.route("/predict/video", methods=["POST"])
def predict_video_endpoint():
    if "file" not in request.files and "video" not in request.files:
        return jsonify({"error": "No file provided"}), 400
    file = request.files.get("file") or request.files.get("video")
    ok, err = _validate_video(file)
    if not ok:
        return jsonify({"error": err}), 400

    path = os.path.join(UPLOAD_DIR, f"{uuid.uuid4()}{_ext(file.filename)}")
    try:
        file.save(path)
        logger.info(f"Processing video: {path}")

        data = predict_video(path)
        prob_mean = data["fake_probability_mean"]
        prob_max = data["fake_probability_max"]
        n = data["frames_processed"]

        fake_prob = (prob_mean + prob_max) / 2.0
        label, confidence, summary = classify_result(fake_prob)

        return jsonify({
            "fake_probability": round(fake_prob, 4),
            "fake_probability_mean": round(prob_mean, 4),
            "fake_probability_max": round(prob_max, 4),
            "result": label,
            "confidence": confidence,
            "summary": summary,
            "frames_processed": n,
            "scores": [round(s, 4) for s in data.get("scores", [])],
        })
    except Exception as e:
        logger.exception("Video prediction failed")
        return jsonify({"error": str(e)}), 500
    finally:
        if os.path.exists(path):
            try:
                os.remove(path)
            except OSError:
                pass


@app.route("/metrics", methods=["GET"])
def metrics():
    try:
        data = get_metrics_data()
        return jsonify(data)
    except Exception as e:
        logger.exception("Metrics failed")
        return jsonify({"error": str(e)}), 500


@app.route("/contact", methods=["POST"])
def contact():
    data = request.get_json()
    logger.info(f"Received /contact request data: {data}")
    
    if not data:
        return jsonify({"error": "No JSON payload provided"}), 400

    name = data.get("name")
    email = data.get("email")
    message = data.get("message")

    if not name or not email or not message:
        return jsonify({"error": "Missing required fields: name, email, message"}), 400

    doc = {
        "name": name,
        "email": email,
        "message": message,
        "timestamp": datetime.utcnow()
    }

    try:
        contact_collection = get_contact_collection()
        if contact_collection is not None:
            contact_collection.insert_one(doc)
            logger.info("Successfully inserted contact message into MongoDB.")
        else:
            logger.warning("MongoDB is not connected. Message not stored, but simulating success.")
            
        return jsonify({"message": "Message sent successfully!"}), 201
    except Exception as e:
        logger.exception("Failed to save contact message")
        return jsonify({"error": "Failed to save message"}), 500


@app.errorhandler(413)
def too_large(e):
    return jsonify({"error": "File too large"}), 413


@app.errorhandler(500)
def internal_error(e):
    return jsonify({"error": "Internal server error"}), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, threaded=True)
