'use client';

import Link from 'next/link';
import { Shield, Car, Zap, Users, BatteryCharging, Crown, ArrowRight, Sparkles } from 'lucide-react';
import { useCategoryCounts } from '@/hooks/useCarsData';

const iconMap: Record<string, any> = {
  Shield,
  Car,
  Zap,
  Users,
  BatteryCharging,
  Crown,
};

export default function CategoryShowcase() {
  const { categories, loading } = useCategoryCounts();

  return (
    <section className="section-padding relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="hidden md:block absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 rounded-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-500/10 dark:from-purple-600/15 via-transparent to-transparent pointer-events-none" />
      <div className="hidden md:block absolute bottom-0 right-0 w-96 h-96 rounded-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-400/10 dark:from-cyan-600/15 via-transparent to-transparent pointer-events-none" />

      <div className="container-max px-4 sm:px-6 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <p className="text-sm text-purple-700 dark:text-purple-400 font-semibold uppercase tracking-widest mb-2 flex items-center gap-1.5 transition-colors">
              <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              Body Style Collections
            </p>
            <h2 className="text-3xl md:text-4xl font-bold font-[var(--font-outfit)] text-slate-900 dark:text-white transition-colors">
              Browse By <span className="gradient-text">Category</span>
            </h2>
          </div>
          <p className="text-sm text-slate-600 dark:text-gray-400 max-w-md mt-2 md:mt-0 transition-colors">
            Explore our curated inventory filtered by body style, fuel tech, and luxury class with real-time live availability.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => {
            const Icon = iconMap[cat.iconName] || Car;
            return (
              <Link
                key={cat.id}
                href={`/cars?bodyType=${cat.bodyTypeParam}`}
                className="group block preserve-3d perspective-1000"
              >
                <div className="glass rounded-2xl p-6 border border-slate-200 dark:border-purple-900/30 card-hover relative overflow-hidden transition-all duration-300 shadow-md hover:shadow-2xl hover:shadow-purple-500/10 dark:hover:shadow-purple-900/20 flex flex-col justify-between h-full min-h-[220px]">
                  {/* Neon backlight effect on card hover */}
                  <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-purple-500/0 via-purple-500/0 to-cyan-500/0 group-hover:from-purple-500/10 group-hover:via-purple-500/5 group-hover:to-cyan-500/10 transition-all duration-500 pointer-events-none" />

                  {/* Top row: Icon & Count Badge */}
                  <div className="flex items-start justify-between mb-4 relative z-10">
                    <div className="w-14 h-14 gradient-purple rounded-2xl flex items-center justify-center glow-sm group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-md">
                      <Icon className="w-7 h-7 text-white" />
                    </div>

                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-purple-100/80 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300 border border-purple-200/80 dark:border-purple-700/50 shadow-sm transition-all duration-300 group-hover:scale-105">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      {loading ? '...' : `${cat.count} ${cat.count === 1 ? 'Vehicle' : 'Vehicles'}`}
                    </span>
                  </div>

                  {/* Middle row: Title & Description */}
                  <div className="relative z-10 mb-6">
                    <h3 className="text-xl font-bold font-[var(--font-outfit)] text-slate-900 dark:text-white group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors mb-2">
                      {cat.name}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-gray-400 leading-relaxed transition-colors">
                      {cat.description}
                    </p>
                  </div>

                  {/* Bottom row: CTA prompt */}
                  <div className="relative z-10 flex items-center gap-2 text-xs font-bold text-purple-700 dark:text-purple-400 group-hover:text-purple-900 dark:group-hover:text-purple-300 transition-colors">
                    <span>Explore Inventory</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform duration-300" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
