import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LocationService } from '../../../../core/services/location.service';
import { BookingStateService } from '../../../../core/services/booking-state.service';

@Component({
  selector: 'app-hero-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section id="hero-search" class="relative bg-gradient-to-b from-brand-50 to-white overflow-hidden">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">

        <!-- ═══ Turo Tarzı: Sol Başlık + Sağ Görsel ═══ -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">

          <!-- SOL: Başlık ve Arama Kartı -->
          <div class="relative z-10">
            <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-ink-900 leading-[1.05] tracking-tight">
              Araç kiralama<br>
              <span class="text-brand-600">yeniden tanımlandı</span>
            </h1>
            <p class="mt-4 text-lg text-ink-600 max-w-lg">
              Türkiye'nin dört bir yanında konforlu ve güvenli araç kiralama deneyimi. Şimdi rezerve et, yolculuk keyfinle başlasın.
            </p>

            <!-- ═══ Arama Kartı — Turo Tarzı Beyaz Card ═══ -->
            <div class="mt-8 bg-white rounded-card shadow-card p-6 border border-ink-100">
              <!-- Konum -->
              <div class="mb-4">
                <label class="label">Nereden</label>
                <div class="relative">
                  <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-500 pointer-events-none"
                       fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  <select [(ngModel)]="pickupLocationId"
                          class="input-field pl-11 pr-4 cursor-pointer appearance-none">
                    <option [ngValue]="null">Şehir veya havalimanı seçin</option>
                    @for (loc of locations(); track loc.id) {
                      <option [ngValue]="loc.id">{{ loc.name }} — {{ loc.city }}</option>
                    }
                  </select>
                </div>
              </div>

              <!-- Farklı iade konumu -->
              <div class="flex items-center gap-2 mb-4">
                <input type="checkbox"
                       id="differentReturn"
                       [(ngModel)]="differentReturn"
                       class="w-4 h-4 accent-brand-600 cursor-pointer">
                <label for="differentReturn" class="text-sm text-ink-700 cursor-pointer">
                  Farklı konumda teslim et
                </label>
              </div>

              @if (differentReturn()) {
                <div class="mb-4 animate-fade-in">
                  <label class="label">Nereye</label>
                  <select [(ngModel)]="returnLocationId"
                          class="input-field cursor-pointer appearance-none">
                    <option [ngValue]="null">İade konumu seçin</option>
                    @for (loc of locations(); track loc.id) {
                      <option [ngValue]="loc.id">{{ loc.name }} — {{ loc.city }}</option>
                    }
                  </select>
                </div>
              }

              <!-- Alış Tarihi + Saati -->
              <div class="grid grid-cols-2 gap-3 mb-4">
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
                          class="input-field cursor-pointer appearance-none">
                    @for (t of timeOptions; track t) {
                      <option [value]="t">{{ t }}</option>
                    }
                  </select>
                </div>
              </div>

              <!-- İade Tarihi + Saati -->
              <div class="grid grid-cols-2 gap-3 mb-6">
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
                          class="input-field cursor-pointer appearance-none">
                    @for (t of timeOptions; track t) {
                      <option [value]="t">{{ t }}</option>
                    }
                  </select>
                </div>
              </div>

              @if (error()) {
                <p class="mb-3 text-sm text-accent-danger font-medium">{{ error() }}</p>
              }

              <!-- Ara Butonu — Turo tarzı büyük siyah -->
              <button (click)="search()"
                      [disabled]="!canSearch()"
                      class="btn-primary w-full text-base py-4 disabled:opacity-50 disabled:cursor-not-allowed">
                @if (rentalDays() > 0) {
                  {{ rentalDays() }} gün için müsait araçları göster
                } @else {
                  Araç Ara
                }
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- SAĞ: Görsel (yerine göre araç PNG) -->
          <div class="hidden lg:block relative">
            <!-- Arka plan dekoratif blob -->
            <div class="absolute inset-0 bg-gradient-to-br from-brand-100 via-brand-50 to-transparent
                        rounded-card-lg blur-3xl opacity-70"></div>

            <!-- Araç PNG (public/assets/cars/hero-*.png varsa) -->
            <div class="relative flex items-center justify-center">
              <img src="assets/cars/hero-2.png"
                   alt="Kiralanabilir araç"
                   class="w-full h-auto max-h-[520px] object-contain drop-shadow-2xl"
                   onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
              <div style="display:none" class="text-[280px]">🚗</div>
            </div>

            <!-- Rating badge (Turo tarzı) -->
            <div class="absolute bottom-6 right-6 bg-white rounded-card shadow-card-hover p-4 flex items-center gap-3">
              <div class="w-12 h-12 bg-accent-success/10 rounded-full flex items-center justify-center">
                <svg class="w-6 h-6 text-accent-success" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
                </svg>
              </div>
              <div>
                <div class="font-bold text-ink-900">4.9</div>
                <div class="text-xs text-ink-500">2.400+ mutlu müşteri</div>
              </div>
            </div>

            <!-- Fiyat badge (sol üst) -->
            <div class="absolute top-6 left-6 bg-white rounded-card shadow-card-hover px-4 py-3">
              <div class="text-xs text-ink-500 font-semibold uppercase">Günlük</div>
              <div class="text-2xl font-extrabold text-brand-600">₺500'den başlar</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `
})
export class HeroSearchComponent implements OnInit {
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
    if (this.locations().length === 0) {
      this.locationService.getAll().subscribe();
    }

    // Önceki seçimi geri yükle
    const prev = this.bookingState.selection();
    if (prev.pickupLocationId) this.pickupLocationId.set(prev.pickupLocationId);
    if (prev.returnLocationId && prev.returnLocationId !== prev.pickupLocationId) {
      this.returnLocationId.set(prev.returnLocationId);
      this.differentReturn.set(true);
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