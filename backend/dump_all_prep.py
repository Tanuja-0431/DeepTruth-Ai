import sys
import os
import cv2
import numpy as np
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"

sys.path.append(r"e:\deepfakedetection\backend")
from model_loader import get_model

try:
    from tensorflow.keras.applications.xception import preprocess_input as xception_prep
    from tensorflow.keras.applications.efficientnet import preprocess_input as efficientnet_prep
except ModuleNotFoundError:
    from keras.applications.xception import preprocess_input as xception_prep
    from keras.applications.efficientnet import preprocess_input as efficientnet_prep

def eval_image(image_path, model):
    if not os.path.exists(image_path):
        return [f"File not found: {image_path}"]
        
    img_bgr = cv2.imread(image_path)
    img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
    
    # Base array [0, 255]
    base = cv2.resize(img_rgb, (224, 224))
    base_batch = np.expand_dims(base, axis=0).astype(np.float32)

    scenarios = {
        "1. Raw Math [0, 255]": base_batch.copy(),
        "2. Rescaled [0, 1]": base_batch.copy() / 255.0,
        "3. Xception Prep [-1, 1]": xception_prep(base_batch.copy()),
        "4. EfficientNet Prep": efficientnet_prep(base_batch.copy())
    }

    lines = [f"\n--- Testing: {os.path.basename(image_path)} ---"]
    for name, tensor in scenarios.items():
        pred = model.predict(tensor, verbose=0)[0][0]
        lines.append(f"{name:25s} | Min: {tensor.min():>6.2f} | Max: {tensor.max():>6.2f} | Pred: {pred:.6f}")
    return lines

def main():
    model, _ = get_model()
    paths = [
        r"E:\deepfakedetection\dataset\real image.jpg",
        r"E:\deepfakedetection\dataset\fake image.jpg"
    ]
    output = []
    for p in paths:
        output.extend(eval_image(p, model))
        
    with open("prep_results.txt", "w", encoding="utf-8") as f:
        f.write("\n".join(output))

if __name__ == "__main__":
    main()
