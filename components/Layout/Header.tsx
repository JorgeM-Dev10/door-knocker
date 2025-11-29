'use client';

import { useState, useEffect } from 'react';

export default function Header() {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [status, setStatus] = useState<'ONLINE' | 'OFFLINE'>('ONLINE');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const seconds = now.getSeconds().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}:${seconds}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <header className="w-full border-b border-border-dark bg-bg-card px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-wider text-text-secondary font-display">
            SAPIENS LABORATORIES
          </span>
          <span className="text-2xl font-bold uppercase tracking-wider text-white font-display">
            DOOR KNOCKER
          </span>
        </div>

        {/* Status & Time */}
        <div className="flex items-center gap-6">
          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-text-secondary">
              STATUS:
            </span>
            <div
              className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                status === 'ONLINE'
                  ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                  : 'bg-red-500/20 text-red-400 border border-red-500/50'
              }`}
            >
              {status}
            </div>
          </div>

          {/* Clock */}
          <div className="flex items-center gap-2 px-3 py-1 bg-bg-card-alt rounded border border-border-dark">
            <span className="text-xs uppercase tracking-wider text-text-secondary">
              TIME:
            </span>
            <span className="text-sm font-mono text-white">{currentTime}</span>
          </div>
        </div>
      </div>
    </header>
  );
}

