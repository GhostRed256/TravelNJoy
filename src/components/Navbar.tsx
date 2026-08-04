'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Car, MessageCircle, LayoutDashboard, ChevronRight } from 'lucide-react';
import { useSession, signOut } from "next-auth/react";
import WheelIcon from '@/components/WheelIcon';
import CarLogoSVG from '@/components/CarLogoSVG';
import { cn } from '@/lib/utils';
import ThemeToggle from '@/components/ThemeToggle';

const navLinks = [
  { href: '/', label: 'Home', icon: WheelIcon },
  { href: '/cars', label: 'Browse Cars', icon: Car },
  { href: '/chat', label: 'Chat', icon: MessageCircle },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  
  // Safe session access — if NextAuth config is broken, don't crash the whole page
  let session: any = null;
  try {
    const sessionData = useSession();
    session = sessionData?.data;
  } catch {
    // Auth not configured or errored — continue without session
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          scrolled
            ? 'bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200/50 dark:border-purple-900/30 shadow-[0_4px_30px_rgba(124,58,237,0.1)]'
            : 'bg-transparent'
        )}
      >
      <div className="container-max px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-12 h-8 md:w-16 md:h-10 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
              <CarLogoSVG className="w-full h-full" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-lg md:text-xl font-bold font-[var(--font-outfit)] text-slate-900 dark:text-white transition-colors">
                Travel<span className="text-cyan-600 dark:text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]">N</span>Joy
              </span>
              <span className="text-[10px] text-purple-700 dark:text-purple-400/70 font-medium tracking-widest uppercase transition-colors">
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
                    ? 'bg-purple-100 dark:bg-purple-600/20 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-500/30'
                    : 'text-slate-600 dark:text-gray-400 hover:text-purple-700 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-600/10'
                )}
              >
                {Icon && <Icon className="w-4 h-4" />}
                {label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA & Theme Toggle */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            {session ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-100 dark:bg-purple-900/20 border border-purple-300 dark:border-purple-500/20">
                  <img src={session.user?.image || ""} alt="Avatar" className="w-6 h-6 rounded-full" />
                  <span className="text-sm font-medium text-purple-900 dark:text-purple-200">{session.user?.name?.split(' ')[0]}</span>
                </div>
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="text-sm text-slate-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors px-3 py-2"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="text-sm text-slate-700 dark:text-gray-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors px-3 py-2 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-600/10 font-medium"
              >
                Login
              </Link>
            )}
            <Link
              href="/admin"
              className="flex items-center gap-2 text-sm text-slate-700 dark:text-gray-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors px-3 py-2 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-600/10 font-medium"
            >
              <LayoutDashboard className="w-4 h-4" />
              Admin
            </Link>
            <Link href="/cars" className="btn-primary text-sm py-2.5 px-5 flex items-center gap-2">
              View Cars
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile Theme Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-[#0D0D1A]/95 backdrop-blur-md border-t border-slate-200 dark:border-purple-900/30 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.08)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.5)] transition-colors duration-300">
        <div className="flex items-center justify-around h-16">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center justify-center w-full h-full gap-1 transition-colors',
                pathname === href
                  ? 'text-purple-700 dark:text-purple-400 font-semibold'
                  : 'text-slate-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-300'
              )}
            >
              {Icon ? <Icon className="w-5 h-5" /> : <WheelIcon className="w-5 h-5" />}
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          ))}
          <Link
            href="/admin"
            className={cn(
              'flex flex-col items-center justify-center w-full h-full gap-1 transition-colors',
              pathname.startsWith('/admin')
                ? 'text-purple-700 dark:text-purple-400 font-semibold'
                : 'text-slate-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-300'
            )}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px] font-medium">Admin</span>
          </Link>
        </div>
      </nav>
    </>
  );
}
