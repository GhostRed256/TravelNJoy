'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import type { Car } from '@/types/car';
import { DEMO_CARS } from '@/lib/utils';

export interface CarContextType {
  cars: Car[];
  loading: boolean;
  error: string | null;
  refreshCars: () => Promise<void>;
}

export const CarContext = createContext<CarContextType>({
  cars: DEMO_CARS,
  loading: true,
  error: null,
  refreshCars: async () => {},
});

let globalCarsPromise: Promise<{ cars: Car[]; error?: string }> | null = null;
let globalCarsCache: Car[] | null = null;

async function fetchCarsData(): Promise<{ cars: Car[]; error?: string }> {
  if (globalCarsCache) {
    return { cars: globalCarsCache };
  }
  if (globalCarsPromise) {
    return globalCarsPromise;
  }

  globalCarsPromise = (async () => {
    try {
      const res = await fetch('/api/cars?filter=public', { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();

      let resultCars: Car[] = [];
      if (data?.source === 'demo' || !data?.cars) {
        resultCars = DEMO_CARS;
      } else {
        resultCars = data.cars;
      }
      globalCarsCache = resultCars;
      return { cars: resultCars };
    } catch (err: any) {
      console.warn('Failed to fetch cars from API, using DEMO_CARS fallback:', err?.message);
      globalCarsCache = DEMO_CARS;
      return { cars: DEMO_CARS, error: err?.message || 'Failed to fetch' };
    } finally {
      globalCarsPromise = null;
    }
  })();

  return globalCarsPromise;
}

export function CarDataProvider({ children }: { children: React.ReactNode }) {
  const [cars, setCars] = useState<Car[]>(globalCarsCache || DEMO_CARS);
  const [loading, setLoading] = useState<boolean>(!globalCarsCache);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

  const loadCars = useCallback(async (force = false) => {
    if (force) {
      globalCarsCache = null;
      globalCarsPromise = null;
    }
    setLoading(true);
    const result = await fetchCarsData();
    if (isMounted.current) {
      setCars(result.cars && result.cars.length > 0 ? result.cars : DEMO_CARS);
      setError(result.error || null);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;
    loadCars();
    return () => {
      isMounted.current = false;
    };
  }, [loadCars]);

  const refreshCars = useCallback(async () => {
    await loadCars(true);
  }, [loadCars]);

  return (
    <CarContext.Provider value={{ cars, loading, error, refreshCars }}>
      {children}
    </CarContext.Provider>
  );
}

export function useCarContext() {
  return useContext(CarContext);
}
