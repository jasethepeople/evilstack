#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════
# Evil Stack — Autonomous Task & Data Orchestration Dashboard
# One-command scaffold + launch script
# ═══════════════════════════════════════════════════════════════════

set -euo pipefail

PROJECT_DIR="${PROJECT_DIR:-$(pwd)}"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"

echo ""
echo "    ███████╗██╗   ██╗██╗██╗         ███████╗████████╗ █████╗  ██████╗██╗  ██╗"
echo "    ██╔════╝██║   ██║██║██║         ██╔════╝╚══██╔══╝██╔══██╗██╔════╝██║ ██╔╝"
echo "    █████╗  ██║   ██║██║██║         ███████╗   ██║   ███████║██║     █████╔╝ "
echo "    ██╔══╝  ╚██╗ ██╔╝██║██║         ╚════██║   ██║   ██╔══██║██║     ██╔═██╗ "
echo "    ███████╗ ╚████╔╝ ██║███████╗    ███████║   ██║   ██║  ██║╚██████╗██║  ██╗"
echo "    ╚══════╝  ╚═══╝  ╚═╝╚══════╝    ╚══════╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝"
echo ""
echo "    ┌─────────────────────────────────────────────────────────────────────┐"
echo "    │  Autonomous Task & Data Orchestration Dashboard                    │"
echo "    │  Go Backend (net/http, port 0) + React Frontend (Vite, Tailwind)   │"
echo "    └─────────────────────────────────────────────────────────────────────┘"
echo ""

# ─── Check Prerequisites ───────────────────────────────────────────
command -v go >/dev/null 2>&1 || { echo "[ERROR] Go is not installed. Install from https://go.dev/dl/"; exit 1; }
echo "[OK] Go version: $(go version)"

if command -v npm >/dev/null 2>&1; then
    echo "[OK] npm version: $(npm --version)"
else
    echo "[WARN] npm not found — frontend will need manual build"
fi

# ─── Backend ───────────────────────────────────────────────────────
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  1/3  BUILDING GO BACKEND"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
(
    cd "$BACKEND_DIR"
    go mod tidy
    go build -o evil-engine .
    echo "[OK] Backend binary: $BACKEND_DIR/evil-engine"
)

# ─── Frontend ──────────────────────────────────────────────────────
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  2/3  BUILDING FRONTEND"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if command -v npm >/dev/null 2>&1; then
    (
        cd "$FRONTEND_DIR"
        npm install
        npm run build
        echo "[OK] Frontend built: $FRONTEND_DIR/dist/"
    )
else
    echo "[SKIP] npm not available — using pre-built dist/ if present"
    if [ ! -d "$FRONTEND_DIR/dist" ]; then
        echo "[ERROR] No dist/ found and npm unavailable. Cannot build frontend."
        exit 1
    fi
fi

# ─── Launch ────────────────────────────────────────────────────────
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  3/3  LAUNCHING SERVICES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Start backend in background, capture its port
echo "[INFO] Starting Go backend on dynamic port (0.0.0.0:0)..."
cd "$BACKEND_DIR"
./evil-engine &
BACKEND_PID=$!
sleep 1

# Get the actual port from process
BACKEND_PORT=$(ss -tlnp 2>/dev/null | grep "evil-engine" | awk '{print $4}' | cut -d: -f2 | head -1)
if [ -z "$BACKEND_PORT" ]; then
    BACKEND_PORT=$(lsof -iTCP -sTCP:LISTEN -P 2>/dev/null | grep evil-engine | awk '{print $9}' | cut -d: -f2 | head -1)
fi
if [ -z "$BACKEND_PORT" ]; then
    echo "[WARN] Could not auto-detect backend port. Check with: lsof -i | grep evil-engine"
    BACKEND_PORT="<check manually>"
else
    echo "[OK] Backend running on port $BACKEND_PORT (PID $BACKEND_PID)"
fi

echo ""
echo "[INFO] Starting frontend dev server..."
echo ""
echo "    ┌─────────────────────────────────────────────────────────────────┐"
echo "    │  DASHBOARD:  http://localhost:3000                               │"
echo "    │  BACKEND:    http://localhost:$BACKEND_PORT                       │"
echo "    │  API:        http://localhost:$BACKEND_PORT/api/config            │"
echo "    │  SSE:        http://localhost:$BACKEND_PORT/api/telemetry/stream  │"
echo "    │                                                                  │"
echo "    │  Press Ctrl+C to stop both services                              │"
echo "    └─────────────────────────────────────────────────────────────────┘"
echo ""

# Serve the built frontend static files using Python's http.server
cd "$FRONTEND_DIR/dist"
python3 -m http.server 3000 --bind 127.0.0.1 &
FRONTEND_PID=$!

# Cleanup on exit
cleanup() {
    echo ""
    echo "[INFO] Shutting down services..."
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    wait
    echo "[OK] All services stopped."
    exit 0
}
trap cleanup INT TERM EXIT

# Keep script running
wait
