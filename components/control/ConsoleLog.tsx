'use client';

import { useEffect, useRef } from 'react';

interface ConsoleLogProps {
  logs: string[];
}

export default function ConsoleLog({ logs }: ConsoleLogProps) {
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="mt-4 bg-bg-card rounded-lg border border-border-dark p-4">
      <h3 className="text-xs uppercase tracking-wider text-text-secondary mb-3 font-display">
        System Console
      </h3>
      <div
        ref={logContainerRef}
        className="h-48 bg-black/50 rounded border border-border-dark p-3 overflow-y-auto font-mono text-xs"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#1b1f2a #000',
        }}
      >
        {logs.length === 0 ? (
          <div className="text-text-secondary/50">[Sistema en espera]</div>
        ) : (
          logs.map((log, index) => (
            <div
              key={index}
              className="text-accent-cyan mb-1 animate-pulse"
              style={{ animationDuration: '0.5s', animationDelay: `${index * 0.1}s` }}
            >
              {log}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

