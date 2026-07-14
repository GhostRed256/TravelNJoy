export type CarStatus = 'available' | 'sold' | 'reserved';
export type FuelType = 'petrol' | 'diesel' | 'electric' | 'hybrid' | 'cng';
export type TransmissionType = 'manual' | 'automatic' | 'cvt';

export interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuel: FuelType;
  transmission: TransmissionType;
  color: string;
  description: string;
  images: string[]; // URLs (Google Drive public links)
  status: CarStatus;
  features: string[];
  engine: string;
  owners: number;
  ownerName?: string;
  ownerAddress?: string; // e.g. from RC
  condition?: string;
  carType?: string;
  registrationNo?: string;
  chassisNo?: string;
  engineNo?: string;
  dateOfProcurement?: string;
  buyerName?: string;
  buyerAadhar?: string;
  buyerPan?: string;
  buyerAddress?: string;
  soldDate?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ChatMessage {
  id: string;
  customerId: string;
  customerName: string;
  message: string;
  sender: 'customer' | 'admin';
  timestamp: string;
  read: boolean;
}

export interface ChatSession {
  customerId: string;
  customerName: string;
  lastMessage: string;
  lastTimestamp: string;
  unreadCount: number;
  messages: ChatMessage[];
}

export interface CarFilters {
  search?: string;
  make?: string;
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  fuel?: FuelType;
  transmission?: TransmissionType;
  status?: CarStatus;
}
