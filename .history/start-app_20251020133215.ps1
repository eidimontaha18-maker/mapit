# Start Both Backend and Frontend for MapIt

Write-Host "🚀 Starting MapIt Application..." -ForegroundColor Cyan
Write-Host "=" * 60
Write-Host ""

# Test database connection first
Write-Host "📊 Step 1: Testing Database Connection..." -ForegroundColor Yellow
npm run db:test
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Database connection failed! Please check PostgreSQL is running." -ForegroundColor Red
    Write-Host ""
    exit 1
}

Write-Host ""
Write-Host "=" * 60
Write-Host ""

# Start backend server
Write-Host "🌐 Step 2: Starting Backend Server (Port 3101)..." -ForegroundColor Yellow
$backendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    node server.js
}

# Wait for backend to start
Start-Sleep -Seconds 3

# Check if backend started successfully
$backendRunning = $false
try {
    $response = Invoke-WebRequest -Uri "http://127.0.0.1:3101/api/health" -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        $backendRunning = $true
        Write-Host "✅ Backend server started successfully!" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Backend server failed to start!" -ForegroundColor Red
    Stop-Job $backendJob
    Remove-Job $backendJob
    exit 1
}

Write-Host ""
Write-Host "=" * 60
Write-Host ""

# Start frontend
Write-Host "⚛️  Step 3: Starting Frontend (Port 5173)..." -ForegroundColor Yellow
Write-Host ""
Write-Host "📱 Access your application at:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "   Backend:  http://127.0.0.1:3101" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop both servers" -ForegroundColor Yellow
Write-Host ""

# Start frontend (this will run in foreground)
try {
    npm run dev
} finally {
    # Clean up backend when frontend stops
    Write-Host ""
    Write-Host "🛑 Stopping servers..." -ForegroundColor Yellow
    Stop-Job $backendJob -ErrorAction SilentlyContinue
    Remove-Job $backendJob -ErrorAction SilentlyContinue
    Write-Host "✅ Servers stopped" -ForegroundColor Green
}
