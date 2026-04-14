import os
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"
import sys
import numpy as np

sys.path.append(r"e:\deepfakedetection\backend")
from model_loader import get_model

def run_sanity_test():
    print("Loading model for sanity check...")
    model, preprocess = get_model()
    
    print("\n--- 1. VERIFY PREPROCESS MAPPING ---")
    print(f"Preprocess Function: {preprocess.__module__}.{preprocess.__name__}")
    if "xception" not in preprocess.__module__:
        print("[ERROR] Preprocess is NOT Xception!")
    else:
        print("[OK] Xception preprocess confirmed.")

    print("\n--- 2. VERIFY MODEL BEHAVIOR ---")
    
    # Test 1: Random Noise (Represents chaotic inputs)
    noise = np.random.randint(0, 256, (1, 224, 224, 3)).astype(np.float32)
    noise_prep = preprocess(noise.copy())
    p_noise = model.predict(noise_prep, verbose=0)[0][0]
    print(f"Test 1 [Random Noise]: Input Range = [{noise_prep.min():.2f}, {noise_prep.max():.2f}] -> Prediction = {p_noise:.4f}")

    # Test 2: Blank Canvas (Represents zero signal)
    blank = np.zeros((1, 224, 224, 3), dtype=np.float32)
    blank_prep = preprocess(blank.copy())
    p_blank = model.predict(blank_prep, verbose=0)[0][0]
    print(f"Test 2 [Blank Screen]: Input Range = [{blank_prep.min():.2f}, {blank_prep.max():.2f}] -> Prediction = {p_blank:.4f}")

    # Test 3: Pure White (Represents saturated signal)
    white = np.ones((1, 224, 224, 3), dtype=np.float32) * 255.0
    white_prep = preprocess(white.copy())
    p_white = model.predict(white_prep, verbose=0)[0][0]
    print(f"Test 3 [White Screen]: Input Range = [{white_prep.min():.2f}, {white_prep.max():.2f}] -> Prediction = {p_white:.4f}")

    print("\n--- 3. CONCLUSION ---")
    if p_noise == p_blank == p_white:
        print("[FAILED] Model outputs are absolutely CONSTANT. Weights might be dead.")
    else:
        print("[PASSED] Model predictions VARY based on input signal.")

if __name__ == "__main__":
    run_sanity_test()
