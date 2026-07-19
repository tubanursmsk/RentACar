import { Injectable, computed, signal } from '@angular/core';

export interface BookingSelection {
  savedAt: number;
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

// Bir seçim kaç dakika sonra "eski" sayılır (temiz sayfaya dönüş için)
const FRESHNESS_MINUTES = 30;

/**
 * Rezervasyon seçimini tutar — Anasayfa → Araç Listesi → Detay arasında paylaşılır.
 * sessionStorage ile sayfa yenilenince de korunur.
 * 30 dakikadan eski seçimler "taze değil" sayılır, ana sayfa boş açılır.
 */
@Injectable({ providedIn: 'root' })
export class BookingStateService {
  private readonly _selection = signal<BookingSelection>(this.loadFromStorage());

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

  /**
   * ⭐ YENİ: Mevcut seçim son 30 dakika içinde mi yapılmış?
   * Kullanım: hero-search bunu kontrol ederek eski seçimi form'a doldurup doldurmayacağına karar veriyor.
   */
  readonly isFresh = computed(() => {
    const s = this._selection();
    if (!s.savedAt) return false;
    return (Date.now() - s.savedAt) < FRESHNESS_MINUTES * 60 * 1000;
  });

  setSelection(selection: Partial<BookingSelection>): void {
    const current = this._selection();
    const updated: BookingSelection = {
      ...current,
      ...selection,
      savedAt: Date.now()   // ⭐ Her set'te tazelenir
    };
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
      returnTime: null,
      savedAt: 0
    };
    this._selection.set(empty);
    // ⭐ İkisini de temizle (bazı tarayıcılarda sessionStorage tutarsız)
    try {
      sessionStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STORAGE_KEY);
    } catch { /* sessizce yut */ }
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
      returnTime: '09:00',
      savedAt: 0
    };

    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return empty;
      const parsed = JSON.parse(raw);

      // ⭐ Yükleme aşamasında da freshness kontrolü
      const savedAt = parsed.savedAt ?? 0;
      const isFresh = savedAt && (Date.now() - savedAt < FRESHNESS_MINUTES * 60 * 1000);

      if (!isFresh) {
        // Eski seçim - storage'ı da temizle, boş dön
        try { sessionStorage.removeItem(STORAGE_KEY); } catch {}
        return empty;
      }

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