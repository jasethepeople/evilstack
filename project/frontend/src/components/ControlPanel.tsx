import React, { useState } from 'react';
import { dispatchTask, Task } from '../lib/api';

type TaskType = 'Analysis' | 'Generation' | 'Refactor' | 'Deploy';

const EXAMPLE_PAYLOADS: Record<TaskType, string> = {
  Analysis: JSON.stringify({ file: './src/main.ts', depth: 'full', output: 'report' }, null, 2),
  Generation: JSON.stringify({ template: 'react-component', language: 'typescript', count: 3 }, null, 2),
  Refactor: JSON.stringify({ target: './src/legacy', strategy: 'extract-functions', dryRun: false }, null, 2),
  Deploy: JSON.stringify({ environment: 'staging', version: '1.2.0', rollback: true }, null, 2),
};

const QUICK_TASKS: { type: TaskType; label: string; payload: Record<string, unknown> }[] = [
  { type: 'Analysis', label: 'Analyze', payload: { file: './src/main.ts', depth: 'full', output: 'report' } },
  { type: 'Generation', label: 'Generate', payload: { template: 'react-component', language: 'typescript', count: 3 } },
  { type: 'Refactor', label: 'Refactor', payload: { target: './src/legacy', strategy: 'extract-functions', dryRun: false } },
  { type: 'Deploy', label: 'Deploy', payload: { environment: 'staging', version: '1.2.0', rollback: true } },
];

interface Toast { message: string; type: 'success' | 'error' };

const ControlPanel: React.FC = () => {
  const [taskType, setTaskType] = useState<TaskType>('Analysis');
  const [payload, setPayload] = useState(EXAMPLE_PAYLOADS['Analysis']);
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleTypeChange = (t: TaskType) => {
    setTaskType(t);
    setPayload(EXAMPLE_PAYLOADS[t]);
  };

  const handleDispatch = async (type: TaskType, jsonPayload: string | Record<string, unknown>) => {
    setSending(true);
    try {
      const parsed = typeof jsonPayload === 'string' ? JSON.parse(jsonPayload) : jsonPayload;
      const result: Task = await dispatchTask(type.toLowerCase(), parsed);
      showToast(`Task ${result.id.slice(0, 8)} dispatched to ${result.agent}`, 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Dispatch failed', 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="panel">
      <div className="flex items-center gap-2 mb-4">
        <span className="panel-header mb-0">Task Dispatch</span>
        {toast && (
          <span
            className={`ml-auto text-[11px] font-bold px-2 py-1 rounded-md transition-opacity ${
              toast.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`}
          >
            {toast.message}
          </span>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        {/* Quick actions row */}
        <div className="flex flex-wrap gap-2 shrink-0">
          {QUICK_TASKS.map((qt) => (
            <button
              key={qt.type}
              onClick={() => handleDispatch(qt.type, qt.payload)}
              disabled={sending}
              className="btn-primary whitespace-nowrap disabled:opacity-50"
            >
              {sending ? '…' : qt.label}
            </button>
          ))}
        </div>

        <div className="w-px bg-evil-600/30 hidden lg:block" />

        {/* Detailed form */}
        <div className="flex-1 flex flex-col sm:flex-row gap-3">
          <div className="sm:w-40 shrink-0">
            <label className="stat-label block mb-1.5">Task Type</label>
            <select
              value={taskType}
              onChange={(e) => handleTypeChange(e.target.value as TaskType)}
              className="input-field cursor-pointer"
            >
              <option value="Analysis">Analysis</option>
              <option value="Generation">Generation</option>
              <option value="Refactor">Refactor</option>
              <option value="Deploy">Deploy</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="stat-label block mb-1.5">Payload (JSON)</label>
            <textarea
              value={payload}
              onChange={(e) => setPayload(e.target.value)}
              rows={3}
              className="input-field resize-none text-xs"
              spellCheck={false}
            />
          </div>
          <div className="flex items-end shrink-0">
            <button
              onClick={() => handleDispatch(taskType, payload)}
              disabled={sending}
              className="btn-primary disabled:opacity-50"
            >
              {sending ? 'DISPATCHING…' : 'DISPATCH'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
