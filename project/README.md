# Evil Stack — Autonomous Task & Data Orchestration Dashboard

A hyper-performance, autonomous application built with the "Evil Stack" methodology: raw Go speed on the backend, fluid React composition on the frontend.

---

## Architecture

| Layer | Tech | Purpose |
|-------|------|---------|
| **Backend** | Go (stdlib `net/http`) | Ultra-low-latency HTTP server, SSE telemetry, task queue, agent simulation |
| **Frontend** | React 18 + TypeScript + Tailwind CSS | Dark cyber-aesthetic dashboard with real-time telemetry, agent queue, control panel |
| **Protocol** | SSE (Server-Sent Events) + REST | Streaming telemetry + CRUD task API |
| **Port Strategy** | Dynamic `:0` binding | Zero port collisions — OS assigns free port |

---

## Project Structure

```
evil-stack/
  backend/
    go.mod
    main.go                    # Dynamic port binding, CORS, graceful shutdown
    models/
      models.go                # Task, Agent, TelemetrySnapshot, Config, LogEntry
    handlers/
      config.go                # GET /api/config — runtime port discovery
      telemetry.go             # GET /api/telemetry/stream — SSE stream
      tasks.go                 # GET/POST /api/tasks — task CRUD + queue
      logs.go                  # GET /api/logs — ring buffer logs
      agents.go                # GET /api/agents — agent status
    simulator/
      engine.go                # Telemetry generator (500ms sinusoidal + noise)
      agents.go                # 3-agent worker pool (Claude, DeepSeek, Hermes)
  frontend/
    src/
      index.html               # Entry HTML with backend port loader
      main.tsx                 # React 18 StrictMode mount
      styles.css               # Tailwind + custom evil-* theme
      lib/
        api.ts                 # API client: port discovery, SSE, REST calls
      components/
        Dashboard.tsx          # Main layout grid
        TelemetryPanel.tsx     # 4 real-time sparkline stat cards
        AgentQueue.tsx         # 3 live agent cards with status
        ControlPanel.tsx       # Task dispatch form + quick actions
        LogStream.tsx          # Auto-scrolling color-coded log feed
    dist/                      # Production build output
  scaffold.sh                 # One-command setup + launch
```

---

## Quick Start

### Prerequisites
- **Go** 1.21+ — [https://go.dev/dl/](https://go.dev/dl/)
- **Node.js + npm** — [https://nodejs.org/](https://nodejs.org/) (for frontend build)

### One-Command Launch
```bash
cd evil-stack
bash scaffold.sh
```

This will:
1. Build the Go backend binary (`go build`)
2. Build the frontend (`npm install && npm run build`)
3. Launch the backend on a dynamic port
4. Serve the frontend dashboard on `http://localhost:3000`

### Manual Launch (Development)

**Terminal 1 — Backend:**
```bash
cd backend
go mod tidy
go run .
# Backend prints: EVIL_ENGINE_PORT=<actual_port>
```

**Terminal 2 — Frontend Dev:**
```bash
cd frontend
npm install
npm run dev      # Opens http://localhost:3000
```

### Manual Launch (Production)

```bash
# Build both
cd backend && go build -o evil-engine . && cd ..
cd frontend && npm install && npm run build && cd ..

# Start backend
cd backend
./evil-engine &

# Serve frontend static files
cd frontend/dist
python3 -m http.server 3000
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/config` | Returns `{ port, version }` for runtime discovery |
| GET | `/api/telemetry/stream` | SSE stream of TelemetrySnapshot (every 500ms) |
| POST | `/api/tasks` | Dispatch new task `{ type, payload }` |
| GET | `/api/tasks` | List all tasks |
| GET | `/api/agents` | List agent statuses |
| GET | `/api/logs` | Get recent system logs |

---

## Key Design Decisions

- **Port 0 Binding** — Backend binds to `0.0.0.0:0`, prints assigned port to stdout. Frontend discovers via `/api/config` or scanning common ports.
- **Zero External Dependencies (Backend)** — Pure Go stdlib. No Fiber, no UUID library. `crypto/rand` + `net/http` only.
- **SSE over WebSockets** — One-way server→client streaming is simpler, auto-reconnects, works through proxies.
- **Agent Simulation** — 3 goroutine workers simulate real AI agents (Claude, DeepSeek, Hermes) pulling from a buffered channel queue.
- **Graceful Degradation** — Frontend works offline (shows demo data) and auto-discovers backend on startup.

---

## Deployed Frontend

The pre-built frontend dashboard is live at:

> **https://56hjip4fqqniw.kimi.page**

> **Note:** The live demo requires a running backend to show real-time data. The frontend will display a "Backend not connected" state until you start the Go engine locally.

---

## Porting to Replit

1. Create a new **Replit** project
2. Copy `backend/` and `frontend/dist/` into the project
3. In the Replit `.replit` file:
   - **Run command:** `cd backend && go run .`
   - **Port:** Set to `8080` (or let dynamic allocation handle it)
4. Use Replit's web preview to view the dashboard
5. Update `window.__BACKEND_PORT__` in `frontend/dist/index.html` to match Replit's exposed port

---

## License

MIT — Built for speed. No brakes.
