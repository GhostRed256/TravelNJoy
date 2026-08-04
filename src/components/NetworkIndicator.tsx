'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

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
          ? 'bg-red-950/80 border-red-500/30 text-white'
          : 'bg-amber-950/80 border-amber-500/30 text-white'}
      `}>
        <div className="mt-0.5 shrink-0">
          {isOffline ? (
            /* Disconnected plug / no-wifi vector */
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <line x1="2" y1="2" x2="22" y2="22" />
              <path d="M8.5 16.5a5 5 0 0 1 7-7" />
              <path d="M5 12.5A10 10 0 0 1 19.5 7" />
              <path d="M2 8.5A15 15 0 0 1 22 6" />
              <path d="M10.5 21l1.5-3" />
              <path d="M13.5 21l-1.5-3" />
              <circle cx="12" cy="18" r="0.5" fill="currentColor" />
            </svg>
          ) : (
            /* Slow / snail-like signal bars vector */
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="17" width="3" height="4" rx="0.5" fill="currentColor" opacity="0.5" />
              <rect x="7" y="13" width="3" height="8" rx="0.5" fill="currentColor" opacity="0.5" />
              <rect x="12" y="9" width="3" height="12" rx="0.5" fill="currentColor" opacity="0.3" />
              <rect x="17" y="5" width="3" height="16" rx="0.5" fill="currentColor" opacity="0.2" />
              <line x1="3" y1="3" x2="21" y2="21" stroke="currentColor" strokeWidth="2" />
            </svg>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold">
            {isOffline ? 'No Internet Connection' : 'Slow Connection Detected'}
          </p>
          <p className="text-xs mt-0.5 opacity-70">
            {isOffline
              ? 'Please check your network. Some features may not work.'
              : 'Images and data may load slowly. Please be patient.'}
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="shrink-0 p-1 rounded-full hover:bg-white/10 transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4 opacity-60" />
        </button>
      </div>
    </div>
  );
}
