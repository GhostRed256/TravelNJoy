'use client';

import Link from 'next/link';
import { Phone, Mail, MapPin, ChevronRight, MessageCircle } from 'lucide-react';

const phone = process.env.NEXT_PUBLIC_DEALER_PHONE || '919999999999';
const phoneDisplay = phone.startsWith('91') ? `+${phone.slice(0, 2)} ${phone.slice(2, 7)} ${phone.slice(7)}` : `+${phone}`;
const email = process.env.NEXT_PUBLIC_DEALER_EMAIL || 'travelnjoy26@gmail.com';
const address = process.env.NEXT_PUBLIC_DEALER_ADDRESS || '123 Auto Street, Car Market, Mumbai 400001';

export default function Footer() {
  return (
    <footer className="relative border-t border-slate-200 dark:border-purple-900/30 mt-20 transition-colors duration-300">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-100/80 dark:to-[#060610] pointer-events-none" />

      <div className="container-max px-4 sm:px-6 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-4 group">
              <div className="relative w-12 h-12 overflow-hidden rounded-xl shadow-[0_0_15px_rgba(34,211,238,0.2)] group-hover:scale-105 transition-transform duration-300">
                <img src="/images/logo.jpg" alt="TravelNJoy Logo" className="w-full h-full object-cover" />
              </div>
              <div>
                <span className="text-xl font-bold text-slate-900 dark:text-white font-[var(--font-outfit)] transition-colors">
                  Travel<span className="text-cyan-600 dark:text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]">N</span>Joy
                </span>
                <p className="text-[10px] text-purple-700 dark:text-purple-400/70 uppercase tracking-widest font-semibold transition-colors">Premium Cars</p>
              </div>
            </Link>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mt-4 transition-colors">
              Your trusted partner in finding the perfect pre-owned vehicle. Quality certified cars with transparent pricing and full history.
            </p>
            {/* WhatsApp CTA */}
            <a
              href={`https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Hi, I want to enquire about a car on TravelNJoy.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-5 px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-400 hover:bg-green-500/20 transition-all text-sm font-medium"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp Us
            </a>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-purple-900 dark:text-purple-300 uppercase tracking-widest mb-5 transition-colors">Quick Links</h3>
            <ul className="space-y-3">
              {[
                { href: '/', label: 'Home' },
                { href: '/cars', label: 'Browse Cars' },
                { href: '/chat', label: 'Contact Us' },
                { href: '/admin/login', label: 'Admin Portal' },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-purple-700 dark:hover:text-purple-300 text-sm transition-colors group"
                  >
                    <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform text-purple-600 dark:text-purple-400" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Car Categories */}
          <div>
            <h3 className="text-sm font-semibold text-purple-900 dark:text-purple-300 uppercase tracking-widest mb-5 transition-colors">Categories</h3>
            <ul className="space-y-3">
              {[
                'Sedans', 'SUVs & Crossovers', 'Hatchbacks', 'Electric Vehicles', 'Luxury Cars', 'Budget Cars'
              ].map((cat) => (
                <li key={cat}>
                  <Link
                    href={`/cars?search=${cat.split(' ')[0].toLowerCase()}`}
                    className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-purple-700 dark:hover:text-purple-300 text-sm transition-colors group"
                  >
                    <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform text-purple-600 dark:text-purple-400" />
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-purple-900 dark:text-purple-300 uppercase tracking-widest mb-5 transition-colors">Contact</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                <span className="text-slate-600 dark:text-slate-300 text-sm transition-colors">{address}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                <a
                  href={`tel:+${phone.replace(/[^0-9]/g, '')}`}
                  className="text-slate-600 dark:text-slate-300 hover:text-purple-700 dark:hover:text-purple-300 text-sm transition-colors"
                >
                  {phoneDisplay}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                <a
                  href={`mailto:${email}`}
                  className="text-slate-600 dark:text-slate-300 hover:text-purple-700 dark:hover:text-purple-300 text-sm transition-colors"
                >
                  {email}
                </a>
              </li>
            </ul>

            <div className="mt-6 p-4 glass rounded-xl">
              <p className="text-xs text-purple-900 dark:text-purple-300 font-semibold mb-1 transition-colors">Business Hours</p>
              <p className="text-xs text-slate-600 dark:text-slate-300 transition-colors">Mon–Sat: 9:00 AM – 7:00 PM</p>
              <p className="text-xs text-slate-600 dark:text-slate-300 transition-colors">Sunday: 10:00 AM – 5:00 PM</p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-slate-200 dark:border-purple-900/20 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500 dark:text-slate-400 transition-colors">
            © {new Date().getFullYear()} TravelNJoy. All rights reserved.
          </p>
          <p className="text-slate-600 dark:text-slate-300 text-xs md:text-sm transition-colors">
            Developed with <span className="text-red-500 inline-block animate-pulse mx-1">❤️</span> by{' '}
            <a 
              href="https://bio-portfolio-seven.vercel.app/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-bold text-purple-700 dark:text-purple-400 hover:text-purple-900 dark:hover:text-purple-300 transition-colors glow-text hover:underline decoration-2 underline-offset-4"
            >
              Ritesh Dey
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
