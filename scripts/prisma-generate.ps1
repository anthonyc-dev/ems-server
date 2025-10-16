Write-Host "Stopping any running Node.js processes..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
if ($?) {
    Write-Host "Node.js processes stopped successfully." -ForegroundColor Green
} else {
    Write-Host "No Node.js processes found to stop." -ForegroundColor Blue
}

Write-Host "Waiting for file handles to be released..." -ForegroundColor Yellow
Start-Sleep -Seconds 2

Write-Host "Cleaning Prisma cache..." -ForegroundColor Yellow
if (Test-Path "node_modules\.prisma") {
    Remove-Item -Path "node_modules\.prisma" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "Prisma cache cleaned." -ForegroundColor Green
}

if (Test-Path "prisma\generated") {
    Remove-Item -Path "prisma\generated" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "Generated files cleaned." -ForegroundColor Green
}

Write-Host "Generating Prisma client..." -ForegroundColor Yellow
npx prisma generate --schema=./prisma/schema

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Prisma client generated successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Prisma generation failed!" -ForegroundColor Red
    exit 1
}
