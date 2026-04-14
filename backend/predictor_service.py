"""
Inference service for image and video deepfake detection.
"""

import cv2
import numpy as np

from model_loader import get_model
from config import IMG_SIZE, FRAME_SAMPLE_INTERVAL
from metrics_service import record_prediction


def extract_face(frame_bgr, pad=0.2):
    """
    Detects the largest face using OpenCV Haar Cascades.
    Returns the cropped face with padding, or the original frame if no face is found.
    """
    gray = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2GRAY)
    cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
    face_cascade = cv2.CascadeClassifier(cascade_path)
    
    faces = face_cascade.detectMultiScale(
        gray, scaleFactor=1.1, minNeighbors=5, minSize=(60, 60)
    )
    
    if len(faces) == 0:
        return frame_bgr
        
    faces = sorted(faces, key=lambda f: f[2] * f[3], reverse=True)
    x, y, w, h = faces[0]
    
    pad_w = int(w * pad)
    pad_h = int(h * pad)
    
    H, W = frame_bgr.shape[:2]
    x1 = max(0, x - pad_w)
    y1 = max(0, y - pad_h)
    x2 = min(W, x + w + pad_w)
    y2 = min(H, y + h + pad_h)
    
    return frame_bgr[y1:y2, x1:x2]


# =========================
# IMAGE PREDICTION
# =========================
def predict_image(frame_bgr):
    model, preprocess = get_model()

    # 1. REMOVE FACE EXTRACTION (Match training distribution)
    face_bgr = frame_bgr

    # ✅ Convert BGR → RGB
    frame_rgb = cv2.cvtColor(face_bgr, cv2.COLOR_BGR2RGB)

    # ✅ Resize
    frame_resized = cv2.resize(frame_rgb, (IMG_SIZE, IMG_SIZE))

    # ✅ Add batch dimension and set float32
    # NO / 255.0 manual normalization!
    frame_batch = np.expand_dims(frame_resized, axis=0).astype(np.float32)

    # ✅ Apply model-specific preprocess
    frame_prep = preprocess(frame_batch)

    # 🔍 Pure Prediction
    pred = model.predict(frame_prep, verbose=0)[0][0]
    prob = float(pred)

    # ⚠️ 5. ADD DEBUG OUTPUT
    print(f"\n[DEBUG] --- IMAGE PREDICTION ---")
    print(f"        Input Min: {frame_prep.min():.4f} | Max: {frame_prep.max():.4f}")
    print(f"        Raw Keras Prob: {prob:.4f}")
    print(f"-------------------------------\n")

    # ✅ Record metrics
    record_prediction(prob, prob > 0.5)

    return prob


# =========================
# VIDEO PREDICTION
# =========================
def predict_video(video_path, sample_interval=None, progress_callback=None):
    sample_interval = sample_interval or FRAME_SAMPLE_INTERVAL
    model, preprocess = get_model()

    cap = cv2.VideoCapture(video_path)

    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT)) or 0
    scores = []
    count = 0
    processed = 0

    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                break

            if count % sample_interval == 0:
                # 1. REMOVE FACE EXTRACTION
                face_bgr = frame

                frame_rgb = cv2.cvtColor(face_bgr, cv2.COLOR_BGR2RGB)
                resized = cv2.resize(frame_rgb, (IMG_SIZE, IMG_SIZE))

                batch = np.expand_dims(resized, axis=0).astype(np.float32)
                
                # ✅ Apply preprocess natively
                batch_prep = preprocess(batch)

                pred = model.predict(batch_prep, verbose=0)[0][0]
                prob = float(pred)

                scores.append(prob)
                processed += 1

                print(f"[DEBUG] Video Frame {processed} | Min: {batch_prep.min():.2f} Max: {batch_prep.max():.2f} | Keras Prob: {prob:.4f}")

                # Progress callback
                if progress_callback and total_frames > 0:
                    pct = min(100, int(100 * count / total_frames))
                    progress_callback(pct, processed)

            count += 1

    finally:
        cap.release()

    # Record metrics
    for s in scores:
        record_prediction(s, s > 0.5)

    if not scores:
        return {
            "fake_probability_mean": 0.5,
            "fake_probability_max": 0.5,
            "frames_processed": 0,
            "scores": [],
        }

    return {
        "fake_probability_mean": float(np.mean(scores)),
        "fake_probability_max": float(np.max(scores)),
        "frames_processed": len(scores),
        "scores": scores,
    }