"""Model loading and GPU detection."""
import os

try:
    import tensorflow as tf
    TF_AVAILABLE = True
except ImportError:
    TF_AVAILABLE = False

from config import MODEL_PATH

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


def load_model():
    global _model, _preprocess
    if _model is not None:
        return _model, _preprocess

    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"Model not found: {MODEL_PATH}")

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
