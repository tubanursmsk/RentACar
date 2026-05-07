import { Injectable, computed, signal } from '@angular/core';

export interface BookingSelection {
  pickupLocationId: number | null;
  pickupLocationName: string | null;
  returnLocationId: number | null;
  returnLocationName: string | null;
  pickupDate: Date | null;
  pickupTime: string | null;
  returnDate: Date | null;
  returnTime: string | null;
}

const STORAGE_KEY = 'rentacar_booking';

/**
 * Rezervasyon seçimini tutar — Anasayfa → Araç Listesi → Detay arasında paylaşılır.
 * sessionStorage ile sayfa yenilenince de korunur.
 */
@Injectable({ providedIn: 'root' })
export class BookingStateService {
  private readonly _selection = signal<BookingSelection>(this.loadFromStorage());

  // Public read-only signals
  readonly selection = this._selection.asReadonly();
  readonly hasSelection = computed(() => {
    const s = this._selection();
    return !!(s.pickupLocationId && s.pickupDate && s.returnDate);
  });
  readonly rentalDays = computed(() => {
    const s = this._selection();
    if (!s.pickupDate || !s.returnDate) return 0;
    const diff = s.returnDate.getTime() - s.pickupDate.getTime();
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  });

  setSelection(selection: Partial<BookingSelection>): void {
    const current = this._selection();
    const updated = { ...current, ...selection };
    this._selection.set(updated);
    this.saveToStorage(updated);
  }

  clear(): void {
    const empty: BookingSelection = {
      pickupLocationId: null,
      pickupLocationName: null,
      returnLocationId: null,
      returnLocationName: null,
      pickupDate: null,
      pickupTime: null,
      returnDate: null,
      returnTime: null
    };
    this._selection.set(empty);
    sessionStorage.removeItem(STORAGE_KEY);
  }

  private loadFromStorage(): BookingSelection {
    const empty: BookingSelection = {
      pickupLocationId: null,
      pickupLocationName: null,
      returnLocationId: null,
      returnLocationName: null,
      pickupDate: null,
      pickupTime: '09:00',
      returnDate: null,
      returnTime: '09:00'
    };

    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return empty;
      const parsed = JSON.parse(raw);
      return {
        ...empty,
        ...parsed,
        pickupDate: parsed.pickupDate ? new Date(parsed.pickupDate) : null,
        returnDate: parsed.returnDate ? new Date(parsed.returnDate) : null,
      };
    } catch {
      return empty;
    }
  }

  private saveToStorage(selection: BookingSelection): void {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(selection));
    } catch {
      // sessionStorage dolu olabilir, sessizce yut
    }
  }
}