import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { CarService } from '../../core/services/car.service';
import { LocationService } from '../../core/services/location.service';
import { Car } from '../../core/models/car.model';
import { HeroSearchComponent } from './components/hero-search/hero-search.component';
import { CategoryChipsComponent } from './components/category-chips/category-chips.component';
import { environment } from '../../../environments/environment';
import { SeoService } from '../../core/services/seo.service';
import { SEO_CONFIG } from '../../core/services/seo.config';

interface CategoryInfo {
  titleKey: string;
  subtitleKey: string;
  params?: any;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, HeroSearchComponent, CategoryChipsComponent, TranslatePipe],
  template: `
    <app-hero-search />

    <div class="border-b border-ink-100">
      <app-category-chips (categoryChanged)="onCategoryChanged($event)" />
    </div>

    <section class="py-10 lg:py-12">
      <div class="max-w-[1400px] mx-auto px-4 sm:px-6">

        <!-- Başlık + alt yazı -->
        <div class="flex items-end justify-between mb-6">
          <div>
            <h2 class="text-2xl font-bold text-ink-900">
              {{ categoryInfo().titleKey | translate: categoryInfo().params }}
            </h2>
            <p class="text-ink-500 text-sm mt-1">
              {{ categoryInfo().subtitleKey | translate: categoryInfo().params }}
            </p>
          </div>
          <a routerLink="/araclar"
             class="hidden md:inline-flex items-center gap-1 text-sm font-semibold text-ink-900 hover:text-brand-600 transition">
            {{ 'common.seeAll' | translate }}
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
        } @else if (activeCategory() === 'cities') {
          <!-- ═══ ŞEHİRLER ═══ -->
          @for (cityGroup of carsByCity(); track cityGroup.city) {
            <div class="mb-10">
              <h3 class="text-xl font-bold text-ink-900 mb-4 flex items-center gap-2">
                <svg class="w-5 h-5 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                {{ cityGroup.city }}
                <span class="text-sm font-normal text-ink-500">
                  ({{ 'common.carsCount' | translate: { count: cityGroup.cars.length } }})
                </span>
              </h3>
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                @for (car of cityGroup.cars.slice(0, 4); track car.id) {
                  <ng-container *ngTemplateOutlet="carCard; context: { $implicit: car }"></ng-container>
                }
              </div>
            </div>
          }
        } @else if (filteredCars().length > 0) {
          <!-- ═══ NORMAL GRID ═══ -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            @for (car of filteredCars(); track car.id) {
              <ng-container *ngTemplateOutlet="carCard; context: { $implicit: car }"></ng-container>
            }
          </div>
        } @else {
          <!-- ═══ Boş Durum ═══ -->
          <div class="text-center py-16">
            <div class="text-5xl mb-3">😔</div>
            <h3 class="text-lg font-bold text-ink-900">{{ 'home.sections.empty' | translate }}</h3>
            <p class="text-ink-500 text-sm mt-2">{{ 'home.sections.emptyDescription' | translate }}</p>
            <button (click)="onCategoryChanged('all')" class="btn-primary mt-4">
              {{ 'home.sections.showAll' | translate }}
            </button>
          </div>
        }
      </div>
    </section>

    <!-- ═══ Neden Biz? ═══ -->
    <section class="py-14 bg-ink-50">
      <div class="max-w-[1400px] mx-auto px-4 sm:px-6">
        <div class="text-center max-w-2xl mx-auto mb-10">
          <h2 class="text-2xl font-bold text-ink-900 mb-2">{{ 'home.whyUs.title' | translate }}</h2>
          <p class="text-ink-600">{{ 'home.whyUs.subtitle' | translate }}</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="text-center p-6">
            <div class="w-14 h-14 mx-auto bg-brand-50 rounded-2xl flex items-center justify-center text-brand-600">
              <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
            </div>
            <h3 class="font-bold text-lg mt-4">{{ 'home.whyUs.instantTitle' | translate }}</h3>
            <p class="text-ink-600 text-sm mt-2">{{ 'home.whyUs.instantDesc' | translate }}</p>
          </div>
          <div class="text-center p-6">
            <div class="w-14 h-14 mx-auto bg-accent-success/10 rounded-2xl flex items-center justify-center text-accent-success">
              <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
              </svg>
            </div>
            <h3 class="font-bold text-lg mt-4">{{ 'home.whyUs.secureTitle' | translate }}</h3>
            <p class="text-ink-600 text-sm mt-2">{{ 'home.whyUs.secureDesc' | translate }}</p>
          </div>
          <div class="text-center p-6">
            <div class="w-14 h-14 mx-auto bg-accent-warning/10 rounded-2xl flex items-center justify-center text-accent-warning">
              <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"/>
              </svg>
            </div>
            <h3 class="font-bold text-lg mt-4">{{ 'home.whyUs.supportTitle' | translate }}</h3>
            <p class="text-ink-600 text-sm mt-2">{{ 'home.whyUs.supportDesc' | translate }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ Araç Kartı Template'i ═══ -->
    <ng-template #carCard let-car>
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

          @if (car.locationName) {
            <div class="absolute bottom-3 left-3 bg-white/90 backdrop-blur px-2 py-1 rounded-full text-xs font-semibold text-ink-700 shadow-card">
              📍 {{ car.locationName }}
            </div>
          }
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
            <span>{{ getFuelLabel(car.fuelType) | translate }}</span>
            <span>•</span>
            <span>{{ getTransLabel(car.transmissionType) | translate }}</span>
            <span>•</span>
            <span>{{ car.seatCount }} {{ 'home.car.seats' | translate }}</span>
          </div>

          <div class="mt-4 pt-4 border-t border-ink-100 flex items-baseline justify-between">
            <div class="text-lg font-extrabold text-ink-900">
              ₺{{ car.dailyPrice | number:'1.0-0' }}
              <span class="text-xs font-normal text-ink-500">{{ 'home.car.perDay' | translate }}</span>
            </div>
            @if (activeCategory() === 'monthly') {
              <div class="text-xs text-accent-success font-semibold">
                {{ 'home.car.monthly' | translate }}: ₺{{ (car.dailyPrice * 30 * 0.85) | number:'1.0-0' }}
              </div>
            }
          </div>
        </div>
      </a>
    </ng-template>
  `
})
export class HomeComponent implements OnInit {
  private carService = inject(CarService);
  private locationService = inject(LocationService);
  private translate = inject(TranslateService);
   private seo = inject(SeoService);

