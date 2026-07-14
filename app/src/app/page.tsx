'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Search, Shield, Star, ChevronRight, Zap, Award, HeartHandshake,
  Gauge, Calendar, Fuel, ArrowRight, CheckCircle2, Car, Users, TrendingUp, MessageCircle
} from 'lucide-react';
import CarCard from '@/components/CarCard';
import { DEMO_CARS } from '@/lib/utils';

// Animated counter
function Counter({ end, suffix = '', duration = 2000 }: { end: number; suffix?: string; duration?: number }) {
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

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
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
  { icon: Car, label: 'Cars Listed', value: 500, suffix: '+' },
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
  const featuredCars = DEMO_CARS.filter(c => c.status === 'available').slice(0, 3);

  return (
    <div className="overflow-hidden">
      {/* ─── HERO SECTION ─── */}
      <section className="relative min-h-screen flex items-center justify-center gradient-hero pt-20">
        {/* Decorative orbs */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-purple-700/10 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-20 left-10 w-56 h-56 bg-violet-900/10 rounded-full blur-3xl" />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(167,139,250,1) 1px, transparent 1px), linear-gradient(90deg, rgba(167,139,250,1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />

        <div className="container-max px-4 sm:px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Text */}
            <div className="animate-slide-up">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-purple-500/30 text-purple-300 text-sm font-medium mb-6">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                300+ Cars Available Now
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold font-[var(--font-outfit)] leading-tight mb-6">
                Find Your{' '}
                <span className="gradient-text glow-text">Perfect</span>
                <br />
                <span className="text-white">Used Car</span>
              </h1>

              <p className="text-lg text-gray-400 leading-relaxed mb-8 max-w-xl">
                Browse hundreds of quality-certified pre-owned vehicles with transparent pricing, verified service history, and expert support — all in one place.
              </p>

              {/* Search bar */}
              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
                  <input
                    type="text"
                    placeholder="Search by make, model, or year..."
                    className="input-dark pl-12 h-14 text-base"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        window.location.href = `/cars?search=${(e.target as HTMLInputElement).value}`;
                      }
                    }}
                  />
                </div>
                <Link href="/cars" className="btn-primary h-14 px-8 flex items-center gap-2 text-base whitespace-nowrap">
                  Search Cars
                  <Search className="w-4 h-4" />
                </Link>
              </div>

              {/* Trust chips */}
              <div className="flex flex-wrap gap-3">
                {['No Hidden Fees', '150-Point Inspection', 'Finance Available', '7-Day Return'].map((t) => (
                  <span key={t} className="flex items-center gap-1.5 text-sm text-gray-400 bg-purple-900/20 border border-purple-900/30 px-3 py-1.5 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Right - Hero image with floating cards */}
            <div className="relative hidden lg:flex items-center justify-center">
              <div className="relative w-full max-w-lg">
                <div className="absolute -inset-8 bg-purple-600/10 rounded-full blur-3xl" />
                <Image
                  src="/hero-banner.png"
                  alt="Premium used cars at TravelNJoy"
                  width={600}
                  height={450}
                  className="rounded-3xl object-cover w-full animate-float shadow-[0_30px_80px_rgba(124,58,237,0.3)]"
                  priority
                />

                {/* Floating stat cards */}
                <div className="absolute -left-8 top-12 glass rounded-2xl p-4 animate-float" style={{ animationDelay: '1s' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 gradient-purple rounded-xl flex items-center justify-center">
                      <Star className="w-5 h-5 text-white fill-current" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-lg leading-none">4.8★</p>
                      <p className="text-xs text-gray-400">1200+ Reviews</p>
                    </div>
                  </div>
                </div>

                <div className="absolute -right-8 bottom-16 glass rounded-2xl p-4 animate-float" style={{ animationDelay: '2s' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500/20 border border-green-500/30 rounded-xl flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <p className="text-white font-bold leading-none">Verified</p>
                      <p className="text-xs text-gray-400">150-Point Check</p>
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
            <div className="w-1.5 h-3 bg-purple-400 rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* ─── STATS SECTION ─── */}
      <section className="py-16 relative">
        <div className="container-max px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map(({ icon: Icon, label, value, suffix }) => (
              <div key={label} className="glass rounded-2xl p-6 text-center card-hover border border-purple-900/30">
                <div className="w-12 h-12 gradient-purple rounded-xl flex items-center justify-center mx-auto mb-3 glow-sm">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-3xl font-bold gradient-text font-[var(--font-outfit)] mb-1">
                  <Counter end={value} suffix={suffix} />
                </p>
                <p className="text-sm text-gray-500">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURED CARS ─── */}
      <section className="section-padding">
        <div className="container-max px-4 sm:px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-sm text-purple-400 font-medium uppercase tracking-widest mb-2">Hand-picked</p>
              <h2 className="text-3xl md:text-4xl font-bold font-[var(--font-outfit)] text-white">
                Featured <span className="gradient-text">Cars</span>
              </h2>
            </div>
            <Link href="/cars" className="flex items-center gap-2 text-purple-400 hover:text-purple-300 font-medium text-sm transition-colors group">
              View All
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCars.map((car) => (
              <CarCard key={car.id} car={car} featured />
            ))}
          </div>
        </div>
      </section>

      {/* ─── WHY TRAVELNJ0Y ─── */}
      <section className="section-padding relative">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-950/5 to-transparent pointer-events-none" />
        <div className="container-max px-4 sm:px-6 relative z-10">
          <div className="text-center mb-14">
            <p className="text-sm text-purple-400 font-medium uppercase tracking-widest mb-3">Why Choose Us</p>
            <h2 className="text-3xl md:text-4xl font-bold font-[var(--font-outfit)] text-white mb-4">
              The <span className="gradient-text">TravelNJoy</span> Difference
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              We have reimagined the used car buying experience from the ground up — making it simpler, safer, and more enjoyable.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="glass rounded-2xl p-6 card-hover border border-purple-900/30 group">
                <div className="w-14 h-14 gradient-purple rounded-2xl flex items-center justify-center mb-5 glow-sm group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-3">{title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="section-padding">
        <div className="container-max px-4 sm:px-6">
          <div className="text-center mb-14">
            <p className="text-sm text-purple-400 font-medium uppercase tracking-widest mb-3">Simple Process</p>
            <h2 className="text-3xl md:text-4xl font-bold font-[var(--font-outfit)] text-white">
              How It <span className="gradient-text">Works</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-8 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />

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
                icon: Car,
                title: 'Drive Home Happy',
                desc: 'Complete paperwork seamlessly. We handle RC transfer, insurance, and deliver the car to your doorstep.',
              },
            ].map(({ step, icon: Icon, title, desc }) => (
              <div key={step} className="relative flex flex-col items-center text-center group">
                <div className="relative mb-6">
                  <div className="w-16 h-16 glass rounded-2xl border border-purple-500/30 flex items-center justify-center group-hover:border-purple-400/60 transition-colors">
                    <Icon className="w-8 h-8 text-purple-400 group-hover:text-purple-300 transition-colors" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-7 h-7 gradient-purple rounded-full flex items-center justify-center text-xs font-bold text-white">
                    {step}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-3 font-[var(--font-outfit)]">{title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed max-w-xs">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="section-padding relative">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-950/5 via-transparent to-purple-950/5 pointer-events-none" />
        <div className="container-max px-4 sm:px-6 relative z-10">
          <div className="text-center mb-14">
            <p className="text-sm text-purple-400 font-medium uppercase tracking-widest mb-3">Testimonials</p>
            <h2 className="text-3xl md:text-4xl font-bold font-[var(--font-outfit)] text-white">
              Happy <span className="gradient-text">Customers</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map(({ name, role, text, rating, avatar }) => (
              <div key={name} className="glass rounded-2xl p-6 border border-purple-900/30 card-hover">
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-6 italic">"{text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 glass rounded-full flex items-center justify-center text-xl">
                    {avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">{name}</p>
                    <p className="text-xs text-purple-400">{role}</p>
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
          <div className="relative rounded-3xl overflow-hidden">
            <div className="absolute inset-0 gradient-purple opacity-90" />
            <div className="absolute inset-0 bg-[url('/hero-banner.png')] bg-cover bg-center opacity-10" />

            {/* Decorative blobs */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-60 h-60 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />

            <div className="relative z-10 p-12 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold font-[var(--font-outfit)] text-white mb-3">
                  Ready to Find Your Car?
                </h2>
                <p className="text-purple-200 text-lg">
                  Browse 500+ certified used cars. Zero pressure, full transparency.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 flex-shrink-0">
                <Link
                  href="/cars"
                  className="btn-ghost border-white/30 text-white hover:bg-white/10 py-3 px-8 text-base flex items-center gap-2 justify-center"
                >
                  Browse Cars
                  <ChevronRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/chat"
                  className="bg-white text-purple-700 font-bold rounded-full py-3 px-8 text-base hover:bg-purple-50 transition-all duration-200 flex items-center gap-2 justify-center shadow-lg"
                >
                  <MessageCircle className="w-5 h-5" />
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
