import os
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"
import sys
import cv2
import numpy as np

sys.path.append(r"e:\deepfakedetection\backend")
from model_loader import get_model

def run_debug():
    print("--- 1. VERIFY MODEL LOADING ---")
    model, preprocess = get_model()
    print("Model Loaded Successfully.")
    
    print("\nModel Summary:")
    print(f"Input shape: {model.input_shape}")
    print(f"Output shape: {model.output_shape}")
    
    # Check the top 5 layers
    print("\nFirst layers:")
    for layer in model.layers[:5]:
        print(f"  {layer.name} ({layer.__class__.__name__})")
        
    print(f"\nPreprocess function mapping: {preprocess.__module__}.{preprocess.__name__}")

    print("\n--- 2. TEST PREPROCESSING BEHAVIOR ---")
    # Simulate a fake camera frame (BGR) with random noise [0, 255]
    dummy_bgr = np.random.randint(0, 256, (224, 224, 3), dtype=np.uint8)
    # Convert exactly how app.py -> cvtColor -> resize does it:
    dummy_rgb = cv2.cvtColor(dummy_bgr, cv2.COLOR_BGR2RGB)
    dummy_frame = cv2.resize(dummy_rgb, (224, 224))
    
    print("Raw pixel stats: Min={}, Max={}".format(dummy_frame.min(), dummy_frame.max()))

    # Try Preprocess Scenario A (ONLY preprocess_input)
    scen_a = np.expand_dims(dummy_frame.astype(np.float32), axis=0)
    scen_a = preprocess(scen_a)
    print(f"\nScenario A (Raw + preprocess):")
    print(f"  Min={scen_a.min():.4f}, Max={scen_a.max():.4f}")
    pred_a = model.predict(scen_a, verbose=0)[0][0]
    print(f"  Prediction: {pred_a:.4f}")

    # Try Preprocess Scenario B (Manual / 255.0 + preprocess_input)
    scen_b = np.expand_dims(dummy_frame.astype(np.float32) / 255.0, axis=0)
    scen_b = preprocess(scen_b)
    print(f"\nScenario B (/ 255.0 + preprocess):")
    print(f"  Min={scen_b.min():.4f}, Max={scen_b.max():.4f}")
    pred_b = model.predict(scen_b, verbose=0)[0][0]
    print(f"  Prediction: {pred_b:.4f}")

    print("\n--- 7. CHECK MODEL BEHAVIOR (Edge Cases) ---")
    blank = preprocess(np.zeros((1, 224, 224, 3), dtype=np.float32))
    p_blank = model.predict(blank, verbose=0)[0][0]
    print(f"Blank Screen (all 0s) Prediction: {p_blank:.4f}")

    white = preprocess(np.ones((1, 224, 224, 3), dtype=np.float32) * 255.0)
    p_white = model.predict(white, verbose=0)[0][0]
    print(f"White Screen (all 255s) Prediction: {p_white:.4f}")

if __name__ == "__main__":
    run_debug()
