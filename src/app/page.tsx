'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Search, Shield, Star, ChevronRight, Zap, Award, HeartHandshake,
  ArrowRight, CheckCircle2, Car as CarIcon, Users, TrendingUp, MessageCircle
} from 'lucide-react';
import CarCard from '@/components/CarCard';
import CarSkeleton from '@/components/CarSkeleton';
import { use3DTilt } from '@/hooks/use3DTilt';
import { useFeaturedVehicles, usePersonalizedRecommendations } from '@/hooks/useCarsData';
import BrandPills from '@/components/BrandPills';
import CategoryShowcase from '@/components/CategoryShowcase';
import DealOfTheDay from '@/components/DealOfTheDay';

// Animated counter
function Counter({ end, suffix = '', duration = 2000, divisor = 1 }: { end: number; suffix?: string; duration?: number; divisor?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const startTime = performance.now();
          const animate = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * end));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration]);

  const displayCount = divisor > 1 ? (count / divisor).toFixed(1) : count.toLocaleString();

  return <span ref={ref}>{displayCount}{suffix}</span>;
}

const features = [
  {
    icon: Shield,
    title: 'Verified & Certified',
    desc: 'Every car undergoes a rigorous 150-point inspection. Full service history guaranteed.',
  },
  {
    icon: Zap,
    title: 'Instant Financing',
    desc: 'Get pre-approved in minutes. Flexible EMI plans to suit every budget.',
  },
  {
    icon: Award,
    title: 'Best Price Guarantee',
    desc: 'We match or beat any competitor quote. Zero hidden charges, transparent pricing.',
  },
  {
    icon: HeartHandshake,
    title: 'Expert Support',
    desc: 'Our dedicated team guides you through every step — from search to keys in hand.',
  },
];

const stats = [
  { icon: CarIcon, label: 'Cars Listed', value: 500, suffix: '+' },
  { icon: Users, label: 'Happy Customers', value: 1200, suffix: '+' },
  { icon: TrendingUp, label: 'Successful Sales', value: 980, suffix: '+' },
  { icon: Star, label: 'Average Rating', value: 48, suffix: '/5', divisor: 10 },
];

const testimonials = [
  {
    name: 'Rahul Sharma',
    role: 'Bought BMW X5',
    text: 'TravelNJoy made buying my first luxury car an absolute breeze. The team was transparent, honest, and the car was exactly as described. Highly recommended!',
    rating: 5,
    avatar: '👨🏻‍💼',
  },
  {
    name: 'Priya Menon',
    role: 'Bought Hyundai Creta',
    text: 'Got an amazing deal on my Creta. The entire process from browsing to delivery took just 3 days. The chat support was super responsive and helpful.',
    rating: 5,
    avatar: '👩🏻‍💼',
  },
  {
    name: 'Vikram Nair',
    role: 'Bought Tata Nexon EV',
    text: 'Excellent experience! The car records were clearly maintained and I could check everything about the car before purchasing. Will definitely return for my next car.',
    rating: 5,
    avatar: '👨🏾‍💼',
  },
];

