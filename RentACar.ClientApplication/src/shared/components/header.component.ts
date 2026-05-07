import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../app/core/services/auth.service';


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <header class="sticky top-0 z-50">
      <!-- Üst Şerit (Logo + Kullanıcı Linkleri) -->
      <div class="bg-avis-600">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <!-- Logo -->
          <a routerLink="/" class="flex items-center">
            <span class="text-white text-2xl sm:text-3xl font-extrabold tracking-tight">
              RentACar<sup class="text-xs">®</sup>
            </span>
          </a>

          <!-- Sağ Üst — Auth & Dil -->
          <div class="hidden md:flex items-center gap-3">
            @if (auth.isAuthenticated()) {
              <div class="flex items-center gap-2">
                <span class="text-white text-sm">
                  Merhaba, <b>{{ auth.user()?.firstName }}</b>
                </span>
                <button (click)="logout()"
                        class="px-4 py-2 bg-white hover:bg-ink-100 text-avis-600 text-sm font-bold rounded-full transition">
                  Çıkış
                </button>
              </div>
            } @else {
              <a routerLink="/login"
                 class="px-4 py-2 bg-white hover:bg-ink-100 text-avis-600 text-sm font-bold rounded-full transition">
                KURUMSAL Üye Girişi
              </a>
              <a routerLink="/login"
                 class="px-4 py-2 bg-white hover:bg-ink-100 text-avis-600 text-sm font-bold rounded-full transition">
                BİREYSEL Üye Girişi
              </a>
              <a routerLink="/register"
                 class="px-4 py-2 bg-white hover:bg-ink-100 text-avis-600 text-sm font-bold rounded-full transition">
                Üye Olun
              </a>
            }

            <button class="ml-2 px-3 py-2 text-white text-sm font-semibold flex items-center gap-1 hover:bg-avis-700 rounded-full transition">
              TR
              <span class="text-base">🇹🇷</span>
            </button>
          </div>

          <!-- Mobile menu butonu -->
          <button (click)="toggleMobile()"
                  class="md:hidden text-white p-2">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Alt Navigasyon -->
      <nav class="bg-avis-600 border-t border-avis-700">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ul class="hidden md:flex items-center justify-center gap-1">
            <li>
              <a routerLink="/rezervasyonlarim"
                 class="block px-5 py-3 text-white text-sm font-semibold hover:bg-avis-700 transition">
                Rezervasyon Yönetimi
              </a>
            </li>
            <li>
              <a routerLink="/araclar" routerLinkActive="bg-avis-700"
                 class="block px-5 py-3 text-white text-sm font-semibold hover:bg-avis-700 transition">
                Araçlar
              </a>
            </li>
            <li>
              <a href="#kampanyalar"
                 class="block px-5 py-3 text-white text-sm font-semibold hover:bg-avis-700 transition">
                Kampanyalar
              </a>
            </li>
            <li>
              <a href="#ofisler"
                 class="block px-5 py-3 text-white text-sm font-semibold hover:bg-avis-700 transition">
                Ofisler
              </a>
            </li>
            <li>
              <a href="#hizmetler"
                 class="block px-5 py-3 text-white text-sm font-semibold hover:bg-avis-700 transition">
                Hizmetler
              </a>
            </li>
            <li>
              <a href="#yurtdisi"
                 class="block px-5 py-3 text-white text-sm font-semibold hover:bg-avis-700 transition">
                Yurt Dışı Araç Kiralama
              </a>
            </li>
            <li class="ml-auto">
              <button class="p-3 text-white hover:bg-avis-700 transition">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
              </button>
            </li>
          </ul>
        </div>
      </nav>

      <!-- Mobile Menu -->
      @if (isMobileOpen()) {
        <div class="md:hidden bg-avis-700 animate-fade-in">
          <ul class="px-4 py-3 space-y-1">
            <li><a routerLink="/araclar" (click)="toggleMobile()" class="block py-3 text-white font-semibold border-b border-avis-600">Araçlar</a></li>
            <li><a href="#kampanyalar" (click)="toggleMobile()" class="block py-3 text-white font-semibold border-b border-avis-600">Kampanyalar</a></li>
            <li><a href="#ofisler" (click)="toggleMobile()" class="block py-3 text-white font-semibold border-b border-avis-600">Ofisler</a></li>
            <li><a href="#hizmetler" (click)="toggleMobile()" class="block py-3 text-white font-semibold border-b border-avis-600">Hizmetler</a></li>
            <li class="pt-3">
              @if (auth.isAuthenticated()) {
                <button (click)="logout()" class="w-full px-4 py-3 bg-white text-avis-600 font-bold rounded-full">Çıkış Yap</button>
              } @else {
                <a routerLink="/login" (click)="toggleMobile()" class="block text-center px-4 py-3 bg-white text-avis-600 font-bold rounded-full">Giriş Yap</a>
              }
            </li>
          </ul>
        </div>
      }
    </header>
  `
})
export class HeaderComponent {
  protected auth = inject(AuthService);
  private router = inject(Router);

  protected isMobileOpen = signal(false);

  toggleMobile(): void {
    this.isMobileOpen.update(v => !v);
  }

  logout(): void {
    this.auth.logout();
    this.isMobileOpen.set(false);
  }
}