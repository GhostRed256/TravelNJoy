import Image from 'next/image';
import { cn } from '@/lib/utils';

interface BrandLogoProps {
  make: string;
  className?: string;
  size?: number;
}

// Maps brand name patterns to exact Wikimedia SVG vectors in /public/logos/
const BRAND_MAP: Array<[RegExp, string]> = [
  [/maruti|suzuki/i,       '/logos/maruti.svg'],
  [/tata/i,                '/logos/tata.svg'],
  [/mahindra/i,            '/logos/mahindra.svg'],
  [/force/i,               '/logos/force.svg'],
  [/hyundai/i,             '/logos/hyundai.svg'],
  [/kia/i,                 '/logos/kia.svg'],
  [/toyota/i,              '/logos/toyota.svg'],
  [/honda/i,               '/logos/honda.svg'],
  [/nissan/i,              '/logos/nissan.svg'],
  [/volkswagen|vw/i,       '/logos/volkswagen.svg'],
  [/skoda|škoda/i,          '/logos/skoda.svg'],
  [/renault/i,             '/logos/renault.svg'],
  [/citroen|citroën/i,     '/logos/citroen.svg'],
  [/jeep/i,                '/logos/jeep.svg'],
  [/mg|morris/i,            '/logos/mg.svg'],
  [/byd/i,                 '/logos/byd.svg'],
  [/bmw/i,                 '/logos/bmw.svg'],
  [/mercedes|benz/i,       '/logos/mercedes.svg'],
  [/audi/i,                '/logos/audi.svg'],
  [/volvo/i,               '/logos/volvo.svg'],
  [/isuzu/i,               '/logos/isuzu.svg'],
  [/fiat/i,                '/logos/fiat.svg'],
  [/ford/i,                '/logos/ford.svg'],
];

function getLogoSrc(make: string): string | null {
  for (const [pattern, src] of BRAND_MAP) {
    if (pattern.test(make)) return src;
  }
  return null;
}

export default function BrandLogo({ make, className, size = 40 }: BrandLogoProps) {
  const src = getLogoSrc(make || '');

  if (!src) {
    // Dynamic SVG fallback for any unlisted custom brand
    const letter = (make || '?').charAt(0).toUpperCase();
    return (
      <svg
        viewBox="0 0 40 40"
        className={cn('flex-shrink-0', className)}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="20" cy="20" r="19" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
        <text
          x="20"
          y="26"
          fill="currentColor"
          fontSize="20"
          fontFamily="system-ui, sans-serif"
          fontWeight="800"
          textAnchor="middle"
        >
          {letter}
        </text>
      </svg>
    );
  }

  return (
    <Image
      src={src}
      alt={`${make} official vector logo`}
      width={size}
      height={size}
      className={cn('flex-shrink-0 object-contain', className)}
      unoptimized
    />
  );
}