export default function HomePage() {
  const { featuredCars, loading: featuredLoading } = useFeaturedVehicles(3);
  const { recommendedCars, recommendationReason, loading: recLoading } = usePersonalizedRecommendations(3);
  const heroTilt = use3DTilt({ maxTiltDeg: 8, scale: 1.01, perspective: 1200 });

  return (
    <div className="overflow-hidden">
      {/* ─── HERO SECTION ─── */}
      <section className="relative min-h-screen flex items-center justify-center gradient-hero pt-20 transition-colors duration-300 overflow-hidden">
        {/* Ambient neon orb background animations */}
        <div className="hidden md:block absolute top-10 right-10 w-[28rem] h-[28rem] rounded-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-500/25 dark:from-purple-600/30 via-violet-500/10 to-transparent pointer-events-none animate-neon-orb" />
        <div className="hidden md:block absolute bottom-10 left-10 w-96 h-96 rounded-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-400/20 dark:from-cyan-600/20 via-purple-500/10 to-transparent pointer-events-none animate-neon-orb" style={{ animationDelay: '3s' }} />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(124,58,237,1) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />

        <div className="container-max px-4 sm:px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Text */}
            <div className="animate-slide-up">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-purple-300/40 dark:border-purple-500/30 text-purple-800 dark:text-purple-300 text-sm font-semibold mb-6 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                300+ Cars Available Now
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold font-[var(--font-outfit)] leading-tight mb-6">
                Find Your{' '}
                <span className="gradient-text glow-text">Perfect</span>
                <br />
                <span className="text-slate-900 dark:text-white transition-colors">Used Car</span>
              </h1>

              <p className="text-lg text-slate-600 dark:text-gray-400 leading-relaxed mb-8 max-w-xl transition-colors">
                Browse hundreds of quality-certified pre-owned vehicles with transparent pricing, verified service history, and expert support — all in one place.
              </p>

              {/* Search bar */}
              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <input
                    id="hero-search-input"
                    type="text"
                    placeholder="Search brand, model, year, color, fuel..."
                    className="input-dark !pl-12 h-14 text-base shadow-sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        window.location.href = `/cars?search=${encodeURIComponent((e.target as HTMLInputElement).value)}`;
                      }
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const input = document.getElementById('hero-search-input') as HTMLInputElement;
                    const q = input?.value?.trim() || '';
                    window.location.href = q ? `/cars?search=${encodeURIComponent(q)}` : '/cars';
                  }}
                  className="btn-primary h-14 px-8 flex items-center gap-2 text-base whitespace-nowrap justify-center"
                >
                  Search Cars
                  <Search className="w-4 h-4" />
                </button>
              </div>

              {/* Trust chips */}
              <div className="flex flex-wrap gap-3">
                {['No Hidden Fees', '150-Point Inspection', 'Finance Available', '7-Day Return'].map((t) => (
                  <span key={t} className="flex items-center gap-1.5 text-sm text-slate-700 dark:text-gray-300 bg-purple-100/60 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-900/30 px-3 py-1.5 rounded-full font-medium transition-colors">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Right - 3D Hero Banner Stage */}
            <div className="relative hidden lg:flex items-center justify-center perspective-1000">
              <div
                style={heroTilt.style}
                onMouseMove={heroTilt.onMouseMove}
                onMouseLeave={heroTilt.onMouseLeave}
                className="relative w-full max-w-lg preserve-3d"
              >
                <div className="hidden md:block absolute -inset-16 rounded-full bg-gradient-to-r from-purple-600/20 via-cyan-500/15 to-purple-800/20 blur-3xl pointer-events-none animate-neon-orb" />

                <div className="relative rounded-3xl overflow-hidden glass-3d-panel border border-purple-400/30 dark:border-purple-500/40 p-2.5 translate-z-10 animate-float-3d">
                  <Image
                    src="/hero-banner.png"
                    alt="Premium used cars at TravelNJoy"
                    width={600}
                    height={450}
                    className="rounded-2xl object-cover w-full shadow-[0_30px_80px_rgba(124,58,237,0.25)] dark:shadow-[0_30px_80px_rgba(124,58,237,0.4)]"
                    priority
                  />
                </div>

                <div
                  className="absolute -left-10 top-8 glass-3d-panel rounded-2xl p-4 shadow-2xl translate-z-40 animate-float-3d transition-transform duration-300 hover:translate-z-40"
                  style={{ animationDelay: '0.5s' }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 gradient-purple rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                      <Star className="w-5 h-5 text-white fill-current" />
                    </div>
                    <div>
                      <p className="text-slate-900 dark:text-white font-bold text-lg leading-none">4.8★</p>
                      <p className="text-xs text-slate-600 dark:text-gray-300 font-medium">1200+ Reviews</p>
                    </div>
                  </div>
                </div>

                <div
                  className="absolute -right-8 bottom-12 glass-3d-panel rounded-2xl p-4 shadow-2xl translate-z-30 animate-float-3d transition-transform duration-300 hover:translate-z-40"
                  style={{ animationDelay: '2.5s' }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-emerald-500/20 border border-emerald-500/40 rounded-xl flex items-center justify-center shadow-md">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-slate-900 dark:text-white font-bold text-base leading-none">150-Point Check</p>
                      <p className="text-xs text-slate-600 dark:text-gray-300 font-medium">Certified Inspection</p>
                    </div>
                  </div>
                </div>

                <div
                  className="absolute -right-12 top-24 glass-3d-panel rounded-2xl p-3.5 shadow-2xl translate-z-20 animate-float-3d transition-transform duration-300 hover:translate-z-40"
                  style={{ animationDelay: '4.5s' }}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 bg-amber-500/20 border border-amber-500/40 rounded-xl flex items-center justify-center shadow-sm">
                      <Zap className="w-4 h-4 text-amber-500 dark:text-amber-400 fill-current" />
                    </div>
                    <div>
                      <p className="text-slate-900 dark:text-white font-bold text-xs leading-none">Instant Booking</p>
                      <p className="text-[10px] text-slate-600 dark:text-gray-300 font-medium">0% Processing Fee</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-purple-500/40 flex items-start justify-center p-1">
            <div className="w-1.5 h-3 bg-purple-600 dark:bg-purple-400 rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* ─── STATS SECTION ─── */}
      <section className="py-12 md:py-16 relative">
        <div className="container-max px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {stats.map(({ icon: Icon, label, value, suffix, divisor }) => (
              <div key={label} className="glass rounded-2xl p-4 sm:p-6 text-center card-hover border border-slate-200 dark:border-purple-900/30 shadow-sm transition-colors duration-300">
                <div className="w-10 h-10 sm:w-12 sm:h-12 gradient-purple rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3 glow-sm shadow-md">
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <p className="text-2xl sm:text-3xl font-bold gradient-text font-[var(--font-outfit)] mb-1">
                  <Counter end={value} suffix={suffix} divisor={divisor} />
                </p>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-400 font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 1. RECOMMENDED FOR YOU (PLACED AT TOP AFTER STATS) ─── */}
      {(recLoading || recommendedCars.length > 0) && (
        <section className="py-8 md:py-12 relative">
          <div className="container-max px-4 sm:px-6">
            <div className="flex items-end justify-between mb-6">
              <div>
                <p className="text-xs sm:text-sm text-purple-700 dark:text-purple-400 font-semibold uppercase tracking-widest mb-1 flex items-center gap-1.5 transition-colors">
                  <Zap className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  {recommendationReason || 'Personalized Pick'}
                </p>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold font-[var(--font-outfit)] text-slate-900 dark:text-white transition-colors">
                  Recommended <span className="gradient-text">For You</span>
                </h2>
              </div>
              <Link href="/cars" className="text-xs text-purple-700 dark:text-purple-400 hover:text-purple-900 dark:hover:text-purple-300 font-semibold">
                Explore More →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {recLoading ? (
                <>
                  <CarSkeleton />
                  <CarSkeleton />
                  <CarSkeleton />
                </>
              ) : (
                recommendedCars.map((car) => (
                  <CarCard key={`rec-${car.id}`} car={car} enable3D />
                ))
              )}
            </div>
          </div>
        </section>
      )}

      {/* ─── 2. BROWSE BY CATEGORY ─── */}
      <CategoryShowcase />

      {/* ─── 3. POPULAR BRANDS (COMPACT & MOBILE-OPTIMIZED) ─── */}
      <BrandPills />

      {/* ─── 4. DEAL OF THE DAY BANNER ─── */}
      <DealOfTheDay />

      {/* ─── 5. FEATURED CARS ─── */}
      <section className="section-padding">
        <div className="container-max px-4 sm:px-6">
          <div className="flex items-end justify-between mb-8 sm:mb-10">
            <div>
              <p className="text-xs sm:text-sm text-purple-700 dark:text-purple-400 font-semibold uppercase tracking-widest mb-1.5 transition-colors">Hand-picked</p>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-[var(--font-outfit)] text-slate-900 dark:text-white transition-colors">
                Featured <span className="gradient-text">Cars</span>
              </h2>
            </div>
            <Link href="/cars" className="flex items-center gap-1.5 text-purple-700 dark:text-purple-400 hover:text-purple-900 dark:hover:text-purple-300 font-semibold text-xs sm:text-sm transition-colors group">
              View All
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {featuredLoading ? (
              <>
                <CarSkeleton />
                <CarSkeleton />
                <CarSkeleton />
              </>
            ) : (
              featuredCars.map((car) => (
                <CarCard key={car.id} car={car} featured enable3D />
              ))
            )}
          </div>
        </div>
      </section>

      {/* ─── WHY TRAVELNJ0Y ─── */}
      <section className="section-padding relative">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-100/30 dark:from-purple-950/5 via-transparent to-transparent pointer-events-none" />
        <div className="container-max px-4 sm:px-6 relative z-10">
          <div className="text-center mb-10 sm:mb-14">
            <p className="text-xs sm:text-sm text-purple-700 dark:text-purple-400 font-semibold uppercase tracking-widest mb-2 transition-colors">Why Choose Us</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-[var(--font-outfit)] text-slate-900 dark:text-white mb-3 transition-colors">
              The Travel<span className="text-cyan-600 dark:text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]">N</span>Joy Difference
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-400 max-w-xl mx-auto transition-colors">
              We have reimagined the used car buying experience from the ground up — making it simpler, safer, and more enjoyable.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="glass rounded-2xl p-5 sm:p-6 card-hover border border-slate-200 dark:border-purple-900/30 shadow-sm group transition-colors duration-300">
                <div className="w-12 h-12 sm:w-14 sm:h-14 gradient-purple rounded-2xl flex items-center justify-center mb-4 sm:mb-5 glow-sm group-hover:scale-110 transition-transform duration-300 shadow-md">
                  <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white mb-2 sm:mb-3 transition-colors">{title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-400 leading-relaxed transition-colors">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="section-padding">
        <div className="container-max px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-14">
            <p className="text-xs sm:text-sm text-purple-700 dark:text-purple-400 font-semibold uppercase tracking-widest mb-2 transition-colors">Simple Process</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-[var(--font-outfit)] text-slate-900 dark:text-white transition-colors">
              How It <span className="gradient-text">Works</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 relative">
            <div className="hidden md:block absolute top-8 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-purple-300 dark:via-purple-500/40 to-transparent" />

            {[
              {
                step: '01',
                icon: Search,
                title: 'Browse & Filter',
                desc: 'Explore our extensive inventory. Filter by make, model, price, year, and fuel type to find your ideal match.',
              },
              {
                step: '02',
                icon: MessageCircle,
                title: 'Chat & Inquire',
                desc: 'Have questions? Chat directly with our experts. Get real-time answers about any car you\'re interested in.',
              },
              {
                step: '03',
                icon: CarIcon,
                title: 'Drive Home Happy',
                desc: 'Complete paperwork seamlessly. We handle RC transfer, insurance, and deliver the car to your doorstep.',
              },
            ].map(({ step, icon: Icon, title, desc }) => (
              <div key={step} className="relative flex flex-col items-center text-center group">
                <div className="relative mb-4 sm:mb-6">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 glass rounded-2xl border border-purple-300 dark:border-purple-500/30 flex items-center justify-center group-hover:border-purple-500 dark:group-hover:border-purple-400/60 transition-colors shadow-sm">
                    <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-purple-700 dark:text-purple-400 group-hover:text-purple-900 dark:group-hover:text-purple-300 transition-colors" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 sm:w-7 sm:h-7 gradient-purple rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold text-white shadow-md">
                    {step}
                  </div>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2 font-[var(--font-outfit)] transition-colors">{title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-400 leading-relaxed max-w-xs transition-colors">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="section-padding relative">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-100/20 dark:from-purple-950/5 via-transparent to-purple-100/20 dark:to-purple-950/5 pointer-events-none" />
        <div className="container-max px-4 sm:px-6 relative z-10">
          <div className="text-center mb-10 sm:mb-14">
            <p className="text-xs sm:text-sm text-purple-700 dark:text-purple-400 font-semibold uppercase tracking-widest mb-2 transition-colors">Testimonials</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-[var(--font-outfit)] text-slate-900 dark:text-white transition-colors">
              Happy <span className="gradient-text">Customers</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {testimonials.map(({ name, role, text, rating, avatar }) => (
              <div key={name} className="glass rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-purple-900/30 card-hover shadow-sm transition-colors duration-300">
                <div className="flex items-center gap-1 mb-3 sm:mb-4">
                  {Array.from({ length: rating }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 fill-current" />
                  ))}
                </div>
                <p className="text-slate-700 dark:text-gray-300 text-xs sm:text-sm leading-relaxed mb-4 sm:mb-6 italic transition-colors">"{text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 glass rounded-full flex items-center justify-center text-lg sm:text-xl shadow-inner">
                    {avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm transition-colors">{name}</p>
                    <p className="text-[10px] sm:text-xs text-purple-700 dark:text-purple-400 font-medium transition-colors">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA SECTION ─── */}
      <section className="section-padding">
        <div className="container-max px-4 sm:px-6">
          <div className="relative rounded-3xl overflow-hidden shadow-xl">
            <div className="absolute inset-0 gradient-purple opacity-90" />
            <div className="absolute inset-0 bg-[url('/hero-banner.png')] bg-cover bg-center opacity-10" />

            <div className="hidden md:block absolute top-0 right-0 w-[40rem] h-[40rem] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="hidden md:block absolute bottom-0 left-0 w-[30rem] h-[30rem] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-black/20 via-transparent to-transparent translate-y-1/2 -translate-x-1/2 pointer-events-none" />

            <div className="relative z-10 p-8 sm:p-12 md:p-16 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
              <div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-[var(--font-outfit)] text-white mb-2 sm:mb-3">
                  Ready to Find Your Car?
                </h2>
                <p className="text-purple-200 text-sm sm:text-base md:text-lg">
                  Browse 500+ certified used cars. Zero pressure, full transparency.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 flex-shrink-0 w-full sm:w-auto">
                <Link
                  href="/cars"
                  className="btn-ghost border-white/40 text-white hover:bg-white/10 py-3 px-6 sm:px-8 text-sm sm:text-base flex items-center gap-2 justify-center"
                >
                  Browse Cars
                  <ChevronRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/chat"
                  className="bg-white text-purple-800 font-bold rounded-full py-3 px-6 sm:px-8 text-sm sm:text-base hover:bg-purple-50 transition-all duration-200 flex items-center gap-2 justify-center shadow-lg"
                >
                  <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  Chat with Expert
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
