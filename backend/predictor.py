import os
import sys
import cv2
import numpy as np

# Keras import - TF 2.16+ uses standalone keras
try:
    from tensorflow.keras.models import load_model
    from tensorflow.keras.applications.efficientnet import preprocess_input as preprocess
except ModuleNotFoundError:
    from keras.models import load_model
    from keras.applications.efficientnet import preprocess_input as preprocess

# Paths relative to script location (works from any cwd)
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
MODEL_PATH = os.path.join(PROJECT_ROOT, "models", "deepfake_final_model.keras")
VIDEO_PATH = os.path.join(PROJECT_ROOT, "test_video.mp4")
IMG_SIZE = 224

print("Loading model...", flush=True)
model = load_model(MODEL_PATH)
print("Model loaded.", flush=True)


def predict_frame(frame):
    frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    frame = cv2.resize(frame, (IMG_SIZE, IMG_SIZE))
    frame = np.expand_dims(frame, axis=0)
    frame = preprocess(frame.astype(np.float32))
    pred = model.predict(frame, verbose=0)[0][0]
    return float(pred)


print(f"Opening video: {VIDEO_PATH}", flush=True)
cap = cv2.VideoCapture(VIDEO_PATH)
if not cap.isOpened():
    print("Error: Could not open video file.", flush=True)
    sys.exit(1)

scores = []
frame_count = 0
while True:
    ret, frame = cap.read()
    if not ret:
        break
    score = predict_frame(frame)
    scores.append(score)
    frame_count += 1

cap.release()
print(f"Processed {frame_count} frames.", flush=True)

if not scores:
    print("Error: No frames read from video.", flush=True)
    sys.exit(1)

final_score = float(np.mean(scores))
print(f"Fake probability: {final_score:.4f}", flush=True)

if final_score > 0.5:
    print("Result: FAKE VIDEO", flush=True)
else:
    print("Result: REAL VIDEO", flush=True)