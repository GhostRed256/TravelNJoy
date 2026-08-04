import React from 'react';
import { cn } from '@/lib/utils';

interface WheelIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

export default function WheelIcon({ className, ...props }: WheelIconProps) {
  return (
    <svg viewBox="0 0 100 100" className={cn("flex-shrink-0", className)} fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      {/* Outer tire */}
      <circle cx="50" cy="50" r="46" stroke="currentColor" strokeWidth="7" />
      {/* Inner rim */}
      <circle cx="50" cy="50" r="34" stroke="currentColor" strokeWidth="4" />
      {/* Hub center */}
      <circle cx="50" cy="50" r="9" fill="currentColor" />
      <circle cx="50" cy="50" r="5" fill="white" className="dark:fill-[#0A0A0F]" />
      {/* 5 spokes */}
      <line x1="50" y1="41" x2="50" y2="16" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
      <line x1="50" y1="41" x2="72" y2="27" stroke="currentColor" strokeWidth="5" strokeLinecap="round" transform="rotate(72 50 50)" />
      <line x1="50" y1="41" x2="72" y2="27" stroke="currentColor" strokeWidth="5" strokeLinecap="round" transform="rotate(144 50 50)" />
      <line x1="50" y1="41" x2="72" y2="27" stroke="currentColor" strokeWidth="5" strokeLinecap="round" transform="rotate(216 50 50)" />
      <line x1="50" y1="41" x2="72" y2="27" stroke="currentColor" strokeWidth="5" strokeLinecap="round" transform="rotate(288 50 50)" />
    </svg>
  );
}
