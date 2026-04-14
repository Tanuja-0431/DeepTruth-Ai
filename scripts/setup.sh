#!/bin/bash
# Deepfake Detection - Linux/macOS Setup
set -e
echo "Setting up Deepfake Detection..."

echo -e "\n[1/2] Backend setup..."
cd backend
pip install -r requirements.txt
cd ..

echo -e "\n[2/2] Frontend setup..."
cd frontend
npm install
cd ..

echo -e "\nDone! Run:"
echo "  Terminal 1: cd backend && python app.py"
echo "  Terminal 2: cd frontend && npm run dev"
echo "  Open: http://localhost:5173"
