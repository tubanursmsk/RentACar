import { Component, OnInit, computed, ElementRef, HostListener, inject, signal, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LocationService } from '../../../../core/services/location.service';
import { BookingStateService } from '../../../../core/services/booking-state.service';
import { Location } from '../../../../core/models/brand-location.model';

@Component({
  selector: 'app-hero-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section id="hero-search" class="relative bg-white">
      <div class="max-w-[1600px] mx-auto px-6 lg:px-8 py-8 lg:py-12">

        <!-- ═══ Hero Bilgi Bar (Turo tarzı — üstte tek satır) ═══ -->
        <div class="bg-ink-900 text-white text-center py-3 rounded-t-card">
          <p class="text-sm font-medium">
            🎉 Yeni müşterilere özel! İlk kiralamanızda %20 indirim — Kod: <span class="font-bold">HOSGELDIN</span>
          </p>
        </div>

        <!-- ═══ Hero Kart (Turo tarzı — arkaplan araç fotoğrafı + üstte overlay) ═══ -->
        <div class="relative rounded-b-card overflow-hidden">
          <!-- Arkaplan görseli -->
          <div class="absolute inset-0 bg-gradient-to-br from-brand-800 via-brand-700 to-brand-900">
            <img src="assets/cars/hero-1.png"
                 alt="Kiralanabilir araç"
                 class="w-full h-full object-cover opacity-40"
                 onerror="this.style.display='none'">
            <!-- Karartma overlay -->
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-black/40"></div>
          </div>

          <!-- İçerik -->
          <div class="relative z-10 px-6 lg:px-16 py-12 lg:py-20 text-center">
            <h1 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight">
              Araç kiralama yeniden tanımlandı
            </h1>
            <p class="mt-3 text-base lg:text-lg text-white/90 max-w-2xl mx-auto">
              Tam istediğiniz aracı, tam ihtiyacınız olan yerde, günlerce, haftalarca veya aylarca kiralayın.
            </p>

            <!-- ═══ Arama Kutusu (Turo tarzı — beyaz card, tek satır) ═══ -->
            <div class="mt-6 max-w-5xl mx-auto">
              <div class="bg-white rounded-full shadow-card-hover flex items-center p-1.5">

                <!-- 1. Konum (autocomplete) -->
                <div class="relative flex-1 min-w-0" #locationContainer>
                  <button type="button"
                          (click)="toggleLocationDropdown()"
                          class="w-full px-5 py-3 rounded-full text-left hover:bg-ink-50 transition group">
                    <div class="text-[10px] font-bold text-ink-700 uppercase tracking-wide">Nerede</div>
                    <div class="mt-0.5 text-sm text-ink-900 truncate"
                         [class.text-ink-400]="!selectedLocationLabel()">
                      {{ selectedLocationLabel() || 'Havalimanı, otel, adres, şehir' }}
                    </div>
                  </button>

                  <!-- ─── Autocomplete Dropdown ─── -->
                  @if (isLocationOpen()) {
                    <div class="absolute left-0 top-full mt-2 w-full min-w-[380px] bg-white
                                rounded-card shadow-card-hover border border-ink-100
                                py-2 z-30 animate-fade-in max-h-96 overflow-y-auto">
                      <!-- Konumumu Kullan -->
                      <button type="button"
                              (click)="useCurrentLocation()"
                              class="w-full px-4 py-3 flex items-center gap-3 hover:bg-ink-50 transition">
                        <div class="w-10 h-10 flex items-center justify-center text-brand-600">
                          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0013 3.06V1h-2v2.06A8.994 8.994 0 003.06 11H1v2h2.06A8.994 8.994 0 0011 20.94V23h2v-2.06A8.994 8.994 0 0020.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
                          </svg>
                        </div>
                        <div class="text-left">
                          <div class="font-semibold text-sm text-brand-600">Mevcut konumum</div>
                        </div>
                      </button>

                      <!-- Herhangi Bir Yer -->
                      <button type="button"
                              (click)="selectAnywhere()"
                              class="w-full px-4 py-3 flex items-center gap-3 hover:bg-ink-50 transition">
                        <div class="w-10 h-10 flex items-center justify-center text-ink-700">
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                  d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                          </svg>
                        </div>
                        <div class="text-left">
                          <div class="font-semibold text-sm text-ink-900">Herhangi bir yer</div>
                          <div class="text-xs text-ink-500">Tüm araçları gör</div>
                        </div>
                      </button>

                      <div class="border-t border-ink-100 my-1"></div>

                      <!-- Popüler Lokasyonlar (havalimanları) -->
                      @for (loc of airportLocations(); track loc.id) {
                        <button type="button"
                                (click)="selectLocation(loc)"
                                class="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-ink-50 transition">
                          <div class="w-10 h-10 flex items-center justify-center text-ink-700">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                            </svg>
                          </div>
                          <div class="text-left flex-1 min-w-0">
                            <div class="font-semibold text-sm text-ink-900 truncate">{{ loc.name }}</div>
                            <div class="text-xs text-ink-500">{{ loc.city }}</div>
                          </div>
                        </button>
                      }

                      <!-- Şehirler -->
                      @for (city of cityGroups(); track city.name) {
                        <button type="button"
                                (click)="selectLocation(city.location)"
                                class="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-ink-50 transition">
                          <div class="w-10 h-10 flex items-center justify-center text-ink-700">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                            </svg>
                          </div>
                          <div class="text-left flex-1 min-w-0">
                            <div class="font-semibold text-sm text-ink-900 truncate">{{ city.name }}</div>
                          </div>
                        </button>
                      }
                    </div>
                  }
                </div>

                <!-- Ayırıcı -->
                <div class="w-px h-10 bg-ink-200"></div>

                <!-- 2. Alış Tarihi -->
                <div class="hidden md:block flex-1 min-w-0 relative">
                  <button type="button"
                          (click)="openDateInput('pickup')"
                          class="w-full px-5 py-3 rounded-full text-left hover:bg-ink-50 transition">
                    <div class="text-[10px] font-bold text-ink-700 uppercase tracking-wide">İtibaren</div>
                    <div class="mt-0.5 text-sm text-ink-900 truncate"
                         [class.text-ink-400]="!pickupDate()">
                      {{ pickupDate() ? formatShortDate(pickupDate()!) : 'Tarih seçin' }}
                    </div>
                  </button>
                  <input #pickupDateInput
                         type="date"
                         [(ngModel)]="pickupDate"
                         [min]="todayString"
                         class="absolute inset-0 opacity-0 cursor-pointer">
                </div>

                <!-- 3. Alış Saati -->
                <div class="hidden md:block flex-1 min-w-0 relative border-l border-ink-200">
                  <button type="button"
                          class="w-full px-5 py-3 rounded-full text-left hover:bg-ink-50 transition">
                    <div class="text-[10px] font-bold text-ink-700 uppercase tracking-wide">Saat</div>
                    <div class="mt-0.5 text-sm text-ink-900 truncate">
                      {{ pickupTime() }}
                    </div>
                  </button>
                  <select [(ngModel)]="pickupTime"
                          class="absolute inset-0 opacity-0 cursor-pointer">
                    @for (t of timeOptions; track t) {
                      <option [value]="t">{{ t }}</option>
                    }
                  </select>
                </div>

                <!-- Ayırıcı -->
                <div class="hidden md:block w-px h-10 bg-ink-200"></div>

                <!-- 4. İade Tarihi -->
                <div class="hidden md:block flex-1 min-w-0 relative">
                  <button type="button"
                          (click)="openDateInput('return')"
                          class="w-full px-5 py-3 rounded-full text-left hover:bg-ink-50 transition">
                    <div class="text-[10px] font-bold text-ink-700 uppercase tracking-wide">Değin</div>
                    <div class="mt-0.5 text-sm text-ink-900 truncate"
                         [class.text-ink-400]="!returnDate()">
                      {{ returnDate() ? formatShortDate(returnDate()!) : 'Tarih seçin' }}
                    </div>
                  </button>
                  <input #returnDateInput
                         type="date"
                         [(ngModel)]="returnDate"
                         [min]="minReturnDate()"
                         class="absolute inset-0 opacity-0 cursor-pointer">
                </div>

                <!-- 5. İade Saati -->
                <div class="hidden md:block flex-1 min-w-0 relative border-l border-ink-200">
                  <button type="button"
                          class="w-full px-5 py-3 rounded-full text-left hover:bg-ink-50 transition">
                    <div class="text-[10px] font-bold text-ink-700 uppercase tracking-wide">Saat</div>
                    <div class="mt-0.5 text-sm text-ink-900 truncate">
                      {{ returnTime() }}
                    </div>
                  </button>
                  <select [(ngModel)]="returnTime"
                          class="absolute inset-0 opacity-0 cursor-pointer">
                    @for (t of timeOptions; track t) {
                      <option [value]="t">{{ t }}</option>
                    }
                  </select>
                </div>

                <!-- Ara Butonu (Turo mor daire — bizde brand-600 mavi) -->
                <button (click)="search()"
                        [disabled]="!canSearch()"
                        class="w-12 h-12 lg:w-14 lg:h-14 ml-2 bg-brand-600 hover:bg-brand-700
                               disabled:opacity-50 disabled:cursor-not-allowed
                               text-white rounded-full flex items-center justify-center transition
                               shadow-lg hover:shadow-xl flex-shrink-0">
                  <svg class="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                  </svg>
                </button>
              </div>

              <!-- Mobil için tarih satırı -->
              <div class="md:hidden mt-3 grid grid-cols-2 gap-2">
                <div class="bg-white rounded-lg p-3 shadow-card">
                  <div class="text-[10px] font-bold text-ink-700 uppercase">Alış</div>
                  <input type="date"
                         [(ngModel)]="pickupDate"
                         [min]="todayString"
                         class="mt-1 w-full outline-none text-sm">
                </div>
                <div class="bg-white rounded-lg p-3 shadow-card">
                  <div class="text-[10px] font-bold text-ink-700 uppercase">İade</div>
                  <input type="date"
                         [(ngModel)]="returnDate"
                         [min]="minReturnDate()"
                         class="mt-1 w-full outline-none text-sm">
                </div>
              </div>

              @if (error()) {
                <p class="mt-3 text-sm text-white bg-accent-danger/90 rounded-lg py-2 px-4 inline-block font-medium">
                  {{ error() }}
                </p>
              }
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
  private el = inject(ElementRef);

  protected locations = this.locationService.locations;

  protected pickupLocationId = signal<number | null>(null);
  protected selectedLocation = signal<Location | null>(null);
  protected pickupDate = signal<string>('');
  protected returnDate = signal<string>('');
  protected pickupTime = signal('09:00');
  protected returnTime = signal('09:00');
  protected error = signal<string | null>(null);
  protected isLocationOpen = signal(false);

  protected timeOptions = this.generateTimeOptions();
  protected todayString = new Date().toISOString().split('T')[0];

  // Havalimanı olan lokasyonlar
  protected airportLocations = computed(() =>
    this.locations().filter(l =>
      l.name.toLowerCase().includes('havaliman') ||
      l.name.toLowerCase().includes('airport')
    )
  );

  // Şehirler (uniq)
  protected cityGroups = computed(() => {
    const cities = new Map<string, Location>();
    this.locations().forEach(l => {
      if (!cities.has(l.city)) {
        cities.set(l.city, l);
      }
    });
    return Array.from(cities.entries()).map(([name, location]) => ({ name, location }));
  });

  protected selectedLocationLabel = computed(() => {
    const l = this.selectedLocation();
    if (!l) return null;
    return `${l.name} — ${l.city}`;
  });

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
    if (prev.pickupLocationId) {
      this.pickupLocationId.set(prev.pickupLocationId);
      // Seçili lokasyonu bul
      const loc = this.locations().find(l => l.id === prev.pickupLocationId);
      if (loc) this.selectedLocation.set(loc);
    }
    if (prev.pickupDate) this.pickupDate.set(this.formatDate(prev.pickupDate));
    if (prev.returnDate) this.returnDate.set(this.formatDate(prev.returnDate));
    if (prev.pickupTime) this.pickupTime.set(prev.pickupTime);
    if (prev.returnTime) this.returnTime.set(prev.returnTime);
  }

  toggleLocationDropdown(): void {
    this.isLocationOpen.update(v => !v);
  }

  selectLocation(loc: Location): void {
    this.selectedLocation.set(loc);
    this.pickupLocationId.set(loc.id);
    this.isLocationOpen.set(false);
  }

  selectAnywhere(): void {
    // Herhangi bir yer = tüm araçları listele → ilk lokasyonu seç
    const first = this.locations()[0];
    if (first) {
      this.selectedLocation.set(first);
      this.pickupLocationId.set(first.id);
    }
    this.isLocationOpen.set(false);
  }

  useCurrentLocation(): void {
    if (!navigator.geolocation) {
      this.selectAnywhere();
      return;
    }
    navigator.geolocation.getCurrentPosition(
      () => {
        // İleride en yakın şubeyi bulacağız — şimdilik ilk şubeyi seç
        this.selectAnywhere();
      },
      () => this.selectAnywhere()
    );
  }

  openDateInput(target: 'pickup' | 'return'): void {
    // Native date picker'ı programatik açmak için (mobile)
    setTimeout(() => {
      const input = this.el.nativeElement.querySelector(
        target === 'pickup' ? 'input[type="date"]:first-of-type' : 'input[type="date"]:last-of-type'
      );
      input?.showPicker?.();
    });
  }

  search(): void {
    if (!this.canSearch()) {
      this.error.set('Lütfen konum ve tarih seçin.');
      return;
    }

    const loc = this.selectedLocation();
    this.bookingState.setSelection({
      pickupLocationId: this.pickupLocationId(),
      pickupLocationName: loc?.name ?? null,
      returnLocationId: this.pickupLocationId(),
      returnLocationName: loc?.name ?? null,
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

  formatShortDate(dateStr: string): string {
    const d = new Date(dateStr);
    const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
    return `${d.getDate()} ${months[d.getMonth()]}`;
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

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!this.el.nativeElement.contains(target)) {
      this.isLocationOpen.set(false);
    }
  }
}