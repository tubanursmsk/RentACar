import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LocationService } from '../../core/services/location.service';
import { Location } from '../../core/models/brand-location.model';
import { environment } from '../../../environments/environment';
import { SeoService } from '../../core/services/seo.service';
import { SEO_CONFIG } from '../../core/services/seo.config';


@Component({
  selector: 'app-offices',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="relative bg-ink-900 overflow-hidden">
      <div class="absolute inset-0 opacity-20 bg-cover bg-center" style="background-image: url('assets/cars/hero-1.png');"></div>
      <div class="absolute inset-0 bg-gradient-to-r from-ink-900 to-transparent"></div>

      <div class="relative page-container mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24 z-10">
        <div class="text-sm font-bold text-white/80 tracking-widest uppercase mb-2">
          Ana Sayfa > RentACar Ofisleri
        </div>
        <h1 class="text-3xl md:text-5xl font-extrabold text-white mb-4">Araç Kiralama Ofisleri</h1>
        <p class="text-lg text-ink-300 max-w-2xl">
          Türkiye'nin dört bir yanındaki şehir ve havalimanı ofislerimizle, yola çıkmak istediğiniz her an yanınızdayız.
        </p>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
      <div class="bg-white rounded-2xl shadow-xl p-4 md:p-6 border border-ink-100 flex flex-col md:flex-row gap-4 items-center">
        <div class="relative w-full">
          <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-ink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input type="text"
                 [ngModel]="searchQuery()"
                 (ngModelChange)="searchQuery.set($event)"
                 placeholder="Şehir, havalimanı veya ofis adı arayın..."
                 class="w-full pl-12 pr-4 py-3 rounded-xl border border-ink-200 focus:border-avis-600 focus:ring-2 focus:ring-avis-100 outline-none transition text-lg">
        </div>
      </div>
    </div>

    <div class="page-container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      @if (loading()) {
        <div class="flex justify-center py-20">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-avis-600"></div>
        </div>
      } @else if (groupedOffices().length === 0) {
        <div class="text-center py-20 bg-ink-50 rounded-3xl border-2 border-dashed border-ink-200">
          <p class="text-xl text-ink-500 font-medium">Aramanıza uygun ofis bulunamadı.</p>
        </div>
      } @else {
        <div class="space-y-12">
          @for (group of groupedOffices(); track group.city) {
            <section class="animate-fade-in">
              <div class="flex items-center gap-3 mb-6">
                <h2 class="text-3xl font-extrabold text-ink-900">{{ group.city }} Ofisleri</h2>
                <span class="px-3 py-1 bg-avis-50 text-brand-600 text-sm font-bold rounded-full">{{ group.offices.length }} Ofis</span>
                <div class="flex-1 h-px bg-ink-200 ml-4 hidden sm:block"></div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                @for (office of group.offices; track office.id) {
                  <div class="bg-white border border-ink-100 rounded-2xl p-6 hover:shadow-xl transition-shadow group flex flex-col h-full">

                    <div class="flex items-start justify-between mb-4">
                      <div>
                        <h3 class="font-bold text-lg text-ink-900 group-hover:text-brand-600 transition-colors">{{ office.name }}</h3>
                        <p class="text-sm text-ink-500 flex items-center gap-1 mt-1">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                          {{ office.city }}
                        </p>
                      </div>
                      <div class="w-12 h-12 bg-avis-50 rounded-full flex items-center justify-center text-brand-600 flex-shrink-0">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                        </svg>
                      </div>
                    </div>

                    <div class="mt-auto space-y-3 mb-6">
                      <div class="flex items-start gap-2 text-sm text-ink-700">
                        <svg class="w-5 h-5 text-ink-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        <span>Hafta İçi: 09:00 - 18:00<br>Hafta Sonu: 09:00 - 15:00</span>
                      </div>
                    </div>

                    <a [routerLink]="['/araclar']" [queryParams]="{ locationId: office.id }"
                       class="w-full block text-center bg-ink-100 hover:bg-brand-600 text-ink-900 hover:text-white font-bold py-3 px-4 rounded-xl transition-colors">
                      Bu Ofisten Araç Kirala
                    </a>
                  </div>
                }
              </div>
            </section>
          }
        </div>
      }
    </div>
  `
})
export class OfficesComponent implements OnInit {
  private locationService = inject(LocationService);
  private seo = inject(SeoService);   // ⭐ DÜZELTİLDİ: private + inject

  protected searchQuery = signal('');
  protected loading = signal(true);

  // Servisteki veriyi alıyoruz
  private locations = this.locationService.locations;

  ngOnInit(): void {
    // ⭐ SEO uygula
    this.seo.updateSeo(SEO_CONFIG['offices']);

    if (this.locations().length === 0) {
      this.locationService.getAll().subscribe({
        next: () => this.loading.set(false),
        error: () => this.loading.set(false)
      });
    } else {
      this.loading.set(false);
    }
  }

  // Arama metnine göre filtreleme ve Şehirlere Göre Gruplama İşlemi
  protected groupedOffices = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    let filtered = this.locations();

    if (query) {
      filtered = filtered.filter(loc =>
        loc.name.toLowerCase().includes(query) ||
        loc.city.toLowerCase().includes(query)
      );
    }

    // Şehre göre (city) gruplama yapıyoruz
    const grouped = filtered.reduce((acc, curr) => {
      const city = curr.city || 'Diğer'; // Şehir bilgisi yoksa "Diğer"e at
      if (!acc[city]) {
        acc[city] = [];
      }
      acc[city].push(curr);
      return acc;
    }, {} as Record<string, Location[]>);

    // Objeyi array'e çevirip şehir ismine göre alfabetik sıralıyoruz
    return Object.keys(grouped).sort().map(city => ({
      city,
      offices: grouped[city]
    }));
  });
}