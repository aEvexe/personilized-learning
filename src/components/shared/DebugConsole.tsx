import { useState, useRef, useEffect } from 'react';

interface LogEntry {
  id: number;
  message: string;
  type: 'info' | 'error' | 'warn';
  timestamp: string;
}

let logIdCounter = 0;
const logEntries: LogEntry[] = [];
const listeners: Set<() => void> = new Set();

export function debugLog(message: unknown, type: 'info' | 'error' | 'warn' = 'info') {
  const timestamp = new Date().toLocaleTimeString();
  const msg = typeof message === 'object' ? JSON.stringify(message, null, 2) : String(message);
  logEntries.push({ id: logIdCounter++, message: msg, type, timestamp });
  if (logEntries.length > 200) logEntries.shift();
  listeners.forEach(fn => fn());
  console.log(`[${type.toUpperCase()}]`, message);
}

export function DebugConsole({ visible }: { visible: boolean }) {
  const [, forceUpdate] = useState(0);
  const logsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const listener = () => forceUpdate(n => n + 1);
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  }, []);

  useEffect(() => {
    if (logsRef.current) {
      logsRef.current.scrollTop = logsRef.current.scrollHeight;
    }
  });

  if (!visible) return null;

  return (
    <div className="debug-console">
      <div className="debug-header">
        <strong>Debug Console</strong>
        <button className="btn-secondary" onClick={() => { logEntries.length = 0; forceUpdate(n => n + 1); }}>
          Clear Logs
        </button>
      </div>
      <div ref={logsRef} id="debug-logs">
        {logEntries.map(entry => (
          <div key={entry.id} className={`log ${entry.type}`}>
            <strong>[{entry.timestamp}]</strong> {entry.message}
          </div>
        ))}
      </div>
    </div>
  );
}
