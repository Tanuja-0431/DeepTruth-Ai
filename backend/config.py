"""Backend configuration."""
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(BASE_DIR)
MODEL_PATH = os.path.join(PROJECT_ROOT, "models", "deepfake_final_model.keras")
MODEL_DRIVE_ID = os.environ.get("MODEL_DRIVE_ID", "1js0NOSnoApGNjrursV2OEc1Y4Qg0GNwf")
UPLOAD_DIR = os.path.join(PROJECT_ROOT, "uploads")
METRICS_CACHE_DIR = os.path.join(PROJECT_ROOT, ".metrics_cache")

MAX_IMAGE_SIZE = 10 * 1024 * 1024
MAX_VIDEO_SIZE = 100 * 1024 * 1024

FRAME_SAMPLE_INTERVAL = 30
IMG_SIZE = 224

ALLOWED_IMAGE_EXT = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}
ALLOWED_VIDEO_EXT = {".mp4", ".avi", ".mov", ".mkv", ".webm"}
