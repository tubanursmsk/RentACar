import { Component, OnInit, inject, signal, computed, ElementRef, HostListener } from '@angular/core';
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
    <div class="relative z-40 bg-white rounded-2xl shadow-2xl p-6 md:p-7 max-w-md w-full">
      <h3 class="text-base md:text-lg font-bold text-ink-900 leading-snug">
        Ayrıcalıklı Araç Kiralama Deneyimi İçin Yola RentACar'le Devam Edin!
      </h3>

      <div class="mt-5">
        <label class="block text-[11px] font-bold text-avis-600 uppercase tracking-wider mb-2">
          TESLİMAT KONUMU
        </label>
        <div class="relative" (click)="$event.stopPropagation()">
          
          <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-500 pointer-events-none z-20"
               fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>

          <input type="text"
                 placeholder="İl, ilçe veya havalimanı yazın..."
                 [ngModel]="pickupSearchText()" 
                 (ngModelChange)="onPickupSearchChange($event)"
                 (focus)="isPickupDropdownOpen.set(true)"
                 class="w-full pl-11 pr-11 py-3 rounded-lg border border-ink-100
                        focus:border-avis-600 focus:ring-2 focus:ring-avis-100
                        outline-none transition text-sm font-medium bg-white relative z-10 placeholder:font-normal">
          
          <button type="button"
                  (click)="useCurrentLocation()"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-avis-600 hover:text-avis-700 p-1
                         transition-transform hover:scale-110 z-20 bg-white"
                  title="En yakın şubeyi bul">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="3" stroke-width="2"/>
              <circle cx="12" cy="12" r="9" stroke-width="2"/>
              <line x1="12" y1="2" x2="12" y2="5" stroke-width="2"/>
              <line x1="12" y1="19" x2="12" y2="22" stroke-width="2"/>
              <line x1="2" y1="12" x2="5" y2="12" stroke-width="2"/>
              <line x1="19" y1="12" x2="22" y2="12" stroke-width="2"/>
            </svg>
          </button>

          @if (isPickupDropdownOpen() && filteredLocations().length > 0) {
            <div class="absolute z-50 top-full left-0 right-0 mt-2 bg-white border border-ink-100 rounded-lg shadow-xl max-h-60 overflow-y-auto animate-fade-in">
              @for (loc of filteredLocations(); track loc.id) {
                <div (click)="selectPickupLocation(loc)" 
                     class="px-4 py-3 hover:bg-ink-50 cursor-pointer border-b border-ink-100 last:border-0 transition flex flex-col">
                  <span class="font-bold text-ink-900 text-sm">{{ loc.name }}</span>
                  <span class="text-xs text-ink-500">{{ loc.city }}</span>
                </div>
              }
            </div>
          } @else if (isPickupDropdownOpen() && filteredLocations().length === 0) {
            <div class="absolute z-50 top-full left-0 right-0 mt-2 bg-white border border-ink-100 rounded-lg shadow-xl p-4 text-center text-sm text-ink-500">
              Sonuç bulunamadı.
            </div>
          }
        </div>
      </div>

      <div class="mt-5 relative">
        <div class="grid grid-cols-[1fr_auto_1fr] gap-2 mb-2">
          <label class="text-[11px] font-bold text-ink-700 uppercase tracking-wide">Alış Tarihi</label>
          <span class="w-8"></span>
          <label class="text-[11px] font-bold text-ink-700 uppercase tracking-wide">İade Tarihi</label>
        </div>

        <div class="grid grid-cols-[1fr_auto_1fr] gap-2 items-center">
          <div class="grid grid-cols-2 gap-2">
            <button type="button" (click)="togglePicker('pickupDate', $event)"
                    class="px-3 py-2.5 rounded-lg border border-ink-100 hover:border-avis-300 text-left transition flex items-center justify-between gap-1 text-sm bg-white">
              <span [class.text-ink-300]="!pickupDate()" class="font-semibold">{{ pickupDate() ? formatShortDate(pickupDate()!) : 'gg.aa.yy' }}</span>
            </button>
            <button type="button" (click)="togglePicker('pickupTime', $event)"
                    class="px-3 py-2.5 rounded-lg border border-ink-100 hover:border-avis-300 text-left transition flex items-center justify-between gap-1 text-sm bg-white">
              <span class="font-semibold">{{ pickupTime() }}</span>
            </button>
          </div>

          <div class="flex items-center justify-center">
            <svg class="w-5 h-5 text-avis-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
          </div>

          <div class="grid grid-cols-2 gap-2">
            <button type="button" (click)="togglePicker('returnDate', $event)"
                    class="px-3 py-2.5 rounded-lg border border-ink-100 hover:border-avis-300 text-left transition flex items-center justify-between gap-1 text-sm bg-white">
              <span [class.text-ink-300]="!returnDate()" class="font-semibold">{{ returnDate() ? formatShortDate(returnDate()!) : 'gg.aa.yy' }}</span>
            </button>
            <button type="button" (click)="togglePicker('returnTime', $event)"
                    class="px-3 py-2.5 rounded-lg border border-ink-100 hover:border-avis-300 text-left transition flex items-center justify-between gap-1 text-sm bg-white">
              <span class="font-semibold">{{ returnTime() }}</span>
            </button>
          </div>
        </div>

        @if (openPicker() === 'pickupDate') {
          <div class="absolute z-50 top-full left-0 mt-2 p-3 bg-white border border-ink-100 rounded-lg shadow-xl animate-fade-in w-64">
            <input type="date" [value]="pickupDateString()" [min]="todayString" (change)="onPickupDateChange($event)" class="w-full px-3 py-2 border border-ink-100 rounded-lg outline-none focus:border-avis-600 text-sm cursor-pointer">
          </div>
        }
        @if (openPicker() === 'pickupTime') {
          <div class="absolute z-50 top-full left-1/4 mt-2 p-2 bg-white border border-ink-100 rounded-lg shadow-xl max-h-48 overflow-y-auto animate-fade-in w-64">
            <div class="grid grid-cols-4 gap-1">
              @for (t of timeOptions; track t) {
                <button type="button" (click)="selectTime('pickup', t)" class="px-2 py-1.5 text-xs rounded transition" [class.bg-avis-600]="pickupTime() === t" [class.text-white]="pickupTime() === t" [class.hover:bg-ink-100]="pickupTime() !== t">{{ t }}</button>
              }
            </div>
          </div>
        }
        @if (openPicker() === 'returnDate') {
          <div class="absolute z-50 top-full right-1/4 mt-2 p-3 bg-white border border-ink-100 rounded-lg shadow-xl animate-fade-in w-64">
            <input type="date" [value]="returnDateString()" [min]="minReturnDateString()" (change)="onReturnDateChange($event)" class="w-full px-3 py-2 border border-ink-100 rounded-lg outline-none focus:border-avis-600 text-sm cursor-pointer">
          </div>
        }
        @if (openPicker() === 'returnTime') {
          <div class="absolute z-50 top-full right-0 mt-2 p-2 bg-white border border-ink-100 rounded-lg shadow-xl max-h-48 overflow-y-auto animate-fade-in w-64">
            <div class="grid grid-cols-4 gap-1">
              @for (t of timeOptions; track t) {
                <button type="button" (click)="selectTime('return', t)" class="px-2 py-1.5 text-xs rounded transition" [class.bg-avis-600]="returnTime() === t" [class.text-white]="returnTime() === t" [class.hover:bg-ink-100]="returnTime() !== t">{{ t }}</button>
              }
            </div>
          </div>
        }
      </div>

      @if (error()) {
        <p class="mt-3 text-xs text-avis-600 font-semibold">{{ error() }}</p>
      }

      <div class="mt-6 flex items-center justify-between gap-2">
        <a href="#kampanyalar" class="text-[11px] font-bold text-ink-700 hover:text-avis-600 flex items-center gap-1 tracking-wide">
          AVANTAJLI KAMPANYALAR
        </a>
        <button (click)="search()" [disabled]="!canSearch()" class="inline-flex items-center gap-2 bg-avis-600 hover:bg-avis-700 disabled:bg-avis-300 disabled:cursor-not-allowed text-white font-bold px-5 py-2.5 rounded-full transition-all shadow-md hover:shadow-lg text-sm z-10">
          @if (rentalDays() > 0) { {{ rentalDays() }} GÜN KİRALA } @else { ARAÇ ARA }
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

  // ── ARAMA VE KONUM STATE'LERİ ──
  protected pickupLocationId = signal<number | null>(null);
  protected pickupSearchText = signal<string>('');
  protected isPickupDropdownOpen = signal<boolean>(false);

  // ── TARİH STATE'LERİ ──
  protected pickupDate = signal<Date | null>(null);
  protected returnDate = signal<Date | null>(null);
  protected pickupTime = signal('09:00');
  protected returnTime = signal('09:00');
  protected error = signal<string | null>(null);
  protected openPicker = signal<string | null>(null);

  protected timeOptions = this.generateTimeOptions();
  protected todayString = this.toDateString(new Date());

  // ── COMPUTED: Filtrelenmiş Şubeler ──
  protected filteredLocations = computed(() => {
    const query = this.pickupSearchText().toLowerCase().trim();
    if (!query) return this.locations();
    
    return this.locations().filter(loc => 
      loc.name.toLowerCase().includes(query) || 
      loc.city.toLowerCase().includes(query)
    );
  });

  protected pickupDateString = computed(() => this.pickupDate() ? this.toDateString(this.pickupDate()!) : '');
  protected returnDateString = computed(() => this.returnDate() ? this.toDateString(this.returnDate()!) : '');
  
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
  }

  // ── KONUM METOTLARI ──
  onPickupSearchChange(query: string): void {
    this.pickupSearchText.set(query);
    this.pickupLocationId.set(null); // Kullanıcı silip/değiştirirse ID'yi temizle
    this.isPickupDropdownOpen.set(true);
  }

  selectPickupLocation(loc: any): void {
    this.pickupLocationId.set(loc.id);
    this.pickupSearchText.set(`${loc.name} — ${loc.city}`);
    this.isPickupDropdownOpen.set(false);
    this.error.set(null);
  }

  useCurrentLocation(): void {
    if (!navigator.geolocation) {
      this.error.set("Tarayıcınız konum özelliğini desteklemiyor.");
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        // MVP: Gerçek projede (pos.coords.latitude) ile hesaplanır.
        // Biz şimdilik şehri Antalya olan veya listedeki ilk şubeyi seçiyoruz.
        const nearest = this.locations().find(l => l.city.toLowerCase() === 'antalya') || this.locations()[0];
        
        if (nearest) {
          this.selectPickupLocation(nearest);
          // İsteğe bağlı olarak kullanıcıya bilgi verilebilir
        }
      },
      (err) => {
        this.error.set("Konum erişim izni reddedildi veya alınamadı.");
      }
    );
  }

  // ── EKRAN DIŞINA TIKLAMA KONTROLÜ ──
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.openPicker.set(null);
      this.isPickupDropdownOpen.set(false); // Arama dropdown'ını kapat
    }
  }

  // ── TARİH METOTLARI ──
  togglePicker(name: string, event: Event): void {
    event.stopPropagation();
    this.isPickupDropdownOpen.set(false); // Tarih açılırken konum dropdown'ını kapat
    this.openPicker.update(curr => curr === name ? null : name);
  }

  onPickupDateChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    if (!value) return;
    this.pickupDate.set(new Date(value));

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

  selectTime(target: 'pickup' | 'return', time: string): void {
    if (target === 'pickup') {
      this.pickupTime.set(time);
    } else {
      this.returnTime.set(time);
    }
    this.openPicker.set(null);
  }

  // ── ARAMA TETİKLEME ──
  search(): void {
    if (!this.canSearch()) {
      this.error.set('Lütfen geçerli bir konum ve tarih seçin.');
      return;
    }

    const pickupLoc = this.locations().find(l => l.id === this.pickupLocationId());

    this.bookingState.setSelection({
      pickupLocationId: this.pickupLocationId(),
      pickupLocationName: pickupLoc?.name ?? null,
      returnLocationId: this.pickupLocationId(), // MVP için aynı yer
      returnLocationName: pickupLoc?.name ?? null,
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

  // ── YARDIMCI METOTLAR ──
  formatShortDate(d: Date): string {
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