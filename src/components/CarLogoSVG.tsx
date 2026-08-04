'use client';

import { cn } from '@/lib/utils';

interface CarLogoSVGProps {
  className?: string;
}

export default function CarLogoSVG({ className }: CarLogoSVGProps) {
  return (
    <svg
      viewBox="0 0 500 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('w-full h-full object-contain', className)}
    >
      <g id="Supercar-Outline">
        {/* Car Body Fill - Dark Slate in light mode, Pure White in dark mode */}
        <path
          d="M85 118C90 100 115 90 150 78C200 62 250 58 320 62C360 65 390 78 412 95C420 102 422 110 420 120C415 130 395 138 375 140H110C95 140 82 130 85 118Z"
          className="fill-slate-900 dark:fill-white transition-colors duration-300"
        />
        
        {/* Main Supercar Silhouette path */}
        <path
          d="M72 125C70 120 78 108 92 98C108 86 138 74 182 66C226 58 288 56 348 64C392 70 422 84 436 96C446 104 448 116 442 126C438 132 428 136 410 137C408 118 392 104 372 104C352 104 336 118 334 137H224C222 118 206 104 186 104C166 104 150 118 148 137H100C84 137 74 132 72 125Z"
          className="fill-slate-900 dark:fill-white transition-colors duration-300"
        />

        {/* Roofline / Windshield Contour cutout */}
        <path
          d="M175 70C215 60 270 58 325 64C355 67 375 75 392 88C360 84 315 82 270 85C225 88 190 95 170 102C168 90 170 78 175 70Z"
          className="fill-slate-100 dark:fill-[#0A0A0F] transition-colors duration-300"
        />
        
        {/* Side Mirror */}
        <path
          d="M260 88C265 85 278 85 282 90C282 94 272 96 265 94L260 88Z"
          className="fill-slate-900 dark:fill-white transition-colors duration-300"
        />

        {/* Headlight Cyan Accents */}
        <path
          d="M85 106L112 96L125 110L102 114Z"
          fill="#00F2FE"
          className="drop-shadow-[0_0_8px_rgba(0,242,254,0.8)]"
        />
        <path
          d="M142 98L160 92L165 98L148 102Z"
          fill="#00F2FE"
          className="drop-shadow-[0_0_6px_rgba(0,242,254,0.8)]"
        />

        {/* Front Wheel Cyan Rim Accent */}
        <circle cx="186" cy="137" r="26" fill="#0A0A0F" stroke="#00F2FE" strokeWidth="6" className="drop-shadow-[0_0_10px_rgba(0,242,254,0.7)]" />
        <circle cx="186" cy="137" r="14" className="fill-slate-900 dark:fill-white" />

        {/* Rear Wheel Cyan Rim Accent */}
        <circle cx="372" cy="137" r="26" fill="#0A0A0F" stroke="#00F2FE" strokeWidth="6" className="drop-shadow-[0_0_10px_rgba(0,242,254,0.7)]" />
        <circle cx="372" cy="137" r="14" className="fill-slate-900 dark:fill-white" />

        {/* Side Skirt Cyan Aero Line */}
        <path
          d="M215 130C250 128 290 124 330 126C310 134 270 136 220 135Z"
          fill="#00F2FE"
          className="drop-shadow-[0_0_8px_rgba(0,242,254,0.7)]"
        />
      </g>
    </svg>
  );
}
