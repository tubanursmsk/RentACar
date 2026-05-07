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

export interface Car {
  id: number;
  plate: string;
  model: string;
  modelYear: number;
  color: string;
  dailyPrice: number;
  status: CarStatus;
  fuelType: FuelType;
  transmissionType: TransmissionType;
  seatCount: number;
  doorCount: number;
  mileage: number;
  brandId: number;
  brandName?: string;
  currentLocationId: number;
  locationName?: string;
  imageUrl?: string;
  carImages?: CarImage[];
  description?: string;
}

export interface CarImage {
  id: number;
  carId: number;
  imageUrl: string;
  isMain: boolean;
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