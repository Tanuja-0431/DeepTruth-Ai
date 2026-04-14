# Deepfake Detection - Windows Setup
Write-Host "Setting up Deepfake Detection..." -ForegroundColor Green

# Backend
Write-Host "`n[1/2] Backend setup..." -ForegroundColor Cyan
Push-Location backend
pip install -r requirements.txt
Pop-Location

# Frontend
Write-Host "`n[2/2] Frontend setup..." -ForegroundColor Cyan
Push-Location frontend
npm install
Pop-Location

Write-Host "`nDone! Run:" -ForegroundColor Green
Write-Host "  Terminal 1: cd backend; python app.py"
Write-Host "  Terminal 2: cd frontend; npm run dev"
Write-Host "  Open: http://localhost:5173"
