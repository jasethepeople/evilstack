# Evil Stack — Autonomous Task & Data Orchestration Dashboard

## Overview
A hyper-performance, autonomous application utilizing the "Evil Stack" methodology: Go (Fiber) backend for raw speed, Bun + Elysia frontend for fluid composition. A real-time telemetry dashboard with multi-agent task orchestration simulation.

---

## Architecture

### Backend: Go (Fiber)
- **Server:** Fiber on dynamic port 0 (`0.0.0.0:0`)
- **State:** In-memory with sync.RWMutex, Go channels for task queue
- **Endpoints:**
  - `GET /api/config` → `{ "port": <actual_port>, "version": "1.0.0" }`
  - `GET /api/telemetry/stream` → SSE stream of TelemetrySnapshot (every 500ms)
  - `POST /api/tasks` → Dispatch task `{ "type": string, "payload": object }`
  - `GET /api/tasks` → List all tasks
  - `GET /api/agents` → List agent statuses
  - `GET /api/logs` → System logs (recent 100)
- **CORS:** Allow all origins, all methods
- **Telemetry:** Simulated CPU %, Memory %, Active Goroutines, Request Count, Token Throughput
- **Agent Simulation:** 3 agents (Claude, DeepSeek, Hermes) processing tasks from channel queue

### Frontend: Bun + Elysia + React + Tailwind
- **Runtime:** Bun, Vite for bundling
- **Framework:** React 18 + Elysia (Bun server) for SSR/dev
- **Styling:** Tailwind CSS, dark-mode-first (`bg-gray-950` base)
- **Real-time:** EventSource connected to `/api/telemetry/stream`
- **API Discovery:** First fetches `/api/config` to get actual backend port
- **Components:**
  - Dashboard — main layout grid
  - TelemetryPanel — 4 stat cards + sparkline mini-chart
  - AgentQueue — live agent cards with status (idle/busy/processing)
  - ControlPanel — task dispatch form + quick-action buttons
  - LogStream — scrolling log feed from SSE
- **No placeholders. Full implementation.**

---

## Data Models

### TelemetrySnapshot (JSON, SSE)
```json
{
  "timestamp": 1715900000000,
  "cpu": 42.5,
  "memory": 67.2,
  "goroutines": 28,
  "requests": 1520,
  "tokensPerSecond": 1240
}
```

### Task (JSON)
```json
{
  "id": "uuid",
  "type": "analysis|generation|refactor|deploy",
  "payload": { ... },
  "status": "pending|running|completed|failed",
  "agent": "Claude|DeepSeek|Hermes|",
  "createdAt": "ISO8601",
  "startedAt": "ISO8601|null",
  "completedAt": "ISO8601|null"
}
```

### Agent (JSON)
```json
{
  "name": "Claude",
  "status": "idle|processing|error",
  "currentTask": "uuid|null",
  "processedCount": 42,
  "avgLatencyMs": 1200
}
```

---

## Backend File Structure
```
backend/
  go.mod
  main.go
  handlers/
    telemetry.go
    tasks.go
    config.go
    logs.go
  models/
    models.go
  simulator/
    engine.go
    agents.go
```

## Frontend File Structure
```
frontend/
  package.json
  tsconfig.json
  vite.config.ts
  tailwind.config.js
  elysia.config.ts
  src/
    main.tsx
    index.html
    styles.css
    components/
      Dashboard.tsx
      TelemetryPanel.tsx
      AgentQueue.tsx
      ControlPanel.tsx
      LogStream.tsx
    lib/
      api.ts
  public/
```

---

## Integration Contract
1. Frontend reads `backendPort` from `/api/config` at startup
2. All subsequent API calls target `http://localhost:<backendPort>/api/*`
3. SSE connection established once port is known
4. CORS on backend allows `*` origins

## Build & Run
- **Backend:** `cd backend && go run .`
- **Frontend:** `cd frontend && bun install && bun run dev`
- **One-command scaffold:** `bash scaffold.sh`
