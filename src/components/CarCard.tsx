'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Settings2, Star, ArrowRight, Gauge } from 'lucide-react';
import { Car } from '@/types/car';
import { formatPrice, formatMileage, cn } from '@/lib/utils';

interface CarCardProps {
  car: Car;
  featured?: boolean;
  priority?: boolean;
}

export default function CarCard({ car, featured, priority }: CarCardProps) {
  // Use first 3 images for the card preview slideshow
  const previewImages = car.images.slice(0, 3).length > 0
    ? car.images.slice(0, 3)
    : ['/car-sedan.png'];

  const [imgIndex, setImgIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (hovered && previewImages.length > 1) {
      intervalRef.current = setInterval(() => {
        setImgIndex((i) => (i + 1) % previewImages.length);
      }, 900);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setImgIndex(0);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [hovered, previewImages.length]);

  return (
    <Link href={`/cars/${car.id}`} className="block group">
      <div
        className={cn(
          'relative rounded-2xl overflow-hidden border transition-all duration-300 card-hover',
          'bg-[#13131F] border-purple-900/30',
          featured && 'ring-1 ring-purple-500/30 shadow-[0_0_30px_rgba(124,58,237,0.15)]'
        )}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Featured badge */}
        {featured && (
          <div className="absolute top-3 left-3 z-20 flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-600/90 text-white text-xs font-semibold backdrop-blur-sm">
            <Star className="w-3 h-3 fill-current" />
            Featured
          </div>
        )}

        {/* Status badge */}
        <div
          className={cn(
            'absolute top-3 right-3 z-20 px-2.5 py-1 rounded-full text-xs font-semibold',
            car.status === 'available' && 'status-available',
            car.status === 'sold' && 'status-sold',
            car.status === 'reserved' && 'status-reserved'
          )}
        >
          {car.status.charAt(0).toUpperCase() + car.status.slice(1)}
        </div>

        {/* Image — only render active slide */}
        <div className="relative h-48 overflow-hidden bg-gradient-to-b from-purple-950/20 to-[#0D0D1A]">
          <Image
            key={previewImages[imgIndex]}
            src={previewImages[imgIndex]}
            alt={`${car.make} ${car.modelVariant}`}
            fill
            priority={priority && imgIndex === 0}
            loading={priority && imgIndex === 0 ? 'eager' : 'lazy'}
            className="object-cover transition-opacity duration-300 opacity-0 animate-[fadeIn_0.3s_ease_forwards] scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#13131F] via-transparent to-transparent" />

          {/* Dot indicators */}
          {previewImages.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {previewImages.map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'rounded-full transition-all duration-300',
                    i === imgIndex ? 'w-4 h-1.5 bg-purple-400' : 'w-1.5 h-1.5 bg-white/30'
                  )}
                />
              ))}
            </div>
          )}

          {/* Image count badge */}
          {car.images.length > 3 && (
            <div className="absolute top-3 left-3 z-10 glass-dark rounded-lg px-2 py-0.5 text-xs text-gray-300">
              +{car.images.length - 3} more
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-xs text-purple-400 font-medium uppercase tracking-wider mb-0.5">{car.make}</p>
              <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
                {car.modelVariant}
              </h3>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 mb-0.5">Price</p>
              <p className="text-base font-bold text-white">{formatPrice(car.quotingPrice)}</p>
            </div>
          </div>

          {/* Quick specs */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="flex flex-col items-center glass rounded-lg px-2 py-2">
              <Calendar className="w-3.5 h-3.5 text-purple-400 mb-1" />
              <span className="text-xs text-gray-300">{car.yearOfManufacture}</span>
            </div>
            <div className="flex flex-col items-center glass rounded-lg px-2 py-2">
              <Gauge className="w-3.5 h-3.5 text-purple-400 mb-1" />
              <span className="text-xs text-gray-300 truncate w-full text-center">{formatMileage(car.odometer)}</span>
            </div>
            <div className="flex flex-col items-center glass rounded-lg px-2 py-2">
              <Settings2 className="w-3.5 h-3.5 text-purple-400 mb-1" />
              <span className="text-xs text-gray-300 capitalize">{car.fuel}</span>
            </div>
          </div>

          {/* CTA */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">{car.condition || ''}</p>
            <span className="flex items-center gap-1 text-xs font-semibold text-purple-400 group-hover:text-purple-300 group-hover:gap-2 transition-all">
              View Details
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
