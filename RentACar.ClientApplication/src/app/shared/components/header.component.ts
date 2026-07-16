import { Component, HostListener, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <header class="sticky top-0 z-50 bg-white border-b border-ink-200">
      <div class="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center h-16">

          <!-- Sol Alan -->
          <div class="flex items-center gap-10">

            <!-- ═══ Logo ═══ -->
            <a routerLink="/" class="flex items-center gap-2 flex-shrink-0 group">
              <div class="w-9 h-9 bg-brand-600 rounded-lg flex items-center justify-center group-hover:bg-brand-700 transition">
                <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
                </svg>
              </div>
              <span class="text-lg font-extrabold text-ink-900 tracking-tight">RentACar</span>
            </a>

            <!-- ═══ Desktop Menü Linkleri ═══ -->
            <nav class="hidden lg:flex items-center gap-1">
              <a routerLink="/rezervasyonlarim" routerLinkActive="text-brand-600"
                 class="px-2 py-2 text-sm font-semibold text-ink-700 hover:text-ink-900 hover:bg-ink-100 rounded-lg transition">
                Rezervasyon Yönetimi
              </a>
              <a routerLink="/araclar" routerLinkActive="text-brand-600"
                 class="px-2 py-2 text-sm font-semibold text-ink-700 hover:text-ink-900 hover:bg-ink-100 rounded-lg transition">
                Araçlar
              </a>
              <a routerLink="/kampanyalar" routerLinkActive="text-brand-600"
                 class="px-2 py-2 text-sm font-semibold text-ink-700 hover:text-ink-900 hover:bg-ink-100 rounded-lg transition">
                Kampanyalar
              </a>
              <a routerLink="/hizmetler" routerLinkActive="text-brand-600"
                 class="px-2 py-2 text-sm font-semibold text-ink-700 hover:text-ink-900 hover:bg-ink-100 rounded-lg transition">
                Hizmetler
              </a>
              <a routerLink="/ofisler" routerLinkActive="text-brand-600"
                 class="px-2 py-2 text-sm font-semibold text-ink-700 hover:text-ink-900 hover:bg-ink-100 rounded-lg transition">
                Ofisler
              </a>
              <a routerLink="/hakkimizda" routerLinkActive="text-brand-600"
                 class="px-2 py-2 text-sm font-semibold text-ink-700 hover:text-ink-900 hover:bg-ink-100 rounded-lg transition">
                Hakkımızda
              </a>
              <a routerLink="/iletisim" routerLinkActive="text-brand-600"
                 class="px-2 py-2 text-sm font-semibold text-ink-700 hover:text-ink-900 hover:bg-ink-100 rounded-lg transition">
                İletişim
              </a>
              <a routerLink="/kiralama-kosullari" routerLinkActive="text-brand-600"
                 class="px-2 py-2 text-sm font-semibold text-ink-700 hover:text-ink-900 hover:bg-ink-100 rounded-lg transition">
                Kiralama Koşulları
              </a>
            </nav>

          </div>

          <!-- Sağ Alan -->
          <div class="ml-auto flex items-center gap-2 sm:gap-3">

            <!-- Dil seçici (mobil+desktop) -->
            <div class="relative">
              <button (click)="toggleLangMenu()"
                      class="flex items-center gap-1.5 px-2 sm:px-3 py-2 rounded-lg hover:bg-ink-100 transition text-sm font-semibold text-ink-700">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                {{ currentLang() }}
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>

              @if (isLangMenuOpen()) {
                <div class="absolute right-0 top-full mt-2 w-32 bg-white rounded-xl shadow-card-hover border border-ink-100 py-1 animate-fade-in z-50">
                  <button (click)="setLang('TR')"
                          class="w-full text-left px-4 py-2 text-sm hover:bg-ink-100 flex items-center gap-2"
                          [class.font-bold]="currentLang() === 'TR'"
                          [class.text-brand-600]="currentLang() === 'TR'">
                    🇹🇷 Türkçe
                  </button>
                  <button (click)="setLang('EN')"
                          class="w-full text-left px-4 py-2 text-sm hover:bg-ink-100 flex items-center gap-2"
                          [class.font-bold]="currentLang() === 'EN'"
                          [class.text-brand-600]="currentLang() === 'EN'">
                    🇬🇧 English
                  </button>
                </div>
              }
            </div>

            <!-- ═══ DESKTOP: Kullanıcı ═══ (lg ve üstünde) -->
            <div class="hidden lg:block">
              @if (auth.isAuthenticated()) {
                <div class="relative">
                  <button (click)="toggleUserMenu()"
                          class="flex items-center gap-2 pl-2 pr-2 py-1.5 rounded-full
                                 border border-ink-200 hover:shadow-card transition">
                    <svg class="w-4 h-4 text-ink-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
                    </svg>
                    <div class="w-7 h-7 bg-brand-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {{ getInitials() }}
                    </div>
                  </button>

                  @if (isUserMenuOpen()) {
                    <div class="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-card-hover
                                border border-ink-100 py-2 animate-fade-in z-50">
                      <div class="px-4 py-2 border-b border-ink-100">
                        <p class="font-semibold text-sm">{{ auth.user()?.firstName }} {{ auth.user()?.lastName }}</p>
                        <p class="text-xs text-ink-500 truncate">{{ auth.user()?.email }}</p>
                      </div>
                      <a routerLink="/profile" (click)="closeMenus()"
                         class="block px-4 py-2 text-sm text-ink-700 hover:bg-ink-100">Profilim</a>
                      <a routerLink="/rezervasyonlarim" (click)="closeMenus()"
                         class="block px-4 py-2 text-sm text-ink-700 hover:bg-ink-100">Rezervasyonlarım</a>
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
                <a routerLink="/login"
                   class="inline-flex items-center px-4 py-2 text-sm font-semibold
                          bg-ink-900 hover:bg-ink-800 text-white rounded-full transition">
                  Giriş Yap
                </a>
              }
            </div>

            <!-- ═══ MOBİL: Tek Hamburger Butonu ═══ (lg altında) -->
            <button (click)="toggleMobileMenu()"
                    class="lg:hidden flex items-center gap-2 pl-2 pr-2 py-1.5 rounded-full
                           border border-ink-200 hover:shadow-card transition">
              <!-- Hamburger ikonu -->
              <svg class="w-4 h-4 text-ink-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                @if (isMobileMenuOpen()) {
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                } @else {
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
                }
              </svg>

              <!-- Avatar (giriş yaptıysa) veya kullanıcı ikonu -->
              @if (auth.isAuthenticated()) {
                <div class="w-7 h-7 bg-brand-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {{ getInitials() }}
                </div>
              } @else {
                <div class="w-7 h-7 bg-ink-100 rounded-full flex items-center justify-center">
                  <svg class="w-4 h-4 text-ink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                </div>
              }
            </button>
          </div>
        </div>
      </div>

      <!-- ═══════════════════════════════════════════════════════════════ -->
      <!-- ═══ MOBİL Dropdown — Kullanıcı + Nav + Aksiyonlar Tek Panel ═══ -->
      <!-- ═══════════════════════════════════════════════════════════════ -->
      @if (isMobileMenuOpen()) {
        <div class="lg:hidden border-t border-ink-100 bg-white animate-fade-in shadow-lg">

          <!-- ─── Üst: Kullanıcı Bölümü ─── -->
          @if (auth.isAuthenticated()) {
            <!-- Giriş yapmış: Kullanıcı kartı -->
            <div class="px-4 py-4 bg-gradient-to-br from-brand-50 to-white border-b border-ink-100">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 bg-brand-600 rounded-full flex items-center justify-center text-white text-base font-bold">
                  {{ getInitials() }}
                </div>
                <div class="min-w-0 flex-1">
                  <p class="font-bold text-ink-900 truncate">
                    {{ auth.user()?.firstName }} {{ auth.user()?.lastName }}
                  </p>
                  <p class="text-xs text-ink-500 truncate">{{ auth.user()?.email }}</p>
                </div>
              </div>

              <!-- Hızlı aksiyonlar -->
              <div class="grid grid-cols-2 gap-2 mt-3">
                <a routerLink="/profile" (click)="closeMenus()"
                   class="flex items-center justify-center gap-2 px-3 py-2 bg-white border border-ink-200 rounded-lg text-sm font-semibold text-ink-700 hover:bg-ink-100 transition">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                  Profilim
                </a>
                <a routerLink="/rezervasyonlarim" (click)="closeMenus()"
                   class="flex items-center justify-center gap-2 px-3 py-2 bg-white border border-ink-200 rounded-lg text-sm font-semibold text-ink-700 hover:bg-ink-100 transition">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                  </svg>
                  Rezervasyonlar
                </a>
              </div>
            </div>
          } @else {
            <!-- Giriş yapmamış: Büyük "Giriş Yap" butonu -->
            <div class="px-4 py-4 bg-gradient-to-br from-brand-50 to-white border-b border-ink-100">
              <p class="text-sm text-ink-700 mb-3 text-center">
                Rezervasyonlarınızı yönetmek için giriş yapın
              </p>
              <div class="grid grid-cols-2 gap-2">
                <a routerLink="/login" (click)="closeMenus()"
                   class="flex items-center justify-center px-4 py-2.5 rounded-full text-sm font-bold bg-ink-900 hover:bg-ink-800 text-white transition">
                  Giriş Yap
                </a>
                <a routerLink="/register" (click)="closeMenus()"
                   class="flex items-center justify-center px-4 py-2.5 rounded-full text-sm font-bold bg-white border border-ink-200 hover:bg-ink-100 text-ink-700 transition">
                  Kayıt Ol
                </a>
              </div>
            </div>
          }

          <!-- ─── Orta: Navigasyon Linkleri ─── -->
          <nav class="px-2 py-2">
            <a routerLink="/araclar" routerLinkActive="bg-brand-50 text-brand-600" (click)="closeMenus()"
               class="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold text-ink-700 hover:bg-ink-100 transition">
              <span>🚗</span> Araçlar
            </a>
            <a routerLink="/kampanyalar" routerLinkActive="bg-brand-50 text-brand-600" (click)="closeMenus()"
               class="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold text-ink-700 hover:bg-ink-100 transition">
              <span>🎁</span> Kampanyalar
            </a>
            <a routerLink="/hizmetler" routerLinkActive="bg-brand-50 text-brand-600" (click)="closeMenus()"
               class="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold text-ink-700 hover:bg-ink-100 transition">
              <span>✨</span> Hizmetler
            </a>
            <a routerLink="/ofisler" routerLinkActive="bg-brand-50 text-brand-600" (click)="closeMenus()"
               class="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold text-ink-700 hover:bg-ink-100 transition">
              <span>📍</span> Ofisler
            </a>

            <div class="border-t border-ink-100 my-2"></div>

            <a routerLink="/hakkimizda" routerLinkActive="bg-brand-50 text-brand-600" (click)="closeMenus()"
               class="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold text-ink-700 hover:bg-ink-100 transition">
              <span>🏆</span> Hakkımızda
            </a>
            <a routerLink="/iletisim" routerLinkActive="bg-brand-50 text-brand-600" (click)="closeMenus()"
               class="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold text-ink-700 hover:bg-ink-100 transition">
              <span>📞</span> İletişim
            </a>
            <a routerLink="/kiralama-kosullari" routerLinkActive="bg-brand-50 text-brand-600" (click)="closeMenus()"
               class="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold text-ink-700 hover:bg-ink-100 transition">
              <span>📋</span> Kiralama Koşulları
            </a>
            <a routerLink="/sikca-sorulan-sorular" routerLinkActive="bg-brand-50 text-brand-600" (click)="closeMenus()"
               class="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold text-ink-700 hover:bg-ink-100 transition">
              <span>❓</span> Sık Sorulan Sorular
            </a>
          </nav>

          <!-- ─── Alt: Çıkış (giriş yaptıysa) ─── -->
          @if (auth.isAuthenticated()) {
            <div class="border-t border-ink-100 px-2 py-2">
              <button (click)="logout()"
                      class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold text-accent-danger hover:bg-red-50 transition">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                </svg>
                Çıkış Yap
              </button>
            </div>
          }
        </div>
      }
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
    this.isMobileMenuOpen.set(false);
  }

  toggleLangMenu(): void {
    this.isLangMenuOpen.update(v => !v);
    this.isUserMenuOpen.set(false);
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update(v => !v);
    this.isUserMenuOpen.set(false);
    this.isLangMenuOpen.set(false);
  }

  setLang(lang: 'TR' | 'EN'): void {
    this.currentLang.set(lang);
    this.isLangMenuOpen.set(false);
  }

  closeMenus(): void {
    this.isUserMenuOpen.set(false);
    this.isLangMenuOpen.set(false);
    this.isMobileMenuOpen.set(false);
  }

  logout(): void {
    this.closeMenus();
    this.auth.logout();
  }

  getInitials(): string {
    const u = this.auth.user();
    if (!u) return '?';
    return `${u.firstName?.[0] || ''}${u.lastName?.[0] || ''}`.toUpperCase();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    // Sadece dil seçici ve kullanıcı menüsü için outside-click kapat
    // Mobil menü için kullanıcı X'e basmalı
    if (!target.closest('.relative')) {
      this.isUserMenuOpen.set(false);
      this.isLangMenuOpen.set(false);
    }
  }
}