@echo off
REM ============================================================
REM  Mentor Connect - Windows setup script (double-click friendly)
REM ============================================================
title Mentor Connect Setup

echo.
echo ========================================
echo   Mentor Connect Setup (Windows)
echo ========================================
echo.

where node >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Node.js is not installed or not in PATH.
    echo         Install it from https://nodejs.org (LTS) then try again.
    pause
    exit /b 1
)
echo [OK] Node is installed.

echo.
echo [1/5] Setting up backend .env ...
if not exist "mconnect\backend\.env" (
    if exist "mconnect\backend\.env.example" (
        copy "mconnect\backend\.env.example" "mconnect\backend\.env" >nul
        echo [OK] Created .env from .env.example
        echo      IMPORTANT: Edit it and set the correct DATABASE_URL password!
    ) else (
        echo [WARN] No .env file found.
    )
) else (
    echo [OK] .env already exists.
)

echo.
echo [2/5] Installing backend dependencies ...
pushd mconnect\backend
call npm install
if errorlevel 1 ( popd & pause & exit /b 1 )
popd

echo.
echo [3/5] Installing frontend dependencies ...
pushd mconnect\frontend
call npm install
if errorlevel 1 ( popd & pause & exit /b 1 )
popd

echo.
echo [4/5] Syncing the database schema (Prisma) ...
pushd mconnect\backend
call npx prisma generate
call npx prisma db push
popd

echo.
echo [5/5] Done!
echo.
echo To run the app, open TWO terminals:
echo   1) Backend :  cd mconnect\backend ; npm run dev
echo   2) Frontend:  cd mconnect\frontend; npm run dev
echo.
echo Then open http://localhost:5173 in your browser.
echo To test on your PHONE, open http://^<this PC's IP^>:5173 (same Wi-Fi).
echo.
echo Demo login:  admin@mconnect.com  /  password123
echo.
pause
