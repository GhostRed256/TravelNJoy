import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

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

// Demo cars for when Google Sheets is not configured
export const DEMO_CARS = [
  {
    id: 'demo_1',
    make: 'Toyota',
    model: 'Camry',
    year: 2021,
    price: 2200000,
    mileage: 32000,
    fuel: 'petrol' as const,
    transmission: 'automatic' as const,
    color: 'Pearl White',
    description: 'Pristine condition Toyota Camry with full service history. One owner. All features intact including sunroof, leather seats, and advanced safety systems.',
    images: ['/car-sedan.png'],
    status: 'available' as const,
    features: ['Sunroof', 'Leather Seats', 'Backup Camera', 'Bluetooth', 'Cruise Control', 'Lane Assist'],
    engine: '2.5L 4-cylinder',
    owners: 1,
    ownerName: 'Rahul T.',
    condition: 'Excellent',
    carType: 'Sedan',
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'demo_2',
    make: 'BMW',
    model: 'X5',
    year: 2022,
    price: 6500000,
    mileage: 18000,
    fuel: 'diesel' as const,
    transmission: 'automatic' as const,
    color: 'Midnight Black',
    description: 'Luxury BMW X5 with panoramic sunroof, 360 camera, premium Harman Kardon sound system. Loaded with all options. Under warranty.',
    images: ['/car-suv.png'],
    status: 'available' as const,
    features: ['Panoramic Sunroof', '360 Camera', 'Harman Kardon Audio', 'Heated Seats', 'Ventilated Seats', 'Heads-Up Display'],
    engine: '3.0L 6-cylinder Turbo Diesel',
    owners: 1,
    ownerName: 'Anita M.',
    condition: 'Like New',
    carType: 'SUV',
    createdAt: '2024-02-20T10:00:00Z',
  },
  {
    id: 'demo_3',
    make: 'Honda',
    model: 'City',
    year: 2020,
    price: 980000,
    mileage: 45000,
    fuel: 'petrol' as const,
    transmission: 'cvt' as const,
    color: 'Lunar Silver',
    description: 'Well-maintained Honda City CVT. Excellent fuel economy. Ideal for city driving and highway cruising. Full service records available.',
    images: ['/car-sedan.png'],
    status: 'available' as const,
    features: ['Lane Watch Camera', 'Touchscreen Infotainment', 'Reverse Camera', 'Automatic Climate Control'],
    engine: '1.5L i-VTEC',
    owners: 2,
    ownerName: 'Sanjay P.',
    condition: 'Good',
    carType: 'Sedan',
    createdAt: '2024-03-10T10:00:00Z',
  },
  {
    id: 'demo_4',
    make: 'Hyundai',
    model: 'Creta',
    year: 2023,
    price: 1750000,
    mileage: 12000,
    fuel: 'diesel' as const,
    transmission: 'automatic' as const,
    color: 'Typhoon Silver',
    description: 'Nearly new Hyundai Creta SX(O) fully loaded trim. Panoramic sunroof, ventilated seats, BlueLink connected features, and ADAS suite.',
    images: ['/car-suv.png'],
    status: 'reserved' as const,
    features: ['Panoramic Sunroof', 'ADAS Safety Suite', 'BlueLink Connected', 'Ventilated Front Seats', 'Wireless Charging'],
    engine: '1.5L U2 CRDi Diesel',
    owners: 1,
    ownerName: 'Vikram S.',
    condition: 'Excellent',
    carType: 'SUV',
    createdAt: '2024-04-05T10:00:00Z',
  },
  {
    id: 'demo_5',
    make: 'Tata',
    model: 'Nexon EV',
    year: 2023,
    price: 1600000,
    mileage: 8000,
    fuel: 'electric' as const,
    transmission: 'automatic' as const,
    color: 'Flame Red',
    description: 'Tata Nexon EV Max with 437km certified range. Fast charging capability. V2L feature. Still under manufacturer warranty.',
    images: ['/car-suv.png'],
    status: 'available' as const,
    features: ['437km Range', 'Fast Charging', 'Vehicle-to-Load', 'Air Purifier', 'Connected Tech', 'Wireless Charging'],
    engine: 'Electric Motor - 143 PS',
    owners: 1,
    ownerName: 'Priya K.',
    condition: 'Like New',
    carType: 'SUV',
    createdAt: '2024-05-01T10:00:00Z',
  },
  {
    id: 'demo_6',
    make: 'Maruti',
    model: 'Swift',
    year: 2019,
    price: 620000,
    mileage: 58000,
    fuel: 'petrol' as const,
    transmission: 'manual' as const,
    color: 'Solid Red',
    description: 'Reliable and economical Maruti Swift ZXi. Excellent city car with low maintenance cost. Full service history available.',
    images: ['/car-sedan.png'],
    status: 'sold' as const,
    features: ['SmartPlay Infotainment', 'Rear Parking Sensors', 'Dual Airbags', 'ABS', 'EBD'],
    engine: '1.2L K-Series',
    owners: 1,
    ownerName: 'Amit D.',
    condition: 'Good',
    carType: 'Hatchback',
    createdAt: '2024-01-25T10:00:00Z',
  },
  {
    id: 'demo_7',
    make: 'Maruti Suzuki',
    model: 'Celerio VXI',
    year: 2015,
    price: 350000,
    mileage: 45000,
    fuel: 'petrol' as const,
    transmission: 'manual' as const,
    color: 'Silky Silver',
    description: 'Silver Maruti Suzuki Celerio VXI in good condition. Affordable and practical hatchback.',
    images: [
      '/MS Celerio demo/1 (2).jpeg',
      '/MS Celerio demo/1 (1).jpeg',
      '/MS Celerio demo/1 (4).jpeg',
      '/MS Celerio demo/1 (5).jpeg',
      '/MS Celerio demo/1 (6).jpeg',
      '/MS Celerio demo/1 (8).jpeg',
    ],
    status: 'sold' as const,
    features: ['Power Steering', 'AC', 'Front Power Windows'],
    engine: '998.00 CC',
    owners: 1,
    ownerName: 'DEBABRATA CHOWDHURY',
    ownerAddress: 'NEAR APIL , BL-II, E-153, NAMSAI, NAMSAI, NAMSAI-ARUNACHAL PRADESH-792103',
    condition: 'Used - Good',
    carType: 'Hatchback',
    registrationNo: 'AR11A3021',
    chassisNo: 'MA3ETDE1S00192979',
    engineNo: 'K10BN1844928',
    dateOfProcurement: '19/06/24',
    buyerName: 'Arup Kakoty',
    buyerAadhar: '9698 6745 2344',
    buyerPan: 'DBQPK8679M',
    buyerAddress: 'C/O: So Late Sonaram Kakoty, BORDUBI BAZAR, Bordubi Rev. Town., Tinsukia, Assam, 786601',
    soldDate: '2024-07-10T10:00:00Z',
    createdAt: '2024-06-19T10:00:00Z',
  },
];
