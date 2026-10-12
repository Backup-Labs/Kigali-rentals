export type AssetType = 'property' | 'car' | 'combo';

export type PropertyCategory = 'penthouse' | 'villa' | 'studio' | 'apartment';
export type VehicleCategory = 'suv' | 'sedan' | '4x4' | 'hybrid' | 'luxury';
export type Transmission = 'automatic' | 'manual';
export type FuelType = 'petrol' | 'diesel' | 'hybrid' | 'electric';
export type DriverOption = 'self-drive' | 'chauffeur' | 'both';

export interface Listing {
  id: string;
  type: 'property' | 'car';
  title: string;
  subtitle: string;
  neighborhood: string; // e.g. Nyarutarama, Kiyovu, Kimihurura, Kigali Airport, Gacuriro
  address: string;
  description: string;
  images: string[];
  pricePerDay: number; // USD
  pricePerDayRwf: number; // RWF
  securityDeposit: number; // USD hold
  cleaningOrServiceFee: number; // USD
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  isInstantBook: boolean;
  featured: boolean;
  badges: string[];
  specsSummary: string; // e.g., '4 Seats • Automatic' or '2 Beds • 2 Baths'
  
  propertyDetails?: {
    category: PropertyCategory;
    bedrooms: number;
    bathrooms: number;
    maxGuests: number;
    sqm: number;
    amenities: string[];
    rules: string[];
    hasBackupGenerator: boolean;
    hasWaterReservoir: boolean;
    hasFastWifi: boolean;
    hasPool: boolean;
  };

  vehicleDetails?: {
    category: VehicleCategory;
    seats: number;
    doors: number;
    transmission: Transmission;
    fuelType: FuelType;
    fuelEfficiency: string;
    features: string[];
    driverOption: DriverOption;
    driverCostPerDay: number; // USD
    fourWheelDrive: boolean;
    unlimitedMileage: boolean;
  };

  crossSellRecommendation?: {
    assetId: string;
    title: string;
    type: 'car' | 'property';
    discountDailyRate: number;
    originalDailyRate: number;
    image: string;
    tagline: string;
    specs: string;
  };
}

export interface CustomerInfo {
  fullName: string;
  email: string;
  phone: string;
  idNumber?: string;
  idType?: 'passport' | 'national_id' | 'driver_license';
  documentUploaded?: boolean;
  documentFileName?: string;
}

export interface AddOnSelection {
  airportPickup: boolean;
  dedicatedDriver: boolean;
  childSeat: boolean;
  wifiHotspot: boolean;
  damageWaiver: boolean;
}

export type PaymentMethod = 'momo_mtn' | 'momo_airtel' | 'card';
export type PaymentPlan = 'pay_full' | 'deposit_30' | 'hold_card';

export interface ReservationPricing {
  baseDailyRate: number;
  days: number;
  baseTotal: number;
  comboAssetDailyRate?: number;
  comboTotal?: number;
  cleaningOrServiceFee: number;
  addOnsTotal: number;
  securityDepositHold: number;
  subtotal: number;
  taxesAndTourismLevy: number; // 5%
  grandTotal: number;
  payableToday: number;
  dueAtCheckIn: number;
  currency: 'USD' | 'RWF';
  paymentPlan: PaymentPlan;
  paymentMethod: PaymentMethod;
}

export interface Reservation {
  id: string; // e.g. KGL-2026-8942
  assetId: string;
  assetTitle: string;
  assetType: 'property' | 'car' | 'combo';
  assetImage: string;
  pairedAssetId?: string;
  pairedAssetTitle?: string;
  pairedAssetImage?: string;
  neighborhood: string;
  customer: CustomerInfo;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  daysCount: number;
  status: 'confirmed' | 'active' | 'completed' | 'cancelled' | 'pending_handover';
  addOns: AddOnSelection;
  pricing: ReservationPricing;
  agreementSigned: boolean;
  signatureDataUrl?: string;
  createdAt: string;
  handoverStatus: {
    checkInDone: boolean;
    checkInDate?: string;
    checkOutDone: boolean;
    checkOutDate?: string;
  };
}

export interface CarHandoverData {
  odometer: number;
  fuelLevel: number; // 0 to 100
  cleanliness: 'pristine' | 'standard' | 'muddy';
  exteriorPhotos: {
    front?: string;
    back?: string;
    driverSide?: string;
    passengerSide?: string;
  };
  scratches: { id: string; location: string; severity: 'minor' | 'moderate' | 'major'; note: string }[];
  spareTireAndJack: boolean;
  trianglePresent: boolean;
  notes: string;
}

export interface PropertyHandoverData {
  keysHandedOver: boolean;
  keyBoxPin: string;
  electricityMeterKwh: number;
  waterMeterUnits: number;
  cleanliness: 'pristine' | 'good' | 'needs_attention';
  roomsChecklist: { id: string; room: string; status: 'ok' | 'issue'; notes: string }[];
  acAndAppliancesWorking: boolean;
  poolAndGardenCondition: 'excellent' | 'normal' | 'na';
  notes: string;
}

export interface ConditionReport {
  id: string;
  bookingId: string;
  assetId: string;
  assetTitle: string;
  assetType: 'car' | 'property';
  stage: 'check_in' | 'check_out';
  timestamp: string;
  agentName: string;
  customerName: string;
  carData?: CarHandoverData;
  propertyData?: PropertyHandoverData;
  signatureUrl?: string;
  completed: boolean;
}

export interface AdminTask {
  id: string;
  title: string;
  type: 'cleaning' | 'driver_dispatch' | 'handover_checkin' | 'handover_checkout' | 'maintenance';
  assetId: string;
  assetName: string;
  assetType: 'property' | 'car';
  assignee: string;
  assigneeRole: string;
  time: string;
  date: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  notes?: string;
}

export interface AssetInventoryItem {
  id: string;
  title: string;
  type: 'property' | 'car';
  neighborhood: string;
  status: 'Available' | 'Rented' | 'Cleaning' | 'Maintenance';
  pricePerDay: number;
  pricePerDayRwf: number;
  activeBookingId?: string;
  nextAvailableDate: string;
  imageUrl: string;
  specs: string;
}

