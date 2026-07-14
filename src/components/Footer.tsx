import Link from 'next/link';
import { Car, Phone, Mail, MapPin, ChevronRight, Globe, MessageCircle, Share2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative border-t border-purple-900/30 mt-20">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#060610] pointer-events-none" />

      <div className="container-max px-4 sm:px-6 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-4 group">
              <div className="w-10 h-10 rounded-xl gradient-purple flex items-center justify-center glow-sm">
                <Car className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold gradient-text font-[var(--font-outfit)]">TravelNJoy</span>
                <p className="text-[10px] text-purple-400/60 uppercase tracking-widest">Premium Cars</p>
              </div>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed mt-4">
              Your trusted partner in finding the perfect pre-owned vehicle. Quality certified cars with transparent pricing and full history.
            </p>
            <div className="flex items-center gap-3 mt-6">
              {[Globe, MessageCircle, Share2].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 glass rounded-lg flex items-center justify-center text-purple-400 hover:text-white hover:bg-purple-600/30 transition-all duration-200"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-purple-300 uppercase tracking-widest mb-5">Quick Links</h3>
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
                    className="flex items-center gap-2 text-gray-500 hover:text-purple-300 text-sm transition-colors group"
                  >
                    <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Car Categories */}
          <div>
            <h3 className="text-sm font-semibold text-purple-300 uppercase tracking-widest mb-5">Categories</h3>
            <ul className="space-y-3">
              {[
                'Sedans', 'SUVs & Crossovers', 'Hatchbacks', 'Electric Vehicles', 'Luxury Cars', 'Budget Cars'
              ].map((cat) => (
                <li key={cat}>
                  <Link
                    href={`/cars?category=${cat.toLowerCase()}`}
                    className="flex items-center gap-2 text-gray-500 hover:text-purple-300 text-sm transition-colors group"
                  >
                    <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-purple-300 uppercase tracking-widest mb-5">Contact</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                <span className="text-gray-500 text-sm">123 Auto Street, Car Market, Mumbai 400001</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-purple-400 flex-shrink-0" />
                <a href="tel:+919999999999" className="text-gray-500 hover:text-purple-300 text-sm transition-colors">
                  +91 99999 99999
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-purple-400 flex-shrink-0" />
                <a href="mailto:hello@travelnj.com" className="text-gray-500 hover:text-purple-300 text-sm transition-colors">
                  hello@travelnj.com
                </a>
              </li>
            </ul>

            <div className="mt-6 p-4 glass rounded-xl">
              <p className="text-xs text-purple-300 font-medium mb-1">Business Hours</p>
              <p className="text-xs text-gray-500">Mon–Sat: 9:00 AM – 7:00 PM</p>
              <p className="text-xs text-gray-500">Sunday: 10:00 AM – 5:00 PM</p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-purple-900/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} TravelNJoy. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-xs text-gray-600 hover:text-purple-400 transition-colors">Privacy Policy</a>
            <a href="#" className="text-xs text-gray-600 hover:text-purple-400 transition-colors">Terms of Service</a>
            <a href="#" className="text-xs text-gray-600 hover:text-purple-400 transition-colors">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
