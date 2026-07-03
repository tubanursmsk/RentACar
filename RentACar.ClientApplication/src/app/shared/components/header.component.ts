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
      <!-- Geniş layout: max-w-[1600px], daha az kenar boşluğu -->
      <div class="max-w-[1600px] mx-auto px-6 lg:px-8">
        <div class="flex items-center h-16">


        
         <!-- Sol Alan -->
         <div class="flex items-center gap-12">



          <!-- ═══ Logo ═══ -->
          <a routerLink="/" class="flex items-center gap-2 flex-shrink-0 group">
            <div class="w-9 h-9 bg-brand-600 rounded-lg flex items-center justify-center group-hover:bg-brand-700 transition">
              <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
              </svg>
            </div>
            <span class="text-lg font-extrabold text-ink-900 tracking-tight">RentACar</span>
          </a>

          <!-- ═══ Orta: Menü Linkleri ═══ -->
          <nav class="hidden lg:flex items-center gap-4">
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
          </nav>

          </div>



            <!-- Sağ Alan -->
            <div class="ml-auto flex items-center gap-3">



            <!-- Dil seçici (çalışır dropdown) -->
            <div class="relative">
              <button (click)="toggleLangMenu()"
                      class="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-ink-100 transition text-sm font-semibold text-ink-700">
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

            @if (auth.isAuthenticated()) {
              <!-- Giriş yapmış: Profil ikonu + dropdown -->
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
                    <a routerLink="/profil" (click)="closeMenus()"
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
              <!-- Giriş yapmamış: Sadece "Giriş Yap" -->
              <a routerLink="/login"
                 class="inline-flex items-center px-4 py-2 text-sm font-semibold
                        bg-ink-900 hover:bg-ink-800 text-white rounded-full transition">
                Giriş Yap
              </a>
            }

            <!-- Mobil menü butonu -->
            <button (click)="toggleMobileMenu()" class="lg:hidden p-2 text-ink-700">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
 
      <!-- ═══ Mobil Menü ═══ -->
      @if (isMobileMenuOpen()) {
        <div class="lg:hidden border-t border-ink-100 bg-white animate-fade-in">
          <nav class="px-4 py-3 space-y-1">
            <a routerLink="/rezervasyonlarim" (click)="closeMenus()" class="block py-2.5 text-sm font-semibold text-ink-700 hover:text-brand-600">Rezervasyon Yönetimi</a>
            <a routerLink="/araclar" (click)="closeMenus()" class="block py-2.5 text-sm font-semibold text-ink-700 hover:text-brand-600">Araçlar</a>
            <a routerLink="/kampanyalar" (click)="closeMenus()" class="block py-2.5 text-sm font-semibold text-ink-700 hover:text-brand-600">Kampanyalar</a>
            <a routerLink="/hizmetler" (click)="closeMenus()" class="block py-2.5 text-sm font-semibold text-ink-700 hover:text-brand-600">Hizmetler</a>
            <a routerLink="/ofisler" (click)="closeMenus()" class="block py-2.5 text-sm font-semibold text-ink-700 hover:text-brand-600">Ofisler</a>
          </nav>
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
  }

  toggleLangMenu(): void {
    this.isLangMenuOpen.update(v => !v);
    this.isUserMenuOpen.set(false);
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update(v => !v);
  }

  setLang(lang: 'TR' | 'EN'): void {
    this.currentLang.set(lang);
    this.isLangMenuOpen.set(false);
    // TODO: ngx-translate ile gerçek dil değişimi (sonraki modül)
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
    if (!target.closest('.relative')) {
      this.isUserMenuOpen.set(false);
      this.isLangMenuOpen.set(false);
    }
  }
}