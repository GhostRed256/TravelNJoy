'use client';

import Link from 'next/link';
import { Award, ChevronRight } from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';
import { useBrandStats } from '@/hooks/useCarsData';

export default function BrandPills() {
  const { brandStats, loading } = useBrandStats();

  return (
    <section className="py-12 relative">
      <div className="container-max px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
          <div>
            <p className="text-sm text-purple-700 dark:text-purple-400 font-semibold uppercase tracking-widest mb-1 flex items-center gap-1.5 transition-colors">
              <Award className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              Trusted Manufacturers
            </p>
            <h2 className="text-2xl md:text-3xl font-bold font-[var(--font-outfit)] text-slate-900 dark:text-white transition-colors">
              Popular <span className="gradient-text">Brands</span>
            </h2>
          </div>
          <Link
            href="/cars"
            className="text-xs text-purple-700 dark:text-purple-400 hover:text-purple-900 dark:hover:text-purple-300 font-semibold flex items-center gap-1 mt-2 sm:mt-0 transition-colors group"
          >
            View All Brands
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* 3D Pill grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
          {brandStats.map((brand) => (
            <Link
              key={brand.name}
              href={`/cars?make=${encodeURIComponent(brand.name)}`}
              className="group block preserve-3d perspective-1000"
            >
              <div className="glass rounded-2xl p-4 border border-slate-200 dark:border-purple-900/30 card-hover relative overflow-hidden transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-purple-500/10 dark:hover:shadow-purple-900/20 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl gradient-purple flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform duration-300 p-1.5">
                    <BrandLogo make={brand.name} className="w-full h-full text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors truncate">
                      {brand.name}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-gray-400 truncate">
                      {brand.tagline}
                    </p>
                  </div>
                </div>

                <span className="flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100/80 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-700/40 shadow-xs transition-all duration-300 group-hover:scale-105">
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
