import sys
import os
import cv2
import argparse

sys.path.append(r"e:\deepfakedetection\backend")
from predictor_service import predict_image

def main():
    parser = argparse.ArgumentParser(description="Test deepfake inference against a specific file.")
    parser.add_argument("image_path", help="Path to a test image (REAL or FAKE)")
    args = parser.parse_args()

    if not os.path.exists(args.image_path):
        print(f"Error: Could not find image at {args.image_path}")
        return

    frame_bgr = cv2.imread(args.image_path)
    if frame_bgr is None:
        print("Error: Could not decode image. Is it a valid image file?")
        return
        
    print(f"Testing Prediction for: {args.image_path}")
    print("=" * 40)
    prob = predict_image(frame_bgr)
    print("=" * 40)
    print(f"Final Reported Probability (Fake=1.0): {prob:.4f}")
    if prob > 0.5:
        print("[RESULT] Model considers this FAKE.")
    else:
        print("[RESULT] Model considers this REAL.")

if __name__ == "__main__":
    main()
