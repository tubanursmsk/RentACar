import { Component, OnInit, computed, HostListener, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CarService } from '../../../core/services/car.service';
import { LocationService } from '../../../core/services/location.service';
import { Car } from '../../../core/models/car.model';
import { BookingStateService } from '../../../core/services/booking-state.service';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-car-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="bg-ink-100/30 min-h-screen py-8">
      <div class="max-w-[1400px] mx-auto px-4 sm:px-6">

        <!-- Breadcrumb -->
        <nav class="text-sm text-ink-500 mb-4">
          <a routerLink="/" class="hover:text-brand-600">Ana Sayfa</a>
          <span class="mx-2">/</span>
          <a routerLink="/araclar" class="hover:text-brand-600">Araçlar</a>
          <span class="mx-2">/</span>
          <span class="text-ink-700 font-semibold">{{ car()?.brandName }} {{ car()?.model }}</span>
        </nav>

        @if (loading()) {
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-pulse">
            <div class="aspect-video bg-ink-100 rounded-2xl"></div>
            <div>
              <div class="h-8 bg-ink-100 rounded w-3/4"></div>
              <div class="h-6 bg-ink-100 rounded mt-3 w-1/2"></div>
              <div class="h-32 bg-ink-100 rounded mt-6"></div>
            </div>
          </div>
        } @else if (car(); as c) {
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">

            <!-- SOL: Fotoğraf galerisi -->
            <div>
              <div class="bg-white rounded-2xl shadow-card overflow-hidden aspect-video flex items-center justify-center">
                @if (selectedImage(); as img) {
                  <img [src]="apiBaseUrl + img" [alt]="c.model" class="w-full h-full object-cover">
                } @else {
                  <span class="text-9xl">🚗</span>
                }
              </div>

              @if (galleryImages().length > 1) {
                <div class="mt-4 grid grid-cols-4 gap-3">
                  @for (img of galleryImages(); track img; let i = $index) {
                    <button (click)="selectImage(img)"
                            class="aspect-video bg-white rounded-lg overflow-hidden border-2 transition"
                            [class.border-brand-600]="img === selectedImage()"
                            [class.border-transparent]="img !== selectedImage()">
                      <img [src]="apiBaseUrl + img" [alt]="'Foto ' + (i+1)" class="w-full h-full object-cover">
                    </button>
                  }
                </div>
              }
            </div>

            <!-- SAĞ: Bilgi & Rezervasyon -->
            <div>
              <div class="bg-white rounded-2xl shadow-card p-6 lg:p-8">
                <div class="flex items-start justify-between">
                  <div>
                    <h1 class="text-2xl md:text-3xl font-extrabold text-ink-900">
                      {{ c.brandName }} {{ c.model }}
                    </h1>
                    <p class="text-ink-500 mt-1">{{ c.modelYear }} • {{ c.color }} • {{ c.plate }}</p>
                  </div>
                  <span class="inline-flex items-center px-3 py-1 bg-brand-50 text-brand-600 text-xs font-bold rounded-full">
                    {{ getStatusLabel(c.status) }}
                  </span>
                </div>

                <!-- Özellikler -->
                <div class="mt-6 grid grid-cols-2 gap-4">
                  <div class="flex items-center gap-3 p-3 bg-ink-100/50 rounded-lg">
                    <div class="w-10 h-10 bg-white rounded-full flex items-center justify-center text-xl">⛽</div>
                    <div>
                      <div class="text-xs text-ink-500">Yakıt</div>
                      <div class="font-bold text-sm">{{ getFuelLabel(c.fuelType) }}</div>
                    </div>
                  </div>
                  <div class="flex items-center gap-3 p-3 bg-ink-100/50 rounded-lg">
                    <div class="w-10 h-10 bg-white rounded-full flex items-center justify-center text-xl">⚙️</div>
                    <div>
                      <div class="text-xs text-ink-500">Vites</div>
                      <div class="font-bold text-sm">{{ getTransLabel(c.transmissionType) }}</div>
                    </div>
                  </div>
                  <div class="flex items-center gap-3 p-3 bg-ink-100/50 rounded-lg">
                    <div class="w-10 h-10 bg-white rounded-full flex items-center justify-center text-xl">👥</div>
                    <div>
                      <div class="text-xs text-ink-500">Kapasite</div>
                      <div class="font-bold text-sm">{{ c.seatCount }} kişi</div>
                    </div>
                  </div>
                  <div class="flex items-center gap-3 p-3 bg-ink-100/50 rounded-lg">
                    <div class="w-10 h-10 bg-white rounded-full flex items-center justify-center text-xl">🚪</div>
                    <div>
                      <div class="text-xs text-ink-500">Kapı</div>
                      <div class="font-bold text-sm">{{ c.doorCount }} kapı</div>
                    </div>
                  </div>
                </div>

                @if (c.description) {
                  <div class="mt-6">
                    <h3 class="font-bold text-ink-900 mb-2">Açıklama</h3>
                    <p class="text-sm text-ink-700 leading-relaxed">{{ c.description }}</p>
                  </div>
                }

                @if (c.locationName) {
                  <div class="mt-6 p-4 bg-brand-50 rounded-lg flex items-start gap-3">
                    <svg class="w-5 h-5 text-brand-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                    <div>
                      <div class="text-xs text-brand-600 font-bold uppercase">Şube</div>
                      <div class="text-sm text-ink-900 font-semibold">{{ c.locationName }}</div>
                    </div>
                  </div>
                }
              </div>

              <!-- Rezervasyon kartı -->
              <div class="mt-4 bg-white rounded-2xl shadow-card p-6 lg:p-8 sticky top-32">
                <div class="flex items-end justify-between mb-4">
                  <div>
                    <div class="text-xs text-ink-500">Günlük fiyat</div>
                    <div class="text-3xl font-extrabold text-brand-600">
                      ₺{{ c.dailyPrice | number:'1.0-0' }}
                    </div>
                  </div>
                  @if (rentalDays() > 0) {
                    <div class="text-right">
                      <div class="text-xs text-ink-500">{{ rentalDays() }} gün toplam</div>
                      <div class="text-xl font-bold text-ink-900">
                        ₺{{ totalPrice() | number:'1.0-0' }}
                      </div>
                    </div>
                  }
                </div>

                @if (booking.hasSelection() && pickupDateFormatted() && returnDateFormatted()) {
                  <div class="text-sm bg-ink-100/50 rounded-lg p-3 mb-4 space-y-1">
                    <div class="flex justify-between">
                      <span class="text-ink-500">Alış:</span>
                      <span class="font-semibold">{{ pickupDateFormatted() }} • {{ booking.selection().pickupTime }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-ink-500">İade:</span>
                      <span class="font-semibold">{{ returnDateFormatted() }} • {{ booking.selection().returnTime }}</span>
                    </div>
                    @if (booking.selection().pickupLocationName) {
                      <div class="flex justify-between">
                        <span class="text-ink-500">Şube:</span>
                        <span class="font-semibold truncate ml-2">{{ booking.selection().pickupLocationName }}</span>
                      </div>
                    }
                    <div class="pt-2 mt-2 border-t border-ink-200">
                      <button (click)="openBookingModal()"
                              class="text-xs font-semibold text-brand-600 hover:underline">
                        Tarihi Düzenle
                      </button>
                    </div>
                  </div>
                } @else {
                  <p class="text-sm text-ink-500 mb-4">
                    Devam etmek için alış ve iade tarihlerini seçin.
                  </p>
                }

                <button (click)="onReserveClick()"
                        [disabled]="c.status !== 1"
                        class="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed">
                  @if (c.status !== 1) {
                    BU ARAÇ ŞU AN MÜSAİT DEĞİL
                  } @else if (!hasValidBooking()) {
                    KİRALAMA İÇİN TIKLAYIN
                  } @else {
                    REZERVASYON YAP ›
                  }
                </button>

                @if (!auth.isAuthenticated() && hasValidBooking()) {
                  <p class="text-xs text-center text-ink-500 mt-3">
                    Rezervasyon için giriş yapmanız gerekir.
                  </p>
                }
              </div>
            </div>
          </div>
        } @else {
          <div class="text-center py-20">
            <div class="text-6xl mb-4">😕</div>
            <h3 class="text-xl font-bold">Araç bulunamadı</h3>
            <a routerLink="/araclar" class="btn-primary mt-4 inline-flex">Araç listesine dön</a>
          </div>
        }
      </div>
    </div>

    <!-- ═══ KİRALAMA MODALI (Avis tarzı) ═══ -->
    @if (isModalOpen() && car(); as c) {
      <!-- Backdrop -->
      <div class="fixed inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
           style="z-index: 100;"
           (click)="closeBookingModal()"></div>

      <!-- Modal -->
      <div class="fixed inset-0 flex items-center justify-center p-4 pointer-events-none"
           style="z-index: 101;">
        <div class="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto pointer-events-auto animate-fade-in"
             (click)="$event.stopPropagation()">

          <!-- Modal Header -->
          <div class="sticky top-0 bg-white z-10 flex items-center justify-between px-6 py-4 border-b border-ink-100">
            <h3 class="text-lg font-bold text-ink-900">Kiralama Yapmak İçin Seçim Yapınız</h3>
            <button (click)="closeBookingModal()"
                    class="w-9 h-9 rounded-full hover:bg-ink-100 flex items-center justify-center transition">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- Araç Özet Kartı -->
          <div class="px-6 py-4 bg-brand-50/50 border-b border-brand-100 flex items-center gap-4">
            <div class="w-20 h-14 bg-white rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0">
              @if (c.imageUrl) {
                <img [src]="apiBaseUrl + c.imageUrl" [alt]="c.model" class="w-full h-full object-cover">
              } @else {
                <span class="text-2xl">🚗</span>
              }
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-xs font-bold text-brand-600 uppercase tracking-wide">Seçili Araç</div>
              <div class="font-bold text-ink-900 truncate">{{ c.brandName }} {{ c.model }}</div>
              <div class="text-xs text-ink-500">ya da benzeri</div>
            </div>
          </div>

          <!-- Form -->
          <div class="p-6 space-y-4">

            <!-- Alış Ofisi -->
            <div>
              <div class="flex items-center justify-between mb-2">
                <label class="text-xs font-bold text-ink-700 uppercase tracking-wide">Alış Ofisi Seçiniz</label>
                <button class="text-xs font-bold text-brand-600 hover:underline">OFİS DETAYI</button>
              </div>
              <div class="relative">
                <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-600"
                     fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                </svg>
                <select [(ngModel)]="modalPickupLocationId"
                        class="input-field pl-10 pr-4 text-sm cursor-pointer">
                  <option [ngValue]="null">Konum seçin</option>
                  @for (loc of locations(); track loc.id) {
                    <option [ngValue]="loc.id">{{ loc.name }} — {{ loc.city }}</option>
                  }
                </select>
              </div>
            </div>

            <!-- Farklı iade konumu -->
            <div class="flex items-center gap-2">
              <input type="checkbox"
                     id="differentDropoff"
                     [(ngModel)]="modalDifferentDropoff"
                     class="w-4 h-4 accent-brand-600 cursor-pointer">
              <label for="differentDropoff" class="text-sm text-ink-700 cursor-pointer">
                Farklı bir noktaya teslim etmek istiyorum.
              </label>
            </div>

            <!-- Alış / İade Tarihleri -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="text-xs font-bold text-ink-700 uppercase tracking-wide mb-2 block">Alış Tarihi</label>
                <div class="grid grid-cols-[1fr_auto] gap-2">
                  <input type="date"
                         [(ngModel)]="modalPickupDate"
                         [min]="todayString"
                         (change)="onPickupDateChange()"
                         class="input-field text-sm cursor-pointer"
                         style="color-scheme: light;">
                  <select [(ngModel)]="modalPickupTime"
                          class="input-field text-sm cursor-pointer w-20 px-2 appearance-none">
                    @for (t of pickupTimeOptions(); track t.value) {
                      <option [value]="t.value" [disabled]="t.disabled">
                        {{ t.value }}
                      </option>
                    }
                  </select>
                </div>
              </div>

              <div>
                <label class="text-xs font-bold text-ink-700 uppercase tracking-wide mb-2 block">İade Tarihi</label>
                <div class="grid grid-cols-[1fr_auto] gap-2">
                  <input type="date"
                         [(ngModel)]="modalReturnDate"
                         [min]="minReturnDate()"
                         class="input-field text-sm cursor-pointer"
                         style="color-scheme: light;">
                  <select [(ngModel)]="modalReturnTime"
                          class="input-field text-sm cursor-pointer w-20 px-2 appearance-none">
                    @for (t of timeOptions; track t) {
                      <option [value]="t">{{ t }}</option>
                    }
                  </select>
                </div>
              </div>
            </div>

            <!-- Kural bildirimi -->
            <div class="text-xs text-ink-500 bg-ink-50 rounded-lg p-3 flex items-start gap-2">
              <svg class="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span>{{ MIN_ADVANCE_MINUTES }} dakikalık hazırlık süresi • Minimum 1 gün kiralama</span>
            </div>

            @if (modalError()) {
              <div class="text-sm text-white bg-accent-danger rounded-lg py-2 px-3 font-medium">
                ⚠️ {{ modalError() }}
              </div>
            }

            <!-- Toplam ve CTA -->
            @if (modalRentalDays() > 0) {
              <div class="bg-brand-50 border border-brand-100 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <div class="text-xs text-ink-500">{{ modalRentalDays() }} gün toplam</div>
                  <div class="text-2xl font-extrabold text-brand-600">
                    ₺{{ modalTotalPrice() | number:'1.0-0' }}
                  </div>
                </div>
                <div class="text-xs text-ink-500">
                  Günlük ₺{{ c.dailyPrice | number:'1.0-0' }}
                </div>
              </div>
            }

            <!-- CTA -->
            <button (click)="confirmBooking()"
                    [disabled]="!canConfirm()"
                    class="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed">
              @if (modalRentalDays() > 0) {
                {{ modalRentalDays() }} GÜN KİRALA ›
              } @else {
                REZERVASYON YAP ›
              }
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class CarDetailComponent implements OnInit {
  private carService = inject(CarService);
  private locationService = inject(LocationService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  protected booking = inject(BookingStateService);
  protected auth = inject(AuthService);

  protected apiBaseUrl = environment.apiBaseUrl;
  protected car = signal<Car | null>(null);
  protected loading = signal(true);
  protected selectedImage = signal<string | null>(null);
  protected locations = this.locationService.locations;

  // Modal state
  protected isModalOpen = signal(false);
  protected modalPickupLocationId = signal<number | null>(null);
  protected modalDifferentDropoff = signal(false);
  protected modalPickupDate = signal<string>('');
  protected modalReturnDate = signal<string>('');
  protected modalPickupTime = signal<string>('09:00');
  protected modalReturnTime = signal<string>('09:00');
  protected modalError = signal<string | null>(null);

  // İş kuralları
  protected readonly MIN_ADVANCE_MINUTES = 30;
  protected readonly MIN_RENTAL_DAYS = 1;
  protected readonly MAX_ADVANCE_DAYS = 365;

  protected todayString = this.formatDateForInput(new Date());

  protected timeOptions = this.generateTimeOptions();

  // Dinamik alış saati (bugün seçilirse geçmiş saatler disabled)
  protected pickupTimeOptions = computed(() => {
    const pd = this.modalPickupDate();
    if (!pd) return this.timeOptions.map(v => ({ value: v, disabled: false }));

    const now = new Date();
    const selectedDate = new Date(pd);
    const isToday = this.isSameDay(selectedDate, now);

    if (!isToday) {
      return this.timeOptions.map(v => ({ value: v, disabled: false }));
    }

    const minTime = new Date(now.getTime() + this.MIN_ADVANCE_MINUTES * 60 * 1000);
    const minHour = minTime.getHours();
    const minMinute = minTime.getMinutes();

    return this.timeOptions.map(v => {
      const [h, m] = v.split(':').map(Number);
      const disabled = (h < minHour) || (h === minHour && m < minMinute);
      return { value: v, disabled };
    });
  });

  protected minReturnDate = computed(() => {
    const pd = this.modalPickupDate();
    if (!pd) return this.todayString;
    const d = new Date(pd);
    d.setDate(d.getDate() + this.MIN_RENTAL_DAYS);
    return this.formatDateForInput(d);
  });

  protected modalRentalDays = computed(() => {
    const pd = this.modalPickupDate();
    const rd = this.modalReturnDate();
    if (!pd || !rd) return 0;
    const diff = new Date(rd).getTime() - new Date(pd).getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  });

  protected modalTotalPrice = computed(() => {
    const c = this.car();
    return c ? c.dailyPrice * this.modalRentalDays() : 0;
  });

  protected canConfirm = computed(() =>
    !!this.modalPickupLocationId() &&
    !!this.modalPickupDate() &&
    !!this.modalReturnDate() &&
    this.modalRentalDays() > 0
  );

  protected galleryImages = computed(() => {
    const c = this.car();
    if (!c) return [];
    const images: string[] = [];
    if (c.imageUrl) images.push(c.imageUrl);
    if (c.carImages?.length) {
      c.carImages
        .filter(img => img.imageUrl !== c.imageUrl)
        .forEach(img => images.push(img.imageUrl));
    }
    return images;
  });

  // ═══ Booking state'ten gelen tarihler için güvenli parse ═══
  protected pickupDateFormatted = computed(() => {
    const d = this.booking.selection().pickupDate;
    if (!d) return null;
    // sessionStorage'dan gelirse string olur, Date değilse çevir
    const date = d instanceof Date ? d : new Date(d);
    if (isNaN(date.getTime())) return null;
    return this.formatDisplayDate(date);
  });

  protected returnDateFormatted = computed(() => {
    const d = this.booking.selection().returnDate;
    if (!d) return null;
    const date = d instanceof Date ? d : new Date(d);
    if (isNaN(date.getTime())) return null;
    return this.formatDisplayDate(date);
  });

  protected rentalDays = computed(() => {
    const s = this.booking.selection();
    if (!s.pickupDate || !s.returnDate) return 0;
    const p = s.pickupDate instanceof Date ? s.pickupDate : new Date(s.pickupDate);
    const r = s.returnDate instanceof Date ? s.returnDate : new Date(s.returnDate);
    if (isNaN(p.getTime()) || isNaN(r.getTime())) return 0;
    const diff = r.getTime() - p.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  });

  protected totalPrice = computed(() => {
    const c = this.car();
    return c ? c.dailyPrice * this.rentalDays() : 0;
  });

  protected hasValidBooking = computed(() =>
    this.booking.hasSelection() && this.rentalDays() > 0
  );

  ngOnInit(): void {
    // Konumları yükle
    if (this.locations().length === 0) {
      this.locationService.getAll().subscribe();
    }

    this.route.params.subscribe(params => {
      const id = +params['id'];
      if (!id) return;
      this.loadCar(id);
    });
  }

  private loadCar(id: number): void {
    this.loading.set(true);
    this.carService.getById(id).subscribe({
      next: res => {
        if (res.success && res.data) {
          this.car.set(res.data);
          if (res.data.imageUrl) this.selectedImage.set(res.data.imageUrl);
        }
        this.loading.set(false);
      },
      error: () => {
        this.car.set(null);
        this.loading.set(false);
      }
    });
  }

  selectImage(url: string): void {
    this.selectedImage.set(url);
  }

  // ═══ "Rezervasyon Yap" butonu ═══
  onReserveClick(): void {
    // 1) Tarih/konum eksikse modalı aç
    if (!this.hasValidBooking()) {
      this.openBookingModal();
      return;
    }

    // 2) Login değilse login sayfasına
    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: `/rezervasyon/ozet?carId=${this.car()?.id}` }
      });
      return;
    }

    // 3) Wizard'a yönlendir
    this.router.navigate(['/rezervasyon/ozet'], {
      queryParams: { carId: this.car()?.id }
    });
  }

  // ═══ MODAL ═══
  openBookingModal(): void {
    // Mevcut booking state varsa modalı doldur
    const s = this.booking.selection();
    if (s.pickupLocationId) this.modalPickupLocationId.set(s.pickupLocationId);
    if (s.pickupDate) {
      const d = s.pickupDate instanceof Date ? s.pickupDate : new Date(s.pickupDate);
      if (!isNaN(d.getTime())) this.modalPickupDate.set(this.formatDateForInput(d));
    }
    if (s.returnDate) {
      const d = s.returnDate instanceof Date ? s.returnDate : new Date(s.returnDate);
      if (!isNaN(d.getTime())) this.modalReturnDate.set(this.formatDateForInput(d));
    }
    if (s.pickupTime) this.modalPickupTime.set(s.pickupTime);
    if (s.returnTime) this.modalReturnTime.set(s.returnTime);

    // Aracın kendi şubesi varsa varsayılan olarak seç (isim üzerinden eşleştir)
    const c = this.car();
    if (c?.locationName && !this.modalPickupLocationId()) {
      const matchedLocation = this.locations().find(l => l.name === c.locationName);
      if (matchedLocation) {
        this.modalPickupLocationId.set(matchedLocation.id);
      }
    }

    this.modalError.set(null);
    this.isModalOpen.set(true);
    document.body.style.overflow = 'hidden';
  }

  closeBookingModal(): void {
    this.isModalOpen.set(false);
    this.modalError.set(null);
    document.body.style.overflow = '';
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isModalOpen()) this.closeBookingModal();
  }

  onPickupDateChange(): void {
    // İade tarihi geriye kalırsa +1 gün ayarla
    const pd = this.modalPickupDate();
    const rd = this.modalReturnDate();
    if (pd && rd) {
      const pickup = new Date(pd);
      const ret = new Date(rd);
      if (ret <= pickup) {
        const newReturn = new Date(pickup);
        newReturn.setDate(newReturn.getDate() + this.MIN_RENTAL_DAYS);
        this.modalReturnDate.set(this.formatDateForInput(newReturn));
      }
    }

    // Alış saati bugün seçilirse ve geçmişteyse otomatik düzelt
    if (pd && this.isSameDay(new Date(pd), new Date())) {
      const opts = this.pickupTimeOptions();
      const currentValid = opts.find(o => o.value === this.modalPickupTime() && !o.disabled);
      if (!currentValid) {
        const firstAvailable = opts.find(o => !o.disabled);
        if (firstAvailable) this.modalPickupTime.set(firstAvailable.value);
      }
    }
    this.modalError.set(null);
  }

  confirmBooking(): void {
    if (!this.canConfirm()) return;

    // Validation
    const pickupDT = this.combineDateAndTime(this.modalPickupDate(), this.modalPickupTime());
    const returnDT = this.combineDateAndTime(this.modalReturnDate(), this.modalReturnTime());
    const now = new Date();

    if (pickupDT <= now) {
      this.modalError.set('Alış tarihi ve saati geçmişte olamaz.');
      return;
    }

    const minPickup = new Date(now.getTime() + this.MIN_ADVANCE_MINUTES * 60 * 1000);
    if (pickupDT < minPickup) {
      this.modalError.set(`Alış zamanı şu andan en az ${this.MIN_ADVANCE_MINUTES} dakika sonra olmalı.`);
      return;
    }

    if (returnDT <= pickupDT) {
      this.modalError.set('İade zamanı alış zamanından sonra olmalı.');
      return;
    }

    // Konumu bul
    const loc = this.locations().find(l => l.id === this.modalPickupLocationId());

    // BookingStateService'e kaydet
    this.booking.setSelection({
      pickupLocationId: this.modalPickupLocationId(),
      pickupLocationName: loc?.name ?? null,
      returnLocationId: this.modalDifferentDropoff() ? null : this.modalPickupLocationId(),
      returnLocationName: loc?.name ?? null,
      pickupDate: pickupDT,
      pickupTime: this.modalPickupTime(),
      returnDate: returnDT,
      returnTime: this.modalReturnTime()
    });

    this.closeBookingModal();

    // Login değilse login'e yönlendir
    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: `/rezervasyon/ozet?carId=${this.car()?.id}` }
      });
      return;
    }

    // Direkt wizard'a git
    this.router.navigate(['/rezervasyon/ozet'], {
      queryParams: { carId: this.car()?.id }
    });
  }

  // ═══ Helpers ═══
  private formatDateForInput(d: Date): string {
    const y = d.getFullYear();
    const m = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  private formatDisplayDate(d: Date): string {
    const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  }

  private isSameDay(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() &&
           a.getMonth() === b.getMonth() &&
           a.getDate() === b.getDate();
  }

  private combineDateAndTime(dateStr: string, timeStr: string): Date {
    const d = new Date(dateStr);
    const [h, m] = timeStr.split(':').map(Number);
    d.setHours(h, m, 0, 0);
    return d;
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

  protected getFuelLabel(fuel: number): string {
    return ({ 1: 'Benzin', 2: 'Dizel', 3: 'Elektrik', 4: 'Hibrit', 5: 'LPG' } as any)[fuel] ?? '—';
  }

  protected getTransLabel(trans: number): string {
    return ({ 1: 'Manuel', 2: 'Otomatik', 3: 'Yarı Otomatik' } as any)[trans] ?? '—';
  }

  protected getStatusLabel(status: number): string {
    return ({ 1: 'Müsait', 2: 'Kirada', 3: 'Bakımda', 4: 'Pasif' } as any)[status] ?? '—';
  }
}