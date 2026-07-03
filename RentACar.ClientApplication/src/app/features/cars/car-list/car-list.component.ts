import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CarService } from '../../../core/services/car.service';
import { BrandService } from '../../../core/services/brand.service';
import { LocationService } from '../../../core/services/location.service';
import { Car, CarFilter, FuelType, TransmissionType } from '../../../core/models/car.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-car-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="bg-ink-100/30">

  <section class="bg-white border-b border-ink-200">
    <div class="page-container py-5">

      <div class="flex items-center justify-between">

        <div>
          <h1 class="text-3xl font-bold text-ink-900">
            Araçlarımız
          </h1>

          <p class="text-ink-500 mt-1">
            {{ totalCount() }} araç arasından seçim yapın
          </p>
        </div>

      </div>

    </div>
  </section>

  <div class="page-container pt-5 pb-8">
        <div class="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">

          <aside class="lg:sticky lg:top-32 lg:self-start">
            <div class="bg-white rounded-2xl shadow-card p-6">
              <div class="flex items-center justify-between mb-4">
                <h3 class="font-bold text-lg">Filtrele</h3>
                <button (click)="clearFilters()" class="text-xs font-bold text-brand-600 hover:underline">Temizle</button>
              </div>

              <div class="mb-5">
                <label class="text-xs font-bold text-ink-700 uppercase">Marka/Model Ara</label>
                <input type="text" [(ngModel)]="searchTerm" (input)="onFilterChange()" placeholder="Toyota, Audi..." class="input-field mt-2 text-sm">
              </div>

              <div class="mb-5">
                <label class="text-xs font-bold text-ink-700 uppercase">Markalar</label>
                <div class="mt-2 space-y-2 max-h-48 overflow-y-auto pr-2">
                  @for (brand of brands(); track brand.id) {
                    <label class="flex items-center gap-2 cursor-pointer hover:bg-ink-100/50 px-2 py-1 rounded">
                      <input type="checkbox" [checked]="selectedBrandIds().includes(brand.id)" (change)="toggleBrand(brand.id)" class="w-4 h-4 accent-brand-600">
                      <span class="text-sm">{{ brand.name }}</span>
                    </label>
                  }
                </div>
              </div>

              <div class="mb-5">
                <label class="text-xs font-bold text-ink-700 uppercase">Şube</label>
                <select [(ngModel)]="selectedLocationId" (change)="onFilterChange()" class="input-field mt-2 text-sm">
                  <option [ngValue]="null">Tüm şubeler</option>
                  @for (loc of locations(); track loc.id) {
                    <option [ngValue]="loc.id">{{ loc.name }} — {{ loc.city }}</option>
                  }
                </select>
              </div>

              <div class="mb-5">
                <label class="text-xs font-bold text-ink-700 uppercase">Yakıt Tipi</label>
                <select [(ngModel)]="selectedFuel" (change)="onFilterChange()" class="input-field mt-2 text-sm">
                  <option [ngValue]="null">Tümü</option>
                  <option [ngValue]="1">Benzin</option>
                  <option [ngValue]="2">Dizel</option>
                  <option [ngValue]="3">Elektrik</option>
                  <option [ngValue]="4">Hibrit</option>
                  <option [ngValue]="5">LPG</option>
                </select>
              </div>

              <div class="mb-5">
                <label class="text-xs font-bold text-ink-700 uppercase">Vites</label>
                <select [(ngModel)]="selectedTransmission" (change)="onFilterChange()" class="input-field mt-2 text-sm">
                  <option [ngValue]="null">Tümü</option>
                  <option [ngValue]="1">Manuel</option>
                  <option [ngValue]="2">Otomatik</option>
                  <option [ngValue]="3">Yarı Otomatik</option>
                </select>
              </div>

              <div class="mb-2">
                <label class="text-xs font-bold text-ink-700 uppercase">Günlük Fiyat (₺)</label>
                <div class="grid grid-cols-2 gap-2 mt-2">
                  <input type="number" [(ngModel)]="minPrice" (change)="onFilterChange()" placeholder="Min" class="input-field text-sm">
                  <input type="number" [(ngModel)]="maxPrice" (change)="onFilterChange()" placeholder="Max" class="input-field text-sm">
                </div>
              </div>
            </div>
          </aside>

          <main>
            <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
              <p class="text-sm text-ink-700"><b class="text-brand-600">{{ totalCount() }}</b> araç bulundu</p>
              <select [(ngModel)]="sortBy" (change)="applySort()" class="input-field text-sm w-auto">
                <option value="default">Varsayılan</option>
                <option value="price-asc">Fiyat (düşükten yükseğe)</option>
                <option value="price-desc">Fiyat (yüksekten düşüğe)</option>
                <option value="year-desc">Model yılı (yeniden eskiye)</option>
              </select>
            </div>

            @if (loading()) {
              <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                @for (i of [1,2,3,4,5,6]; track i) {
                  <div class="card p-4 animate-pulse">
                    <div class="h-44 bg-ink-100 rounded-lg"></div>
                    <div class="h-4 bg-ink-100 rounded mt-4 w-3/4"></div>
                    <div class="h-4 bg-ink-100 rounded mt-2 w-1/2"></div>
                  </div>
                }
              </div>
            } @else if (cars().length === 0) {
              <div class="text-center py-20">
                <div class="text-6xl mb-4">🔍</div>
                <h3 class="text-xl font-bold">Araç bulunamadı</h3>
                <p class="text-ink-500 mt-2">Filtre kriterlerinizi değiştirip tekrar deneyin.</p>
                <button (click)="clearFilters()" class="btn-primary mt-4">Filtreleri Temizle</button>
              </div>
            } @else {
              <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                @for (car of cars(); track car.id) {
                  <a [routerLink]="['/araclar', car.id]" class="card p-4 group cursor-pointer animate-fade-in">
                    <div class="aspect-video bg-ink-100 rounded-lg overflow-hidden flex items-center justify-center">
                      @if (car.imageUrl) {
                        <img [src]="apiBaseUrl + car.imageUrl" [alt]="car.brandName + ' ' + car.model" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
                      } @else {
                        <span class="text-5xl">🚗</span>
                      }
                    </div>
                    <div class="mt-4">
                      <h3 class="font-bold text-ink-900 text-lg leading-tight">{{ car.brandName }} {{ car.model }}</h3>
                      <p class="text-sm text-ink-500 mt-1">{{ car.modelYear }}</p>

                      <div class="flex flex-wrap gap-2 mt-3">
                        <span class="inline-flex items-center gap-1 text-xs bg-ink-100 text-ink-700 px-2 py-1 rounded-full">⛽ {{ getFuelLabel(car.fuelType) }}</span>
                        <span class="inline-flex items-center gap-1 text-xs bg-ink-100 text-ink-700 px-2 py-1 rounded-full">⚙️ {{ getTransLabel(car.transmissionType) }}</span>
                        <span class="inline-flex items-center gap-1 text-xs bg-ink-100 text-ink-700 px-2 py-1 rounded-full">👥 {{ car.seatCount }} kişi</span>
                      </div>

                      <div class="mt-4 pt-4 border-t border-ink-100 flex items-end justify-between">
                        <div>
                          <div class="text-xs text-ink-500">Günlük</div>
                          <div class="text-xl font-extrabold text-brand-600">₺{{ car.dailyPrice | number:'1.0-0' }}</div>
                        </div>
                        <button class="btn-primary !py-2 !px-4 text-xs">REZERVE ET</button>
                      </div>
                    </div>
                  </a>
                }
              </div>

              @if (totalPages() > 1) {
                <div class="mt-10 flex items-center justify-center gap-2">
                  <button (click)="goToPage(currentPage() - 1)" [disabled]="currentPage() === 1" class="px-4 py-2 rounded-lg bg-white border border-ink-100 hover:bg-ink-100 disabled:opacity-40 disabled:cursor-not-allowed transition text-sm font-semibold">‹ Önceki</button>
                  @for (p of pageNumbers(); track p) {
                    <button (click)="goToPage(p)" class="px-4 py-2 rounded-lg text-sm font-semibold transition" [class.bg-brand-600]="p === currentPage()" [class.text-white]="p === currentPage()" [class.bg-white]="p !== currentPage()" [class.border]="p !== currentPage()" [class.border-ink-100]="p !== currentPage()" [class.hover:bg-ink-100]="p !== currentPage()">{{ p }}</button>
                  }
                  <button (click)="goToPage(currentPage() + 1)" [disabled]="currentPage() === totalPages()" class="px-4 py-2 rounded-lg bg-white border border-ink-100 hover:bg-ink-100 disabled:opacity-40 disabled:cursor-not-allowed transition text-sm font-semibold">Sonraki ›</button>
                </div>
              }
            }
          </main>
        </div>
      </div>
    </div>
  `
})
export class CarListComponent implements OnInit {
  private carService = inject(CarService);
  private brandService = inject(BrandService);
  private locationService = inject(LocationService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  protected brands = this.brandService.brands;
  protected locations = this.locationService.locations;
  protected apiBaseUrl = environment.apiBaseUrl;

  protected cars = signal<Car[]>([]);
  protected loading = signal(true);
  protected totalCount = signal(0);
  protected currentPage = signal(1);
  protected totalPages = signal(1);

  protected pageNumbers = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, current - 2);
    let end = Math.min(total, start + maxVisible - 1);
    if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  });

  protected searchTerm = '';
  protected selectedBrandIds = signal<number[]>([]);
  protected selectedLocationId: number | null = null;
  protected selectedFuel: FuelType | null = null;
  protected selectedTransmission: TransmissionType | null = null;
  protected minPrice: number | null = null;
  protected maxPrice: number | null = null;
  protected sortBy = 'default';

  private debounceTimer: any;
  private readonly pageSize = 12;

  ngOnInit(): void {
    if (this.brands().length === 0) this.brandService.getAll().subscribe();
    if (this.locations().length === 0) this.locationService.getAll().subscribe();

    this.route.queryParams.subscribe(params => {
      // YENİ: Başka sayfadan filtre gelirse (Örn: Arama çubuğu veya Ofisler sayfası)
      if (params['locationId']) this.selectedLocationId = +params['locationId'];
      if (params['q']) this.searchTerm = params['q'];
      
      this.loadCars();
    });
  }

  toggleBrand(brandId: number): void {
    const current = this.selectedBrandIds();
    if (current.includes(brandId)) {
      this.selectedBrandIds.set(current.filter(id => id !== brandId));
    } else {
      this.selectedBrandIds.set([...current, brandId]);
    }
    this.onFilterChange();
  }

  onFilterChange(): void {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.currentPage.set(1);
      
      // YENİ DETAY: URL'i de güncelliyoruz ki müşteri linki kopyaladığında ofis seçili kalsın
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { locationId: this.selectedLocationId || null },
        queryParamsHandling: 'merge'
      });

      this.loadCars();
    }, 350);
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedBrandIds.set([]);
    this.selectedLocationId = null;
    this.selectedFuel = null;
    this.selectedTransmission = null;
    this.minPrice = null;
    this.maxPrice = null;
    this.sortBy = 'default';
    this.currentPage.set(1);
    
    this.router.navigate([], { relativeTo: this.route, queryParams: {} });
    this.loadCars();
  }

  applySort(): void {
    const list = [...this.cars()];
    switch (this.sortBy) {
      case 'price-asc': list.sort((a, b) => a.dailyPrice - b.dailyPrice); break;
      case 'price-desc': list.sort((a, b) => b.dailyPrice - a.dailyPrice); break;
      case 'year-desc': list.sort((a, b) => b.modelYear - a.modelYear); break;
    }
    this.cars.set(list);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    this.loadCars();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private loadCars(): void {
    this.loading.set(true);

    const filter: CarFilter = {
      searchTerm: this.searchTerm || undefined,
      brandIds: this.selectedBrandIds().length ? this.selectedBrandIds() : undefined,
      locationId: this.selectedLocationId ?? undefined,
      fuelType: this.selectedFuel ?? undefined,
      transmissionType: this.selectedTransmission ?? undefined,
      minPrice: this.minPrice ?? undefined,
      maxPrice: this.maxPrice ?? undefined,
      pageNumber: this.currentPage(),
      pageSize: this.pageSize
    };

    this.carService.searchCars(filter).subscribe({
      next: res => {
        if (res.success && res.data) {
          this.cars.set(res.data.items);
          this.totalCount.set(res.data.totalCount);
          this.totalPages.set(res.data.totalPages);
          this.applySort();
        } else {
          this.cars.set([]);
          this.totalCount.set(0);
          this.totalPages.set(1);
        }
        this.loading.set(false);
      },
      error: () => {
        this.cars.set([]);
        this.loading.set(false);
      }
    });
  }

  protected getFuelLabel(fuel: number): string {
    return ({ 1: 'Benzin', 2: 'Dizel', 3: 'Elektrik', 4: 'Hibrit', 5: 'LPG' } as any)[fuel] ?? '—';
  }

  protected getTransLabel(trans: number): string {
    return ({ 1: 'Manuel', 2: 'Otomatik', 3: 'Yarı Otomatik' } as any)[trans] ?? '—';
  }
}