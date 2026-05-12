import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CarService } from '../../core/services/car.service';
import { Car } from '../../core/models/car.model';
import { BookingCardComponent } from './components/booking-card/booking-card.component';
import { HeroSliderComponent } from './components/hero/hero-slider.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, HeroSliderComponent, BookingCardComponent],
  template: `
    <!-- ═══ Hero + Booking Card (üst üste) ═══ -->
    <section class="relative">
      <app-hero-slider />

      <!-- Booking Card — Hero'nun üzerinde absolute pozisyonlu -->
      <div class="lg:absolute lg:inset-y-0 lg:right-0 lg:left-0 lg:pointer-events-none">
        <div class="lg:max-w-7xl lg:mx-auto lg:px-8 lg:h-full lg:flex lg:items-center lg:justify-end">
          <div class="lg:pointer-events-auto lg:w-[420px]">
            <!-- Mobil: hero'nun altında normal akış -->
            <div class="lg:hidden px-4 -mt-8 relative z-20">
              <app-booking-card />
            </div>
            <!-- Desktop: hero'nun sağında ortalanmış -->
            <div class="hidden lg:block">
              <app-booking-card />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ Öne çıkan araçlar ═══ -->
    <section class="py-16 bg-ink-100/30">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-end justify-between mb-8">
          <div>
            <h2 class="text-3xl md:text-4xl font-extrabold text-ink-900">Öne Çıkan Araçlar</h2>
            <p class="text-ink-500 mt-2">En çok tercih edilen araçlarımız</p>
          </div>
          <a routerLink="/araclar"
             class="hidden md:inline-flex items-center gap-2 text-avis-600 font-bold hover:underline">
            Tümünü Gör
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M9 5l7 7-7 7"/>
            </svg>
          </a>
        </div>

        @if (loading()) {
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            @for (i of [1,2,3,4]; track i) {
              <div class="card p-4 animate-pulse">
                <div class="h-40 bg-ink-100 rounded-lg"></div>
                <div class="h-4 bg-ink-100 rounded mt-4 w-3/4"></div>
                <div class="h-4 bg-ink-100 rounded mt-2 w-1/2"></div>
              </div>
            }
          </div>
        } @else if (featuredCars().length > 0) {
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            @for (car of featuredCars(); track car.id) {
              <a [routerLink]="['/araclar', car.id]" class="card p-4 group cursor-pointer">
                <div class="aspect-video bg-ink-100 rounded-lg overflow-hidden flex items-center justify-center">
                  @if (car.imageUrl) {
                    <img [src]="apiBaseUrl + car.imageUrl"
                         [alt]="car.brandName + ' ' + car.model"
                         class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
                  } @else {
                    <span class="text-5xl">🚗</span>
                  }
                </div>
                <div class="mt-4">
                  <h3 class="font-bold text-ink-900 text-lg">
                    {{ car.brandName }} {{ car.model }}
                  </h3>
                  <p class="text-sm text-ink-500 mt-1">
                    {{ car.modelYear }} • {{ getFuelLabel(car.fuelType) }} • {{ getTransLabel(car.transmissionType) }}
                  </p>
                  <div class="mt-3 flex items-end justify-between">
                    <div>
                      <div class="text-xs text-ink-500">Günlük</div>
                      <div class="text-xl font-extrabold text-avis-600">
                        ₺{{ car.dailyPrice | number:'1.0-0' }}
                      </div>
                    </div>
                    <button class="px-3 py-1.5 bg-avis-600 hover:bg-avis-700 text-white text-xs font-bold rounded-full transition">
                      İNCELE
                    </button>
                  </div>
                </div>
              </a>
            }
          </div>
        } @else {
          <p class="text-center py-12 text-ink-500">Henüz araç eklenmemiş.</p>
        }

        <div class="mt-8 text-center md:hidden">
          <a routerLink="/araclar" class="btn-primary">Tüm Araçları Gör</a>
        </div>
      </div>
    </section>

    <!-- ═══ Avantajlar ═══ -->
    <section class="py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-3xl md:text-4xl font-extrabold text-ink-900 text-center mb-12">
          Neden RentACar?
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="text-center p-6">
            <div class="w-16 h-16 mx-auto bg-avis-50 rounded-full flex items-center justify-center text-avis-600">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
            </div>
            <h3 class="font-bold text-xl mt-4">Hızlı Rezervasyon</h3>
            <p class="text-ink-500 mt-2">3 dakikada online rezervasyon, anında onay.</p>
          </div>
          <div class="text-center p-6">
            <div class="w-16 h-16 mx-auto bg-avis-50 rounded-full flex items-center justify-center text-avis-600">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
              </svg>
            </div>
            <h3 class="font-bold text-xl mt-4">Güvenli Sürüş</h3>
            <p class="text-ink-500 mt-2">Tüm araçlarımız tam sigortalı ve düzenli bakımlı.</p>
          </div>
          <div class="text-center p-6">
            <div class="w-16 h-16 mx-auto bg-avis-50 rounded-full flex items-center justify-center text-avis-600">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
            </div>
            <h3 class="font-bold text-xl mt-4">7/24 Destek</h3>
            <p class="text-ink-500 mt-2">Yol yardım ve müşteri hizmetleri her an yanınızda.</p>
          </div>
        </div>
      </div>
    </section>
  `
})
export class HomeComponent implements OnInit {
  private carService = inject(CarService);

  protected featuredCars = signal<Car[]>([]);
  protected loading = signal(true);
  protected apiBaseUrl = environment.apiBaseUrl;

  ngOnInit(): void {
    this.carService.searchCars({ pageNumber: 1, pageSize: 4 }).subscribe({
      next: res => {
        if (res.success && res.data) {
          this.featuredCars.set(res.data.items);
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  protected getFuelLabel(fuel: number): string {
    return ({ 1: 'Benzin', 2: 'Dizel', 3: 'Elektrik', 4: 'Hibrit', 5: 'LPG' } as any)[fuel] ?? '—';
  }

  protected getTransLabel(trans: number): string {
    return ({ 1: 'Manuel', 2: 'Otomatik', 3: 'Yarı Otomatik' } as any)[trans] ?? '—';
  }
}