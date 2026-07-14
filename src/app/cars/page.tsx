'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import CarCard from '@/components/CarCard';
import { Car, CarFilters, FuelType, TransmissionType, CarStatus } from '@/types/car';
import { DEMO_CARS, formatPrice } from '@/lib/utils';

const MAKES = ['All', 'BMW', 'Honda', 'Hyundai', 'Maruti', 'Tata', 'Toyota'];
const FUEL_TYPES: FuelType[] = ['petrol', 'diesel', 'electric', 'hybrid', 'cng'];
const TRANSMISSION_TYPES: TransmissionType[] = ['manual', 'automatic', 'cvt'];

function CarsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [cars, setCars] = useState<Car[]>(DEMO_CARS as Car[]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<CarFilters>({
    search: searchParams.get('search') || '',
    make: searchParams.get('make') || '',
    minPrice: 0,
    maxPrice: 10000000,
    minYear: 2015,
    maxYear: new Date().getFullYear(),
    fuel: undefined,
    transmission: undefined,
    status: 'available',
  });

  // Try fetching from API, fall back to demo data
  useEffect(() => {
    const fetchCars = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/sheets/cars');
        if (res.ok) {
          const data = await res.json();
          if (data.cars && data.cars.length > 0) {
            setCars(data.cars);
          }
        }
      } catch {
        // Use demo data
      } finally {
        setLoading(false);
      }
    };
    fetchCars();
  }, []);

  const filtered = cars.filter((car) => {
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (!`${car.make} ${car.model} ${car.year}`.toLowerCase().includes(q)) return false;
    }
    if (filters.make && filters.make !== 'All' && car.make !== filters.make) return false;
    if (filters.minPrice && car.price < filters.minPrice) return false;
    if (filters.maxPrice && car.price > filters.maxPrice) return false;
    if (filters.minYear && car.year < filters.minYear) return false;
    if (filters.maxYear && car.year > filters.maxYear) return false;
    if (filters.fuel && car.fuel !== filters.fuel) return false;
    if (filters.transmission && car.transmission !== filters.transmission) return false;
    if (filters.status && filters.status !== 'available' && car.status !== filters.status) return false;
    return true;
  });

  const updateFilter = (key: keyof CarFilters, value: unknown) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      make: '',
      minPrice: 0,
      maxPrice: 10000000,
      minYear: 2015,
      maxYear: new Date().getFullYear(),
      fuel: undefined,
      transmission: undefined,
      status: undefined,
    });
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container-max px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <p className="text-sm text-purple-400 font-medium uppercase tracking-widest mb-2">Inventory</p>
          <h1 className="text-3xl md:text-4xl font-bold font-[var(--font-outfit)] text-white mb-2">
            Browse <span className="gradient-text">All Cars</span>
          </h1>
          <p className="text-gray-400">
            {filtered.length} {filtered.length === 1 ? 'vehicle' : 'vehicles'} found
          </p>
        </div>

        {/* Search + filter toggle bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
            <input
              type="text"
              placeholder="Search make, model, year..."
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="input-dark pl-12 h-12"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-5 h-12 glass border border-purple-500/30 rounded-xl text-purple-300 font-medium hover:bg-purple-600/10 transition-all"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
          <button
            onClick={clearFilters}
            className="flex items-center gap-2 px-4 h-12 text-sm text-gray-400 hover:text-red-400 transition-colors rounded-xl hover:bg-red-500/10"
          >
            <X className="w-4 h-4" />
            Clear
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside
            className={`lg:w-72 flex-shrink-0 transition-all duration-300 ${showFilters ? 'block' : 'hidden lg:block'}`}
          >
            <div className="glass rounded-2xl p-6 border border-purple-900/30 space-y-6 sticky top-24">
              <h2 className="text-sm font-semibold text-purple-300 uppercase tracking-widest">Refine Results</h2>

              {/* Status */}
              <div>
                <label className="text-xs text-gray-500 font-medium mb-3 block">Availability</label>
                <div className="flex flex-wrap gap-2">
                  {(['', 'available', 'reserved', 'sold'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => updateFilter('status', s || undefined)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        (filters.status === s || (!s && !filters.status))
                          ? 'gradient-purple text-white'
                          : 'glass text-gray-400 hover:text-purple-300'
                      }`}
                    >
                      {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Make */}
              <div>
                <label className="text-xs text-gray-500 font-medium mb-3 block">Make</label>
                <div className="relative">
                  <select
                    value={filters.make}
                    onChange={(e) => updateFilter('make', e.target.value)}
                    className="select-dark"
                  >
                    {MAKES.map((m) => <option key={m} value={m === 'All' ? '' : m}>{m}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400 pointer-events-none" />
                </div>
              </div>

              {/* Price Range */}
              <div>
                <label className="text-xs text-gray-500 font-medium mb-3 block">
                  Price Range: {formatPrice(filters.minPrice || 0)} — {formatPrice(filters.maxPrice || 10000000)}
                </label>
                <div className="space-y-3">
                  <input
                    type="range"
                    min={0}
                    max={10000000}
                    step={100000}
                    value={filters.maxPrice}
                    onChange={(e) => updateFilter('maxPrice', parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Year Range */}
              <div>
                <label className="text-xs text-gray-500 font-medium mb-3 block">
                  Year: {filters.minYear} — {filters.maxYear}
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={filters.minYear}
                    min={2000}
                    max={filters.maxYear}
                    onChange={(e) => updateFilter('minYear', parseInt(e.target.value))}
                    className="input-dark text-sm py-2"
                  />
                  <input
                    type="number"
                    value={filters.maxYear}
                    min={filters.minYear}
                    max={new Date().getFullYear()}
                    onChange={(e) => updateFilter('maxYear', parseInt(e.target.value))}
                    className="input-dark text-sm py-2"
                  />
                </div>
              </div>

              {/* Fuel Type */}
              <div>
                <label className="text-xs text-gray-500 font-medium mb-3 block">Fuel Type</label>
                <div className="flex flex-wrap gap-2">
                  {FUEL_TYPES.map((f) => (
                    <button
                      key={f}
                      onClick={() => updateFilter('fuel', filters.fuel === f ? undefined : f)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all capitalize ${
                        filters.fuel === f
                          ? 'gradient-purple text-white'
                          : 'glass text-gray-400 hover:text-purple-300'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Transmission */}
              <div>
                <label className="text-xs text-gray-500 font-medium mb-3 block">Transmission</label>
                <div className="flex flex-wrap gap-2">
                  {TRANSMISSION_TYPES.map((t) => (
                    <button
                      key={t}
                      onClick={() => updateFilter('transmission', filters.transmission === t ? undefined : t)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all uppercase ${
                        filters.transmission === t
                          ? 'gradient-purple text-white'
                          : 'glass text-gray-400 hover:text-purple-300'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Car Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="rounded-2xl overflow-hidden bg-[#13131F]">
                    <div className="skeleton h-48 w-full" />
                    <div className="p-5 space-y-3">
                      <div className="skeleton h-4 w-2/3" />
                      <div className="skeleton h-6 w-1/2" />
                      <div className="grid grid-cols-2 gap-2">
                        {[1,2,3,4].map(j => <div key={j} className="skeleton h-8 rounded-lg" />)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 glass rounded-full flex items-center justify-center mb-6 text-4xl">🚗</div>
                <h3 className="text-xl font-bold text-white mb-2">No Cars Found</h3>
                <p className="text-gray-400 mb-6">Try adjusting your filters or search term.</p>
                <button onClick={clearFilters} className="btn-primary">Clear All Filters</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filtered.map((car, index) => (
                  <CarCard key={car.id} car={car} priority={index < 3} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CarsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <CarsContent />
    </Suspense>
  );
}
