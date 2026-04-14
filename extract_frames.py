import cv2
import os

def extract_frames(video_path, output_folder, prefix, frame_gap=30):
    cap = cv2.VideoCapture(video_path)
    count = 0
    saved = 0

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        if count % frame_gap == 0:
            filename = os.path.join(output_folder, f"{prefix}_frame_{saved}.jpg")
            cv2.imwrite(filename, frame)
            saved += 1

        count += 1

    cap.release()

def process_folder(input_folder, output_folder):
    os.makedirs(output_folder, exist_ok=True)

    for video in os.listdir(input_folder):
        video_path = os.path.join(input_folder, video)
        if not video.lower().endswith(('.mp4', '.avi', '.mov', '.mkv', '.webm')):
            continue
        prefix = os.path.splitext(video)[0]
        extract_frames(video_path, output_folder, prefix)

# REAL
process_folder("E:/deepfakedetection/dataset/videos/real", "E:/deepfakedetection/dataset/frames/train/real")

# FAKE
process_folder("E:/deepfakedetection/dataset/videos/fake", "E:/deepfakedetection/dataset/frames/train/fake")