# Run backend and frontend
$backend = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\..\backend'; python app.py" -PassThru
Start-Sleep -Seconds 2
$frontend = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\..\frontend'; npm run dev" -PassThru
Write-Host "Backend and frontend started. Close windows to stop."
