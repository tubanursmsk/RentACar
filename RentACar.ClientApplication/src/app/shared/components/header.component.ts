import { Component, HostListener, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <header class="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-ink-200">
      <div class="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16 lg:h-18 gap-6">

          <!-- ═══ Logo (Kompakt) ═══ -->
          <a routerLink="/" class="flex items-center gap-2 flex-shrink-0 group">
            <div class="w-9 h-9 bg-brand-600 rounded-xl flex items-center justify-center group-hover:bg-brand-700 transition">
              <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
              </svg>
            </div>
            <span class="text-xl font-extrabold text-ink-900 tracking-tight">
              RentACar
            </span>
          </a>

          <!-- ═══ Ana Menü (5 item) ═══ -->
          <nav class="hidden lg:flex items-center gap-1 flex-1 justify-center">
            <a routerLink="/rezervasyonlarim"
               class="px-3 py-2 text-sm font-semibold text-ink-700 hover:text-ink-900 hover:bg-ink-100 rounded-lg transition">
              Rezervasyon Yönetimi
            </a>
            <a routerLink="/araclar"
               class="px-3 py-2 text-sm font-semibold text-ink-700 hover:text-ink-900 hover:bg-ink-100 rounded-lg transition">
              Araçlar
            </a>
            <a routerLink="/kampanyalar"
               class="px-3 py-2 text-sm font-semibold text-ink-700 hover:text-ink-900 hover:bg-ink-100 rounded-lg transition">
              Kampanyalar
            </a>
            <a routerLink="/hizmetler"
               class="px-3 py-2 text-sm font-semibold text-ink-700 hover:text-ink-900 hover:bg-ink-100 rounded-lg transition">
              Hizmetler
            </a>
            <a routerLink="/ofisler"
               class="px-3 py-2 text-sm font-semibold text-ink-700 hover:text-ink-900 hover:bg-ink-100 rounded-lg transition">
              Ofisler
            </a>
          </nav>

          <!-- ═══ Sağ Menü ═══ -->
          <div class="flex items-center gap-2 flex-shrink-0">

            <!-- Küçük arama ikonu (turo tarzı) -->
            <button (click)="focusSearch()"
                    class="hidden md:flex w-9 h-9 items-center justify-center rounded-full
                           border border-ink-200 hover:border-ink-400 hover:shadow-card transition"
                    title="Ara">
              <svg class="w-4 h-4 text-ink-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </button>

            <!-- Dil seçici (dropdown) -->
            <div class="relative hidden sm:block">
              <button (click)="toggleLangMenu()"
                      class="flex items-center gap-1 px-3 py-2 rounded-lg
                             hover:bg-ink-100 transition text-sm font-semibold text-ink-700">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                {{ currentLang() }}
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>

              @if (isLangMenuOpen()) {
                <div class="absolute right-0 top-full mt-2 w-32 bg-white rounded-card shadow-card-hover
                            border border-ink-100 py-1 animate-fade-in">
                  <button (click)="selectLang('TR')"
                          class="w-full text-left px-4 py-2 text-sm hover:bg-ink-100 transition flex items-center gap-2">
                    🇹🇷 Türkçe
                  </button>
                  <button (click)="selectLang('EN')"
                          class="w-full text-left px-4 py-2 text-sm hover:bg-ink-100 transition flex items-center gap-2">
                    🇬🇧 English
                  </button>
                </div>
              }
            </div>

            <!-- Kullanıcı Menu / Login -->
            @if (auth.isAuthenticated()) {
              <div class="relative">
                <button (click)="toggleUserMenu()"
                        class="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full
                               border border-ink-200 hover:shadow-card transition">
                  <svg class="w-4 h-4 text-ink-700 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M4 6h16M4 12h16M4 18h16"/>
                  </svg>
                  <div class="w-8 h-8 bg-brand-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {{ getInitials() }}
                  </div>
                </button>

                @if (isUserMenuOpen()) {
                  <div class="absolute right-0 top-full mt-2 w-56 bg-white rounded-card shadow-card-hover
                              border border-ink-100 py-2 animate-fade-in">
                    <div class="px-4 py-2 border-b border-ink-100">
                      <p class="font-semibold text-sm">{{ auth.user()?.firstName }} {{ auth.user()?.lastName }}</p>
                      <p class="text-xs text-ink-500">{{ auth.user()?.email }}</p>
                    </div>
                    <a routerLink="/profil" (click)="closeMenu()"
                       class="block px-4 py-2 text-sm text-ink-700 hover:bg-ink-100">
                      Profilim
                    </a>
                    <a routerLink="/rezervasyonlarim" (click)="closeMenu()"
                       class="block px-4 py-2 text-sm text-ink-700 hover:bg-ink-100">
                      Rezervasyonlarım
                    </a>
                    <a routerLink="/favorilerim" (click)="closeMenu()"
                       class="block px-4 py-2 text-sm text-ink-700 hover:bg-ink-100">
                      Favorilerim
                    </a>
                    <div class="border-t border-ink-100 mt-2 pt-2">
                      <button (click)="logout()"
                              class="block w-full text-left px-4 py-2 text-sm text-accent-danger hover:bg-ink-100">
                        Çıkış Yap
                      </button>
                    </div>
                  </div>
                }
              </div>
            } @else {
              <!-- Tek "Giriş Yap" butonu -->
              <a routerLink="/login"
                 class="inline-flex items-center px-4 py-2 text-sm font-semibold
                        bg-ink-900 hover:bg-ink-800 text-white rounded-full transition">
                Giriş Yap
              </a>
            }

            <!-- Mobil menü butonu -->
            <button (click)="toggleMobileMenu()"
                    class="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-ink-100 transition">
              <svg class="w-5 h-5 text-ink-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- ═══ Mobil Menü ═══ -->
        @if (isMobileMenuOpen()) {
          <div class="lg:hidden py-4 border-t border-ink-100 animate-fade-in">
            <nav class="flex flex-col gap-1">
              <a routerLink="/rezervasyonlarim" (click)="closeMobileMenu()"
                 class="px-3 py-2.5 text-sm font-semibold text-ink-700 hover:bg-ink-100 rounded-lg">
                Rezervasyon Yönetimi
              </a>
              <a routerLink="/araclar" (click)="closeMobileMenu()"
                 class="px-3 py-2.5 text-sm font-semibold text-ink-700 hover:bg-ink-100 rounded-lg">
                Araçlar
              </a>
              <a routerLink="/kampanyalar" (click)="closeMobileMenu()"
                 class="px-3 py-2.5 text-sm font-semibold text-ink-700 hover:bg-ink-100 rounded-lg">
                Kampanyalar
              </a>
              <a routerLink="/hizmetler" (click)="closeMobileMenu()"
                 class="px-3 py-2.5 text-sm font-semibold text-ink-700 hover:bg-ink-100 rounded-lg">
                Hizmetler
              </a>
              <a routerLink="/ofisler" (click)="closeMobileMenu()"
                 class="px-3 py-2.5 text-sm font-semibold text-ink-700 hover:bg-ink-100 rounded-lg">
                Ofisler
              </a>
            </nav>
          </div>
        }
      </div>
    </header>
  `
})
export class HeaderComponent {
  protected auth = inject(AuthService);
  private router = inject(Router);

  protected isUserMenuOpen = signal(false);
  protected isLangMenuOpen = signal(false);
  protected isMobileMenuOpen = signal(false);
  protected currentLang = signal<'TR' | 'EN'>('TR');

  toggleUserMenu(): void {
    this.isUserMenuOpen.update(v => !v);
    this.isLangMenuOpen.set(false);
  }

  toggleLangMenu(): void {
    this.isLangMenuOpen.update(v => !v);
    this.isUserMenuOpen.set(false);
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update(v => !v);
  }

  closeMenu(): void {
    this.isUserMenuOpen.set(false);
    this.isLangMenuOpen.set(false);
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }

  selectLang(lang: 'TR' | 'EN'): void {
    this.currentLang.set(lang);
    this.isLangMenuOpen.set(false);
    // TODO: ngx-translate ile gerçek dil değişimi (sonraki turda)
  }

  logout(): void {
    this.closeMenu();
    this.auth.logout();
  }

  focusSearch(): void {
    if (this.router.url === '/') {
      const el = document.querySelector('#hero-search');
      el?.scrollIntoView({ behavior: 'smooth' });
    } else {
      this.router.navigate(['/']);
    }
  }

  getInitials(): string {
    const u = this.auth.user();
    if (!u) return '?';
    return `${u.firstName?.[0] || ''}${u.lastName?.[0] || ''}`.toUpperCase();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.relative')) {
      this.isUserMenuOpen.set(false);
      this.isLangMenuOpen.set(false);
    }
  }
}