  protected allCars = signal<Car[]>([]);
  protected loading = signal(true);
  protected activeCategory = signal<string>('all');
  protected apiBaseUrl = environment.apiBaseUrl;

  protected userCity = signal<string | null>(null);

  protected filteredCars = computed(() => {
    const cars = this.allCars();
    const cat = this.activeCategory();

    switch (cat) {
      case 'all':
        return cars.slice(0, 4);

      case 'airport':
        return cars.filter(c =>
          c.locationName?.toLowerCase().includes('havaliman') ||
          c.locationName?.toLowerCase().includes('airport')
        ).slice(0, 4);

      case 'monthly':
        return [...cars]
          .sort((a, b) => a.dailyPrice - b.dailyPrice)
          .slice(0, 4);

      case 'nearby':
        const city = this.userCity();
        if (!city) return cars.slice(0, 4);
        return cars.filter(c =>
          c.locationName?.toLowerCase().includes(city.toLowerCase())
        ).slice(0, 4);

      case 'delivery':
        return cars.slice(0, 4);

      case 'cities':
        return [];

      default:
        return cars.slice(0, 4);
    }
  });

  protected carsByCity = computed(() => {
    const groups = new Map<string, Car[]>();
    for (const car of this.allCars()) {
      if (!car.locationName) continue;
      const city = this.extractCity(car.locationName);
      if (!city) continue;

      if (!groups.has(city)) groups.set(city, []);
      groups.get(city)!.push(car);
    }
    return Array.from(groups.entries())
      .map(([city, cars]) => ({ city, cars }))
      .sort((a, b) => b.cars.length - a.cars.length);
  });

