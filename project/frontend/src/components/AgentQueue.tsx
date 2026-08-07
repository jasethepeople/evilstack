import React, { useEffect, useState } from 'react';
import { Agent, fetchAgents } from '../lib/api';

const AGENT_COLORS: Record<string, { dot: string; name: string }> = {
  claude: { dot: 'bg-purple-500', name: 'Claude' },
  deepseek: { dot: 'bg-cyan-400', name: 'DeepSeek' },
  hermes: { dot: 'bg-green-400', name: 'Hermes' },
};

function resolveAgent(name: string): { dot: string; display: string } {
  const key = Object.keys(AGENT_COLORS).find((k) =>
    name.toLowerCase().includes(k)
  );
  if (key) return { dot: AGENT_COLORS[key].dot, display: AGENT_COLORS[key].name };
  return { dot: 'bg-gray-400', display: name };
}

function statusBadge(status: string) {
  switch (status) {
    case 'idle': return 'badge badge-green';
    case 'processing': return 'badge badge-yellow';
    case 'error': return 'badge badge-red';
    default: return 'badge badge-blue';
  }
}

function agentCardClass(status: string) {
  switch (status) {
    case 'idle': return 'agent-card agent-idle';
    case 'processing': return 'agent-card agent-processing';
    case 'error': return 'agent-card agent-error';
    default: return 'agent-card agent-idle';
  }
}

const AgentQueue: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);

  useEffect(() => {
    let cancelled = false;
    const poll = async () => {
      try {
        const data = await fetchAgents();
        if (!cancelled) setAgents(data);
      } catch {
        // silently retry
      }
    };
    poll();
    const iv = setInterval(poll, 2000);
    return () => {
      cancelled = true;
      clearInterval(iv);
    };
  }, []);

  return (
    <div className="panel h-full flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <span className="panel-header mb-0">Agent Queue</span>
        <span className="text-[10px] text-gray-600 font-mono ml-auto">poll 2s</span>
      </div>
      <div className="flex flex-col gap-2 flex-1 overflow-y-auto">
        {agents.length === 0 && (
          <div className="text-xs text-gray-500 font-mono p-4 text-center">No agents connected</div>
        )}
        {agents.map((agent) => {
          const { dot, display } = resolveAgent(agent.name);
          return (
            <div key={agent.name} className={agentCardClass(agent.status)}>
              <div className={`w-2.5 h-2.5 rounded-full ${dot} shrink-0`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold truncate">{display}</span>
                  <span className={statusBadge(agent.status)}>{agent.status}</span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-[10px] font-mono text-gray-400">
                  <span>processed: {agent.processedCount}</span>
                  <span>avg: {agent.avgLatencyMs.toFixed(0)}ms</span>
                </div>
                {agent.status === 'processing' && agent.currentTask && (
                  <div className="mt-1 text-[10px] font-mono text-yellow-400 truncate">
                    &gt; {agent.currentTask}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AgentQueue;
