'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Tag, Calendar, Gauge, Settings2, Flame, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { useDealOfTheDay } from '@/hooks/useCarsData';
import { formatPrice, formatMileage, getOptimizedImage } from '@/lib/utils';
import { use3DTilt } from '@/hooks/use3DTilt';

import BrandLogo from '@/components/BrandLogo';

export default function DealOfTheDay() {
  const { dealCar, originalPrice, savingsText, loading } = useDealOfTheDay();

  const tilt = use3DTilt({
    maxTiltDeg: 8,
    scale: 1.02,
    perspective: 1000,
  });

  if (loading) {
    return (
      <section className="py-12">
        <div className="container-max px-4 sm:px-6">
          <div className="glass rounded-3xl p-8 h-80 animate-pulse border border-slate-200 dark:border-purple-900/30 flex items-center justify-center">
            <div className="text-center text-slate-400 dark:text-purple-300">
              <Flame className="w-8 h-8 mx-auto mb-2 animate-bounce text-amber-500" />
              <p className="font-semibold">Loading Deal of the Day...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!dealCar) return null;

  const imageSrc = dealCar.images?.[0] || '/car-sedan.png';

  return (
    <section className="py-12 relative overflow-hidden">
      <div className="container-max px-4 sm:px-6">
        <div className="relative rounded-3xl overflow-hidden glass-3d-panel border border-amber-500/30 dark:border-purple-500/30 p-6 md:p-10 shadow-2xl transition-all duration-300">
          {/* Ambient Glow */}
          <div className="hidden md:block absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500/20 via-purple-500/10 to-transparent pointer-events-none animate-neon-orb" />
          <div className="hidden md:block absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-600/20 via-cyan-500/10 to-transparent pointer-events-none animate-neon-orb" style={{ animationDelay: '2s' }} />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            {/* Left Info Column */}
            <div className="lg:col-span-7 flex flex-col justify-between">
              <div>
                {/* Header badges */}
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs font-extrabold uppercase tracking-wider shadow-md glow-sm animate-pulse">
                    <Flame className="w-4 h-4 fill-current" />
                    Deal of the Day
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 dark:bg-emerald-900/30 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold shadow-sm">
                    <Tag className="w-3.5 h-3.5" />
                    {savingsText}
                  </span>
                </div>

                {/* Make & Title */}
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-5 h-5 rounded-md bg-white p-0.5 border border-slate-200/80 shadow-sm flex items-center justify-center flex-shrink-0">
                    <BrandLogo make={dealCar.make} className="w-full h-full object-contain" />
                  </div>
                  <p className="text-sm font-bold uppercase tracking-widest text-purple-700 dark:text-purple-400">
                    {dealCar.make}
                  </p>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold font-[var(--font-outfit)] text-slate-900 dark:text-white mb-4 leading-tight">
                  {dealCar.modelVariant}
                </h2>

                <p className="text-sm text-slate-600 dark:text-gray-300 mb-6 line-clamp-2 leading-relaxed">
                  {dealCar.description || 'Verified top value pre-owned vehicle inspected through 150 quality checkpoints with full service guarantee.'}
                </p>

                {/* Quick specs grid */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="glass rounded-xl p-3 text-center border border-slate-200/80 dark:border-purple-900/30">
                    <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400 mx-auto mb-1" />
                    <p className="text-[11px] text-slate-500 dark:text-gray-400 uppercase font-medium">Year</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{dealCar.yearOfManufacture}</p>
                  </div>
                  <div className="glass rounded-xl p-3 text-center border border-slate-200/80 dark:border-purple-900/30">
                    <Gauge className="w-4 h-4 text-purple-600 dark:text-purple-400 mx-auto mb-1" />
                    <p className="text-[11px] text-slate-500 dark:text-gray-400 uppercase font-medium">Odometer</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{formatMileage(dealCar.odometer)}</p>
                  </div>
                  <div className="glass rounded-xl p-3 text-center border border-slate-200/80 dark:border-purple-900/30">
                    <Settings2 className="w-4 h-4 text-purple-600 dark:text-purple-400 mx-auto mb-1" />
                    <p className="text-[11px] text-slate-500 dark:text-gray-400 uppercase font-medium">Fuel & Gear</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white capitalize truncate">
                      {dealCar.fuel} / {dealCar.transmission?.slice(0, 4)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Pricing & CTA */}
              <div className="pt-4 border-t border-slate-200 dark:border-purple-900/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-slate-900 dark:text-white font-[var(--font-outfit)]">
                      {formatPrice(dealCar.quotingPrice)}
                    </span>
                    {originalPrice && originalPrice > dealCar.quotingPrice && (
                      <span className="text-base text-slate-400 line-through font-semibold">
                        {formatPrice(originalPrice)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 mt-0.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Zero Hidden Fees • Immediate RC Transfer
                  </p>
                </div>

                <Link
                  href={`/cars/${dealCar.id}`}
                  className="btn-primary py-3.5 px-8 flex items-center justify-center gap-2 text-sm font-bold whitespace-nowrap shadow-lg shadow-purple-600/30 hover:scale-105 transition-transform"
                >
                  View Deal Details
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right Image Stage Column */}
            <div className="lg:col-span-5 perspective-1000">
              <div
                style={tilt.style}
                onMouseMove={tilt.onMouseMove}
                onMouseLeave={tilt.onMouseLeave}
                className="relative rounded-2xl overflow-hidden glass border border-purple-300/40 dark:border-purple-500/40 p-2 shadow-2xl preserve-3d transition-transform"
              >
                <div className="relative h-64 sm:h-72 w-full rounded-xl overflow-hidden bg-slate-900">
                  <Image
                    src={getOptimizedImage(imageSrc, 800)}
                    alt={`${dealCar.make} ${dealCar.modelVariant}`}
                    fill
                    className="object-cover transition-transform duration-500 hover:scale-105"
                    sizes="(max-width: 1024px) 100vw, 40vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  {/* Top Badge on image */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full glass border border-white/20 text-white text-xs font-bold backdrop-blur-md shadow-md">
                    <Zap className="w-3.5 h-3.5 text-amber-400 fill-current" />
                    Top Value Deal
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
