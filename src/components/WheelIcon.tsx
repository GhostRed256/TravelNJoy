import React from 'react';
import { cn } from '@/lib/utils';

interface WheelIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

export default function WheelIcon({ className, ...props }: WheelIconProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={cn(
        "flex-shrink-0 drop-shadow-[0_0_8px_rgba(124,58,237,0.7)] dark:drop-shadow-[0_0_10px_rgba(34,211,238,0.7)]",
        className
      )}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {/* Outer Black Rubber Tire */}
      <circle cx="50" cy="50" r="46" stroke="#090D16" strokeWidth="8" />
      {/* Tire Tread Accent Ring (Dark Slate/Grey) */}
      <circle cx="50" cy="50" r="49" stroke="#334155" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
      
      {/* Metallic Rim Outer Lip */}
      <circle cx="50" cy="50" r="41" stroke="#94A3B8" strokeWidth="2" />
      <circle cx="50" cy="50" r="39" stroke="#7C3AED" strokeWidth="1.5" />

      {/* 5 Metallic Alloy Spokes with EMPTY (Transparent) Gaps */}
      <g id="Spokes">
        {[0, 72, 144, 216, 288].map((angle) => (
          <g key={angle} transform={`rotate(${angle} 50 50)`}>
            {/* Main Alloy Spoke */}
            <path
              d="M 46 39 L 44 13 C 44 11 56 11 56 13 L 54 39 Z"
              fill="url(#spoke-metal-grad)"
              stroke="#475569"
              strokeWidth="0.8"
            />
            {/* Purple/Cyan Accent Strip down spoke */}
            <line x1="50" y1="12" x2="50" y2="38" stroke="#A78BFA" strokeWidth="1.5" strokeLinecap="round" />
          </g>
        ))}
      </g>

      {/* Center Wheel Hub / Cap */}
      <circle cx="50" cy="50" r="12" fill="#090D16" stroke="#7C3AED" strokeWidth="2" />
      <circle cx="50" cy="50" r="8" fill="#1E293B" />
      {/* Cyan Glowing Hub Center */}
      <circle cx="50" cy="50" r="4" fill="#06B6D4" />

      {/* Lug Nuts */}
      {[0, 72, 144, 216, 288].map((angle) => {
        const rad = (angle * Math.PI) / 180;
        return (
          <circle
            key={`lug-${angle}`}
            cx={50 + 9.5 * Math.sin(rad)}
            cy={50 - 9.5 * Math.cos(rad)}
            r="1"
            fill="#E2E8F0"
          />
        );
      })}

      {/* Metal Gradient */}
      <defs>
        <linearGradient id="spoke-metal-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E2E8F0" />
          <stop offset="50%" stopColor="#64748B" />
          <stop offset="100%" stopColor="#334155" />
        </linearGradient>
      </defs>
    </svg>
  );
}
