'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Settings2, Star, ArrowRight, Gauge, Car as CarIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Car } from '@/types/car';
import { formatPrice, formatMileage, getVehicleId, cn, getOptimizedImage } from '@/lib/utils';
import { use3DTilt } from '@/hooks/use3DTilt';

interface CarCardProps {
  car: Car;
  allCars?: Car[];
  featured?: boolean;
  priority?: boolean;
}

export default function CarCard({ car, allCars, featured, priority }: CarCardProps) {
  // Use first 3 images for the card preview slideshow
  const previewImages = (car.images && car.images.length > 0) ? car.images.slice(0, 3) : ['/car-sedan.png'];

  const [imgIndex, setImgIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { style: tiltStyle, onMouseMove, onMouseLeave } = use3DTilt({
    maxTiltDeg: 10,
    scale: 1.02,
    perspective: 1000,
  });

  useEffect(() => {
    const isHoverable = typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches;
    if (hovered && previewImages.length > 1 && isHoverable) {
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
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20, scale: 0.95 },
        show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
      }}
      className="block group preserve-3d perspective-1000"
    >
      <Link href={`/cars/${car.id}`} className="block h-full preserve-3d">
        <div
          style={tiltStyle}
          className={cn(
            'relative h-full rounded-2xl overflow-hidden border transition-all duration-300 card-hover flex flex-col preserve-3d',
            'bg-white dark:bg-[#13131F] border-slate-200 dark:border-purple-900/30 shadow-md shadow-purple-500/5 dark:shadow-none',
            featured && 'ring-1 ring-purple-500/40 shadow-[0_0_30px_rgba(124,58,237,0.15)]'
          )}
          onMouseEnter={() => setHovered(true)}
          onMouseMove={(e) => {
            setHovered(true);
            onMouseMove(e);
          }}
          onMouseLeave={() => {
            setHovered(false);
            onMouseLeave();
          }}
        >
        {/* Featured badge */}
        {featured && (
          <div className="absolute top-3 left-3 z-20 flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-600 dark:bg-purple-600/90 text-white text-xs font-semibold backdrop-blur-sm shadow-sm translate-z-30 transition-transform duration-300 group-hover:translate-z-40">
            <Star className="w-3 h-3 fill-current" />
            Featured
          </div>
        )}

        {/* Status badge */}
        <div
          className={cn(
            'absolute top-3 right-3 z-20 px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-sm translate-z-30 transition-transform duration-300 group-hover:translate-z-40',
            car.status === 'available' && 'status-available',
            car.status === 'sold' && 'status-sold',
            car.status === 'reserved' && 'status-reserved'
          )}
        >
          {(car.status || 'available').charAt(0).toUpperCase() + (car.status || 'available').slice(1)}
        </div>

        {/* Image — only render active slide */}
        <div className="relative h-48 overflow-hidden bg-gradient-to-b from-purple-100/50 to-slate-100 dark:from-purple-950/20 dark:to-[#0D0D1A] translate-z-10 preserve-3d">
          <Image
            key={previewImages[imgIndex]}
            src={getOptimizedImage(previewImages[imgIndex], 800)}
            alt={`${car.make} ${car.modelVariant}`}
            fill
            priority={priority && imgIndex === 0}
            loading={priority && imgIndex === 0 ? 'eager' : 'lazy'}
            unoptimized={previewImages[imgIndex].startsWith('/images/')}
            className="object-cover transition-all duration-500 opacity-0 animate-[fadeIn_0.3s_ease_forwards] scale-105 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-transparent dark:from-[#13131F] dark:via-transparent dark:to-transparent" />

          {/* Dot indicators */}
          {previewImages.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10 translate-z-20">
              {previewImages.map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'rounded-full transition-all duration-300',
                    i === imgIndex ? 'w-4 h-1.5 bg-purple-600 dark:bg-purple-400' : 'w-1.5 h-1.5 bg-slate-400/50 dark:bg-white/30'
                  )}
                />
              ))}
            </div>
          )}

          {/* Image count badge */}
          {car.images?.length > 3 && (
            <div className="absolute top-3 left-3 z-10 glass rounded-lg px-2 py-0.5 text-xs text-slate-700 dark:text-gray-300 font-medium translate-z-20">
              +{car.images.length - 3} more
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 flex-1 flex flex-col preserve-3d">
          <div className="flex items-start justify-between gap-2 mb-3 translate-z-20">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs text-purple-700 dark:text-purple-400 font-bold uppercase tracking-wider truncate">{car.make}</span>
                <span className="text-[10px] bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 px-1.5 py-0.5 rounded font-mono border border-purple-200 dark:border-purple-700/30 flex-shrink-0">
                  {getVehicleId(car, allCars)}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors line-clamp-1" title={car.modelVariant}>
                {car.modelVariant}
              </h3>
              {car.bodyType && (
                <div className="mt-1 flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider truncate">
                  <CarIcon className="w-3 h-3 flex-shrink-0 text-purple-600 dark:text-purple-400" />
                  <span className="truncate">{car.bodyType.replace('_', '/')}</span>
                </div>
              )}
            </div>
            <div className="text-right flex-shrink-0 translate-z-30 transition-transform duration-300 group-hover:translate-z-40">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5 font-medium">Price</p>
              <p className="text-base font-bold text-slate-900 dark:text-white whitespace-nowrap">{formatPrice(car.quotingPrice)}</p>
            </div>
          </div>

          {/* Quick specs */}
          <div className="grid grid-cols-3 gap-2 mb-4 translate-z-20">
            <div className="flex flex-col items-center glass rounded-lg px-2 py-2 transition-transform duration-300 group-hover:translate-z-30">
              <Calendar className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 mb-1" />
              <span className="text-xs text-slate-700 dark:text-gray-300 font-medium">{car.yearOfManufacture}</span>
            </div>
            <div className="flex flex-col items-center glass rounded-lg px-2 py-2 transition-transform duration-300 group-hover:translate-z-30">
              <Gauge className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 mb-1" />
              <span className="text-xs text-slate-700 dark:text-gray-300 font-medium truncate w-full text-center">{formatMileage(car.odometer)}</span>
            </div>
            <div className="flex flex-col items-center glass rounded-lg px-2 py-2 transition-transform duration-300 group-hover:translate-z-30">
              <Settings2 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 mb-1" />
              <span className="text-xs text-slate-700 dark:text-gray-300 font-medium capitalize">{car.fuel}</span>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-auto pt-4 border-t border-slate-200 dark:border-purple-900/20 flex items-center justify-between translate-z-30 transition-transform duration-300 group-hover:translate-z-40">
            <span className="flex items-center gap-1 text-xs font-semibold text-purple-700 dark:text-purple-400 group-hover:text-purple-900 dark:group-hover:text-purple-300 group-hover:gap-2 transition-all">
              View Details
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  </motion.div>
  );
}
