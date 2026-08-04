'use client';

import { useMemo } from 'react';
import { useCarContext } from '@/components/CarDataProvider';
import type { Car } from '@/types/car';
import { getRecommendedCars, getRecommendationReason } from '@/lib/recommendations';
import { formatPrice } from '@/lib/utils';

export function useCarsData() {
  return useCarContext();
}

export function useFeaturedVehicles(limit = 6) {
  const { cars, loading, error } = useCarContext();

  const featuredCars = useMemo(() => {
    if (!cars || cars.length === 0) return [];
    // Prioritize available cars
    const available = cars.filter((c) => c.status === 'available');
    if (available.length > 0) {
      return available.slice(0, limit);
    }
    return cars.slice(0, limit);
  }, [cars, limit]);

  return { featuredCars, loading, error };
}

export interface CategoryCountItem {
  id: string;
  name: string;
  bodyTypeParam: string;
  count: number;
  description: string;
  iconName: string;
}

export function useCategoryCounts() {
  const { cars, loading } = useCarContext();

  const categoryStats = useMemo(() => {
    const LUXURY_MAKES = ['BMW', 'Mercedes-Benz', 'Audi', 'Jaguar', 'Land Rover', 'Volvo', 'Porsche', 'Lexus'];

    let suvCount = 0;
    let sedanCount = 0;
    let hatchbackCount = 0;
    let muvMpvCount = 0;
    let electricCount = 0;
    let luxuryCount = 0;

    cars.forEach((car) => {
      const bt = car.bodyType?.toLowerCase();
      const fuel = car.fuel?.toLowerCase();
      const make = car.make || '';
      const isLuxury = LUXURY_MAKES.some((l) => l.toLowerCase() === make.toLowerCase()) || car.carType === 'luxury';

      if (bt === 'suv' || bt === 'crossover') suvCount++;
      if (bt === 'sedan') sedanCount++;
      if (bt === 'hatchback') hatchbackCount++;
      if (bt === 'muv_mpv' || bt === 'pickup') muvMpvCount++;
      if (fuel === 'electric') electricCount++;
      if (isLuxury) luxuryCount++;
    });

    const categories: CategoryCountItem[] = [
      {
        id: 'suv',
        name: 'SUVs & Crossovers',
        bodyTypeParam: 'suv',
        count: suvCount,
        description: 'Spacious, powerful all-terrain vehicles',
        iconName: 'Shield',
      },
      {
        id: 'sedan',
        name: 'Sedans',
        bodyTypeParam: 'sedan',
        count: sedanCount,
        description: 'Comfortable, elegant executive cars',
        iconName: 'Car',
      },
      {
        id: 'hatchback',
        name: 'Hatchbacks',
        bodyTypeParam: 'hatchback',
        count: hatchbackCount,
        description: 'Agile & fuel-efficient city drives',
        iconName: 'Zap',
      },
      {
        id: 'muv_mpv',
        name: 'MUV / MPV',
        bodyTypeParam: 'muv_mpv',
        count: muvMpvCount,
        description: 'Multi-utility 7-seater family carriers',
        iconName: 'Users',
      },
      {
        id: 'electric',
        name: 'Electric Vehicles',
        bodyTypeParam: 'electric',
        count: electricCount,
        description: 'Zero-emission smart future mobility',
        iconName: 'BatteryCharging',
      },
      {
        id: 'luxury',
        name: 'Luxury Fleet',
        bodyTypeParam: 'luxury',
        count: luxuryCount,
        description: 'Premium prestige luxury automobiles',
        iconName: 'Crown',
      },
    ];

    return {
      suvCount,
      sedanCount,
      hatchbackCount,
      muvMpvCount,
      electricCount,
      luxuryCount,
      categories,
    };
  }, [cars]);

  return { ...categoryStats, loading };
}

export function useDealOfTheDay() {
  const { cars, loading } = useCarContext();

  const dealData = useMemo(() => {
    if (!cars || cars.length === 0) {
      return { dealCar: null, savingsText: '', originalPrice: 0 };
    }

    const available = cars.filter((c) => c.status === 'available');
    const pool = available.length > 0 ? available : cars;

    // Pick top value car: calculate score based on recent year, lower mileage, competitive price
    const scored = [...pool].map((car) => {
      // Estimated market value calculation for savings display
      const baseVal = car.quotingPrice * 1.12;
      const score = (car.yearOfManufacture * 1000) - (car.odometer / 100) - (car.quotingPrice / 10000);
      return { car, estimatedVal: Math.round(baseVal), score };
    });

    scored.sort((a, b) => b.score - a.score);
    const topDeal = scored[0];

    if (!topDeal) {
      return { dealCar: null, savingsText: '', originalPrice: 0 };
    }

    const savings = Math.round(topDeal.estimatedVal - topDeal.car.quotingPrice);
    const savingsText = `Save up to ${formatPrice(savings)} vs Market Estimate`;

    return {
      dealCar: topDeal.car,
      originalPrice: topDeal.estimatedVal,
      savingsText,
    };
  }, [cars]);

  return { ...dealData, loading };
}

export function useBrandStats() {
  const { cars, loading } = useCarContext();

  const brandStats = useMemo(() => {
    const popularBrands = [
      { name: 'Maruti Suzuki', tagline: 'India\'s Favorite' },
      { name: 'Hyundai', tagline: 'Smart & Premium' },
      { name: 'Tata', tagline: '5-Star Safety' },
      { name: 'Mahindra', tagline: 'Authentic SUVs' },
      { name: 'Toyota', tagline: 'Legendary Reliability' },
      { name: 'Honda', tagline: 'Engine Excellence' },
      { name: 'BMW', tagline: 'Sheer Driving Pleasure' },
      { name: 'Kia', tagline: 'Inspiring Motion' },
    ];

    const counts: Record<string, number> = {};
    cars.forEach((car) => {
      if (!car.make) return;
      let key = car.make.trim();
      if (/^maruti/i.test(key)) key = 'Maruti Suzuki';
      // Match case-insensitively to brand list
      const matchedBrand = popularBrands.find(b => b.name.toLowerCase() === key.toLowerCase())?.name || key;
      counts[matchedBrand] = (counts[matchedBrand] || 0) + 1;
    });

    const items = popularBrands.map((b) => ({
      name: b.name,
      tagline: b.tagline,
      count: counts[b.name] || 0,
    }));

    return items;
  }, [cars]);

  return { brandStats, loading };
}

export function usePersonalizedRecommendations(limit = 3) {
  const { cars, loading } = useCarContext();

  const recommendations = useMemo(() => {
    if (!cars || cars.length === 0) {
      return { recommendedCars: [], recommendationReason: null };
    }
    const recommendedCars = getRecommendedCars(cars, limit);
    const recommendationReason = getRecommendationReason();
    return { recommendedCars, recommendationReason };
  }, [cars, limit]);

  return { ...recommendations, loading };
}
