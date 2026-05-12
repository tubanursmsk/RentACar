import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Slide {
  title: string;
  subtitle: string;
  ctaText: string;
  carEmoji: string;
}

@Component({
  selector: 'app-hero-slider',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="relative bg-avis-600 overflow-hidden min-h-[640px]">

      <!-- ═══ Diagonal SVG Arkaplan ═══ -->
      <svg class="absolute inset-0 w-full h-full pointer-events-none"
           preserveAspectRatio="none"
           viewBox="0 0 1440 640"
           xmlns="http://www.w3.org/2000/svg">
        <!-- Açık katman (sol-alt) -->
        <polygon points="0,640 580,0 0,0" fill="#e64560" opacity="0.25"/>
        <!-- Orta katman (sağ-üst) -->
        <polygon points="1440,0 700,640 1440,640" fill="#94143a" opacity="0.4"/>
        <!-- Koyu katman -->
        <polygon points="900,0 1440,0 1440,300 1100,640 750,640" fill="#7e1437" opacity="0.35"/>
        <!-- İnce diagonal şerit -->
        <polygon points="200,640 1100,0 1140,0 240,640" fill="#fff" opacity="0.04"/>
      </svg>

      <!-- ═══ Ana içerik ═══ -->
      <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="relative min-h-[640px] flex items-center">

          <!-- ─── Sol: Slide içerikleri ─── -->
          <div class="relative w-full lg:w-1/2 py-12 lg:py-0">
            @for (slide of slides; track $index; let i = $index) {
              <div class="transition-all duration-700"
                   [class.opacity-100]="currentIndex() === i"
                   [class.opacity-0]="currentIndex() !== i"
                   [class.relative]="currentIndex() === i"
                   [class.absolute]="currentIndex() !== i"
                   [class.inset-0]="currentIndex() !== i"
                   [class.pointer-events-none]="currentIndex() !== i">
                <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] tracking-tight">
                  {{ slide.title }}
                </h1>
                <p class="mt-5 text-lg lg:text-xl text-white/90 max-w-lg">
                  {{ slide.subtitle }}
                </p>
                <button class="mt-8 inline-flex items-center gap-3 bg-white hover:bg-ink-100 text-avis-600 font-bold px-8 py-4 rounded-full transition-all hover:gap-4 shadow-lg">
                  {{ slide.ctaText }}
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M9 5l7 7-7 7"/>
                  </svg>
                </button>
              </div>
            }
          </div>

          <!-- ─── Sağ: Büyük Araç Görseli (sadece desktop) ─── -->
          <div class="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 w-[55%] pointer-events-none">
            @for (slide of slides; track $index; let i = $index) {
              <div class="absolute inset-0 transition-all duration-700"
                   [class.opacity-100]="currentIndex() === i"
                   [class.opacity-0]="currentIndex() !== i"
                   [class.translate-x-0]="currentIndex() === i"
                   [class.translate-x-12]="currentIndex() !== i">
                <div class="flex items-center justify-center h-[500px]">
                  <!-- Eğer assets/cars/hero-car-X.png varsa onu göster, yoksa emoji -->
                  <span class="text-[280px] leading-none drop-shadow-2xl">
                    {{ slide.carEmoji }}
                  </span>
                </div>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- ═══ Slider Kontrolleri (alt sol, büyük) ═══ -->
      <div class="absolute bottom-8 left-4 sm:left-6 lg:left-8 z-20 flex items-center gap-4">
        <!-- Sol Ok -->
        <button (click)="prev()"
                aria-label="Önceki slayt"
                class="w-12 h-12 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md
                       flex items-center justify-center transition-all
                       border border-white/20 hover:scale-110">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>

        <!-- Noktalar -->
        <div class="flex items-center gap-2.5 px-3">
          @for (slide of slides; track $index; let i = $index) {
            <button (click)="goTo(i)"
                    [attr.aria-label]="'Slayt ' + (i+1)"
                    class="h-2 rounded-full transition-all duration-300"
                    [class.bg-white]="currentIndex() === i"
                    [class.w-8]="currentIndex() === i"
                    [class.bg-white\\/40]="currentIndex() !== i"
                    [class.w-2]="currentIndex() !== i"
                    [class.hover:bg-white\\/70]="currentIndex() !== i">
            </button>
          }
        </div>

        <!-- Sağ Ok -->
        <button (click)="next()"
                aria-label="Sonraki slayt"
                class="w-12 h-12 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md
                       flex items-center justify-center transition-all
                       border border-white/20 hover:scale-110">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/>
          </svg>
        </button>
      </div>
    </section>
  `
})
export class HeroSliderComponent implements OnInit, OnDestroy {
  protected slides: Slide[] = [
    {
      title: "RentACar'dan araç kiralarken ödemenizi online yapın, %30 indirim kazanın!",
      subtitle: 'Avantajlı kampanya fırsatlarını kaçırmayın.',
      ctaText: 'REZERVASYON YAP',
      carEmoji: '🚙'
    },
    {
      title: 'Yeni nesil elektrikli araç filomuz hizmetinizde',
      subtitle: 'Çevreyi düşünen ve teknolojiyi seven sürücüler için.',
      ctaText: 'ELEKTRİKLİ ARAÇLAR',
      carEmoji: '🚗'
    },
    {
      title: 'Kurumsal müşterilerimize özel filo yönetim çözümleri',
      subtitle: 'İşletmenizin ulaşım ihtiyaçlarına en uygun paketi keşfedin.',
      ctaText: 'KURUMSAL ÇÖZÜMLER',
      carEmoji: '🚐'
    }
  ];

  protected currentIndex = signal(0);
  private intervalId: any;

  ngOnInit(): void {
    this.startAutoPlay();
  }

  ngOnDestroy(): void {
    this.stopAutoPlay();
  }

  next(): void {
    this.currentIndex.update(i => (i + 1) % this.slides.length);
    this.restartAutoPlay();
  }

  prev(): void {
    this.currentIndex.update(i => (i - 1 + this.slides.length) % this.slides.length);
    this.restartAutoPlay();
  }

  goTo(i: number): void {
    this.currentIndex.set(i);
    this.restartAutoPlay();
  }

  private startAutoPlay(): void {
    this.intervalId = setInterval(() => this.next(), 6000);
  }

  private stopAutoPlay(): void {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  private restartAutoPlay(): void {
    this.stopAutoPlay();
    this.startAutoPlay();
  }
}