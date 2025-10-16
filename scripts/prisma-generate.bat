@echo off
echo Stopping any running Node.js processes...
taskkill /f /im node.exe >nul 2>&1
if %errorlevel% neq 0 (
    echo No Node.js processes found to stop.
) else (
    echo Node.js processes stopped successfully.
)

echo Waiting for file handles to be released...
timeout /t 2 /nobreak >nul

echo Cleaning Prisma cache...
if exist "node_modules\.prisma" (
    rmdir /s /q "node_modules\.prisma"
    echo Prisma cache cleaned.
)

if exist "prisma\generated" (
    rmdir /s /q "prisma\generated"
    echo Generated files cleaned.
)

echo Generating Prisma client...
npx prisma generate --schema=./prisma/schema

if %errorlevel% equ 0 (
    echo ✅ Prisma client generated successfully!
) else (
    echo ❌ Prisma generation failed!
    exit /b 1
)