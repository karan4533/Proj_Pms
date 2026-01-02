# Kill all node processes to stop the dev server
Write-Host "Stopping all Node.js processes..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force

# Restart PostgreSQL service
Write-Host "Restarting PostgreSQL service..." -ForegroundColor Yellow
$pgService = Get-Service -Name "postgresql*" | Select-Object -First 1
if ($pgService) {
    Restart-Service -Name $pgService.Name -Force
    Start-Sleep -Seconds 3
    Write-Host "✅ PostgreSQL restarted" -ForegroundColor Green
} else {
    Write-Host "❌ PostgreSQL service not found" -ForegroundColor Red
}

Write-Host ""
Write-Host "✅ Ready! Now run: npm run dev" -ForegroundColor Green
