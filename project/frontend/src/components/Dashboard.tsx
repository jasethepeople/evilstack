import React, { useEffect, useState } from 'react';
import { discoverBackend, getBaseUrl } from '../lib/api';
import TelemetryPanel from './TelemetryPanel';
import AgentQueue from './AgentQueue';
import LogStream from './LogStream';
import ControlPanel from './ControlPanel';

const Dashboard: React.FC = () => {
  const [, setDiscovered] = useState(false);
  const [discovering, setDiscovering] = useState(true);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const runDiscovery = async () => {
      setDiscovering(true);
      try {
        const port = await discoverBackend();
        if (!cancelled) {
          setDiscovered(true);
          setConnected(port !== 0);
        }
      } catch {
        if (!cancelled) {
          setDiscovered(true);
          setConnected(false);
        }
      } finally {
        if (!cancelled) setDiscovering(false);
      }
    };
    runDiscovery();

    // Poll connection status every 5 seconds
    const iv = setInterval(async () => {
      try {
        const url = getBaseUrl();
        if (!url) {
          setConnected(false);
          return;
        }
        const res = await fetch(`${url}/api/config`, { signal: AbortSignal.timeout(2000) });
        setConnected(res.ok);
      } catch {
        setConnected(false);
      }
    }, 5000);

    return () => {
      cancelled = true;
      clearInterval(iv);
    };
  }, []);

  if (discovering) {
    return (
      <div className="min-h-screen bg-evil-900 flex flex-col items-center justify-center gap-4">
        <div className="w-8 h-8 border-2 border-evil-accent border-t-transparent rounded-full animate-spin" />
        <div className="text-sm font-mono text-gray-400">Discovering backend…</div>
        <div className="text-[10px] font-mono text-gray-600">scanning ports 8080, 3001, 8000, 9000, 5000</div>
      </div>
    );
  }

  if (!connected) {
    return (
      <div className="min-h-screen bg-evil-900 flex flex-col items-center justify-center gap-4">
        <div className="text-4xl font-bold text-evil-accent2">⚠</div>
        <div className="text-sm font-mono text-gray-400">Backend not connected</div>
        <div className="text-[10px] font-mono text-gray-600">set port via localStorage.setItem('evilBackendPort', PORT)</div>
        <button
          onClick={() => window.location.reload()}
          className="btn-primary text-xs mt-2"
        >
          Retry Discovery
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-evil-900 p-4 lg:p-6">
      {/* Header */}
      <header className="mb-6 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-evil-accent animate-pulse shadow-[0_0_10px_#00ff88]" />
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              EVIL <span className="text-evil-accent">STACK</span>
            </h1>
            <p className="text-[10px] text-gray-500 font-mono uppercase tracking-[0.15em]">
              Task Orchestration Dashboard
            </p>
          </div>
        </div>
        <div className="sm:ml-auto flex items-center gap-2">
          <span className="badge badge-green">v1.0.0</span>
          <span className={`badge ${connected ? 'badge-green' : 'badge-red'}`}>
            {connected ? 'CONNECTED' : 'OFFLINE'}
          </span>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Row 1: Telemetry — full width */}
        <div className="lg:col-span-3">
          <TelemetryPanel />
        </div>

        {/* Row 2: AgentQueue (left 1/3) + LogStream (right 2/3) */}
        <div className="lg:col-span-1 min-h-[320px]">
          <AgentQueue />
        </div>
        <div className="lg:col-span-2 min-h-[320px]">
          <LogStream />
        </div>

        {/* Row 3: ControlPanel — full width */}
        <div className="lg:col-span-3">
          <ControlPanel />
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-6 text-center text-[10px] text-gray-600 font-mono">
        Evil Stack Orchestrator — Go backend + React frontend — SSE telemetry — REST API
      </footer>
    </div>
  );
};

export default Dashboard;
