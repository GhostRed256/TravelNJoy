import type { Car } from '@/types/car';

export interface UserPreferences {
  viewedMakes: Record<string, number>; // brand -> count
  searchedQueries: string[];
  preferredFuel?: string;
  preferredBodyType?: string;
  preferredTransmission?: string;
  maxBudget?: number;
  lastVisited?: string;
}

const PREF_KEY = 'travelnjoy_user_prefs';

export function getUserPreferences(): UserPreferences {
  if (typeof window === 'undefined') {
    return { viewedMakes: {}, searchedQueries: [] };
  }
  try {
    const raw = localStorage.getItem(PREF_KEY);
    if (!raw) return { viewedMakes: {}, searchedQueries: [] };
    return JSON.parse(raw);
  } catch {
    return { viewedMakes: {}, searchedQueries: [] };
  }
}

export function trackUserViewCar(car: Car): void {
  if (typeof window === 'undefined' || !car) return;
  try {
    const prefs = getUserPreferences();
    const brand = car.make;
    if (brand) {
      prefs.viewedMakes[brand] = (prefs.viewedMakes[brand] || 0) + 1;
    }
    if (car.quotingPrice) {
      prefs.maxBudget = Math.max(prefs.maxBudget || 0, car.quotingPrice * 1.2);
    }
    if (car.fuel) {
      prefs.preferredFuel = car.fuel;
    }
    if (car.bodyType) {
      prefs.preferredBodyType = car.bodyType;
    }
    if (car.transmission) {
      prefs.preferredTransmission = car.transmission;
    }
    prefs.lastVisited = new Date().toISOString();
    localStorage.setItem(PREF_KEY, JSON.stringify(prefs));
  } catch {
    /* ignore storage errors */
  }
}

export function trackUserSearch(query: string): void {
  if (typeof window === 'undefined' || !query.trim()) return;
  try {
    const prefs = getUserPreferences();
    const q = query.trim().toLowerCase();
    if (!prefs.searchedQueries.includes(q)) {
      prefs.searchedQueries = [q, ...prefs.searchedQueries].slice(0, 10);
    }
    localStorage.setItem(PREF_KEY, JSON.stringify(prefs));
  } catch {
    /* ignore storage errors */
  }
}

/**
 * Returns recommended cars based on user browsing history and brand preferences.
 */
export function getRecommendedCars(cars: Car[], limit = 4): Car[] {
  const prefs = getUserPreferences();
  const brandScores = prefs.viewedMakes;
  
  if (!cars || cars.length === 0) return [];
  if (Object.keys(brandScores).length === 0) {
    // Default fallback: return featured or top available cars
    return cars.filter(c => c.status !== 'sold').slice(0, limit);
  }

  // Sort top brands by view count
  const topBrands = Object.entries(brandScores)
    .sort((a, b) => b[1] - a[1])
    .map(([brand]) => brand.toLowerCase());

  // Rank cars by matching top brands first, then budget/fuel/bodyType/transmission
  const scored = cars
    .filter(c => c.status !== 'sold')
    .map(car => {
      let score = 0;
      const brand = (car.make || '').toLowerCase();
      if (topBrands.includes(brand)) {
        const rankIndex = topBrands.indexOf(brand);
        score += 50 - rankIndex * 10;
      }
      if (prefs.preferredFuel && car.fuel === prefs.preferredFuel) {
        score += 15;
      }
      if (prefs.preferredBodyType && car.bodyType === prefs.preferredBodyType) {
        score += 20; // High weight for body type match
      }
      if (prefs.preferredTransmission && car.transmission === prefs.preferredTransmission) {
        score += 10;
      }
      if (prefs.maxBudget && car.quotingPrice <= prefs.maxBudget) {
        score += 10;
      }
      return { car, score };
    });

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map(item => item.car);
}

/**
 * Returns a human-readable reason for the recommendations.
 */
export function getRecommendationReason(): string | null {
  const prefs = getUserPreferences();
  const brandScores = prefs.viewedMakes;
  if (Object.keys(brandScores).length > 0) {
    const topBrand = Object.entries(brandScores).sort((a, b) => b[1] - a[1])[0][0];
    return `Based on your interest in ${topBrand}`;
  }
  return null;
}
