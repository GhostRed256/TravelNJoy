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
import type { Car } from '@/types/car';
import { DEMO_CARS, formatPrice, formatMileage, cn, getOptimizedImage } from '@/lib/utils';
import { trackUserViewCar } from '@/lib/recommendations';
import CarDetailSkeleton from '@/components/CarDetailSkeleton';
import { useSession } from "next-auth/react";
import toast from 'react-hot-toast';

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
  
  // Safe session access
  let session: any = null;
  try {
    const sessionData = useSession();
    session = sessionData?.data;
  } catch {
    // Auth not configured — continue without session
  }
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingData, setBookingData] = useState({ buyerName: '', buyerEmail: '', buyerAadhar: '', buyerPAN: '', buyerAddress: '' });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingStep, setBookingStep] = useState<'FORM' | 'OTP'>('FORM');
  const [otp, setOtp] = useState('');

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingLoading(true);

    if (bookingStep === 'FORM') {
      try {
        const res = await fetch('/api/booking/send-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: bookingData.buyerEmail, carMake: car?.make, carModel: car?.modelVariant })
        });
        if (res.ok) {
          toast.success("OTP sent to your email!");
          setBookingStep('OTP');
        } else {
          toast.error("Failed to send OTP. Please check your email.");
        }
      } catch {
        toast.error("Network error.");
      } finally {
        setBookingLoading(false);
      }
      return;
    }

    // OTP Verification & Booking Step
    try {
      const res = await fetch(`/api/cars/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...bookingData, status: 'reserved', otp })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Car reserved successfully! Await admin approval.");
        setShowBookingModal(false);
        setBookingStep('FORM');
        setOtp('');
        setCar(prev => prev ? { ...prev, status: 'reserved', ...bookingData } : null);
      } else {
        toast.error(data.error || "Failed to reserve car.");
      }
    } catch {
      toast.error("Network error.");
    } finally {
      setBookingLoading(false);
    }
  };

  useEffect(() => {
    const fetchCar = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/cars/${id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.car) {
            setCar(data.car);
            trackUserViewCar(data.car);
            setLoading(false);
            return;
          }
        }
      } catch { /* fall through */ }
      // Demo fallback
      const demo = DEMO_CARS.find(c => c.id === id);
      const found = demo as Car || null;
      setCar(found);
      if (found) trackUserViewCar(found);
      setLoading(false);
    };
    fetchCar();
  }, [id]);

  if (loading) {
    return <CarDetailSkeleton />;
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

  const images = (car.images && car.images.length > 0) ? car.images : ['/car-sedan.png', '/car-suv.png'];

  const specs = [
    { icon: Calendar, label: 'Year', value: car.yearOfManufacture?.toString() || 'N/A' },
    { icon: Gauge, label: 'Odometer', value: car.odometer ? formatMileage(car.odometer) : 'N/A' },
    { icon: Fuel, label: 'Fuel', value: car.fuel ? car.fuel.charAt(0).toUpperCase() + car.fuel.slice(1) : 'N/A' },
    { icon: Settings2, label: 'Transmission', value: car.transmission ? car.transmission.toUpperCase() : 'N/A' },
    { icon: Users, label: 'Owners', value: car.owners ? `${car.owners} Owner${car.owners > 1 ? 's' : ''}` : 'N/A' },
    { icon: Palette, label: 'Color', value: car.color || 'N/A' },
    { icon: Star, label: 'Condition', value: car.condition || 'N/A' },
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
            type="button"
            className="absolute top-4 right-4 text-white glass rounded-full p-2 z-10"
            onClick={() => setLightbox(false)}
          >
            <X className="w-6 h-6" />
          </button>
          <button
            type="button"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white glass rounded-full p-3"
            onClick={(e) => { e.stopPropagation(); setImageIndex((i) => (i - 1 + images.length) % images.length); }}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <Image
            src={getOptimizedImage(images[imageIndex], 1200)}
            alt={`${car.make} ${car.modelVariant}`}
            width={1200}
            height={800}
            className="max-h-[85vh] object-contain rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            type="button"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white glass rounded-full p-3"
            onClick={(e) => { e.stopPropagation(); setImageIndex((i) => (i + 1) % images.length); }}
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#13131F] rounded-2xl p-6 w-full max-w-md border border-purple-500/30">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Book {car.make} {car.modelVariant}</h2>
              <button type="button" onClick={() => { setShowBookingModal(false); setBookingStep('FORM'); }} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            {bookingStep === 'FORM' ? (
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400">Full Name</label>
                  <input required type="text" className="input-dark w-full mt-1" value={bookingData.buyerName} onChange={e => setBookingData({...bookingData, buyerName: e.target.value})} />
                </div>
                <div>
                  <label className="text-sm text-gray-400">Email Address</label>
                  <input required type="email" className="input-dark w-full mt-1" value={bookingData.buyerEmail} onChange={e => setBookingData({...bookingData, buyerEmail: e.target.value})} />
                </div>
                <div>
                  <label className="text-sm text-gray-400">Aadhar Number</label>
                  <input required type="text" className="input-dark w-full mt-1" value={bookingData.buyerAadhar} onChange={e => setBookingData({...bookingData, buyerAadhar: e.target.value})} />
                </div>
                <div>
                  <label className="text-sm text-gray-400">PAN Number</label>
                  <input required type="text" className="input-dark w-full mt-1" value={bookingData.buyerPAN} onChange={e => setBookingData({...bookingData, buyerPAN: e.target.value})} />
                </div>
                <div>
                  <label className="text-sm text-gray-400">Full Address</label>
                  <textarea required className="input-dark w-full mt-1" rows={3} value={bookingData.buyerAddress} onChange={e => setBookingData({...bookingData, buyerAddress: e.target.value})} />
                </div>
                <button type="submit" disabled={bookingLoading} className="btn-primary w-full py-3 mt-4">
                  {bookingLoading ? 'Processing...' : 'Send OTP & Confirm'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <p className="text-sm text-gray-300">
                  Please enter the 6-digit OTP sent to <span className="font-bold text-white">{bookingData.buyerEmail}</span>.
                </p>
                <div>
                  <label className="text-sm text-gray-400">6-Digit OTP</label>
                  <input 
                    required 
                    type="text" 
                    maxLength={6}
                    placeholder="123456"
                    className="input-dark w-full mt-1 text-center text-2xl tracking-widest" 
                    value={otp} 
                    onChange={e => setOtp(e.target.value.replace(/[^0-9]/g, ''))} 
                  />
                </div>
                <button type="submit" disabled={bookingLoading || otp.length !== 6} className="btn-primary w-full py-3 mt-4">
                  {bookingLoading ? 'Processing...' : 'Verify & Book'}
                </button>
                <button type="button" onClick={() => setBookingStep('FORM')} className="w-full text-sm text-gray-400 hover:text-white mt-2">
                  Back to Form
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      <div className="container-max px-4 sm:px-6">
        {/* Back button */}
        <button
          type="button"
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
                  src={getOptimizedImage(images[imageIndex], 1200)}
                  alt={`${car.make} ${car.modelVariant}`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </div>

              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    className="absolute left-3 top-1/2 -translate-y-1/2 glass-dark rounded-full p-2 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => { e.stopPropagation(); setImageIndex((i) => (i - 1 + images.length) % images.length); }}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
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
                    type="button"
                    key={i}
                    onClick={() => setImageIndex(i)}
                    className={cn(
                      'relative w-20 h-16 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all',
                      i === imageIndex ? 'border-purple-500 glow-sm' : 'border-purple-900/30 opacity-60 hover:opacity-100'
                    )}
                  >
                    <Image src={getOptimizedImage(img, 400)} alt="" fill className="object-cover" />
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
            {car.features && car.features.length > 0 && (
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
                  <h1 className="text-2xl font-bold text-white font-[var(--font-outfit)]">{car.modelVariant}</h1>
                </div>
                <button
                  type="button"
                  onClick={() => navigator.share?.({ title: `${car.make} ${car.modelVariant}`, url: window.location.href }).catch(() => {})}
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
                <p className="text-xs text-gray-500 mb-1">Price</p>
                <p className="text-3xl font-bold text-white font-[var(--font-outfit)]">
                  {formatPrice(car.quotingPrice)}
                </p>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                  { label: 'Year', value: car.yearOfManufacture },
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
                  {session ? (
                    <button type="button" onClick={() => { setBookingData(prev => ({...prev, buyerName: session.user?.name || ''})); setShowBookingModal(true); }} className="btn-primary w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-500">
                      <CheckCircle2 className="w-5 h-5" />
                      Book this Car
                    </button>
                  ) : (
                    <Link href="/login" className="btn-primary w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-500">
                      Sign in to Book
                    </Link>
                  )}
                  <Link href="/chat" className="btn-primary w-full flex items-center justify-center gap-2 py-3">
                    <MessageCircle className="w-5 h-5" />
                    Enquire Now
                  </Link>
                  <a
                    href={`https://wa.me/${(process.env.NEXT_PUBLIC_DEALER_PHONE || '919999999999').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi, I'm interested in the ${car.yearOfManufacture} ${car.make} ${car.modelVariant} listed at ${formatPrice(car.quotingPrice)}.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-ghost w-full flex items-center justify-center gap-2 py-3 border-green-500/40 text-green-400 hover:bg-green-500/10"
                  >
                    <Phone className="w-5 h-5" />
                    WhatsApp Dealer
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
