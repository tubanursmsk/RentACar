import { Component, OnInit, inject, signal, computed, ElementRef, HostListener, viewChild } from '@angular/core';
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
    <div class="bg-white rounded-2xl shadow-2xl p-6 md:p-7 max-w-md w-full">
      <h3 class="text-base md:text-lg font-bold text-ink-900 leading-snug">
        Ayrıcalıklı Araç Kiralama Deneyimi İçin Yola RentACar'le Devam Edin!
      </h3>

      <!-- ─── Teslimat Konumu ─── -->
      <div class="mt-5">
        <label class="block text-[11px] font-bold text-avis-600 uppercase tracking-wider mb-2">
          TESLİMAT KONUMU
        </label>
        <div class="relative">
          <!-- Sol arama ikonu -->
          <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-500 pointer-events-none"
               fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <select [(ngModel)]="pickupLocationId"
                  class="w-full pl-11 pr-11 py-3 rounded-lg border border-ink-100
                         focus:border-avis-600 focus:ring-2 focus:ring-avis-100
                         outline-none transition appearance-none cursor-pointer text-sm">
            <option [ngValue]="null">Konum Seçiniz</option>
            @for (loc of locations(); track loc.id) {
              <option [ngValue]="loc.id">{{ loc.name }} — {{ loc.city }}</option>
            }
          </select>
          <!-- Sağ GPS ikonu -->
          <button type="button"
                  (click)="useCurrentLocation()"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-avis-600 hover:text-avis-700 p-1
                         transition-transform hover:scale-110"
                  title="Konumumu kullan">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="3" stroke-width="2"/>
              <circle cx="12" cy="12" r="9" stroke-width="2"/>
              <line x1="12" y1="2" x2="12" y2="5" stroke-width="2"/>
              <line x1="12" y1="19" x2="12" y2="22" stroke-width="2"/>
              <line x1="2" y1="12" x2="5" y2="12" stroke-width="2"/>
              <line x1="19" y1="12" x2="22" y2="12" stroke-width="2"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- ─── Farklı iade noktası checkbox ─── -->
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
        <div class="mt-3 animate-fade-in">
          <select [(ngModel)]="returnLocationId"
                  class="w-full px-4 py-3 rounded-lg border border-ink-100
                         focus:border-avis-600 focus:ring-2 focus:ring-avis-100
                         outline-none transition appearance-none cursor-pointer text-sm">
            <option [ngValue]="null">İade Konumu Seçiniz</option>
            @for (loc of locations(); track loc.id) {
              <option [ngValue]="loc.id">{{ loc.name }} — {{ loc.city }}</option>
            }
          </select>
        </div>
      }

      <!-- ─── Tarih/Saat satırı (Avis stili: Alış → İade) ─── -->
      <div class="mt-5">
        <!-- Üst etiketler -->
        <div class="grid grid-cols-[1fr_auto_1fr] gap-2 mb-2">
          <label class="text-[11px] font-bold text-ink-700 uppercase tracking-wide">Alış Tarihi</label>
          <span class="w-8"></span>
          <label class="text-[11px] font-bold text-ink-700 uppercase tracking-wide">İade Tarihi</label>
        </div>

        <!-- Tarihler + ok -->
        <div class="grid grid-cols-[1fr_auto_1fr] gap-2 items-center">
          <!-- Alış Tarihi (custom picker) -->
          <div class="grid grid-cols-2 gap-2">
            <button type="button"
                    (click)="togglePicker('pickupDate')"
                    class="px-3 py-2.5 rounded-lg border border-ink-100 hover:border-avis-300
                           text-left transition flex items-center justify-between gap-1 text-sm">
              <span [class.text-ink-300]="!pickupDate()" class="font-semibold">
                {{ pickupDate() ? formatShortDate(pickupDate()!) : 'gg.aa.yy' }}
              </span>
              <svg class="w-3 h-3 text-ink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7"/>
              </svg>
            </button>
            <button type="button"
                    (click)="togglePicker('pickupTime')"
                    class="px-3 py-2.5 rounded-lg border border-ink-100 hover:border-avis-300
                           text-left transition flex items-center justify-between gap-1 text-sm">
              <span class="font-semibold">{{ pickupTime() }}</span>
              <svg class="w-3 h-3 text-ink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7"/>
              </svg>
            </button>
          </div>

          <!-- Kırmızı ok (→) -->
          <div class="flex items-center justify-center">
            <svg class="w-5 h-5 text-avis-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
            </svg>
          </div>

          <!-- İade Tarihi -->
          <div class="grid grid-cols-2 gap-2">
            <button type="button"
                    (click)="togglePicker('returnDate')"
                    class="px-3 py-2.5 rounded-lg border border-ink-100 hover:border-avis-300
                           text-left transition flex items-center justify-between gap-1 text-sm">
              <span [class.text-ink-300]="!returnDate()" class="font-semibold">
                {{ returnDate() ? formatShortDate(returnDate()!) : 'gg.aa.yy' }}
              </span>
              <svg class="w-3 h-3 text-ink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7"/>
              </svg>
            </button>
            <button type="button"
                    (click)="togglePicker('returnTime')"
                    class="px-3 py-2.5 rounded-lg border border-ink-100 hover:border-avis-300
                           text-left transition flex items-center justify-between gap-1 text-sm">
              <span class="font-semibold">{{ returnTime() }}</span>
              <svg class="w-3 h-3 text-ink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- ─── Açılır picker'lar ─── -->

        <!-- Alış Tarih Picker -->
        @if (openPicker() === 'pickupDate') {
          <div class="mt-2 p-3 bg-white border border-ink-100 rounded-lg shadow-lg animate-fade-in">
            <input type="date"
                   [value]="pickupDateString()"
                   [min]="todayString"
                   (change)="onPickupDateChange($event)"
                   class="w-full px-3 py-2 border border-ink-100 rounded-lg outline-none focus:border-avis-600 text-sm">
          </div>
        }

        <!-- Alış Saat Picker -->
        @if (openPicker() === 'pickupTime') {
          <div class="mt-2 p-2 bg-white border border-ink-100 rounded-lg shadow-lg max-h-48 overflow-y-auto animate-fade-in">
            <div class="grid grid-cols-4 gap-1">
              @for (t of timeOptions; track t) {
                <button type="button"
                        (click)="selectTime('pickup', t)"
                        class="px-2 py-1.5 text-xs rounded transition"
                        [class.bg-avis-600]="pickupTime() === t"
                        [class.text-white]="pickupTime() === t"
                        [class.hover:bg-ink-100]="pickupTime() !== t">
                  {{ t }}
                </button>
              }
            </div>
          </div>
        }

        <!-- İade Tarih Picker -->
        @if (openPicker() === 'returnDate') {
          <div class="mt-2 p-3 bg-white border border-ink-100 rounded-lg shadow-lg animate-fade-in">
            <input type="date"
                   [value]="returnDateString()"
                   [min]="minReturnDateString()"
                   (change)="onReturnDateChange($event)"
                   class="w-full px-3 py-2 border border-ink-100 rounded-lg outline-none focus:border-avis-600 text-sm">
          </div>
        }

        <!-- İade Saat Picker -->
        @if (openPicker() === 'returnTime') {
          <div class="mt-2 p-2 bg-white border border-ink-100 rounded-lg shadow-lg max-h-48 overflow-y-auto animate-fade-in">
            <div class="grid grid-cols-4 gap-1">
              @for (t of timeOptions; track t) {
                <button type="button"
                        (click)="selectTime('return', t)"
                        class="px-2 py-1.5 text-xs rounded transition"
                        [class.bg-avis-600]="returnTime() === t"
                        [class.text-white]="returnTime() === t"
                        [class.hover:bg-ink-100]="returnTime() !== t">
                  {{ t }}
                </button>
              }
            </div>
          </div>
        }
      </div>

      <!-- Hata mesajı -->
      @if (error()) {
        <p class="mt-3 text-xs text-avis-600 font-semibold">{{ error() }}</p>
      }

      <!-- ─── Alt butonlar ─── -->
      <div class="mt-6 flex items-center justify-between gap-2">
        <a href="#kampanyalar" class="text-[11px] font-bold text-ink-700 hover:text-avis-600 flex items-center gap-1 tracking-wide">
          AVANTAJLI KAMPANYALAR
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M9 5l7 7-7 7"/>
          </svg>
        </a>

        <button (click)="search()"
                [disabled]="!canSearch()"
                class="inline-flex items-center gap-2 bg-avis-600 hover:bg-avis-700
                       disabled:bg-avis-300 disabled:cursor-not-allowed
                       text-white font-bold px-5 py-2.5 rounded-full transition-all
                       shadow-md hover:shadow-lg text-sm">
          @if (rentalDays() > 0) {
            {{ rentalDays() }} GÜN KİRALA
          } @else {
            ARAÇ ARA
          }
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
  private elementRef = inject(ElementRef);

  protected locations = this.locationService.locations;

  // ── State ──
  protected pickupLocationId = signal<number | null>(null);
  protected returnLocationId = signal<number | null>(null);
  protected differentReturn = signal(false);
  protected pickupDate = signal<Date | null>(null);
  protected returnDate = signal<Date | null>(null);
  protected pickupTime = signal('09:00');
  protected returnTime = signal('09:00');
  protected error = signal<string | null>(null);

  // Hangi picker açık? ('pickupDate' | 'pickupTime' | 'returnDate' | 'returnTime' | null)
  protected openPicker = signal<string | null>(null);

  protected timeOptions = this.generateTimeOptions();
  protected todayString = this.toDateString(new Date());

  // ── Computed ──
  protected pickupDateString = computed(() =>
    this.pickupDate() ? this.toDateString(this.pickupDate()!) : ''
  );
  protected returnDateString = computed(() =>
    this.returnDate() ? this.toDateString(this.returnDate()!) : ''
  );
  protected minReturnDateString = computed(() => {
    const pd = this.pickupDate();
    if (!pd) return this.todayString;
    const next = new Date(pd);
    next.setDate(next.getDate() + 1);
    return this.toDateString(next);
  });

  protected rentalDays = computed(() => {
    const start = this.pickupDate();
    const end = this.returnDate();
    if (!start || !end) return 0;
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
    if (prev.pickupDate) this.pickupDate.set(new Date(prev.pickupDate));
    if (prev.returnDate) this.returnDate.set(new Date(prev.returnDate));
    if (prev.pickupTime) this.pickupTime.set(prev.pickupTime);
    if (prev.returnTime) this.returnTime.set(prev.returnTime);
  }

  // ── Picker toggle ──
  togglePicker(name: string): void {
    this.openPicker.update(curr => curr === name ? null : name);
  }

  // ── Dış tıklamada picker'ı kapat ──
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.openPicker.set(null);
    }
  }

  // ── Tarih değişimleri ──
  onPickupDateChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    if (!value) return;
    this.pickupDate.set(new Date(value));

    // Eğer iade tarihi alıştan öncesindeyse temizle
    const ret = this.returnDate();
    if (ret && ret <= new Date(value)) {
      const next = new Date(value);
      next.setDate(next.getDate() + 1);
      this.returnDate.set(next);
    }

    this.openPicker.set(null);
  }

  onReturnDateChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    if (!value) return;
    this.returnDate.set(new Date(value));
    this.openPicker.set(null);
  }

  // ── Saat seçimi ──
  selectTime(target: 'pickup' | 'return', time: string): void {
    if (target === 'pickup') {
      this.pickupTime.set(time);
    } else {
      this.returnTime.set(time);
    }
    this.openPicker.set(null);
  }

  // ── GPS lokasyon (opsiyonel - geliştirilebilir) ──
  useCurrentLocation(): void {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        // Burada en yakın şubeyi bulup seçebilirsin
        // Şimdilik sadece ilk şubeyi seç (örnek)
        const first = this.locations()[0];
        if (first) this.pickupLocationId.set(first.id);
      },
      () => { /* sessizce yut */ }
    );
  }

  // ── Arama ──
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
      pickupDate: this.pickupDate(),
      pickupTime: this.pickupTime(),
      returnDate: this.returnDate(),
      returnTime: this.returnTime()
    });

    this.error.set(null);
    this.router.navigate(['/araclar'], {
      queryParams: { locationId: this.pickupLocationId() }
    });
  }

  // ── Helpers ──
  formatShortDate(d: Date): string {
    // "08 May 26" formatı
    const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
    const day = d.getDate().toString().padStart(2, '0');
    const month = months[d.getMonth()];
    const year = d.getFullYear().toString().slice(-2);
    return `${day} ${month} ${year}`;
  }

  private toDateString(d: Date): string {
    const y = d.getFullYear();
    const m = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  private generateTimeOptions(): string[] {
    const times: string[] = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 30) {
        times.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
      }
    }
    return times;
  }
}