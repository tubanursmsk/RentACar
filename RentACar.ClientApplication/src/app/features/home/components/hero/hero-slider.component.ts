import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Slide {
  title: string;
  subtitle: string;
  ctaText: string;
  bgGradient: string;
  imageUrl: string;
}

@Component({
  selector: 'app-hero-slider',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="relative bg-avis-600 overflow-hidden">
      <!-- Slide içerikleri -->
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="relative min-h-[480px] md:min-h-[520px] flex items-center">

          <!-- Sol — Slide içerikleri -->
          <div class="relative z-10 max-w-xl py-12 md:py-20 flex-1">
            @for (slide of slides; track $index; let i = $index) {
              <div class="absolute top-1/2 -translate-y-1/2 transition-opacity duration-700"
                   [class.opacity-100]="currentIndex() === i"
                   [class.opacity-0]="currentIndex() !== i"
                   [class.pointer-events-none]="currentIndex() !== i">
                <h1 class="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight">
                  {{ slide.title }}
                </h1>
                <p class="mt-4 text-lg md:text-xl text-white/90">
                  {{ slide.subtitle }}
                </p>
                <button class="mt-6 inline-flex items-center gap-2 bg-white hover:bg-ink-100 text-avis-600 font-bold px-6 py-3 rounded-full transition">
                  {{ slide.ctaText }}
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M9 5l7 7-7 7"/>
                  </svg>
                </button>
              </div>
            }
            <!-- Spacer for layout (görünmez ama yer kaplar) -->
            <div class="opacity-0 pointer-events-none">
              <h1 class="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight">
                Placeholder Title<br>Two Lines
              </h1>
              <p class="mt-4 text-lg md:text-xl">Placeholder subtitle</p>
              <button class="mt-6 px-6 py-3">CTA</button>
            </div>
          </div>

          <!-- Sağ — Araç görseli (büyük ekranda) -->
          <div class="hidden lg:block relative flex-shrink-0 w-[480px]">
            @for (slide of slides; track $index; let i = $index) {
              <div class="absolute inset-0 transition-opacity duration-700 flex items-center justify-center"
                   [class.opacity-100]="currentIndex() === i"
                   [class.opacity-0]="currentIndex() !== i">
                <div class="text-9xl">🚗</div>
              </div>
            }
          </div>
        </div>

        <!-- Slider Kontrolleri -->
        <div class="absolute bottom-6 left-4 sm:left-6 lg:left-8 flex items-center gap-3 z-20">
          <button (click)="prev()"
                  class="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur flex items-center justify-center transition">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>

          <div class="flex gap-2">
            @for (slide of slides; track $index; let i = $index) {
              <button (click)="goTo(i)"
                      class="w-2 h-2 rounded-full transition-all"
                      [class.bg-white]="currentIndex() === i"
                      [class.w-6]="currentIndex() === i"
                      [class.bg-white\\/40]="currentIndex() !== i">
              </button>
            }
          </div>

          <button (click)="next()"
                  class="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur flex items-center justify-center transition">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Dekoratif geometrik şekiller -->
      <div class="absolute top-0 right-0 w-full h-full pointer-events-none overflow-hidden">
        <div class="absolute -top-20 -right-20 w-96 h-96 bg-avis-500/30 rounded-full blur-3xl"></div>
        <div class="absolute -bottom-32 right-1/4 w-72 h-72 bg-avis-700/40 rounded-full blur-3xl"></div>
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
      bgGradient: 'from-avis-600 to-avis-800',
      imageUrl: ''
    },
    {
      title: 'Yeni nesil elektrikli araç filomuz hizmetinizde',
      subtitle: 'Çevreyi düşünen ve teknolojiyi seven sürücüler için.',
      ctaText: 'ELEKTRİKLİ ARAÇLAR',
      bgGradient: 'from-avis-700 to-avis-900',
      imageUrl: ''
    },
    {
      title: 'Kurumsal müşterilerimize özel filo yönetim çözümleri',
      subtitle: 'İşletmenizin ulaşım ihtiyaçlarına en uygun paketi keşfedin.',
      ctaText: 'KURUMSAL ÇÖZÜMLER',
      bgGradient: 'from-avis-600 to-avis-800',
      imageUrl: ''
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