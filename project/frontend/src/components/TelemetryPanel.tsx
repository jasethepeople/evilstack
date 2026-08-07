import React, { useEffect, useRef, useState } from 'react';
import { TelemetrySnapshot, connectTelemetryStream } from '../lib/api';

const BUFFER_SIZE = 40;

function useRingBuffer() {
  const buffer = useRef<TelemetrySnapshot[]>([]);
  const [, tick] = useState(0);

  const push = (s: TelemetrySnapshot) => {
    const b = buffer.current;
    b.push(s);
    if (b.length > BUFFER_SIZE) b.shift();
    tick((v) => v + 1);
  };

  return { buffer, push };
}

function buildSparkline(data: number[], viewH = 60, viewW = 200): string {
  if (data.length < 2) return '';
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * viewW;
    const y = viewH - ((v - min) / range) * viewH;
    return `${x},${y}`;
  });
  return points.join(' ');
}

interface StatCardProps {
  label: string;
  value: number;
  unit: string;
  sparklineData: number[];
  strokeColor: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, unit, sparklineData, strokeColor }) => {
  const path = buildSparkline(sparklineData);
  return (
    <div className="panel flex-1 min-w-0">
      <div className="flex items-center justify-between mb-1">
        <span className="stat-label">{label}</span>
        <span className="text-[10px] text-gray-600 font-mono">{unit}</span>
      </div>
      <div className="stat-value" style={{ color: strokeColor }}>
        {typeof value === 'number' ? value.toFixed(1) : '0.0'}
      </div>
      <svg viewBox="0 0 200 60" className="w-full h-10 mt-2" preserveAspectRatio="none">
        {path && (
          <>
            <defs>
              <linearGradient id={`grad-${label}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={strokeColor} stopOpacity="0.3" />
                <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
              </linearGradient>
            </defs>
            <polyline
              fill="none"
              stroke={strokeColor}
              strokeWidth="1.5"
              points={path}
            />
            <polygon
              fill={`url(#grad-${label})`}
              points={`0,60 ${path} 200,60`}
            />
          </>
        )}
      </svg>
    </div>
  );
};

const TelemetryPanel: React.FC = () => {
  const { buffer, push } = useRingBuffer();

  useEffect(() => {
    const es = connectTelemetryStream((data) => {
      push(data);
    });
    return () => {
      es?.close();
    };
  }, []);

  const cpuValues = buffer.current.map((s) => s.cpu);
  const memValues = buffer.current.map((s) => s.memory);
  const goroutineValues = buffer.current.map((s) => s.goroutines);
  const tpsValues = buffer.current.map((s) => s.tokensPerSecond);

  const latest = buffer.current[buffer.current.length - 1] || {
    cpu: 0, memory: 0, goroutines: 0, tokensPerSecond: 0,
  };

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 rounded-full bg-evil-accent animate-pulse" />
        <span className="panel-header mb-0">Live Telemetry</span>
        <span className="text-[10px] text-gray-600 font-mono ml-auto">SSE /api/telemetry/stream</span>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="CPU"
          value={latest.cpu}
          unit="%"
          sparklineData={cpuValues}
          strokeColor="#00ff88"
        />
        <StatCard
          label="Memory"
          value={latest.memory}
          unit="MB"
          sparklineData={memValues}
          strokeColor="#00ccff"
        />
        <StatCard
          label="Goroutines"
          value={latest.goroutines}
          unit="active"
          sparklineData={goroutineValues}
          strokeColor="#a855f7"
        />
        <StatCard
          label="Tokens / sec"
          value={latest.tokensPerSecond}
          unit="tok/s"
          sparklineData={tpsValues}
          strokeColor="#00ccff"
        />
      </div>
    </div>
  );
};

export default TelemetryPanel;
