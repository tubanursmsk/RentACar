import { Component, OnInit, computed, ElementRef, inject, signal, effect } from '@angular/core';
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

        <!-- ═══ Kampanya Bar ═══ -->
        <div class="bg-ink-900 text-white text-center py-3 rounded-t-card">
          <p class="text-sm font-medium">
            🎉 Yeni müşterilere özel! İlk kiralamanızda %20 indirim — Kod: <span class="font-bold">HOSGELDIN</span>
          </p>
        </div>

        <!-- ═══ Hero Card ═══ -->
        <div class="relative rounded-b-card">
          <!-- Arkaplan görseli -->
          <div class="absolute inset-0 rounded-b-card overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-br from-brand-800 via-brand-700 to-brand-900">
              <img src="assets/cars/hero-1.png" alt="Kiralanabilir araç"
                   class="w-full h-full object-cover opacity-40"
                   onerror="this.style.display='none'">
              <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-black/40"></div>
            </div>
          </div>

          <!-- İçerik -->
          <div class="relative z-10 px-6 lg:px-16 py-12 lg:py-20 text-center">
            <h1 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight">
              Araç kiralama yeniden tanımlandı
            </h1>
            <p class="mt-3 text-base lg:text-lg text-white/90 max-w-2xl mx-auto">
              Tam istediğiniz aracı, tam ihtiyacınız olan yerde, günlerce, haftalarca veya aylarca kiralayın.
            </p>

            <!-- Arama Kutusu -->
            <div class="mt-6 max-w-5xl mx-auto relative" style="overflow: visible;">

              <!-- Ana arama çubuğu -->
              <div class="bg-white rounded-full shadow-card-hover flex items-center p-1.5 relative"
                   style="z-index: 20;">

                <!-- 1. KONUM -->
                <div class="relative flex-1 min-w-0">
                  <button type="button"
                          (click)="toggleLocationDropdown($event)"
                          class="w-full px-5 py-3 rounded-full text-left hover:bg-ink-50 transition">
                    <div class="text-[10px] font-bold text-ink-700 uppercase tracking-wide">Nerede</div>
                    <div class="mt-0.5 text-sm truncate"
                         [class.text-ink-400]="!selectedLocationLabel()"
                         [class.text-ink-900]="selectedLocationLabel()">
                      {{ selectedLocationLabel() || 'Havalimanı, otel, adres, şehir' }}
                    </div>
                  </button>
                </div>

                <div class="w-px h-10 bg-ink-200"></div>

                <!-- 2. ALIŞ TARİHİ (min=bugün) -->
                <div class="hidden md:block flex-1 min-w-0 px-5 py-2">
                  <div class="text-[10px] font-bold text-ink-700 uppercase tracking-wide">İtibaren</div>
                  <input type="date"
                         [(ngModel)]="pickupDate"
                         [min]="todayString"
                         [max]="maxPickupDate"
                         (change)="onPickupDateChange()"
                         class="mt-0.5 w-full text-sm text-ink-900 bg-transparent outline-none cursor-pointer
                                border-none p-0 font-sans"
                         style="color-scheme: light;">
                </div>

                <!-- 3. ALIŞ SAATİ -->
                <div class="hidden md:block flex-1 min-w-0 px-5 py-2 border-l border-ink-200">
                  <div class="text-[10px] font-bold text-ink-700 uppercase tracking-wide">Saat</div>
                  <select [(ngModel)]="pickupTime"
                          (change)="onPickupTimeChange()"
                          class="mt-0.5 w-full text-sm text-ink-900 bg-transparent outline-none cursor-pointer
                                 border-none p-0 font-sans appearance-none">
                    @for (t of pickupTimeOptions(); track t.value) {
                      <option [value]="t.value" [disabled]="t.disabled">
                        {{ t.value }}{{ t.disabled ? ' (geçti)' : '' }}
                      </option>
                    }
                  </select>
                </div>

                <div class="hidden md:block w-px h-10 bg-ink-200"></div>

                <!-- 4. İADE TARİHİ -->
                <div class="hidden md:block flex-1 min-w-0 px-5 py-2">
                  <div class="text-[10px] font-bold text-ink-700 uppercase tracking-wide">Değin</div>
                  <input type="date"
                         [(ngModel)]="returnDate"
                         [min]="minReturnDate()"
                         [max]="maxReturnDate"
                         (change)="onReturnDateChange()"
                         class="mt-0.5 w-full text-sm text-ink-900 bg-transparent outline-none cursor-pointer
                                border-none p-0 font-sans"
                         style="color-scheme: light;">
                </div>

                <!-- 5. İADE SAATİ -->
                <div class="hidden md:block flex-1 min-w-0 px-5 py-2 border-l border-ink-200">
                  <div class="text-[10px] font-bold text-ink-700 uppercase tracking-wide">Saat</div>
                  <select [(ngModel)]="returnTime"
                          (change)="onReturnTimeChange()"
                          class="mt-0.5 w-full text-sm text-ink-900 bg-transparent outline-none cursor-pointer
                                 border-none p-0 font-sans appearance-none">
                    @for (t of returnTimeOptions(); track t.value) {
                      <option [value]="t.value" [disabled]="t.disabled">
                        {{ t.value }}{{ t.disabled ? ' (geçersiz)' : '' }}
                      </option>
                    }
                  </select>
                </div>

                <!-- Ara Butonu -->
                <button (click)="search()"
                        class="w-12 h-12 lg:w-14 lg:h-14 ml-2 bg-brand-600 hover:bg-brand-700
                               text-white rounded-full flex items-center justify-center transition
                               shadow-lg hover:shadow-xl flex-shrink-0">
                  <svg class="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                  </svg>
                </button>
              </div>

              <!-- ═══ KONUM DROPDOWN ═══ -->
              @if (isLocationOpen()) {
                <div class="fixed inset-0" style="z-index: 40;" (click)="closeLocationDropdown()"></div>
                <div class="absolute top-full left-0 mt-2 w-full sm:w-[480px] max-h-[420px]
                            bg-white rounded-2xl shadow-2xl border border-ink-100
                            overflow-y-auto animate-fade-in"
                     style="z-index: 50;">

                  <button type="button" (click)="useCurrentLocation()"
                          class="w-full px-5 py-3.5 flex items-center gap-4 hover:bg-ink-50 transition text-left">
                    <div class="w-6 h-6 flex items-center justify-center text-brand-600 flex-shrink-0">
                      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0013 3.06V1h-2v2.06A8.994 8.994 0 003.06 11H1v2h2.06A8.994 8.994 0 0011 20.94V23h2v-2.06A8.994 8.994 0 0020.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
                      </svg>
                    </div>
                    <div class="text-left flex-1 min-w-0">
                      <div class="font-semibold text-sm text-brand-600">Mevcut konumum</div>
                    </div>
                  </button>

                  <button type="button" (click)="selectAnywhere()"
                          class="w-full px-5 py-3.5 flex items-center gap-4 hover:bg-ink-50 transition text-left">
                    <div class="w-6 h-6 flex items-center justify-center text-ink-700 flex-shrink-0">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                    </div>
                    <div class="text-left flex-1 min-w-0">
                      <div class="font-semibold text-sm text-ink-900">Herhangi bir yer</div>
                      <div class="text-xs text-ink-500">Tüm araçları gör</div>
                    </div>
                  </button>

                  @if (airportLocations().length > 0) {
                    <div class="border-t border-ink-100 my-1"></div>
                    <div class="px-5 py-2 text-[10px] font-bold text-ink-500 uppercase tracking-wide">Havalimanları</div>
                    @for (loc of airportLocations(); track loc.id) {
                      <button type="button" (click)="selectLocation(loc)"
                              class="w-full px-5 py-2.5 flex items-center gap-4 hover:bg-ink-50 transition text-left">
                        <div class="w-6 h-6 flex items-center justify-center text-ink-700 flex-shrink-0">
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                          </svg>
                        </div>
                        <div class="text-left flex-1 min-w-0">
                          <div class="font-semibold text-sm text-ink-900 truncate">{{ loc.name }}</div>
                          <div class="text-xs text-ink-500">{{ loc.city }}</div>
                        </div>
                      </button>
                    }
                  }

                  @if (cityGroups().length > 0) {
                    <div class="border-t border-ink-100 my-1"></div>
                    <div class="px-5 py-2 text-[10px] font-bold text-ink-500 uppercase tracking-wide">Şehirler</div>
                    @for (city of cityGroups(); track city.name) {
                      <button type="button" (click)="selectLocation(city.location)"
                              class="w-full px-5 py-2.5 flex items-center gap-4 hover:bg-ink-50 transition text-left">
                        <div class="w-6 h-6 flex items-center justify-center text-ink-700 flex-shrink-0">
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                          </svg>
                        </div>
                        <div class="text-left flex-1 min-w-0">
                          <div class="font-semibold text-sm text-ink-900 truncate">{{ city.name }}</div>
                        </div>
                      </button>
                    }
                  }

                  @if (locations().length === 0) {
                    <div class="px-5 py-8 text-center">
                      <div class="text-sm text-ink-500">Konumlar yükleniyor...</div>
                    </div>
                  }
                </div>
              }

              <!-- Mobil tarih satırı -->
              <div class="md:hidden mt-3 grid grid-cols-2 gap-2">
                <div class="bg-white rounded-lg p-3 shadow-card">
                  <div class="text-[10px] font-bold text-ink-700 uppercase">Alış</div>
                  <input type="date" [(ngModel)]="pickupDate" [min]="todayString" [max]="maxPickupDate"
                         (change)="onPickupDateChange()"
                         class="mt-1 w-full outline-none text-sm bg-transparent">
                </div>
                <div class="bg-white rounded-lg p-3 shadow-card">
                  <div class="text-[10px] font-bold text-ink-700 uppercase">İade</div>
                  <input type="date" [(ngModel)]="returnDate" [min]="minReturnDate()" [max]="maxReturnDate"
                         (change)="onReturnDateChange()"
                         class="mt-1 w-full outline-none text-sm bg-transparent">
                </div>
              </div>

              @if (error()) {
                <div class="mt-4 flex justify-center">
                  <p class="text-sm text-white bg-accent-danger/90 rounded-lg py-2 px-4 font-medium shadow-lg">
                    ⚠️ {{ error() }}
                  </p>
                </div>
              }

              <!-- Kural bildirimleri -->
              <div class="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs text-white/80">
                <span class="flex items-center gap-1">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  {{ MIN_ADVANCE_MINUTES }} dakikalık hazırlık süresi
                </span>
                <span>•</span>
                <span>Minimum 1 gün kiralama</span>
                <span>•</span>
                <span>Maks. {{ MAX_ADVANCE_DAYS }} gün ileri</span>
              </div>
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

  // ═══════════════════════════════════════════════════
  // İŞ KURALLARI (Business Rules)
  // ═══════════════════════════════════════════════════
  protected readonly MIN_ADVANCE_MINUTES = 30;      // Minimum 30 dakika hazırlık süresi
  protected readonly MIN_RENTAL_DAYS = 1;           // Minimum 1 gün kiralama
  protected readonly MAX_ADVANCE_DAYS = 365;        // Maksimum 1 yıl ileri
  protected readonly TIME_SLOT_MINUTES = 30;        // 30 dakikalık slotlar

  protected locations = this.locationService.locations;

  protected pickupLocationId = signal<number | null>(null);
  protected selectedLocation = signal<Location | null>(null);
  protected pickupDate = signal<string>('');
  protected returnDate = signal<string>('');
  protected pickupTime = signal('');
  protected returnTime = signal('');
  protected error = signal<string | null>(null);
  protected isLocationOpen = signal(false);

  // Şu anki zamanı takip eden signal (her dakika güncellenir)
  private currentTime = signal(new Date());

  // Türkçe formatlanmış "bugün" tarihi (YYYY-MM-DD)
  protected todayString = this.formatDateForInput(new Date());

  // Maksimum tarihler
  protected readonly maxPickupDate = this.getMaxDateString();
  protected readonly maxReturnDate = this.getMaxDateString();

  protected airportLocations = computed(() =>
    this.locations().filter(l =>
      l.name.toLowerCase().includes('havaliman') ||
      l.name.toLowerCase().includes('airport')
    )
  );

  protected cityGroups = computed(() => {
    const cities = new Map<string, Location>();
    this.locations().forEach(l => {
      const isAirport = l.name.toLowerCase().includes('havaliman') || l.name.toLowerCase().includes('airport');
      if (!isAirport && !cities.has(l.city)) {
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

  // İade tarihi minimum → alış tarihi + 1 gün
  protected minReturnDate = computed(() => {
    const pd = this.pickupDate();
    if (!pd) return this.todayString;
    const d = new Date(pd);
    d.setDate(d.getDate() + this.MIN_RENTAL_DAYS);
    return this.formatDateForInput(d);
  });

  // ═══════════════════════════════════════════════════
  // SAAT SEÇENEKLERİ (dinamik — geçmiş saatler devre dışı)
  // ═══════════════════════════════════════════════════
  protected pickupTimeOptions = computed(() => {
    const pd = this.pickupDate();
    if (!pd) return this.generateAllTimeSlots();

    const now = this.currentTime();
    const selectedDate = new Date(pd);
    const isToday = this.isSameDay(selectedDate, now);

    if (!isToday) {
      // Bugün değilse tüm saatler açık
      return this.generateAllTimeSlots();
    }

    // Bugün ise → şu andan MIN_ADVANCE_MINUTES sonrasından itibaren
    const minTime = new Date(now.getTime() + this.MIN_ADVANCE_MINUTES * 60 * 1000);
    const minHour = minTime.getHours();
    const minMinute = minTime.getMinutes();

    return this.generateAllTimeSlots().map(slot => {
      const [h, m] = slot.value.split(':').map(Number);
      const disabled = (h < minHour) || (h === minHour && m < minMinute);
      return { ...slot, disabled };
    });
  });

  protected returnTimeOptions = computed(() => {
    const rd = this.returnDate();
    const pd = this.pickupDate();
    const pt = this.pickupTime();
    if (!rd) return this.generateAllTimeSlots();

    const returnDate = new Date(rd);
    const pickupDate = pd ? new Date(pd) : null;
    const isSameAsPickup = pickupDate && this.isSameDay(returnDate, pickupDate);

    return this.generateAllTimeSlots().map(slot => {
      const [h, m] = slot.value.split(':').map(Number);
      let disabled = false;

      // İade aynı gün ise → alış saatinden en az MIN_RENTAL_DAYS × 24 saat sonra olmalı
      // Ama MIN_RENTAL_DAYS = 1 gün olduğu için aslında farklı gün olmalı
      if (isSameAsPickup && pt) {
        const [ph, pm] = pt.split(':').map(Number);
        // Aynı gün seçilirse tüm saatler geçersiz (min 1 gün kural)
        disabled = true;
      }

      return { ...slot, disabled };
    });
  });

  constructor() {
    // Her dakikada bir "şu an" güncellensin — geçmiş saatler dinamik olarak devre dışı kalsın
    effect((onCleanup) => {
      const timer = setInterval(() => {
        this.currentTime.set(new Date());
        // Kullanıcı geçmişe kalan bir saat seçmişse otomatik düzelt
        this.validateAndCorrectPickupTime();
      }, 60_000); // her 1 dakika
      onCleanup(() => clearInterval(timer));
    });

    // Alış tarihi değişince alış saati de yeniden validate edilsin
    effect(() => {
      const _ = this.pickupDate();
      this.validateAndCorrectPickupTime();
    }, { allowSignalWrites: true });
  }

   ngOnInit(): void {
    if (this.locations().length === 0) {
      this.locationService.getAll().subscribe();
    }
 
    // İlk açılışta varsayılan saatleri hesapla
    this.setDefaultTimes();
 
    // ⭐ Sadece TAZE seçimi (son 30 dk) geri yükle
    // Eski seçimler taze değil → form boş kalır, kullanıcı yeni tercih yapar
    if (!this.bookingState.isFresh()) {
      // Eski seçim varsa temizle
      this.bookingState.clear();
      return;
    }
 
    const prev = this.bookingState.selection();
 
    if (prev.pickupLocationId) {
      this.pickupLocationId.set(prev.pickupLocationId);
      const loc = this.locations().find(l => l.id === prev.pickupLocationId);
      if (loc) this.selectedLocation.set(loc);
    }
 
    if (prev.pickupDate && this.isFutureDate(prev.pickupDate)) {
      this.pickupDate.set(this.formatDateForInput(prev.pickupDate));
      if (prev.pickupTime) this.pickupTime.set(prev.pickupTime);
    }
    if (prev.returnDate && this.isFutureDate(prev.returnDate)) {
      this.returnDate.set(this.formatDateForInput(prev.returnDate));
      if (prev.returnTime) this.returnTime.set(prev.returnTime);
    }
  }

  // ═══════════════════════════════════════════════════
  // VALIDATION HELPERS
  // ═══════════════════════════════════════════════════

  private setDefaultTimes(): void {
    if (!this.pickupTime()) {
      // Şu andan 30 dk sonra, en yakın 30 dk slotu
      const nextSlot = this.getNextAvailablePickupSlot();
      this.pickupTime.set(nextSlot);
    }
    if (!this.returnTime()) {
      this.returnTime.set('09:00');
    }
  }

  private getNextAvailablePickupSlot(): string {
    const now = new Date();
    // Şu an + 30 dakika (min hazırlık süresi)
    const minTime = new Date(now.getTime() + this.MIN_ADVANCE_MINUTES * 60 * 1000);
    let hour = minTime.getHours();
    let minute = minTime.getMinutes();

    // 30 dakikalık slota yuvarla (yukarı)
    // Örn: 11:08 + 30 dk = 11:38 → 12:00
    // Örn: 11:00 + 30 dk = 11:30 → 11:30
    if (minute > 0 && minute <= 30) {
      minute = 30;
    } else if (minute > 30) {
      minute = 0;
      hour++;
    }
    if (hour >= 24) {
      hour = 9; // Ertesi gün 09:00
    }

    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  }

  private validateAndCorrectPickupTime(): void {
    const pd = this.pickupDate();
    const pt = this.pickupTime();
    if (!pd || !pt) return;

    const now = this.currentTime();
    const selectedDate = new Date(pd);
    if (!this.isSameDay(selectedDate, now)) return;

    // Bugün seçili — alış saati şu andan MIN_ADVANCE_MINUTES sonrasında olmalı
    const [h, m] = pt.split(':').map(Number);
    const pickupDateTime = new Date(selectedDate);
    pickupDateTime.setHours(h, m, 0, 0);

    const minPickupDateTime = new Date(now.getTime() + this.MIN_ADVANCE_MINUTES * 60 * 1000);

    if (pickupDateTime < minPickupDateTime) {
      // Saati otomatik olarak en yakın uygun slota çek
      this.pickupTime.set(this.getNextAvailablePickupSlot());
    }
  }

  private isFutureDate(d: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const check = new Date(d);
    check.setHours(0, 0, 0, 0);
    return check >= today;
  }

  private isSameDay(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() &&
           a.getMonth() === b.getMonth() &&
           a.getDate() === b.getDate();
  }

  private formatDateForInput(d: Date): string {
    // Timezone kaçırma sorunu için manuel formatla
    const y = d.getFullYear();
    const m = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  private getMaxDateString(): string {
    const max = new Date();
    max.setDate(max.getDate() + this.MAX_ADVANCE_DAYS);
    return this.formatDateForInput(max);
  }

  private generateAllTimeSlots(): { value: string; disabled: boolean }[] {
    const slots: { value: string; disabled: boolean }[] = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += this.TIME_SLOT_MINUTES) {
        slots.push({
          value: `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`,
          disabled: false
        });
      }
    }
    return slots;
  }

  // ═══════════════════════════════════════════════════
  // EVENT HANDLERS
  // ═══════════════════════════════════════════════════

  onPickupDateChange(): void {
    this.error.set(null);
    // Eğer iade tarihi alış tarihinden önce veya aynı ise, otomatik +1 gün ayarla
    const pd = this.pickupDate();
    const rd = this.returnDate();
    if (pd && rd) {
      const pickupD = new Date(pd);
      const returnD = new Date(rd);
      if (returnD <= pickupD) {
        const newReturn = new Date(pickupD);
        newReturn.setDate(newReturn.getDate() + this.MIN_RENTAL_DAYS);
        this.returnDate.set(this.formatDateForInput(newReturn));
      }
    }
    this.validateAndCorrectPickupTime();
  }

  onPickupTimeChange(): void {
    this.error.set(null);
    this.validateAndCorrectPickupTime();
  }

  onReturnDateChange(): void {
    this.error.set(null);
  }

  onReturnTimeChange(): void {
    this.error.set(null);
  }

  // ═══════════════════════════════════════════════════
  // LOCATION DROPDOWN
  // ═══════════════════════════════════════════════════

  toggleLocationDropdown(event: MouseEvent): void {
    event.stopPropagation();
    this.isLocationOpen.update(v => !v);
  }

  closeLocationDropdown(): void {
    this.isLocationOpen.set(false);
  }

  selectLocation(loc: Location): void {
    this.selectedLocation.set(loc);
    this.pickupLocationId.set(loc.id);
    this.isLocationOpen.set(false);
    this.error.set(null);
  }

  selectAnywhere(): void {
    const first = this.locations()[0];
    if (first) {
      this.selectedLocation.set(first);
      this.pickupLocationId.set(first.id);
    }
    this.isLocationOpen.set(false);
    this.error.set(null);
  }

  useCurrentLocation(): void {
    this.selectAnywhere();
  }

  // ═══════════════════════════════════════════════════
  // ARAMA — TAM VALIDATION
  // ═══════════════════════════════════════════════════

  search(): void {
    // 1. Konum kontrolü
    if (!this.pickupLocationId()) {
      this.error.set('Lütfen bir konum seçin.');
      return;
    }

    // 2. Tarih dolu mu?
    if (!this.pickupDate() || !this.returnDate()) {
      this.error.set('Lütfen alış ve iade tarihlerini seçin.');
      return;
    }

    // 3. Saat dolu mu?
    if (!this.pickupTime() || !this.returnTime()) {
      this.error.set('Lütfen alış ve iade saatlerini seçin.');
      return;
    }

    // 4. Tam tarihleri oluştur
    const pickupDateTime = this.combineDateAndTime(this.pickupDate(), this.pickupTime());
    const returnDateTime = this.combineDateAndTime(this.returnDate(), this.returnTime());
    const now = new Date();

    // 5. Alış zamanı geçmişte mi?
    if (pickupDateTime <= now) {
      this.error.set('Alış tarihi ve saati geçmişte olamaz.');
      return;
    }

    // 6. Minimum ilerideki zaman kontrolü (30 dakika hazırlık süresi)
    const minPickup = new Date(now.getTime() + this.MIN_ADVANCE_MINUTES * 60 * 1000);
    if (pickupDateTime < minPickup) {
      this.error.set(`Alış zamanı şu andan en az ${this.MIN_ADVANCE_MINUTES} dakika sonra olmalı.`);
      return;
    }

    // 7. İade, alıştan sonra mı?
    if (returnDateTime <= pickupDateTime) {
      this.error.set('İade zamanı alış zamanından sonra olmalı.');
      return;
    }

    // 8. Minimum kiralama süresi
    const rentalMs = returnDateTime.getTime() - pickupDateTime.getTime();
    const rentalDays = rentalMs / (1000 * 60 * 60 * 24);
    if (rentalDays < this.MIN_RENTAL_DAYS) {
      this.error.set(`Minimum kiralama süresi ${this.MIN_RENTAL_DAYS} gün.`);
      return;
    }

    // 9. Maksimum ileri tarih kontrolü
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + this.MAX_ADVANCE_DAYS);
    if (pickupDateTime > maxDate) {
      this.error.set(`En fazla ${this.MAX_ADVANCE_DAYS} gün ileri rezervasyon yapılabilir.`);
      return;
    }

    // ✅ Tüm kontroller geçti
    const loc = this.selectedLocation();
    this.bookingState.setSelection({
      pickupLocationId: this.pickupLocationId(),
      pickupLocationName: loc?.name ?? null,
      returnLocationId: this.pickupLocationId(),
      returnLocationName: loc?.name ?? null,
      pickupDate: pickupDateTime,
      pickupTime: this.pickupTime(),
      returnDate: returnDateTime,
      returnTime: this.returnTime()
    });

    this.error.set(null);
    this.router.navigate(['/araclar'], {
      queryParams: { locationId: this.pickupLocationId() }
    });
  }

  private combineDateAndTime(dateStr: string, timeStr: string): Date {
    const d = new Date(dateStr);
    const [h, m] = timeStr.split(':').map(Number);
    d.setHours(h, m, 0, 0);
    return d;
  }
}