@echo off
setlocal enabledelayedexpansion

echo =======================================================================
echo          JAL-RAKSHAK (जल रक्षक) - Smart Water Intelligence Platform
echo                 FastAPI + React 18 + AI Telemetry SaaS
echo =======================================================================
echo.

set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%"

:: Check if user specified --docker
if "%1"=="--docker" (
    echo [Launcher] Starting JAL-RAKSHAK stack using Docker Compose...
    docker compose up --build
    goto :eof
)

echo [1/3] Checking Backend Python Environment...
if not exist "backend\venv\Scripts\python.exe" (
    echo [Backend] Virtual environment not found. Creating venv...
    python -m venv backend\venv
    echo [Backend] Installing dependencies...
    backend\venv\Scripts\pip.exe install -r backend\requirements.txt
)

echo [2/3] Checking Frontend Dependencies...
if not exist "frontend\node_modules" (
    echo [Frontend] Installing npm packages...
    cd frontend && npm install && cd ..
)

echo [3/3] Launching JAL-RAKSHAK Services...
echo.
echo Starting FastAPI Backend on http://localhost:8000 ...
start "JAL-RAKSHAK Backend (Port 8000)" cmd /k "cd /d %SCRIPT_DIR%backend && venv\Scripts\python.exe -m uvicorn main:app --reload --port 8000"

timeout /t 3 /nobreak >nul

echo Starting React + Vite Command Centre on http://localhost:5173 ...
start "JAL-RAKSHAK Frontend (Port 5173)" cmd /k "cd /d %SCRIPT_DIR%frontend && npm run dev"

echo.
echo =======================================================================
echo JAL-RAKSHAK services successfully initialized!
echo - Web Command Centre  : http://localhost:5173
echo - FastAPI REST Docs   : http://localhost:8000/api/v1/docs
echo - System Health Ping  : http://localhost:8000/api/v1/health
echo =======================================================================
echo.
pause
