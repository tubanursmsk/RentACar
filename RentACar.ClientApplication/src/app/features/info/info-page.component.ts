import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { INFO_PAGES, InfoPage } from './info-pages.data';
import { ContactBarComponent } from '../../shared/components/contact-bar.component';

@Component({
  selector: 'app-info-page',
  standalone: true,
  imports: [CommonModule, RouterLink, ContactBarComponent],
  template: `
    <div class="bg-ink-100/30 min-h-screen">
      @if (page(); as p) {

        <!-- ═══════════════════════════════════════════════════ -->
        <!-- HERO — Ofisler sayfasıyla birebir aynı desen         -->
        <!-- ═══════════════════════════════════════════════════ -->
        <div class="relative bg-ink-900 overflow-hidden">
          <div class="absolute inset-0 opacity-20 bg-cover bg-center"
               style="background-image: url('assets/cars/hero-1.png');"></div>
          <div class="absolute inset-0 bg-gradient-to-r from-ink-900 to-transparent"></div>

          <div class="relative page-container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20 z-10">
            <!-- Breadcrumb -->
            
            <nav class="text-sm font-bold text-white/80 tracking-widest uppercase mb-2 flex items-center gap-2 flex-wrap">
              <a routerLink="/" class="hover:text-white transition">Ana Sayfa</a>
              <span>></span>
              <span>{{ p.breadcrumbGroup }}</span>
              <span>></span>
              <span class="text-white">{{ p.title }}</span>
            </nav>

            <!-- Başlık + Icon -->
            <div class="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
              <div class="text-5xl lg:text-6xl"></div>
              <div>
                <h1 class="text-3xl md:text-5xl font-extrabold text-white mb-3">{{ p.title }}</h1>
                @if (p.subtitle) {
                  <p class="text-lg text-ink-300 max-w-2xl leading-relaxed">{{ p.subtitle }}</p>
                }
              </div>
            </div>
          </div>
        </div>

        <!-- SADECE /iletisim slug'ında formu göster -->
        @if (p.slug === 'iletisim') {
          <app-contact-bar />
        }

        <!-- ═══ İçerik ═══ -->
        <div class="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 lg:py-12">
          <div class="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8">
            <!-- Ana içerik -->
            <div class="bg-white rounded-2xl shadow-card p-6 lg:p-10">
              @for (section of p.sections; track $index) {
                <section class="mb-8 last:mb-0">
                  @if (section.title) {
                    <h2 class="text-xl lg:text-2xl font-bold text-ink-900 mb-4 pb-2 border-b-2 border-brand-100">
                      {{ section.title }}
                    </h2>
                  }

                  @if (section.paragraphs) {
                    @for (paragraph of section.paragraphs; track $index) {
                      <p class="text-ink-700 leading-relaxed mb-4 last:mb-0">
                        {{ paragraph }}
                      </p>
                    }
                  }

                  @if (section.bullets) {
                    <ul class="space-y-3 mt-4">
                      @for (bullet of section.bullets; track $index) {
                        <li class="flex items-start gap-3 text-ink-700">
                          <span class="text-brand-600 mt-1 flex-shrink-0">
                            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
                            </svg>
                          </span>
                          <span class="leading-relaxed">{{ bullet }}</span>
                        </li>
                      }
                    </ul>
                  }
                </section>
              }

              <!-- CTA -->
              @if (p.cta) {
                <div class="mt-10 p-6 bg-brand-50 border border-brand-100 rounded-2xl text-center">
                  <p class="text-lg font-semibold text-ink-900 mb-4">{{ p.cta.text }}</p>
                  <a [routerLink]="p.cta.buttonLink"
                     class="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-brand-600 hover:bg-brand-700 text-white font-semibold transition">
                    {{ p.cta.buttonText }}
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/>
                    </svg>
                  </a>
                </div>
              }
            </div>

            <!-- Yan Panel: Aynı gruptaki diğer sayfalar -->
            <aside class="lg:sticky lg:top-24 lg:self-start">
              <div class="bg-white rounded-2xl shadow-card p-5">
                <h3 class="text-sm font-bold text-ink-500 uppercase tracking-wide mb-4">
                  {{ p.breadcrumbGroup }}
                </h3>
                <nav class="space-y-1">
                  @for (relatedPage of relatedPages(); track relatedPage.slug) {
                    <a [routerLink]="'/' + relatedPage.slug"
                       class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition"
                       [class.bg-brand-50]="relatedPage.slug === p.slug"
                       [class.text-brand-700]="relatedPage.slug === p.slug"
                       [class.font-semibold]="relatedPage.slug === p.slug"
                       [class.text-ink-700]="relatedPage.slug !== p.slug"
                       [class.hover:bg-ink-50]="relatedPage.slug !== p.slug">
                      <span>{{ relatedPage.title }}</span>
                    </a>
                  }
                </nav>
              </div>

              <!-- İletişim kutusu -->
              <div class="bg-white rounded-2xl shadow-card p-5 mt-4">
                <h3 class="font-bold text-ink-900 mb-2">Yardıma mı ihtiyacınız var?</h3>
                <p class="text-sm text-ink-500 mb-3">
                  Sorularınız için 7/24 çağrı merkezimiz hizmetinizde.
                </p>
                <a routerLink="/iletisim"
                   class="text-sm font-semibold text-brand-600 hover:underline">
                  📞 İletişime Geç
                </a>
              </div>
            </aside>
          </div>
        </div>
      } @else {
        <div class="max-w-2xl mx-auto px-4 py-20 text-center">
          <div class="text-6xl mb-4">📄</div>
          <h1 class="text-2xl font-bold text-ink-900 mb-3">Sayfa bulunamadı</h1>
          <p class="text-ink-500 mb-6">
            Aradığınız sayfa mevcut değil veya taşınmış olabilir.
          </p>
          <a routerLink="/"
             class="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-brand-600 hover:bg-brand-700 text-white font-semibold transition">
            Ana Sayfaya Dön
          </a>
        </div>
      }
    </div>
  `
})
export class InfoPageComponent implements OnInit {
  private route = inject(ActivatedRoute);

  protected page = signal<InfoPage | null>(null);

  protected relatedPages = computed(() => {
    const current = this.page();
    if (!current) return [];
    return INFO_PAGES.filter(p => p.breadcrumbGroup === current.breadcrumbGroup);
  });

  ngOnInit(): void {
    this.route.data.subscribe(data => {
      const slug = data['slug'] as string;
      const found = INFO_PAGES.find(p => p.slug === slug);
      this.page.set(found ?? null);
      window.scrollTo({ top: 0, behavior: 'instant' });
    });
  }
}