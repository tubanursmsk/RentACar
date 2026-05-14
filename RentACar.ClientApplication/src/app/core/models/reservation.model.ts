// ─── INSURANCE ───
export interface InsuranceFeature {
  name: string;
  isIncluded: boolean;
}

export interface InsurancePackage {
  id: number;
  name: string;
  code: string;
  dailyPrice: number;
  description: string;
  displayOrder: number;
  isRecommended: boolean;
  features: InsuranceFeature[];
}

// ─── ADDITIONAL PRODUCTS ───
export interface AdditionalProduct {
  id: number;
  name: string;
  code: string;
  description: string;
  dailyPrice: number;
  iconName: string;
  isQuantityBased: boolean;
  maxQuantity: number;
  displayOrder: number;
}

export interface SelectedAdditionalProduct {
  additionalProductId: number;
  quantity: number;
}

// ─── DRIVER INFO ───
export interface DriverInfo {
  identityNumber: string;
  firstName: string;
  lastName: string;
  birthDate: string;       // YYYY-MM-DD
  licenseNumber: string;
  phone: string;
  email: string;
  address: string;
}

// ─── PRICE PREVIEW ───
export interface PricePreviewRequest {
  carId: number;
  rentStartDate: string;
  rentEndDate: string;
  insurancePackageId?: number | null;
  additionalProducts: SelectedAdditionalProduct[];
}

export interface PriceLine {
  label: string;
  amount: number;
  detail?: string;
}

export interface PricePreview {
  totalDays: number;
  carDailyPrice: number;
  subTotal: number;
  insuranceTotal: number;
  additionalProductsTotal: number;
  grandTotal: number;
  lines: PriceLine[];
}

// ─── CREATE RESERVATION ───
export interface CreateReservationRequest {
  carId: number;
  pickUpLocationId: number;
  dropOffLocationId: number;
  rentStartDate: string;
  rentEndDate: string;
  insurancePackageId?: number | null;
  additionalProducts: SelectedAdditionalProduct[];

  driverIdentityNumber: string;
  driverFirstName: string;
  driverLastName: string;
  driverBirthDate: string;
  driverLicenseNumber: string;
  driverPhone: string;
  driverEmail: string;
  driverAddress: string;
}

// ─── RESERVATION DETAIL ───
export interface ReservationDetail {
  id: number;
  carInfo: string;
  carImageUrl?: string;
  pickUpLocationName: string;
  dropOffLocationName: string;
  rentStartDate: string;
  rentEndDate: string;
  totalDays: number;
  insurancePackage?: InsurancePackage;
  additionalProducts: ReservationProductDetail[];
  subTotal: number;
  insuranceTotal: number;
  additionalProductsTotal: number;
  totalAmount: number;
  status: string;
  isPaid: boolean;
  createdDate: string;
}

export interface ReservationProductDetail {
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}
