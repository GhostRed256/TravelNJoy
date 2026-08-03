'use client';

import { useState, useEffect } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { ThemeMode } from '@/lib/theme';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const options: { mode: ThemeMode; label: string; icon: typeof Sun }[] = [
    { mode: 'light', label: 'Light Mode', icon: Sun },
    { mode: 'auto', label: 'Auto (System / Time)', icon: Monitor },
    { mode: 'dark', label: 'Dark Purple Neon Mode', icon: Moon },
  ];

  const getPillPosition = () => {
    switch (theme) {
      case 'light':
        return 'translate-x-0 bg-white text-amber-500 shadow-md shadow-amber-500/10 border border-amber-200/50';
      case 'auto':
        return 'translate-x-full bg-purple-600/90 text-white shadow-md shadow-purple-500/30 border border-purple-400/50';
      case 'dark':
        return 'translate-x-[200%] bg-[#19192C] text-purple-400 shadow-[0_0_15px_rgba(139,92,246,0.4)] border border-purple-500/40';
      default:
        return 'translate-x-0 bg-white text-amber-500';
    }
  };

  return (
    <div
      className="relative flex items-center p-1 rounded-full bg-slate-200/80 dark:bg-[#131322] border border-slate-300/60 dark:border-purple-800/40 shadow-inner backdrop-blur-md transition-colors duration-300"
      role="group"
      aria-label="Theme mode selector"
    >
      {/* Sliding pill indicator */}
      {mounted && (
        <div
          className={`absolute top-1 left-1 w-8 h-8 rounded-full transition-transform duration-300 cubic-bezier(0.4,0,0.2,1) pointer-events-none ${getPillPosition()}`}
        />
      )}

      {options.map(({ mode, label, icon: Icon }) => {
        const isActive = mounted && theme === mode;
        return (
          <button
            key={mode}
            type="button"
            onClick={() => setTheme(mode)}
            title={label}
            aria-label={label}
            className={`relative z-10 w-8 h-8 flex items-center justify-center rounded-full transition-colors duration-200 ${
              isActive
                ? mode === 'light'
                  ? 'text-amber-500'
                  : mode === 'auto'
                  ? 'text-white'
                  : 'text-purple-400'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-purple-300'
            }`}
          >
            <Icon className="w-4 h-4 transition-transform duration-200 hover:scale-110" />
          </button>
        );
      })}
    </div>
  );
}
