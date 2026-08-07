export interface TelemetrySnapshot {
  timestamp: number; cpu: number; memory: number; goroutines: number;
  requests: number; tokensPerSecond: number;
}
export interface Task { id: string; type: string; payload: Record<string, unknown>; status: string; agent: string; createdAt: string; startedAt?: string; completedAt?: string; }
export interface Agent { name: string; status: string; currentTask: string; processedCount: number; avgLatencyMs: number; }
export interface Config { port: number; version: string; }
export interface LogEntry { timestamp: string; level: string; message: string; }

// baseUrl managed per-call via getBaseUrl()

function getBackendPort(): number {
  const w = window as any;
  if (w.__BACKEND_PORT__ && w.__BACKEND_PORT__ !== 0) return w.__BACKEND_PORT__;
  const stored = localStorage.getItem('evilBackendPort');
  if (stored) return parseInt(stored);
  return 0;
}

export function setBackendPort(port: number) {
  localStorage.setItem('evilBackendPort', String(port));
  (window as any).__BACKEND_PORT__ = port;
}

export async function discoverBackend(): Promise<number> {
  // Try common ports
  for (const port of [8080, 3001, 8000, 9000, 5000]) {
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 500);
      const res = await fetch(`http://localhost:${port}/api/config`, { signal: ctrl.signal });
      clearTimeout(timer);
      if (res.ok) {
        const cfg: Config = await res.json();
        setBackendPort(cfg.port);
        return cfg.port;
      }
    } catch { /* continue */ }
  }
  return getBackendPort();
}

export function getBaseUrl(): string {
  const port = getBackendPort();
  if (!port) return '';
  return `http://localhost:${port}`;
}

export async function fetchConfig(): Promise<Config> {
  const res = await fetch(`${getBaseUrl()}/api/config`);
  return res.json();
}
export async function fetchTasks(): Promise<Task[]> {
  const res = await fetch(`${getBaseUrl()}/api/tasks`);
  return res.json();
}
export async function fetchAgents(): Promise<Agent[]> {
  const res = await fetch(`${getBaseUrl()}/api/agents`);
  return res.json();
}
export async function fetchLogs(): Promise<LogEntry[]> {
  const res = await fetch(`${getBaseUrl()}/api/logs`);
  return res.json();
}
export async function dispatchTask(type: string, payload: Record<string, unknown>): Promise<Task> {
  const res = await fetch(`${getBaseUrl()}/api/tasks`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, payload }),
  });
  return res.json();
}
export function connectTelemetryStream(onData: (d: TelemetrySnapshot) => void): EventSource | null {
  const url = getBaseUrl();
  if (!url) return null;
  const es = new EventSource(`${url}/api/telemetry/stream`);
  es.onmessage = (e) => { try { onData(JSON.parse(e.data)); } catch { /* skip */ } };
  return es;
}
