import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../core/services/seo.service';
import { SEO_CONFIG } from '../../core/services/seo.config';

interface Campaign {
  id: number;
  title: string;
  imageIcon: string;
  bgColor: string;
  validUntil: string;
  description: string;
}

@Component({
  selector: 'app-campaigns',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <!-- ═══════════════════════════════════════════════════ -->
    <!-- HERO — Ofisler sayfasıyla birebir aynı desen         -->
    <!-- ═══════════════════════════════════════════════════ -->
    <div class="relative bg-ink-900 overflow-hidden">
      <div class="absolute inset-0 opacity-20 bg-cover bg-center" style="background-image: url('assets/cars/hero-1.png');"></div>
      <div class="absolute inset-0 bg-gradient-to-r from-ink-900 to-transparent"></div>

      <div class="relative page-container mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24 z-10">
        <div class="text-sm font-bold text-white/80 tracking-widest uppercase mb-2">
          <a routerLink="/" class="hover:text-white transition">Ana Sayfa</a> > Kampanyalar
        </div>
        <h1 class="text-3xl md:text-5xl font-extrabold text-white mb-4">Kampanyalar</h1>
        <p class="text-lg text-ink-300 max-w-2xl">
          Size özel fırsatları kaçırmayın! RentACar'ın ayrıcalıklı dünyasında seyahatlerinizi daha avantajlı hale getirecek güncel kampanyalarımızı keşfedin.
        </p>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════ -->
    <!-- KAMPANYA GRID                                        -->
    <!-- ═══════════════════════════════════════════════════ -->
    <div class="page-container mx-auto px-4 sm:px-6 lg:px-8 py-16 min-h-[500px]">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        @for (campaign of campaigns(); track campaign.id) {
          <div class="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-2xl transition-all duration-300 flex flex-col h-full cursor-pointer">

            <div [class]="'h-48 flex items-center justify-center relative overflow-hidden ' + campaign.bgColor">
               <div class="text-7xl group-hover:scale-110 transition-transform duration-500 shadow-sm">
                  {{ campaign.imageIcon }}
               </div>
               <div class="absolute bottom-0 left-0 w-full h-1.5 bg-brand-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
            </div>

            <div class="p-6 flex flex-col flex-1">
              <h3 class="text-xl font-extrabold text-gray-900 mb-3 group-hover:text-brand-600 transition-colors leading-tight">
                {{ campaign.title }}
              </h3>
              <p class="text-gray-500 text-sm leading-relaxed mb-6 flex-1 line-clamp-2">
                {{ campaign.description }}
              </p>

              <div class="pt-4 border-t border-gray-100 flex flex-col gap-4">
                <div class="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest">
                  <svg class="w-4 h-4 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                  Son Geçerlilik: {{ campaign.validUntil }}
                </div>
                 <div class="flex items-center text-brand-600 font-extrabold text-sm tracking-wider group-hover:text-avis-700 transition-colors">
                  DETAYLI BİLGİ
                  <svg class="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M9 5l7 7-7 7"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class CampaignsComponent implements OnInit {
  private seo = inject(SeoService);   // ⭐ SEO servisi

  ngOnInit(): void {
    // ⭐ SEO uygula
    this.seo.updateSeo(SEO_CONFIG['campaigns']);
  }

  campaigns = signal<Campaign[]>([
    {
      id: 1,
      title: 'Yolculuğa Başlamanın En İyi Yolu RentACar!',
      imageIcon: '🚗',
      bgColor: 'bg-gradient-to-r from-red-50 to-red-100',
      validUntil: '31.12.2026',
      description: 'RentACar ile yapacağınız 3 gün ve üzeri kiralamalarda anında %15 indirim fırsatını yakalayın.'
    },
    {
      id: 2,
      title: 'Hafta Sonu Kaçamağına Özel Fırsat',
      imageIcon: '🎒',
      bgColor: 'bg-gradient-to-r from-gray-50 to-gray-200',
      validUntil: '15.06.2026',
      description: 'Cuma alıp Pazartesi teslim edeceğiniz araçlarda "Hafta Sonu" özel tarifemizden yararlanın.'
    },
    {
      id: 3,
      title: 'Erken Rezervasyon ile Kazan!',
      imageIcon: '⏳',
      bgColor: 'bg-gradient-to-r from-red-100 to-red-50',
      validUntil: '30.08.2026',
      description: 'Kiralamanızı 30 gün önceden yapın, dilediğiniz ek hizmeti (Bebek koltuğu, Navigasyon vb.) ücretsiz ekleyelim.'
    },
    {
      id: 4,
      title: 'Elektrikli Araçlarda Çifte Puan Şansı',
      imageIcon: '⚡',
      bgColor: 'bg-gradient-to-r from-gray-200 to-gray-100',
      validUntil: '31.12.2026',
      description: 'Sürdürülebilir bir gelecek için elektrikli veya hibrit araç kiralayın, hesabınıza çifte sadakat puanı yüklensin.'
    },
    {
      id: 5,
      title: 'Uzun Dönem Kiralamalarda Özel İndirim',
      imageIcon: '📅',
      bgColor: 'bg-gradient-to-r from-red-50 to-red-100',
      validUntil: '31.12.2026',
      description: '30 gün ve üzeri kiralamalarda toplam ücret üzerinden %20 indirim fırsatını kaçırmayın.'
    },
    {
      id: 6,
      title: 'Öğrencilere Özel Kampanya',
      imageIcon: '🎓',
      bgColor: 'bg-gradient-to-r from-gray-50 to-gray-200',
      validUntil: '30.09.2026',
      description: 'Geçerli öğrenci kimliği ile yapılan kiralamalarda anında %10 indirim fırsatı sizi bekliyor.'
    }
  ]);
}