'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Fuel, Gauge, Calendar, Settings2, Users, ArrowRight, Star } from 'lucide-react';
import { Car } from '@/types/car';
import { formatPrice, formatMileage, cn } from '@/lib/utils';

interface CarCardProps {
  car: Car;
  featured?: boolean;
}

const fuelIcons: Record<string, string> = {
  petrol: '⛽',
  diesel: '🛢️',
  electric: '⚡',
  hybrid: '🔋',
  cng: '🌿',
};

export default function CarCard({ car, featured }: CarCardProps) {
  const mainImage = car.images[0] || '/car-sedan.png';

  return (
    <Link href={`/cars/${car.id}`} className="block group">
      <div
        className={cn(
          'relative rounded-2xl overflow-hidden border transition-all duration-400 card-hover',
          'bg-[#13131F] border-purple-900/30',
          featured && 'ring-1 ring-purple-500/30 shadow-[0_0_30px_rgba(124,58,237,0.15)]'
        )}
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

        {/* Image */}
        <div className="relative h-48 overflow-hidden bg-gradient-to-b from-purple-950/20 to-[#0D0D1A]">
          <Image
            src={mainImage}
            alt={`${car.make} ${car.model}`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#13131F] via-transparent to-transparent" />
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-xs text-purple-400 font-medium uppercase tracking-wider mb-1">{car.make}</p>
              <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
                {car.model}
              </h3>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 mb-0.5">Owner</p>
              <p className="text-sm font-semibold text-white">{car.ownerName || 'Unknown'}</p>
            </div>
          </div>

          {/* Quick specs grid */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="flex items-center gap-2 glass rounded-lg px-3 py-2">
              <Calendar className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
              <span className="text-xs text-gray-300">{car.year}</span>
            </div>
            <div className="flex items-center gap-2 glass rounded-lg px-3 py-2">
              <Settings2 className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
              <span className="text-xs text-gray-300 capitalize">{car.carType || 'Unknown'}</span>
            </div>
            <div className="flex items-center gap-2 glass rounded-lg px-3 py-2 col-span-2">
              <Star className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
              <span className="text-xs text-gray-300">Condition: {car.condition || 'Unknown'}</span>
            </div>
          </div>

          {/* CTA */}
          <div className="flex items-center justify-end">
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
