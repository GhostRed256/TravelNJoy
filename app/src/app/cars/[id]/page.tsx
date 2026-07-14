'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft, Calendar, Gauge, Fuel, Settings2, Users, Palette,
  ChevronLeft, ChevronRight, Share2, MessageCircle,
  CheckCircle2, Star, Shield, Phone, X
} from 'lucide-react';
import { Car } from '@/types/car';
import { DEMO_CARS, formatPrice, formatMileage, cn } from '@/lib/utils';

const fuelEmoji: Record<string, string> = {
  petrol: '⛽', diesel: '🛢️', electric: '⚡', hybrid: '🔋', cng: '🌿',
};

export default function CarDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageIndex, setImageIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  useEffect(() => {
    const fetchCar = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/sheets/cars');
        if (res.ok) {
          const data = await res.json();
          const found = data.cars?.find((c: Car) => c.id === id);
          if (found) { setCar(found); setLoading(false); return; }
        }
      } catch { /* fall through */ }
      // Demo fallback
      const demo = DEMO_CARS.find(c => c.id === id);
      setCar(demo as Car || null);
      setLoading(false);
    };
    fetchCar();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-20 text-center">
        <div className="text-6xl mb-6">🚗</div>
        <h1 className="text-3xl font-bold text-white mb-4">Car Not Found</h1>
        <p className="text-gray-400 mb-8">This listing may have been removed or sold.</p>
        <Link href="/cars" className="btn-primary">Browse All Cars</Link>
      </div>
    );
  }

  const images = car.images.length > 0 ? car.images : ['/car-sedan.png', '/car-suv.png'];

  const specs = [
    { icon: Calendar, label: 'Year', value: car.year.toString() },
    { icon: Settings2, label: 'Car Type', value: car.carType || 'Unknown' },
    { icon: Palette, label: 'Color', value: car.color },
    { icon: Star, label: 'Condition', value: car.condition || 'Unknown' },
    { icon: Shield, label: 'Status', value: car.status.charAt(0).toUpperCase() + car.status.slice(1) },
  ];

  return (
    <div className="min-h-screen pt-24 pb-16">
      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(false)}
        >
          <button
            className="absolute top-4 right-4 text-white glass rounded-full p-2 z-10"
            onClick={() => setLightbox(false)}
          >
            <X className="w-6 h-6" />
          </button>
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white glass rounded-full p-3"
            onClick={(e) => { e.stopPropagation(); setImageIndex((i) => (i - 1 + images.length) % images.length); }}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <Image
            src={images[imageIndex]}
            alt={`${car.make} ${car.model}`}
            width={1200}
            height={800}
            className="max-h-[85vh] object-contain rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white glass rounded-full p-3"
            onClick={(e) => { e.stopPropagation(); setImageIndex((i) => (i + 1) % images.length); }}
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      )}

      <div className="container-max px-4 sm:px-6">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 hover:text-purple-300 mb-8 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Listings
        </button>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Left: Images + specs */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main image */}
            <div
              className="relative rounded-2xl overflow-hidden bg-[#13131F] border border-purple-900/30 cursor-pointer group"
              onClick={() => setLightbox(true)}
            >
              <div className="relative h-72 md:h-96">
                <Image
                  src={images[imageIndex]}
                  alt={`${car.make} ${car.model}`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </div>

              {images.length > 1 && (
                <>
                  <button
                    className="absolute left-3 top-1/2 -translate-y-1/2 glass-dark rounded-full p-2 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => { e.stopPropagation(); setImageIndex((i) => (i - 1 + images.length) % images.length); }}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    className="absolute right-3 top-1/2 -translate-y-1/2 glass-dark rounded-full p-2 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => { e.stopPropagation(); setImageIndex((i) => (i + 1) % images.length); }}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              <div className="absolute bottom-3 right-3 glass-dark rounded-lg px-2 py-1 text-xs text-gray-300">
                {imageIndex + 1} / {images.length}
              </div>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setImageIndex(i)}
                    className={cn(
                      'relative w-20 h-16 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all',
                      i === imageIndex ? 'border-purple-500 glow-sm' : 'border-purple-900/30 opacity-60 hover:opacity-100'
                    )}
                  >
                    <Image src={img} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Specs Grid */}
            <div className="glass rounded-2xl p-6 border border-purple-900/30">
              <h2 className="text-lg font-bold text-white mb-5">Vehicle Specifications</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {specs.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="bg-[#1A1A2E] rounded-xl p-4">
                    <Icon className="w-4 h-4 text-purple-400 mb-2" />
                    <p className="text-xs text-gray-500 mb-1">{label}</p>
                    <p className="text-sm font-semibold text-white">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="glass rounded-2xl p-6 border border-purple-900/30">
              <h2 className="text-lg font-bold text-white mb-4">About This Car</h2>
              <p className="text-gray-300 leading-relaxed">{car.description}</p>
            </div>

            {/* Features */}
            {car.features.length > 0 && (
              <div className="glass rounded-2xl p-6 border border-purple-900/30">
                <h2 className="text-lg font-bold text-white mb-4">Key Features</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {car.features.map((feat) => (
                    <div key={feat} className="flex items-center gap-2 text-sm text-gray-300">
                      <CheckCircle2 className="w-4 h-4 text-purple-400 flex-shrink-0" />
                      {feat}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Price card + actions */}
          <div className="space-y-5">
            {/* Price card */}
            <div className="glass rounded-2xl p-6 border border-purple-900/30 sticky top-24">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm text-purple-400 font-medium uppercase tracking-wider">{car.make}</p>
                  <h1 className="text-2xl font-bold text-white font-[var(--font-outfit)]">{car.model}</h1>
                </div>
                <button
                  onClick={() => navigator.share?.({ title: `${car.make} ${car.model}`, url: window.location.href }).catch(() => {})}
                  className="glass rounded-xl p-2 text-purple-400 hover:text-white transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>

              <div
                className={cn(
                  'inline-flex px-3 py-1 rounded-full text-xs font-semibold mb-4',
                  car.status === 'available' && 'status-available',
                  car.status === 'sold' && 'status-sold',
                  car.status === 'reserved' && 'status-reserved'
                )}
              >
                {car.status.charAt(0).toUpperCase() + car.status.slice(1)}
              </div>

              <div className="mb-6">
                <p className="text-xs text-gray-500 mb-1">Owner Name</p>
                <p className="text-2xl font-bold text-white font-[var(--font-outfit)]">
                  {car.ownerName || 'Unknown'}
                </p>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                  { label: 'Year', value: car.year },
                  { label: 'Type', value: car.carType || 'N/A' },
                  { label: 'Condition', value: car.condition || 'N/A' },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-[#1A1A2E] rounded-xl p-3 text-center flex flex-col justify-center items-center h-full">
                    <p className="text-sm font-bold text-white mb-1 line-clamp-1 w-full" title={String(value)}>{value}</p>
                    <p className="text-xs text-gray-500">{label}</p>
                  </div>
                ))}
              </div>

              {car.status === 'available' ? (
                <div className="space-y-3">
                  <Link href="/chat" className="btn-primary w-full flex items-center justify-center gap-2 py-3">
                    <MessageCircle className="w-5 h-5" />
                    Enquire Now
                  </Link>
                  <a href="tel:+919999999999" className="btn-ghost w-full flex items-center justify-center gap-2 py-3">
                    <Phone className="w-5 h-5" />
                    Call Dealer
                  </a>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-400 text-sm mb-3">
                    {car.status === 'sold' ? 'This car has been sold.' : 'This car is currently reserved.'}
                  </p>
                  <Link href="/cars" className="btn-ghost w-full flex items-center justify-center gap-2 py-3">
                    See Similar Cars
                  </Link>
                </div>
              )}
            </div>

            {/* Trust badges */}
            <div className="glass rounded-2xl p-5 border border-purple-900/30 space-y-3">
              {[
                { icon: Shield, label: '150-Point Inspection Done' },
                { icon: CheckCircle2, label: 'Full Service Records Available' },
                { icon: Star, label: '7-Day Return Policy' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-3 text-sm text-gray-300">
                  <Icon className="w-5 h-5 text-purple-400 flex-shrink-0" />
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
