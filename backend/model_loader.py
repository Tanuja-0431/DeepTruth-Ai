"""Model loading and GPU detection."""
import os

try:
    import tensorflow as tf
    TF_AVAILABLE = True
except ImportError:
    TF_AVAILABLE = False

from config import MODEL_PATH, MODEL_DRIVE_ID

_model = None
_preprocess = None


def get_gpu_info():
    info = {"gpu_available": False, "devices": [], "message": ""}
    if not TF_AVAILABLE:
        info["message"] = "TensorFlow not installed"
        return info
    try:
        gpus = tf.config.list_physical_devices("GPU")
        info["gpu_available"] = len(gpus) > 0
        info["devices"] = [d.name for d in gpus]
        info["message"] = f"GPU: {gpus[0].name}" if gpus else "Running on CPU"
    except Exception as e:
        info["message"] = str(e)
    return info


def download_model_from_drive():
    """Download the model file from Google Drive if it doesn't exist."""
    if os.path.exists(MODEL_PATH):
        return

    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    print(f"Downloading model from Google Drive (ID: {MODEL_DRIVE_ID})...")
    
    try:
        import gdown
        url = f'https://drive.google.com/uc?id={MODEL_DRIVE_ID}'
        gdown.download(url, MODEL_PATH, quiet=False)
    except Exception as e:
        print(f"Failed to download model: {e}")
        # We don't raise here yet; load_model will catch the missing file


def load_model():
    global _model, _preprocess
    if _model is not None:
        return _model, _preprocess

    # Ensure model exists
    if not os.path.exists(MODEL_PATH):
        download_model_from_drive()

    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"Model File not found at {MODEL_PATH} after download attempt.")

    try:
        from tensorflow.keras.models import load_model as keras_load
        from tensorflow.keras.applications.xception import preprocess_input
    except ModuleNotFoundError:
        from keras.models import load_model as keras_load
        from keras.applications.xception import preprocess_input

    _model = keras_load(MODEL_PATH)
    _preprocess = preprocess_input
    return _model, _preprocess


def get_model():
    if _model is None:
        load_model()
    return _model, _preprocess
