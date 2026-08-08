export type CarStatus = 'available' | 'sold' | 'reserved';
export type FuelType = 'petrol' | 'diesel' | 'electric' | 'hybrid' | 'cng' | 'e10' | 'e20' | 'pure petrol';
export type TransmissionType = 'manual' | 'automatic' | 'cvt';
export type BodyType = 'sedan' | 'suv' | 'hatchback' | 'muv_mpv' | 'crossover' | 'pickup' | 'other';

export interface Car {
  id: string;
  make: string;
  modelVariant: string;
  registrationNo: string;
  odometer: number;
  yearOfManufacture: number;
  acquisitionDate: string;
  quotingPrice: number;
  rcName: string;
  status: CarStatus;
  
  // Documents (Seller)
  docRC?: string;
  docInsurance?: string;
  docPUC?: string;
  docNOC?: string;
  docSellerPAN?: string;
  docSellerAadhar?: string;
  docVehicleDetails?: string;

  // Website only details
  images: string[];
  description: string;
  fuel: FuelType;
  transmission: TransmissionType;
  color: string;
  features: string[];
  engine: string;
  owners: number;
  ownerAddress?: string;
  condition?: string;
  bodyType?: BodyType;
  carType?: string;
  chassisNo?: string;
  engineNo?: string;

  // System fields
  sheetRow?: number;
  createdAt: string;
  updatedAt?: string;

  // Buyer Details (Sold sheet only)
  buyerName?: string;
  buyerEmail?: string;
  buyerPAN?: string;
  buyerAadhar?: string;
  buyerAddress?: string;
  soldDate?: string;
  docBuyerPAN?: string;
  docBuyerAadhar?: string;
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
  bodyType?: BodyType;
  status?: CarStatus;
}
