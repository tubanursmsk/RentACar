import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdditionalServiceService, AdditionalService } from '../../core/services/additional-service.service';
import { ApiResponse } from '../../core/models/api-response.model';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative bg-ink-900 overflow-hidden">
      <div class="absolute inset-0 opacity-20 bg-cover bg-center" style="background-image: url('assets/cars/hero-1.png');"></div>
      <div class="absolute inset-0 bg-gradient-to-r from-ink-900 to-transparent"></div>
 
      <div class="relative page-container mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24 z-10">
       <div class="text-sm font-bold text-avis-500 tracking-widest uppercase mb-2">
 Ana Sayfa > Ek Hizmetler ve Güvenceler</div>
        <h1 class="text-3xl md:text-5xl font-extrabold text-white mb-4">Ek Hizmetler ve Güvenceler</h1>
        <p class="text-lg text-ink-300 max-w-2xl">
          Kiralama deneyiminizi daha konforlu ve güvenli hale getirmek için sunduğumuz ek ürün ve güvence paketlerimizi inceleyebilirsiniz.
        </p>
      </div>
    </div>

    <div class="sticky top-[72px] z-30 bg-white border-b border-gray-200 shadow-sm">
      <div class="page-container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex gap-8 overflow-x-auto no-scrollbar">
          <button (click)="activeCategory.set('products')"
                  [class.border-avis-600]="activeCategory() === 'products'"
                  [class.text-brand-600]="activeCategory() === 'products'"
                  class="py-5 px-1 border-b-4 border-transparent font-bold text-sm uppercase tracking-wider transition-all whitespace-nowrap">
            Ek Ürünler
          </button>
          <button (click)="activeCategory.set('protections')"
                  [class.border-avis-600]="activeCategory() === 'protections'"
                  [class.text-brand-600]="activeCategory() === 'protections'"
                  class="py-5 px-1 border-b-4 border-transparent font-bold text-sm uppercase tracking-wider transition-all whitespace-nowrap">
            Güvenceler
          </button>
          <button (click)="activeCategory.set('corporate')"
                  [class.border-avis-600]="activeCategory() === 'corporate'"
                  [class.text-brand-600]="activeCategory() === 'corporate'"
                  class="py-5 px-1 border-b-4 border-transparent font-bold text-sm uppercase tracking-wider transition-all whitespace-nowrap">
            Kurumsal Hizmetler
          </button>
        </div>
      </div>
    </div>

    <div class="page-container mx-auto px-4 sm:px-6 lg:px-8 py-16 min-h-[500px]">
      @if (loading()) {
        <div class="flex justify-center py-20">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-avis-600"></div>
        </div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          @for (service of filteredServices(); track service.id) {
            <div class="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-2xl transition-all duration-300 flex flex-col h-full">
              
              <div class="h-48 bg-gray-50 flex items-center justify-center relative overflow-hidden">
                 <div class="text-6xl group-hover:scale-110 transition-transform duration-500">
                    {{ getServiceIcon(service.name) }}
                 </div>
                 <div class="absolute bottom-0 left-0 w-full h-1 bg-brand-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
              </div>

              <div class="p-8 flex flex-col flex-1">
                <h3 class="text-xl font-extrabold text-gray-900 mb-3 group-hover:text-brand-600 transition-colors">
                  {{ service.name }}
                </h3>
                <p class="text-gray-500 text-sm leading-relaxed mb-6 flex-1">
                  {{ service.description || 'Konforlu bir yolculuk için tercih edebileceğiniz ek hizmetimiz.' }}
                </p>

                <div class="pt-6 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <span class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Günlük Başlayan</span>
                    <span class="text-2xl font-black text-gray-900">₺{{ service.price | number:'1.0-0' }}</span>
                  </div>
                  <button class="bg-gray-100 hover:bg-brand-600 hover:text-white text-gray-900 font-bold py-3 px-6 rounded-lg transition-all text-xs uppercase tracking-widest">
                    DETAYLI BİLGİ
                  </button>
                </div>
              </div>
            </div>
          } @empty {
            <div class="col-span-full text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
              <p class="text-xl text-gray-400 font-medium">Bu kategoride henüz hizmet bulunmamaktadır.</p>
            </div>
          }
        </div>
      }
    </div>
  `
})

export class ServicesComponent implements OnInit {
  private serviceApi = inject(AdditionalServiceService);

  protected services = signal<AdditionalService[]>([]);
  protected loading = signal(true);
  protected activeCategory = signal<'products' | 'protections' | 'corporate'>('products');

  protected filteredServices = computed(() => {
    const list = this.services();
    const category = this.activeCategory();

    if (category === 'protections') {
      return list.filter(s => s.name.toLowerCase().includes('sigorta') || s.name.toLowerCase().includes('güvence'));
    } else if (category === 'corporate') {
      return [];
    } else {
      return list.filter(s => !s.name.toLowerCase().includes('sigorta') && !s.name.toLowerCase().includes('güvence'));
    }
  });

  ngOnInit(): void {
    this.serviceApi.getAll().subscribe({
      // HATA ÇÖZÜMÜ: res parametresine tip ataması yapıldı
      next: (res: ApiResponse<AdditionalService[]>) => {
        if (res.success && res.data) {
          this.services.set(res.data);
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  getServiceIcon(name: string): string {
    const n = name.toLowerCase();
    if (n.includes('bebek')) return '👶';
    if (n.includes('navigasyon')) return '📍';
    if (n.includes('sürücü')) return '👤';
    if (n.includes('sigorta') || n.includes('güvence')) return '🛡️';
    if (n.includes('wifi')) return '📶';
    return '📦';
  }
}