  // ⭐ Kategori info — translation KEY döndürür (pipe render eder, dile göre değişir)
  protected categoryInfo = computed<CategoryInfo>(() => {
    const cat = this.activeCategory();
    const count = this.filteredCars().length;

    switch (cat) {
      case 'airport':
        return {
          titleKey: 'home.sections.airport',
          subtitleKey: 'home.sections.airportSubtitle',
          params: { count }
        };
      case 'monthly':
        return {
          titleKey: 'home.sections.monthly',
          subtitleKey: 'home.sections.monthlySubtitle'
        };
      case 'nearby':
        const city = this.userCity();
        return city ? {
          titleKey: 'home.sections.nearbyLocated',
          subtitleKey: 'home.sections.nearbySubtitle',
          params: { city }
        } : {
          titleKey: 'home.sections.nearby',
          subtitleKey: 'home.sections.nearbyLoading'
        };
      case 'delivery':
        return {
          titleKey: 'home.sections.delivery',
          subtitleKey: 'home.sections.deliverySubtitle'
        };
      case 'cities':
        return {
          titleKey: 'home.sections.cities',
          subtitleKey: 'home.sections.citiesSubtitle'
        };
      default:
        return {
          titleKey: 'home.sections.featured',
          subtitleKey: 'home.sections.featuredSubtitle'
        };
    }
  });

  ngOnInit(): void {
    this.seo.updateSeo(SEO_CONFIG['home']);
    this.loadCars();

    if (this.locationService.locations().length === 0) {
      this.locationService.getAll().subscribe();
    }
  }

  onCategoryChanged(category: string): void {
    this.activeCategory.set(category);

    if (category === 'nearby' && !this.userCity()) {
      this.detectUserCity();
    }
  }

  private loadCars(): void {
    this.loading.set(true);
    this.carService.searchCars({ pageNumber: 1, pageSize: 100 }).subscribe({
      next: res => {
        if (res.success && res.data) {
          this.allCars.set(res.data.items);
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  private extractCity(locationName: string): string | null {
    const cities = [
      'İstanbul', 'Istanbul', 'Ankara', 'İzmir', 'Izmir', 'Antalya',
      'Bursa', 'Adana', 'Konya', 'Gaziantep', 'Muğla', 'Mugla',
      'Trabzon', 'Kayseri', 'Eskişehir', 'Eskisehir'
    ];

    for (const city of cities) {
      if (locationName.toLowerCase().includes(city.toLowerCase())) {
        if (city === 'Istanbul') return 'İstanbul';
        if (city === 'Izmir') return 'İzmir';
        if (city === 'Mugla') return 'Muğla';
        if (city === 'Eskisehir') return 'Eskişehir';
        return city;
      }
    }
    return null;
  }

  private detectUserCity(): void {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const currentLang = this.translate.getCurrentLang() || 'tr';
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=${currentLang}`
          );
          const data = await response.json();
          const city = data.address?.province || data.address?.city || data.address?.town;
          if (city) {
            this.userCity.set(city);
          }
        } catch (err) {
          console.warn('Şehir tespit edilemedi:', err);
        }
      },
      (err) => {
        console.warn('Konum izni verilmedi:', err);
      },
      { timeout: 5000 }
    );
  }

  // ⭐ Artık translation key döndürüyor, pipe render ediyor
  protected getFuelLabel(fuel: number): string {
    const keys = ({
      1: 'home.fuel.gasoline',
      2: 'home.fuel.diesel',
      3: 'home.fuel.electric',
      4: 'home.fuel.hybrid',
      5: 'home.fuel.lpg'
    } as any)[fuel];
    return keys ?? '—';
  }

  protected getTransLabel(trans: number): string {
    const keys = ({
      1: 'home.transmission.manual',
      2: 'home.transmission.automatic',
      3: 'home.transmission.semiAutomatic'
    } as any)[trans];
    return keys ?? '—';
  }
}