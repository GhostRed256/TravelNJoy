import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
export { DEMO_CARS } from './demo-cars';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatMileage(mileage: number): string {
  return new Intl.NumberFormat('en-IN').format(mileage) + ' km';
}

export function generateId(): string {
  return `car_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function generateCustomerId(): string {
  return `cust_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function getVehicleId(car: import('@/types/car').Car, allCars?: import('@/types/car').Car[]): string {
  if (!allCars || allCars.length === 0) {
    // Fallback: extract numbers or format ID
    const matches = car.id.match(/\d+/g);
    if (matches && matches.length > 0) {
      const lastDigits = matches[matches.length - 1].slice(-3);
      return `#${lastDigits.padStart(3, '0')}`;
    }
    return `#001`;
  }

  // Sort all cars chronologically (earliest created car is #001)
  const sorted = [...allCars].sort((a, b) => {
    const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return ta - tb;
  });

  const index = sorted.findIndex((c) => c.id === car.id);
  if (index >= 0) {
    const num = index + 1;
    return `#${num.toString().padStart(3, '0')}`;
  }

  return `#001`;
}

export const cloudinaryLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => {
  if (!src) return '';
  if (src.includes('res.cloudinary.com') && src.includes('/upload/')) {
    if (src.match(/\/upload\/[a-z_]+,/)) return src;
    return src.replace('/upload/', `/upload/c_scale,w_${width},q_${quality || 'auto'},f_auto/`);
  }
  return src;
};

export function getOptimizedImage(url: string, width = 800): string {
  if (!url) return '';
  if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
    if (url.match(/\/upload\/[a-z_]+,/)) return url;
    return url.replace('/upload/', `/upload/c_scale,w_${width},q_auto,f_auto/`);
  }
  return url;
}
