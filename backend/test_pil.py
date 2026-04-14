import sys
import os
import numpy as np
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"

sys.path.append(r"e:\deepfakedetection\backend")
from model_loader import get_model

try:
    from tensorflow.keras.preprocessing import image
    from tensorflow.keras.applications.xception import preprocess_input as xception_prep
except ModuleNotFoundError:
    from keras.preprocessing import image
    from keras.applications.xception import preprocess_input as xception_prep

def eval_pil(image_path, model):
    if not os.path.exists(image_path): return
    
    img = image.load_img(image_path, target_size=(224, 224))
    x = image.img_to_array(img)
    x = np.expand_dims(x, axis=0)
    x = xception_prep(x)
    
    pred = model.predict(x, verbose=0)[0][0]
    print(f"PIL/Keras Load -> {os.path.basename(image_path)} | Pred: {pred:.6f}")

def main():
    model, _ = get_model()
    paths = [r"E:\deepfakedetection\dataset\real image.jpg", r"E:\deepfakedetection\dataset\fake image.jpg"]
    for p in paths: eval_pil(p, model)

if __name__ == "__main__": main()
