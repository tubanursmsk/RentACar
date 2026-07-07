export enum CarStatus {
  Available = 1,
  Rented = 2,
  InMaintenance = 3,
  Passive = 4
}

export enum FuelType {
  Petrol = 1,
  Diesel = 2,
  Electric = 3,
  Hybrid = 4,
  LPG = 5
}

export enum TransmissionType {
  Manual = 1,
  Automatic = 2,
  SemiAutomatic = 3
}

export interface CarImage {
  id: number;
  imageUrl: string;
  isMain: boolean;
}

export interface Car {
  id: number;
  plate: string;
  model: string;
  year: number;                   // Backend "Year"
  dailyPrice: number;
  status: CarStatus;

  // ═══ Araç Özellikleri ═══
  fuelType: FuelType;
  transmissionType: TransmissionType;
  seatCount: number;
  doorCount: number;
  luggageCount: number;
  color?: string | null;
  mileage?: number | null;
  description?: string | null;

  // ═══ Ek Özellikler ═══
  hasAirbag: boolean;
  hasAbs: boolean;
  hasAirConditioning: boolean;
  hasBluetooth: boolean;
  hasNavigation: boolean;

  // ═══ Kiralama Koşulları ═══
  minFindeksScore: number;
  minDriverAge: number;
  minLicenseYears: number;

  // ═══ İlişkiler ═══
  brandId: number;
  brandName?: string;
  currentLocationId: number;
  currentLocationName?: string;

  imageUrl?: string | null;
  carImages?: CarImage[];

  // Eski isimler için backward compat (frontend'in başka yerlerinde kullanılıyor olabilir)
  modelYear?: number;
  locationName?: string;
}

export interface CarFilter {
  brandIds?: number[];
  locationId?: number;
  fuelType?: FuelType;
  transmissionType?: TransmissionType;
  minPrice?: number;
  maxPrice?: number;
  minSeatCount?: number;
  searchTerm?: string;
  pageNumber?: number;
  pageSize?: number;
}