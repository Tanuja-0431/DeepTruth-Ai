# Deepfake Detection Web Platform

Production-grade web application for detecting AI-generated or manipulated (deepfake) images and videos.

## Features

- **Image & Video Detection** – Upload images or videos for analysis
- **Intelligent Video Sampling** – Extracts frames every N frames, aggregates mean + max predictions
- **Dark Glassmorphism UI** – Modern React frontend with Framer Motion animations
- **Visualization Dashboard** – ROC curve, AUC score, confusion matrix, prediction distribution
- **Explainability** – Confidence explanations and metric descriptions
- **GPU Auto-detection** – Uses GPU when available
- **File Size Limits** – 10MB images, 100MB videos
- **Clean API** – RESTful endpoints with proper error handling

## Quick Start

### Prerequisites

- Python 3.10+
- Node.js 18+
- Model file at `models/deepfake_final_model.keras`

### 1. Backend Setup

```bash
cd backend
pip install -r requirements.txt
python app.py
```

Backend runs at `http://localhost:5000`.

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

### 3. Use the App

1. Open http://localhost:5173
2. Toggle Image or Video mode
3. Drag & drop or click to upload
4. View result and metrics

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check, GPU status |
| POST | `/predict/image` | Analyze image (form field: `file`) |
| POST | `/predict/video` | Analyze video (form field: `file`) |
| GET | `/metrics` | ROC, AUC, confusion matrix (base64 images) |

### Example: Predict Image

```bash
curl -X POST -F "file=@image.jpg" http://localhost:5000/predict/image
```

Response:
```json
{
  "fake_probability": 0.87,
  "result": "FAKE",
  "frames_processed": 1
}
```

### Example: Predict Video

```bash
curl -X POST -F "file=@video.mp4" http://localhost:5000/predict/video
```

Response:
```json
{
  "fake_probability": 0.72,
  "result": "FAKE",
  "frames_processed": 128
}
```

## Project Structure

```
deepfakedetection/
├── backend/
│   ├── app.py              # Flask app
│   ├── config.py           # Configuration
│   ├── model_loader.py     # Model + GPU detection
│   ├── predictor_service.py # Inference logic
│   ├── metrics_service.py  # ROC, AUC, confusion matrix
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── api.ts
│   │   └── components/
│   └── package.json
├── models/
│   └── deepfake_final_model.keras
└── README.md
```

## Deployment

### Hugging Face Spaces

1. Create a new Space (Gradio or Static)
2. Add `Dockerfile` or use Python SDK
3. Set backend URL via `VITE_API_URL` in frontend build

### Render

1. Create Web Service for backend
2. Create Static Site for frontend (build: `npm run build`, publish: `dist`)
3. Set environment variable `VITE_API_URL` to backend URL

### Railway

1. Add backend as a service (start: `cd backend && python app.py`)
2. Add frontend as static site or separate service
3. Configure `VITE_API_URL`

### Manual (VPS)

```bash
# Backend
cd backend && pip install -r requirements.txt
gunicorn -w 4 -b 0.0.0.0:5000 app:app

# Frontend (build)
cd frontend && npm run build
# Serve dist/ with nginx or any static server
```

## Configuration

- `MAX_IMAGE_SIZE` – Default 10MB
- `MAX_VIDEO_SIZE` – Default 100MB  
- `FRAME_SAMPLE_INTERVAL` – Sample every N frames (default 30)
- `VITE_API_URL` – Backend URL for production frontend

## Dataset

The dataset used for training and testing is available on Google Drive:  
[DeepTruth Dataset - Google Drive](https://drive.google.com/drive/folders/1fXZwrUZ5HevNxRkBEQMfd-fV_6HMab5h?usp=drive_link)

---

## License

MIT
