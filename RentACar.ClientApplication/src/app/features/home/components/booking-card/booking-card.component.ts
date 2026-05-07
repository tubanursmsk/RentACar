import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LocationService } from '../../../../core/services/location.service';
import { BookingStateService } from '../../../../core/services/booking-state.service';

@Component({
  selector: 'app-booking-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white rounded-2xl shadow-2xl p-6 md:p-8 max-w-md w-full">
      <h3 class="text-lg md:text-xl font-bold text-ink-900 mb-1">
        Ayrıcalıklı Araç Kiralama Deneyimi İçin Yola RentACar'le Devam Edin!
      </h3>

      <!-- Teslimat Konumu -->
      <div class="mt-6">
        <label class="label">Teslimat Konumu</label>
        <div class="relative">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-500"
               fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <select [(ngModel)]="pickupLocationId"
                  class="input-field pl-10 appearance-none cursor-pointer">
            <option [ngValue]="null">Konum Seçiniz</option>
            @for (loc of locations(); track loc.id) {
              <option [ngValue]="loc.id">{{ loc.name }} — {{ loc.city }}</option>
            }
          </select>
        </div>
      </div>

      <!-- Farklı iade noktası -->
      <div class="mt-3 flex items-center gap-2">
        <input type="checkbox"
               id="differentReturn"
               [(ngModel)]="differentReturn"
               class="w-4 h-4 accent-avis-600 cursor-pointer">
        <label for="differentReturn" class="text-sm text-ink-700 cursor-pointer">
          Farklı bir noktaya teslim etmek istiyorum.
        </label>
      </div>

      @if (differentReturn()) {
        <div class="mt-3">
          <select [(ngModel)]="returnLocationId"
                  class="input-field appearance-none cursor-pointer">
            <option [ngValue]="null">İade Konumu Seçiniz</option>
            @for (loc of locations(); track loc.id) {
              <option [ngValue]="loc.id">{{ loc.name }} — {{ loc.city }}</option>
            }
          </select>
        </div>
      }

      <!-- Tarih Seçimleri -->
      <div class="mt-5 grid grid-cols-2 gap-3">
        <div>
          <label class="label">Alış Tarihi</label>
          <input type="date"
                 [(ngModel)]="pickupDate"
                 [min]="todayString"
                 class="input-field cursor-pointer">
        </div>
        <div>
          <label class="label">Saat</label>
          <select [(ngModel)]="pickupTime"
                  class="input-field appearance-none cursor-pointer">
            @for (t of timeOptions; track t) {
              <option [value]="t">{{ t }}</option>
            }
          </select>
        </div>
      </div>

      <div class="mt-4 grid grid-cols-2 gap-3">
        <div>
          <label class="label">İade Tarihi</label>
          <input type="date"
                 [(ngModel)]="returnDate"
                 [min]="minReturnDate()"
                 class="input-field cursor-pointer">
        </div>
        <div>
          <label class="label">Saat</label>
          <select [(ngModel)]="returnTime"
                  class="input-field appearance-none cursor-pointer">
            @for (t of timeOptions; track t) {
              <option [value]="t">{{ t }}</option>
            }
          </select>
        </div>
      </div>

      <!-- Hata mesajı -->
      @if (error()) {
        <p class="mt-3 text-sm text-avis-600 font-semibold">{{ error() }}</p>
      }

      <!-- Alt butonlar -->
      <div class="mt-6 flex items-center justify-between">
        <a href="#indirim" class="text-xs font-bold text-ink-700 hover:text-avis-600 flex items-center gap-1">
          AVANTAJLI KAMPANYALAR
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M9 5l7 7-7 7"/>
          </svg>
        </a>

        <button (click)="search()"
                [disabled]="!canSearch()"
                class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
          @if (rentalDays() > 0) {
            {{ rentalDays() }} GÜN KİRALA
          } @else {
            ARAÇ ARA
          }
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M9 5l7 7-7 7"/>
          </svg>
        </button>
      </div>
    </div>
  `
})
export class BookingCardComponent implements OnInit {
  private locationService = inject(LocationService);
  private bookingState = inject(BookingStateService);
  private router = inject(Router);

  protected locations = this.locationService.locations;

  protected pickupLocationId = signal<number | null>(null);
  protected returnLocationId = signal<number | null>(null);
  protected differentReturn = signal(false);
  protected pickupDate = signal<string>('');
  protected returnDate = signal<string>('');
  protected pickupTime = signal('09:00');
  protected returnTime = signal('09:00');
  protected error = signal<string | null>(null);

  protected timeOptions = this.generateTimeOptions();

  protected todayString = new Date().toISOString().split('T')[0];

  protected minReturnDate = computed(() => {
    const pd = this.pickupDate();
    if (!pd) return this.todayString;
    const d = new Date(pd);
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });

  protected rentalDays = computed(() => {
    if (!this.pickupDate() || !this.returnDate()) return 0;
    const start = new Date(this.pickupDate());
    const end = new Date(this.returnDate());
    const diff = end.getTime() - start.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  });

  protected canSearch = computed(() =>
    !!this.pickupLocationId() && !!this.pickupDate() && !!this.returnDate() && this.rentalDays() > 0
  );

  ngOnInit(): void {
    // Lokasyonları yükle
    if (this.locations().length === 0) {
      this.locationService.getAll().subscribe();
    }

    // Önceki seçimi geri yükle
    const prev = this.bookingState.selection();
    if (prev.pickupLocationId) this.pickupLocationId.set(prev.pickupLocationId);
    if (prev.returnLocationId) {
      this.returnLocationId.set(prev.returnLocationId);
      this.differentReturn.set(prev.returnLocationId !== prev.pickupLocationId);
    }
    if (prev.pickupDate) this.pickupDate.set(this.formatDate(prev.pickupDate));
    if (prev.returnDate) this.returnDate.set(this.formatDate(prev.returnDate));
    if (prev.pickupTime) this.pickupTime.set(prev.pickupTime);
    if (prev.returnTime) this.returnTime.set(prev.returnTime);
  }

  search(): void {
    if (!this.canSearch()) {
      this.error.set('Lütfen konum ve tarih seçin.');
      return;
    }

    const pickupLoc = this.locations().find(l => l.id === this.pickupLocationId());
    const returnLocId = this.differentReturn() && this.returnLocationId()
      ? this.returnLocationId()
      : this.pickupLocationId();
    const returnLoc = this.locations().find(l => l.id === returnLocId);

    this.bookingState.setSelection({
      pickupLocationId: this.pickupLocationId(),
      pickupLocationName: pickupLoc?.name ?? null,
      returnLocationId: returnLocId,
      returnLocationName: returnLoc?.name ?? null,
      pickupDate: new Date(this.pickupDate()),
      pickupTime: this.pickupTime(),
      returnDate: new Date(this.returnDate()),
      returnTime: this.returnTime()
    });

    this.error.set(null);
    this.router.navigate(['/araclar'], {
      queryParams: { locationId: this.pickupLocationId() }
    });
  }

  private formatDate(d: Date): string {
    return d.toISOString().split('T')[0];
  }

  private generateTimeOptions(): string[] {
    const times: string[] = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 30) {
        const hh = h.toString().padStart(2, '0');
        const mm = m.toString().padStart(2, '0');
        times.push(`${hh}:${mm}`);
      }
    }
    return times;
  }
}