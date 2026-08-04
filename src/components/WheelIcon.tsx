import React from 'react';
import { cn } from '@/lib/utils';

interface WheelIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

export default function WheelIcon({ className, ...props }: WheelIconProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={cn("flex-shrink-0", className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g id="Wheel" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
        <circle id="Tire" fill="#1E293B" cx="50" cy="50" r="50" />
        <circle id="Rim-Outer" fill="#7C3AED" className="dark:fill-[#8B5CF6]" cx="50" cy="50" r="42" />
        <circle id="Rim-Inner" fill="#5B21B6" className="dark:fill-[#6D28D9]" cx="50" cy="50" r="34" />
        <g id="Spokes" transform="translate(19.000000, 19.000000)" fill="#7C3AED" className="dark:fill-[#8B5CF6]">
          <rect x="29" y="0" width="4" height="62" rx="2" />
          <rect transform="translate(31.000000, 31.000000) rotate(72.000000) translate(-31.000000, -31.000000) " x="29" y="0" width="4" height="62" rx="2" />
          <rect transform="translate(31.000000, 31.000000) rotate(144.000000) translate(-31.000000, -31.000000) " x="29" y="0" width="4" height="62" rx="2" />
          <rect transform="translate(31.000000, 31.000000) rotate(216.000000) translate(-31.000000, -31.000000) " x="29" y="0" width="4" height="62" rx="2" />
          <rect transform="translate(31.000000, 31.000000) rotate(288.000000) translate(-31.000000, -31.000000) " x="29" y="0" width="4" height="62" rx="2" />
        </g>
        <circle id="Center-Cap" fill="#1E293B" className="dark:fill-[#0F172A]" cx="50" cy="50" r="8" />
      </g>
    </svg>
  );
}
