'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Car, MessageCircle, LayoutDashboard, Menu, X, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/cars', label: 'Browse Cars' },
  { href: '/chat', label: 'Chat', icon: MessageCircle },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'glass-dark shadow-[0_4px_30px_rgba(124,58,237,0.15)]'
          : 'bg-transparent'
      )}
    >
      <div className="container-max px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl gradient-purple flex items-center justify-center glow-sm group-hover:scale-105 transition-transform duration-300">
                <Car className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -inset-1 gradient-purple rounded-xl opacity-0 group-hover:opacity-30 blur transition-opacity duration-300" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-xl font-bold font-[var(--font-outfit)] gradient-text">
                TravelNJoy
              </span>
              <span className="text-[10px] text-purple-400/70 font-medium tracking-widest uppercase">
                Premium Cars
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
                  pathname === href
                    ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                    : 'text-gray-400 hover:text-purple-300 hover:bg-purple-600/10'
                )}
              >
                {Icon && <Icon className="w-4 h-4" />}
                {label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/admin/login"
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-purple-300 transition-colors px-3 py-2 rounded-lg hover:bg-purple-600/10"
            >
              <LayoutDashboard className="w-4 h-4" />
              Admin
            </Link>
            <Link href="/cars" className="btn-primary text-sm py-2.5 px-5 flex items-center gap-2">
              View Cars
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg glass text-purple-300 hover:text-white transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          'md:hidden transition-all duration-300 overflow-hidden',
          mobileOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="glass-dark border-t border-purple-900/30 px-4 py-4 flex flex-col gap-2">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                pathname === href
                  ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                  : 'text-gray-400 hover:text-purple-300 hover:bg-purple-600/10'
              )}
            >
              {Icon && <Icon className="w-4 h-4" />}
              {label}
            </Link>
          ))}
          <div className="pt-2 mt-2 border-t border-purple-900/30 flex flex-col gap-2">
            <Link
              href="/admin/login"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-gray-400 hover:text-purple-300 hover:bg-purple-600/10 transition-all"
            >
              <LayoutDashboard className="w-4 h-4" />
              Admin Dashboard
            </Link>
            <Link
              href="/cars"
              onClick={() => setMobileOpen(false)}
              className="btn-primary text-sm text-center"
            >
              Browse All Cars
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
