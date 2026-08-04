'use client';

import Link from 'next/link';
import { Award, ChevronRight } from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';
import { useBrandStats } from '@/hooks/useCarsData';

export default function BrandPills() {
  const { brandStats, loading } = useBrandStats();

  return (
    <section className="py-8 md:py-12 relative">
      <div className="container-max px-4 sm:px-6">
        <div className="flex flex-row items-center justify-between mb-5 sm:mb-8">
          <div>
            <p className="text-xs sm:text-sm text-purple-700 dark:text-purple-400 font-semibold uppercase tracking-widest mb-1 flex items-center gap-1.5 transition-colors">
              <Award className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              Trusted Manufacturers
            </p>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold font-[var(--font-outfit)] text-slate-900 dark:text-white transition-colors">
              Popular <span className="gradient-text">Brands</span>
            </h2>
          </div>
          <Link
            href="/cars"
            className="text-xs text-purple-700 dark:text-purple-400 hover:text-purple-900 dark:hover:text-purple-300 font-semibold flex items-center gap-1 transition-colors group shrink-0"
          >
            View All
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Compact & Mobile-optimized Brand Carousel/Grid */}
        <div className="flex sm:grid overflow-x-auto sm:overflow-x-visible snap-x snap-mandatory gap-2.5 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 pb-3 sm:pb-0 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
          {brandStats.map((brand) => (
            <Link
              key={brand.name}
              href={`/cars?make=${encodeURIComponent(brand.name)}`}
              className="group block preserve-3d perspective-1000 shrink-0 w-[130px] sm:w-auto snap-start"
            >
              <div className="glass rounded-xl sm:rounded-2xl p-2.5 sm:p-4 border border-slate-200 dark:border-purple-900/30 card-hover relative overflow-hidden transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-purple-500/10 dark:hover:shadow-purple-900/20 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left h-full">
                <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 min-w-0 w-full sm:w-auto">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white dark:bg-slate-100 border border-slate-200/80 dark:border-slate-300 flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform duration-300 p-1.5">
                    <BrandLogo make={brand.name} className="w-full h-full object-contain" />
                  </div>
                  <div className="min-w-0 w-full">
                    <p className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors truncate">
                      {brand.name}
                    </p>
                    <p className="hidden sm:block text-[11px] text-slate-500 dark:text-gray-400 truncate">
                      {brand.tagline}
                    </p>
                  </div>
                </div>

                <span className="flex-shrink-0 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold bg-purple-100/80 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-700/40 shadow-xs transition-all duration-300 group-hover:scale-105">
                  {loading ? '...' : `${brand.count} ${brand.count === 1 ? 'car' : 'cars'}`}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
