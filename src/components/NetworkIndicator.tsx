'use client';

import { useState, useEffect } from 'react';
import { WifiOff, Snail, X } from 'lucide-react';

type Status = 'online' | 'offline' | 'slow';

export default function NetworkIndicator() {
  const [status, setStatus] = useState<Status>('online');
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    function evaluate() {
      if (!navigator.onLine) { setStatus('offline'); setDismissed(false); return; }
      const conn = (navigator as any).connection;
      if (conn && (conn.effectiveType === '2g' || conn.effectiveType === 'slow-2g' || conn.saveData)) {
        setStatus('slow'); setDismissed(false);
      } else {
        setStatus('online');
      }
    }

    evaluate();
    window.addEventListener('online', evaluate);
    window.addEventListener('offline', evaluate);
    const conn = (navigator as any).connection;
    if (conn) conn.addEventListener('change', evaluate);

    return () => {
      window.removeEventListener('online', evaluate);
      window.removeEventListener('offline', evaluate);
      if (conn) conn.removeEventListener('change', evaluate);
    };
  }, []);

  if (status === 'online' || dismissed) return null;

  const isOffline = status === 'offline';

  return (
    <div
      className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-[9999] w-[90vw] max-w-sm"
      role="alert"
      aria-live="polite"
    >
      <div className={`
        flex items-start gap-3 rounded-2xl px-4 py-3 shadow-2xl
        backdrop-blur-xl border
        ${isOffline
          ? 'bg-red-900/80 border-red-500/40 text-white'
          : 'bg-amber-900/80 border-amber-500/40 text-white'}
      `}>
        <div className="mt-0.5 shrink-0">
          {isOffline
            ? <WifiOff className="w-5 h-5 text-red-300" />
            : <Snail className="w-5 h-5 text-amber-300" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold">
            {isOffline ? '😞 No Internet Connection' : '🐌 Slow Connection Detected'}
          </p>
          <p className="text-xs mt-0.5 opacity-80">
            {isOffline
              ? 'Please check your network. Some features may not work.'
              : 'Images & data may load slowly. Please be patient.'}
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="shrink-0 p-1 rounded-full hover:bg-white/10 transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4 opacity-70" />
        </button>
      </div>
    </div>
  );
}
