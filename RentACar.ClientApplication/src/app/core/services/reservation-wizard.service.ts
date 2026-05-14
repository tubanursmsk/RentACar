import { Injectable, computed, signal } from '@angular/core';
import { Car } from '../models/car.model';
import {
  DriverInfo,
  InsurancePackage,
  PricePreview,
  SelectedAdditionalProduct
} from '../models/reservation.model';

export interface WizardState {
  // Step 0 (anasayfa booking card'tan gelir)
  car: Car | null;
  pickUpLocationId: number | null;
  dropOffLocationId: number | null;
  rentStartDate: Date | null;
  rentEndDate: Date | null;

  // Step 2
  selectedInsurance: InsurancePackage | null;

  // Step 3
  selectedProducts: Map<number, number>;   // productId → quantity

  // Step 4
  driverInfo: DriverInfo;

  // Step 5
  paymentMethod: 'online' | 'office' | null;

  // Hesaplanmış fiyat (her step'te güncellenebilir)
  pricePreview: PricePreview | null;
}

const STORAGE_KEY = 'rentacar_wizard';

const EMPTY_DRIVER: DriverInfo = {
  identityNumber: '',
  firstName: '',
  lastName: '',
  birthDate: '',
  licenseNumber: '',
  phone: '',
  email: '',
  address: ''
};

@Injectable({ providedIn: 'root' })
export class ReservationWizardService {
  // ─── State ───
  private readonly _state = signal<WizardState>(this.loadFromStorage());
  private readonly _currentStep = signal(1);

  // Public readonly
  readonly state = this._state.asReadonly();
  readonly currentStep = this._currentStep.asReadonly();

  // ─── Computed ───
  readonly totalDays = computed(() => {
    const s = this._state();
    if (!s.rentStartDate || !s.rentEndDate) return 0;
    const diff = s.rentEndDate.getTime() - s.rentStartDate.getTime();
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  });

  readonly canProceedFromStep1 = computed(() => {
    const s = this._state();
    return !!(s.car && s.pickUpLocationId && s.rentStartDate && s.rentEndDate);
  });

  readonly canProceedFromStep2 = computed(() => !!this._state().selectedInsurance);

  readonly canProceedFromStep4 = computed(() => {
    const d = this._state().driverInfo;
    return !!(d.identityNumber.length === 11 &&
              d.firstName && d.lastName && d.birthDate &&
              d.licenseNumber && d.phone && d.email && d.address);
  });

  // ─── Step navigation ───
  goToStep(step: number): void {
    if (step < 1 || step > 5) return;
    this._currentStep.set(step);
    this.persist();
  }

  nextStep(): void {
    if (this._currentStep() < 5) {
      this._currentStep.update(s => s + 1);
      this.persist();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  prevStep(): void {
    if (this._currentStep() > 1) {
      this._currentStep.update(s => s - 1);
      this.persist();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // ─── State updaters ───
  setCarAndDates(car: Car, pickUpLocationId: number, dropOffLocationId: number,
                  rentStartDate: Date, rentEndDate: Date): void {
    this._state.update(s => ({
      ...s,
      car,
      pickUpLocationId,
      dropOffLocationId,
      rentStartDate,
      rentEndDate
    }));
    this.persist();
  }

  setInsurance(insurance: InsurancePackage | null): void {
    this._state.update(s => ({ ...s, selectedInsurance: insurance }));
    this.persist();
  }

  setProductQuantity(productId: number, quantity: number): void {
    this._state.update(s => {
      const products = new Map(s.selectedProducts);
      if (quantity <= 0) products.delete(productId);
      else products.set(productId, quantity);
      return { ...s, selectedProducts: products };
    });
    this.persist();
  }

  getProductQuantity(productId: number): number {
    return this._state().selectedProducts.get(productId) ?? 0;
  }

  getSelectedProducts(): SelectedAdditionalProduct[] {
    const map = this._state().selectedProducts;
    return Array.from(map.entries()).map(([id, qty]) => ({
      additionalProductId: id,
      quantity: qty
    }));
  }

  setDriverInfo(info: Partial<DriverInfo>): void {
    this._state.update(s => ({
      ...s,
      driverInfo: { ...s.driverInfo, ...info }
    }));
    this.persist();
  }

  setPaymentMethod(method: 'online' | 'office'): void {
    this._state.update(s => ({ ...s, paymentMethod: method }));
    this.persist();
  }

  setPricePreview(preview: PricePreview | null): void {
    this._state.update(s => ({ ...s, pricePreview: preview }));
    // Fiyatı persist etmiyoruz, her seferinde API'den hesaplıyoruz
  }

  // ─── Reset ───
  reset(): void {
    this._state.set(this.emptyState());
    this._currentStep.set(1);
    sessionStorage.removeItem(STORAGE_KEY);
  }

  // ─── Persist (sessionStorage) ───
  private emptyState(): WizardState {
    return {
      car: null,
      pickUpLocationId: null,
      dropOffLocationId: null,
      rentStartDate: null,
      rentEndDate: null,
      selectedInsurance: null,
      selectedProducts: new Map(),
      driverInfo: { ...EMPTY_DRIVER },
      paymentMethod: null,
      pricePreview: null
    };
  }

  private persist(): void {
    try {
      const s = this._state();
      const serializable = {
        car: s.car,
        pickUpLocationId: s.pickUpLocationId,
        dropOffLocationId: s.dropOffLocationId,
        rentStartDate: s.rentStartDate?.toISOString(),
        rentEndDate: s.rentEndDate?.toISOString(),
        selectedInsurance: s.selectedInsurance,
        selectedProducts: Array.from(s.selectedProducts.entries()),
        driverInfo: s.driverInfo,
        paymentMethod: s.paymentMethod,
        currentStep: this._currentStep()
      };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
    } catch { /* sessizce yut */ }
  }

  private loadFromStorage(): WizardState {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return this.emptyState();
      const parsed = JSON.parse(raw);
      if (parsed.currentStep) {
        // _currentStep henüz initialize edilmediği için doğrudan set'liyemeyiz.
        // ngOnInit'te restore edilecek (aşağıdaki restoreCurrentStep ile)
        this._restoreStep = parsed.currentStep;
      }
      return {
        car: parsed.car ?? null,
        pickUpLocationId: parsed.pickUpLocationId ?? null,
        dropOffLocationId: parsed.dropOffLocationId ?? null,
        rentStartDate: parsed.rentStartDate ? new Date(parsed.rentStartDate) : null,
        rentEndDate: parsed.rentEndDate ? new Date(parsed.rentEndDate) : null,
        selectedInsurance: parsed.selectedInsurance ?? null,
        selectedProducts: new Map(parsed.selectedProducts ?? []),
        driverInfo: parsed.driverInfo ?? { ...EMPTY_DRIVER },
        paymentMethod: parsed.paymentMethod ?? null,
        pricePreview: null
      };
    } catch {
      return this.emptyState();
    }
  }

  private _restoreStep: number | null = null;

  // Component ngOnInit'te çağırsın
  restoreStep(): void {
    if (this._restoreStep != null) {
      this._currentStep.set(this._restoreStep);
      this._restoreStep = null;
    }
  }
}
