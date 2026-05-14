import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CarService } from '../../../core/services/car.service';
import { Car } from '../../../core/models/car.model';
import { BookingStateService } from '../../../core/services/booking-state.service';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-car-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="bg-ink-100/30 min-h-screen py-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <!-- Breadcrumb -->
        <nav class="text-sm text-ink-500 mb-4">
          <a routerLink="/" class="hover:text-avis-600">Ana Sayfa</a>
          <span class="mx-2">/</span>
          <a routerLink="/araclar" class="hover:text-avis-600">Araçlar</a>
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
                            [class.border-avis-600]="img === selectedImage()"
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
                  <span class="inline-flex items-center px-3 py-1 bg-avis-50 text-avis-600 text-xs font-bold rounded-full">
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
                  <div class="mt-6 p-4 bg-avis-50 rounded-lg flex items-start gap-3">
                    <svg class="w-5 h-5 text-avis-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                    <div>
                      <div class="text-xs text-avis-600 font-bold uppercase">Şube</div>
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
                    <div class="text-3xl font-extrabold text-avis-600">
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

                @if (booking.hasSelection()) {
                  <div class="text-sm bg-ink-100/50 rounded-lg p-3 mb-4 space-y-1">
                    <div class="flex justify-between">
                      <span class="text-ink-500">Alış:</span>
                      <span class="font-semibold">{{ booking.selection().pickupDate | date:'dd MMM yyyy':'':'tr' }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-ink-500">İade:</span>
                      <span class="font-semibold">{{ booking.selection().returnDate | date:'dd MMM yyyy':'':'tr' }}</span>
                    </div>
                  </div>
                } @else {
                  <p class="text-sm text-ink-500 mb-4">
                    Önce alış ve iade tarihlerini seçin.
                  </p>
                }

                <button (click)="bookNow()"
                        [disabled]="c.status !== 1"
                        class="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed">
                  @if (c.status !== 1) {
                    BU ARAÇ ŞU AN MÜSAİT DEĞİL
                  } @else if (!booking.hasSelection()) {
                    TARİH SEÇMEK İÇİN ANA SAYFA
                  } @else {
                    REZERVASYON YAP ›
                  }
                </button>

                @if (!auth.isAuthenticated() && booking.hasSelection()) {
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
  `
})
export class CarDetailComponent implements OnInit {
  private carService = inject(CarService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  protected booking = inject(BookingStateService);
  protected auth = inject(AuthService);

  protected apiBaseUrl = environment.apiBaseUrl;
  protected car = signal<Car | null>(null);
  protected loading = signal(true);
  protected selectedImage = signal<string | null>(null);

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

  protected rentalDays = computed(() => this.booking.rentalDays());

  protected totalPrice = computed(() => {
    const c = this.car();
    return c ? c.dailyPrice * this.rentalDays() : 0;
  });

  ngOnInit(): void {
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

  bookNow(): void {
    // 1) Booking state yoksa anasayfaya yönlendir
    if (!this.booking.hasSelection()) {
      this.router.navigate(['/']);
      return;
    }

    // 2) Login değilse → login sayfasına (sonra dönüş için returnUrl)
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