import React from 'react';
import { cn } from '@/lib/utils';
import { Car } from 'lucide-react';

interface BrandLogoProps extends React.SVGProps<SVGSVGElement> {
  make: string;
}

export default function BrandLogo({ make, className, ...props }: BrandLogoProps) {
  const brandName = (make || '').toLowerCase().trim();

  // Basic styles for shared SVG properties
  const svgClass = cn("flex-shrink-0 transition-transform", className);
  
  if (brandName.includes('tata')) {
    return (
      <svg viewBox="0 0 100 100" className={svgClass} {...props} fill="currentColor">
        {/* Tata simplified logo */}
        <ellipse cx="50" cy="50" rx="45" ry="35" fill="none" stroke="currentColor" strokeWidth="6" />
        <path d="M 50 20 L 50 80 M 30 25 L 70 25" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
        <path d="M 30 25 L 50 80 L 70 25" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (brandName.includes('hyundai')) {
    return (
      <svg viewBox="0 0 100 100" className={svgClass} {...props} fill="currentColor">
        <ellipse cx="50" cy="50" rx="45" ry="30" fill="none" stroke="currentColor" strokeWidth="6" />
        <path d="M 35 25 L 35 75 M 65 25 L 65 75 M 25 50 L 75 50" fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round" style={{ transformOrigin: '50% 50%', transform: 'skewX(-15deg)' }} />
      </svg>
    );
  }

  if (brandName.includes('maruti') || brandName.includes('suzuki')) {
    return (
      <svg viewBox="0 0 100 100" className={svgClass} {...props} fill="currentColor">
        <path d="M 70 20 L 30 20 L 15 45 L 55 45 L 45 75 L 85 75 L 70 45 L 30 45 Z" fill="none" stroke="currentColor" strokeWidth="8" strokeLinejoin="round" />
        <path d="M 70 20 L 85 75" fill="none" stroke="transparent" /> 
      </svg>
    );
  }

  if (brandName.includes('mahindra')) {
    return (
      <svg viewBox="0 0 100 100" className={svgClass} {...props} fill="none">
        {/* Twin peaks simplified */}
        <path d="M 15 80 L 40 20 L 50 45" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M 85 80 L 60 20 L 50 45" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M 40 20 L 60 20" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
      </svg>
    );
  }

  if (brandName.includes('toyota')) {
    return (
      <svg viewBox="0 0 100 100" className={svgClass} {...props} fill="none">
        <ellipse cx="50" cy="50" rx="45" ry="30" stroke="currentColor" strokeWidth="5" />
        <ellipse cx="50" cy="50" rx="25" ry="30" stroke="currentColor" strokeWidth="5" />
        <ellipse cx="50" cy="30" rx="35" ry="10" stroke="currentColor" strokeWidth="5" />
      </svg>
    );
  }

  if (brandName.includes('honda')) {
    return (
      <svg viewBox="0 0 100 100" className={svgClass} {...props} fill="none">
        <rect x="15" y="15" width="70" height="70" rx="15" stroke="currentColor" strokeWidth="6" />
        <path d="M 30 25 L 35 75 M 70 25 L 65 75 M 32 55 L 68 55" stroke="currentColor" strokeWidth="9" strokeLinecap="round" />
      </svg>
    );
  }

  if (brandName.includes('ford')) {
    return (
      <svg viewBox="0 0 100 100" className={svgClass} {...props} fill="none">
        <ellipse cx="50" cy="50" rx="45" ry="25" fill="#003478" />
        <ellipse cx="50" cy="50" rx="42" ry="22" stroke="white" strokeWidth="2" fill="none" />
        <text x="50" y="58" fill="white" fontSize="24" fontFamily="cursive" fontStyle="italic" fontWeight="bold" textAnchor="middle">Ford</text>
      </svg>
    );
  }

  if (brandName.includes('mercedes') || brandName.includes('benz')) {
    return (
      <svg viewBox="0 0 100 100" className={svgClass} {...props} fill="none">
        <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="5" />
        <path d="M 50 8 L 50 50 L 15 72 M 50 50 L 85 72" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M 50 8 L 45 50 L 55 50 Z M 15 72 L 48 45 L 53 50 Z M 85 72 L 52 45 L 47 50 Z" fill="currentColor" />
      </svg>
    );
  }

  if (brandName.includes('bmw')) {
    return (
      <svg viewBox="0 0 100 100" className={svgClass} {...props} fill="none">
        <circle cx="50" cy="50" r="45" fill="black" />
        <circle cx="50" cy="50" r="43" stroke="white" strokeWidth="2" />
        <circle cx="50" cy="50" r="28" stroke="white" strokeWidth="2" fill="white" />
        <path d="M 50 22 A 28 28 0 0 1 78 50 L 50 50 Z" fill="#0066b1" />
        <path d="M 50 78 A 28 28 0 0 1 22 50 L 50 50 Z" fill="#0066b1" />
      </svg>
    );
  }

  if (brandName.includes('audi')) {
    return (
      <svg viewBox="0 0 100 100" className={svgClass} {...props} fill="none">
        <circle cx="28" cy="50" r="16" stroke="currentColor" strokeWidth="4" />
        <circle cx="42" cy="50" r="16" stroke="currentColor" strokeWidth="4" />
        <circle cx="58" cy="50" r="16" stroke="currentColor" strokeWidth="4" />
        <circle cx="72" cy="50" r="16" stroke="currentColor" strokeWidth="4" />
      </svg>
    );
  }

  // Fallback for unmapped brands: stylized letter in a circle
  if (brandName) {
    const firstLetter = brandName.charAt(0).toUpperCase();
    return (
      <svg viewBox="0 0 100 100" className={svgClass} {...props} fill="none">
        <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="4" className="opacity-40" />
        <circle cx="50" cy="50" r="38" stroke="currentColor" strokeWidth="2" className="opacity-20" />
        <text x="50" y="65" fill="currentColor" fontSize="42" fontFamily="sans-serif" fontWeight="900" textAnchor="middle">{firstLetter}</text>
      </svg>
    );
  }

  // Absolute fallback if no make is provided
  return <Car className={svgClass} {...(props as any)} />;
}
