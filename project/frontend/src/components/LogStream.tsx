import React, { useEffect, useRef, useState } from 'react';
import { LogEntry, fetchLogs } from '../lib/api';

const MAX_ENTRIES = 100;

function levelBadge(level: string): string {
  switch (level.toUpperCase()) {
    case 'INFO': return 'badge badge-blue';
    case 'WARN': return 'badge badge-yellow';
    case 'ERROR': return 'badge badge-red';
    case 'DEBUG': return 'badge badge-green';
    default: return 'badge badge-blue';
  }
}

const LogStream: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    const poll = async () => {
      try {
        const data = await fetchLogs();
        if (!cancelled) {
          // Reverse so newest is at bottom, keep max 100
          const reversed = [...data].reverse().slice(0, MAX_ENTRIES);
          setLogs(reversed);
        }
      } catch {
        // silently retry
      }
    };
    poll();
    const iv = setInterval(poll, 1000);
    return () => {
      cancelled = true;
      clearInterval(iv);
    };
  }, []);

  // Auto-scroll to bottom when logs update
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  return (
    <div className="panel h-full flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <span className="panel-header mb-0">System Logs</span>
        <span className="text-[10px] text-gray-600 font-mono ml-auto">{logs.length} entries | poll 1s</span>
      </div>
      <div className="flex-1 overflow-y-auto font-mono text-xs max-h-[400px] bg-evil-900/50 rounded-lg border border-evil-700/30">
        {logs.length === 0 && (
          <div className="text-xs text-gray-500 p-4 text-center">No logs available</div>
        )}
        {logs.map((entry, idx) => (
          <div key={idx} className="log-entry flex items-start gap-2">
            <span className="text-gray-600 shrink-0 w-[70px] text-right">
              {entry.timestamp ? new Date(entry.timestamp).toLocaleTimeString('en-US', { hour12: false }) : '--:--:--'}
            </span>
            <span className={`${levelBadge(entry.level)} shrink-0 w-[50px] text-center`}>
              {entry.level}
            </span>
            <span className="text-gray-300 break-all">{entry.message}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default LogStream;
