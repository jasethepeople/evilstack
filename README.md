# Evil Stack — Autonomous Task & Data Orchestration Dashboard

A real-time telemetry dashboard with a simulated multi-agent task orchestration engine: a Go backend dispatches tasks to simulated AI agents and streams telemetry over SSE, while a React dashboard visualizes it live.

## Features

- **SSE telemetry stream** — `GET /api/telemetry/stream` pushes a `TelemetrySnapshot` (CPU %, memory %, goroutines, request count, tokens/sec) every 500ms; the simulator generates it with a sinusoidal + noise engine
- **Task dispatch & queue** — `POST /api/tasks` dispatches a typed task (`analysis|generation|refactor|deploy`) into a buffered Go channel queue; `GET /api/tasks` lists tasks with pending/running/completed/failed status and timing
- **Simulated 3-agent worker pool** — three goroutine workers named Claude, DeepSeek, and Hermes pull tasks from the queue; `GET /api/agents` reports each agent's status (idle/processing/error), current task, processed count, and average latency
- **Dashboard UI** — five components: `Dashboard` layout grid, `TelemetryPanel` (4 real-time stat cards with sparklines), `AgentQueue` (live agent cards), `ControlPanel` (task dispatch form + quick-action buttons), `LogStream` (auto-scrolling log feed from `GET /api/logs`, a recent-100 ring buffer)
- **Dynamic port binding** — the backend binds `0.0.0.0:0` and prints the assigned port; the frontend discovers it via `GET /api/config`, so there are no port collisions
- **Prebuilt frontend bundle** — `project/frontend/dist/` is committed, with a live demo at https://56hjip4fqqniw.kimi.page (shows a "Backend not connected" state unless the Go engine is running locally)

## Tech stack

- **Backend:** Go 1.21, standard library only (`net/http`, `crypto/rand`) — no external dependencies
- **Frontend:** React 18 + TypeScript, Vite, Tailwind CSS (dark theme)
- **Protocol:** REST + Server-Sent Events

## Getting started

Prerequisites: Go 1.21+ and Node.js + npm.

```bash
cd project
bash scaffold.sh        # builds the Go backend + frontend, launches backend, serves dashboard
```

Manual:

```bash
cd project/backend && go mod tidy && go run .     # prints EVIL_ENGINE_PORT=<port>
cd project/frontend && npm install && npm run dev  # opens http://localhost:3000
```

## API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/config` | Returns `{ port, version }` for runtime port discovery |
| GET | `/api/telemetry/stream` | SSE stream of telemetry snapshots (every 500ms) |
| POST | `/api/tasks` | Dispatch a task: `{ type, payload }` |
| GET | `/api/tasks` | List all tasks |
| GET | `/api/agents` | List agent statuses |
| GET | `/api/logs` | Recent system logs (last 100) |

## Project structure

```
SPEC.md / plan.md          design documents (note: they describe a Fiber + Bun/Elysia
                           stack, but the committed code uses stdlib net/http + Vite/npm)
project/
  backend/
    main.go                port-0 binding, CORS, graceful shutdown
    handlers/              config, telemetry (SSE), tasks, logs, agents
    models/models.go       Task, Agent, TelemetrySnapshot, Config, LogEntry
    simulator/             engine.go (telemetry generator), agents.go (worker pool)
  frontend/
    src/components/        Dashboard, TelemetryPanel, AgentQueue, ControlPanel, LogStream
    src/lib/api.ts         API client: port discovery, SSE, REST calls
    dist/                  committed production build
  scaffold.sh              one-command build + launch
```

## Status

Working prototype. The backend is fully implemented in stdlib Go; the frontend is complete with a committed production build. The project-level README notes the demo frontend will show "Backend not connected" until a local Go engine is started.
