import sys
import os
import cv2
import numpy as np
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"

sys.path.append(r"e:\deepfakedetection\backend")
from model_loader import get_model
from tensorflow.keras.applications.xception import preprocess_input

def sweep(image_path, model):
    if not os.path.exists(image_path): return
    img_bgr = cv2.imread(image_path)
    img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
    
    bgr_r = cv2.resize(img_bgr, (224, 224))
    rgb_r = cv2.resize(img_rgb, (224, 224))
    
    scen = {
        "RGB + Xception [-1,1]": preprocess_input(np.expand_dims(rgb_r, 0).astype(np.float32)),
        "BGR + Xception [-1,1]": preprocess_input(np.expand_dims(bgr_r, 0).astype(np.float32)),
        "RGB + Rescale [0,1]": np.expand_dims(rgb_r, 0).astype(np.float32) / 255.0,
        "BGR + Rescale [0,1]": np.expand_dims(bgr_r, 0).astype(np.float32) / 255.0,
    }
    
    print(f"\nEvaluating: {os.path.basename(image_path)}")
    for name, tensor in scen.items():
        try:
            pred = model.predict(tensor, verbose=0)[0][0]
            print(f"{name:25s} | Pred: {pred:.6f}")
        except: pass

def main():
    model, _ = get_model()
    paths = [r"E:\deepfakedetection\dataset\real image.jpg", r"E:\deepfakedetection\dataset\fake image.jpg"]
    for p in paths: sweep(p, model)

if __name__ == "__main__": main()
