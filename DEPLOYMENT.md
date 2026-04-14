# Deployment Guide

## Hugging Face Spaces

### Option A: Docker

1. Create a new Docker Space
2. Add `Dockerfile`:

```dockerfile
FROM python:3.10-slim
WORKDIR /app
COPY backend/requirements.txt .
RUN pip install -r requirements.txt gunicorn
COPY backend/ ./backend/
COPY models/ ./models/
WORKDIR /app/backend
EXPOSE 7860
CMD ["gunicorn", "-b", "0.0.0.0:7860", "app:app"]
```

3. Build frontend: `cd frontend && npm run build`
4. Serve `frontend/dist` with a static file server or use HF's static Space for frontend

### Option B: Gradio Wrapper

Wrap the Flask API in a Gradio interface for HF Spaces compatibility.

## Render

### Backend (Web Service)

1. New Web Service
2. Build: (leave empty)
3. Start: `cd backend && pip install -r requirements.txt && python app.py`
4. Add environment variable: `PORT` (Render sets this)
5. Update `app.py` to use `port=os.environ.get('PORT', 5000)`

### Frontend (Static Site)

1. New Static Site
2. Build: `cd frontend && npm install && npm run build`
3. Publish: `frontend/dist`
4. Add env: `VITE_API_URL` = your backend URL (e.g. `https://your-backend.onrender.com`)

## Railway

1. Connect GitHub repo
2. Add backend as service:
   - Root: `/`
   - Build: `pip install -r backend/requirements.txt`
   - Start: `cd backend && python app.py`
3. Add frontend: build with `VITE_API_URL` pointing to Railway backend URL

## VPS (Ubuntu)

```bash
# Install dependencies
sudo apt update
sudo apt install python3-pip nodejs npm nginx

# Backend
cd /var/www/deepfakedetection/backend
pip3 install -r requirements.txt gunicorn
gunicorn -w 4 -b 127.0.0.1:5000 app:app &

# Frontend
cd /var/www/deepfakedetection/frontend
npm install
VITE_API_URL=https://api.yourdomain.com npm run build

# Nginx config for frontend (port 80) and proxy /api to backend
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API URL for frontend (production) |
| `PORT` | Port for backend (Render, Railway) |
