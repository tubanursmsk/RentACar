import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CarService } from '../../core/services/car.service';
import { Car } from '../../core/models/car.model';
import { HeroSearchComponent } from './components/hero-search/hero-search.component';
import { CategoryChipsComponent } from './components/category-chips/category-chips.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, HeroSearchComponent, CategoryChipsComponent],
  template: `
    <!-- ═══ Hero + YATAY Arama ═══ -->
    <app-hero-search />

    <!-- ═══ Kategori Chip'leri (hero'nun ALTINDA, ortada) ═══ -->
    <div class="border-b border-ink-100">
      <app-category-chips (categoryChanged)="onCategoryChanged($event)" />
    </div>

    <!-- ═══ Öne Çıkan Araçlar (GENİŞ layout) ═══ -->
    <section class="py-10 lg:py-12">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-8">

        <div class="flex items-end justify-between mb-6">
          <div>
            <h2 class="text-2xl font-bold text-ink-900">
              @switch (activeCategory()) {
                @case ('all') { Öne Çıkan Araçlar }
                @case ('airport') { Havalimanlarında Müsait Araçlar }
                @case ('monthly') { Aylık Kiralamalar }
                @default { Araçlar }
              }
            </h2>
            <p class="text-ink-500 text-sm mt-1">Bir gezi için ortalama günlük fiyatlar</p>
          </div>
          <a routerLink="/araclar"
             class="hidden md:inline-flex items-center gap-1 text-sm font-semibold text-ink-900 hover:text-brand-600 transition">
            Tümünü Gör
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/>
            </svg>
          </a>
        </div>

        @if (loading()) {
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            @for (i of [1,2,3,4]; track i) {
              <div class="card p-4 animate-pulse">
                <div class="aspect-[4/3] bg-ink-100 rounded-xl"></div>
                <div class="h-4 bg-ink-100 rounded mt-4 w-3/4"></div>
                <div class="h-4 bg-ink-100 rounded mt-2 w-1/2"></div>
              </div>
            }
          </div>
        } @else if (featuredCars().length > 0) {
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            @for (car of featuredCars(); track car.id) {
              <a [routerLink]="['/araclar', car.id]" class="card overflow-hidden group cursor-pointer">
                <div class="aspect-[4/3] bg-ink-100 relative overflow-hidden">
                  @if (car.imageUrl) {
                    <img [src]="apiBaseUrl + car.imageUrl"
                         [alt]="car.brandName + ' ' + car.model"
                         class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                  } @else {
                    <div class="w-full h-full flex items-center justify-center text-6xl">🚗</div>
                  }
                  <button (click)="$event.preventDefault(); $event.stopPropagation()"
                          class="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur rounded-full
                                 flex items-center justify-center hover:bg-white transition shadow-card">
                    <svg class="w-5 h-5 text-ink-700 hover:text-accent-danger transition"
                         fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                    </svg>
                  </button>
                </div>

                <div class="p-4">
                  <div class="flex items-start justify-between gap-2">
                    <div class="flex-1 min-w-0">
                      <h3 class="font-bold text-ink-900 truncate">{{ car.brandName }} {{ car.model }}</h3>
                      <p class="text-sm text-ink-500">{{ car.modelYear }}</p>
                    </div>
                    <div class="flex items-center gap-1 text-sm font-semibold text-ink-900 flex-shrink-0">
                      <svg class="w-4 h-4 text-accent-warning" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                      4.9
                    </div>
                  </div>

                  <div class="flex items-center gap-3 mt-3 text-xs text-ink-500">
                    <span>{{ getFuelLabel(car.fuelType) }}</span>
                    <span>•</span>
                    <span>{{ getTransLabel(car.transmissionType) }}</span>
                    <span>•</span>
                    <span>{{ car.seatCount }} kişi</span>
                  </div>

                  <div class="mt-4 pt-4 border-t border-ink-100 flex items-baseline justify-between">
                    <div class="text-lg font-extrabold text-ink-900">
                      ₺{{ car.dailyPrice | number:'1.0-0' }}
                      <span class="text-xs font-normal text-ink-500">/ gün</span>
                    </div>
                  </div>
                </div>
              </a>
            }
          </div>
        } @else {
          <p class="text-center py-12 text-ink-500">Henüz araç eklenmemiş.</p>
        }
      </div>
    </section>

    <!-- ═══ Neden Biz? ═══ -->
    <section class="py-14 bg-ink-50">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-8">
        <div class="text-center max-w-2xl mx-auto mb-10">
          <h2 class="text-2xl font-bold text-ink-900 mb-2">Neden RentACar?</h2>
          <p class="text-ink-600">Türkiye'nin en güvenilir araç kiralama deneyimi</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="text-center p-6">
            <div class="w-14 h-14 mx-auto bg-brand-50 rounded-2xl flex items-center justify-center text-brand-600">
              <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
            </div>
            <h3 class="font-bold text-lg mt-4">Anında Rezervasyon</h3>
            <p class="text-ink-600 text-sm mt-2">3 dakikada rezervasyonunu tamamla, anında onay al.</p>
          </div>
          <div class="text-center p-6">
            <div class="w-14 h-14 mx-auto bg-accent-success/10 rounded-2xl flex items-center justify-center text-accent-success">
              <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
              </svg>
            </div>
            <h3 class="font-bold text-lg mt-4">Güvenli Sürüş</h3>
            <p class="text-ink-600 text-sm mt-2">Tüm araçlarımız tam sigortalı ve düzenli bakımlıdır.</p>
          </div>
          <div class="text-center p-6">
            <div class="w-14 h-14 mx-auto bg-accent-warning/10 rounded-2xl flex items-center justify-center text-accent-warning">
              <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"/>
              </svg>
            </div>
            <h3 class="font-bold text-lg mt-4">7/24 Destek</h3>
            <p class="text-ink-600 text-sm mt-2">Yol yardım ve müşteri hizmetleri her an yanında.</p>
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
  protected activeCategory = signal<string>('all');
  protected apiBaseUrl = environment.apiBaseUrl;

  ngOnInit(): void {
    this.loadCars();
  }

  onCategoryChanged(category: string): void {
    this.activeCategory.set(category);
    this.loadCars();
  }

  private loadCars(): void {
    this.loading.set(true);
    this.carService.searchCars({ pageNumber: 1, pageSize: 4 }).subscribe({
      next: res => {
        if (res.success && res.data) this.featuredCars.set(res.data.items);
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