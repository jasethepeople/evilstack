# Evil Stack — Autonomous Task & Data Orchestration Dashboard

## Architecture
- **Backend:** Go (Fiber) — dynamic port 0, CORS, SSE telemetry stream, REST API for task dispatch
- **Frontend:** Bun + Elysia — Tailwind CSS, dark-mode-first, real-time dashboard
- **Integration:** Frontend discovers backend via `/api/config` endpoint (returns actual runtime port)

## Stages

### Stage 1: Go Backend (`/mnt/agents/output/evil-stack/backend/`)
- `main.go` — Fiber server, port 0 binding, CORS, structured logging
- `handlers/telemetry.go` — SSE stream for CPU/Memory/agent metrics simulation
- `handlers/tasks.go` — Task dispatch queue (in-memory with channel-based workers)
- `handlers/config.go` — Runtime config endpoint (returns actual bound port)
- `models/` — Shared data structures (Task, Agent, TelemetrySnapshot)
- `go.mod` — Module definition

### Stage 2: Frontend (`/mnt/agents/output/evil-stack/frontend/`)
- `src/index.html` — Single-page dashboard
- `src/main.tsx` — Elysia mounting point
- `src/components/Dashboard.tsx` — Main layout
- `src/components/TelemetryPanel.tsx` — CPU/Memory/token charts
- `src/components/AgentQueue.tsx` — Live agent processing feed
- `src/components/ControlPanel.tsx` — Task dispatch controls
- `src/lib/api.ts` — Backend API client with dynamic port discovery
- `src/styles.css` — Tailwind directives + custom dark theme
- `package.json`, `tailwind.config.js`, `vite.config.ts`, `tsconfig.json`, `elysia.config.ts`

### Stage 3: Scaffold Script (`/mnt/agents/output/evil-stack/`)
- `scaffold.sh` — Creates all directories and files via `cat << 'EOF'`
- `README.md` — Run instructions

### Stage 4: Deploy
- Deploy via static hosting for frontend
- Backend runs in background
