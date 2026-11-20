#!/usr/bin/env bash
set -e

# JAL-RAKSHAK Universal Linux/macOS Startup Script
echo "======================================================================="
echo "         JAL-RAKSHAK (जल रक्षक) - Smart Water Intelligence Platform"
echo "                FastAPI + React 18 + AI Telemetry SaaS"
echo "======================================================================="

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

if [ "$1" == "--docker" ]; then
    echo "[Launcher] Starting JAL-RAKSHAK stack using Docker Compose..."
    docker compose up --build
    exit 0
fi

# 1. Setup Backend
echo "[1/3] Setting up Python virtual environment..."
if [ ! -d "backend/venv" ]; then
    python3 -m venv backend/venv
    backend/venv/bin/pip install --upgrade pip
    backend/venv/bin/pip install -r backend/requirements.txt
fi

# 2. Setup Frontend
echo "[2/3] Checking Frontend Dependencies..."
if [ ! -d "frontend/node_modules" ]; then
    cd frontend && npm install && cd ..
fi

# 3. Launch Services
echo "[3/3] Starting JAL-RAKSHAK Services..."
trap 'kill 0' SIGINT SIGTERM EXIT

cd "$ROOT_DIR/backend"
"$ROOT_DIR/backend/venv/bin/uvicorn" main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

sleep 3

cd "$ROOT_DIR/frontend"
npm run dev -- --host 0.0.0.0 &
FRONTEND_PID=$!

echo ""
echo "======================================================================="
echo "JAL-RAKSHAK is live!"
echo "- Web Command Centre  : http://localhost:5173"
echo "- FastAPI REST Docs   : http://localhost:8000/api/v1/docs"
echo "- System Health Ping  : http://localhost:8000/api/v1/health"
echo "======================================================================="
echo "Press Ctrl+C to stop all services."

wait
