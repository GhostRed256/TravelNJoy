'use client';

import { useState, useEffect, Suspense, useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal, X, ChevronDown, IndianRupee } from 'lucide-react';
import CarCard from '@/components/CarCard';
import { Car, CarFilters, FuelType, TransmissionType } from '@/types/car';
import { DEMO_CARS, formatPrice } from '@/lib/utils';

const MAKES = ['All', 'BMW', 'Honda', 'Hyundai', 'Maruti', 'Maruti Suzuki', 'Tata', 'Toyota'];
const FUEL_TYPES: FuelType[] = ['petrol', 'diesel', 'electric', 'hybrid', 'cng'];
const TRANSMISSION_TYPES: TransmissionType[] = ['manual', 'automatic', 'cvt'];

const PRICE_PRESETS = [
  { label: 'Under ₹5L', max: 500000 },
  { label: '₹5L–10L', min: 500000, max: 1000000 },
  { label: '₹10L–20L', min: 1000000, max: 2000000 },
  { label: '₹20L+', min: 2000000, max: 10000000 },
];

function CarsContent() {
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  // Start with demo data — renders instantly, no spinner
  const [cars, setCars] = useState<Car[]>(DEMO_CARS as Car[]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<CarFilters>({
    search: searchParams.get('search') || '',
    make: searchParams.get('make') || '',
    minPrice: 0,
    maxPrice: 10000000,
    minYear: 2000,
    maxYear: new Date().getFullYear(),
    fuel: undefined,
    transmission: undefined,
    status: 'available',
  });

  useEffect(() => {
    // Silently fetch from API and swap in if available — no loading state
    const controller = new AbortController();
    fetch('/api/sheets/cars', { signal: controller.signal })
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data?.cars?.length > 0) {
          startTransition(() => setCars(data.cars));
        }
      })
      .catch(() => { /* stay on demo data */ });
    return () => controller.abort();
  }, [startTransition]);

  const updateFilter = (key: keyof CarFilters, value: unknown) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const clearFilters = () => setFilters({
    search: '',
    make: '',
    minPrice: 0,
    maxPrice: 10000000,
    minYear: 2000,
    maxYear: new Date().getFullYear(),
    fuel: undefined,
    transmission: undefined,
    status: undefined,
  });

  const filtered = cars.filter((car) => {
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const priceStr = car.price.toString();
      const match =
        `${car.make} ${car.model} ${car.year} ${car.color} ${car.carType}`.toLowerCase().includes(q) ||
        priceStr.includes(q);
      if (!match) return false;
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

  const activeFilterCount = [
    filters.make && filters.make !== 'All',
    filters.minPrice && filters.minPrice > 0,
    filters.maxPrice && filters.maxPrice < 10000000,
    filters.fuel,
    filters.transmission,
    filters.status && filters.status !== 'available',
  ].filter(Boolean).length;

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

        {/* Search + Quick Brand Pills */}
        <div className="space-y-3 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
              <input
                id="car-search"
                type="text"
                placeholder="Search by brand, model, year..."
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
                className="input-dark pl-12 h-12"
              />
              {filters.search && (
                <button
                  onClick={() => updateFilter('search', '')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Price quick search */}
            <div className="relative sm:w-52">
              <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
              <input
                id="price-search"
                type="number"
                placeholder="Max price..."
                value={filters.maxPrice === 10000000 ? '' : filters.maxPrice}
                onChange={(e) => updateFilter('maxPrice', e.target.value ? parseInt(e.target.value) : 10000000)}
                className="input-dark pl-10 h-12"
              />
            </div>

            {/* Filter toggle */}
            <button
              id="toggle-filters"
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-5 h-12 glass border rounded-xl font-medium transition-all relative ${
                showFilters
                  ? 'border-purple-500/60 text-purple-300 bg-purple-600/10'
                  : 'border-purple-500/30 text-purple-300 hover:bg-purple-600/10'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-purple-500 rounded-full text-white text-[10px] flex items-center justify-center font-bold">
                  {activeFilterCount}
                </span>
              )}
              <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            {/* Clear */}
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-4 h-12 text-sm text-gray-400 hover:text-red-400 transition-colors rounded-xl hover:bg-red-500/10"
              >
                <X className="w-4 h-4" />
                Clear
              </button>
            )}
          </div>

          {/* Quick brand pills */}
          <div className="flex flex-wrap gap-2">
            {MAKES.map((m) => (
              <button
                key={m}
                onClick={() => updateFilter('make', m === 'All' ? '' : m)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                  (m === 'All' && !filters.make) || filters.make === m
                    ? 'gradient-purple text-white shadow-lg shadow-purple-500/20'
                    : 'glass text-gray-400 hover:text-purple-300 border border-purple-900/30 hover:border-purple-500/40'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          {/* Price preset pills */}
          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-gray-500 self-center mr-1">Budget:</span>
            {PRICE_PRESETS.map((p) => {
              const isActive = filters.minPrice === (p.min || 0) && filters.maxPrice === p.max;
              return (
                <button
                  key={p.label}
                  onClick={() => {
                    if (isActive) {
                      updateFilter('minPrice', 0);
                      updateFilter('maxPrice', 10000000);
                    } else {
                      updateFilter('minPrice', p.min || 0);
                      updateFilter('maxPrice', p.max);
                    }
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-purple-600/30 text-purple-300 border border-purple-500/60'
                      : 'glass text-gray-400 hover:text-purple-300 border border-purple-900/30 hover:border-purple-500/40'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
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
                <label className="text-xs text-gray-500 font-medium mb-3 block">Brand</label>
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
                <label className="text-xs text-gray-500 font-medium mb-1 block">
                  Price Range
                </label>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-purple-300">{formatPrice(filters.minPrice || 0)}</span>
                  <span className="text-xs font-semibold text-purple-300">{formatPrice(filters.maxPrice || 10000000)}</span>
                </div>
                <div className="space-y-2">
                  <input
                    type="range" min={0} max={10000000} step={100000}
                    value={filters.minPrice}
                    onChange={(e) => updateFilter('minPrice', parseInt(e.target.value))}
                    className="w-full accent-purple-500"
                  />
                  <input
                    type="range" min={0} max={10000000} step={100000}
                    value={filters.maxPrice}
                    onChange={(e) => updateFilter('maxPrice', parseInt(e.target.value))}
                    className="w-full accent-purple-500"
                  />
                </div>
              </div>

              {/* Year Range */}
              <div>
                <label className="text-xs text-gray-500 font-medium mb-3 block">
                  Year: {filters.minYear} — {filters.maxYear}
                </label>
                <div className="flex gap-2">
                  <input type="number" value={filters.minYear} min={2000} max={filters.maxYear}
                    onChange={(e) => updateFilter('minYear', parseInt(e.target.value))}
                    className="input-dark text-sm py-2" />
                  <input type="number" value={filters.maxYear} min={filters.minYear} max={new Date().getFullYear()}
                    onChange={(e) => updateFilter('maxYear', parseInt(e.target.value))}
                    className="input-dark text-sm py-2" />
                </div>
              </div>

              {/* Fuel Type */}
              <div>
                <label className="text-xs text-gray-500 font-medium mb-3 block">Fuel Type</label>
                <div className="flex flex-wrap gap-2">
                  {FUEL_TYPES.map((f) => (
                    <button key={f}
                      onClick={() => updateFilter('fuel', filters.fuel === f ? undefined : f)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all capitalize ${
                        filters.fuel === f ? 'gradient-purple text-white' : 'glass text-gray-400 hover:text-purple-300'
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
                    <button key={t}
                      onClick={() => updateFilter('transmission', filters.transmission === t ? undefined : t)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all uppercase ${
                        filters.transmission === t ? 'gradient-purple text-white' : 'glass text-gray-400 hover:text-purple-300'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear filters button in sidebar */}
              {activeFilterCount > 0 && (
                <button onClick={clearFilters} className="w-full py-2 text-xs text-red-400 hover:text-red-300 transition-colors glass rounded-xl border border-red-500/20 hover:border-red-400/40">
                  Clear All Filters
                </button>
              )}
            </div>
          </aside>

          {/* Car Grid */}
          <div className="flex-1">
            {filtered.length === 0 ? (
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
