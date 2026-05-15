import { Component, inject, signal, ElementRef, HostListener } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, FormsModule],
  template: `
    <header class="sticky top-0 z-50 relative">
      <div class="bg-avis-600 relative z-20">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <a routerLink="/" class="flex items-center">
            <span class="text-white text-2xl sm:text-3xl font-extrabold tracking-tight">
              RentACar<sup class="text-xs">®</sup>
            </span>
          </a>

          <div class="hidden md:flex items-center gap-3">
            @if (auth.isAuthenticated()) {
              <div class="flex items-center gap-2">
                <span class="text-white text-sm">
                  Merhaba, <b>{{ auth.user()?.firstName }}</b>
                </span>
                
                <a routerLink="/profile"
                   class="px-4 py-2 bg-avis-700 hover:bg-avis-800 text-white text-sm font-bold rounded-full transition shadow-sm border border-avis-500">
                  Profilim
                </a>

                <button (click)="logout()"
                        class="px-4 py-2 bg-white hover:bg-ink-100 text-avis-600 text-sm font-bold rounded-full transition">
                  Çıkış
                </button>
              </div>
            } @else {
              <a routerLink="/login"
                 class="px-4 py-2 bg-white hover:bg-ink-100 text-avis-600 text-sm font-bold rounded-full transition shadow-sm">
                KURUMSAL Üye Girişi
              </a>
              <a routerLink="/login"
                 class="px-4 py-2 bg-white hover:bg-ink-100 text-avis-600 text-sm font-bold rounded-full transition shadow-sm">
                BİREYSEL Üye Girişi
              </a>
              <a routerLink="/register"
                 class="px-4 py-2 bg-white hover:bg-ink-100 text-avis-600 text-sm font-bold rounded-full transition shadow-sm">
                Üye Olun
              </a>
            }

            <button class="ml-2 px-3 py-2 text-white text-sm font-semibold flex items-center gap-1 hover:bg-avis-700 rounded-full transition">
              <span class="text-base">🇹🇷</span>
            </button>
          </div>

          <button (click)="toggleMobile()"
                  class="md:hidden text-white p-2">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>
        </div>
      </div>

      <nav class="bg-avis-600 border-t border-avis-700 relative z-20">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ul class="hidden md:flex items-center justify-center gap-1">
            <li>
              <a routerLink="/profile" routerLinkActive="bg-avis-700"
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
              <a routerLink="/kampanyalar"
                 class="block px-5 py-3 text-white text-sm font-semibold hover:bg-avis-700 transition">
                Kampanyalar
              </a>
            </li>
            <li>
              <a routerLink="/ofisler"
                 class="block px-5 py-3 text-white text-sm font-semibold hover:bg-avis-700 transition">
                Ofisler
              </a>
            </li>
            <li>
              <a routerLink="/hizmetler"
                 class="block px-5 py-3 text-white text-sm font-semibold hover:bg-avis-700 transition">
                Hizmetler
              </a>
            </li>
            <li>
              <a routerLink="/yurtdisi"
                 class="block px-5 py-3 text-white text-sm font-semibold hover:bg-avis-700 transition">
                Yurt Dışı Araç Kiralama
              </a>
            </li>
            
            <li class="ml-auto">
              <button (click)="toggleSearch($event)" 
                      [class.bg-avis-700]="isSearchOpen()"
                      class="p-3 text-white hover:bg-avis-700 transition cursor-pointer">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
              </button>
            </li>
          </ul>
        </div>
      </nav>

      @if (isSearchOpen()) {
        <div class="absolute top-full left-0 right-0 bg-white shadow-2xl border-t border-ink-100 z-10 animate-fade-in origin-top" (click)="$event.stopPropagation()">
          <div class="max-w-5xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
            <div class="relative flex items-center">
              <svg class="absolute left-5 w-6 h-6 text-ink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <input type="text"
                     [ngModel]="searchQuery()" 
                     (ngModelChange)="searchQuery.set($event)"
                     (keyup.enter)="performSearch()"
                     placeholder="Araç, marka, ofis veya kampanya arayın..."
                     class="w-full pl-14 pr-24 py-4 rounded-full border-2 border-ink-100 focus:border-avis-600 outline-none text-lg text-ink-700 placeholder:text-ink-400 transition"
                     autofocus>
                     
              <button (click)="performSearch()" class="absolute right-14 text-white bg-avis-600 hover:bg-avis-700 p-2.5 rounded-full transition transform hover:scale-105">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/>
                </svg>
              </button>
              
              <button (click)="closeSearch()" class="absolute right-4 text-ink-400 hover:text-avis-600 p-2 transition">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      }

      @if (isMobileOpen()) {
        <div class="md:hidden bg-avis-700 animate-fade-in relative z-20">
          <ul class="px-4 py-3 space-y-1">
            <li>
              <div class="relative py-2">
                <input type="text" 
                       [ngModel]="searchQuery()" 
                       (ngModelChange)="searchQuery.set($event)"
                       (keyup.enter)="performSearch()"
                       placeholder="Arama yapın..."
                       class="w-full pl-4 pr-10 py-2 rounded-full text-ink-900 outline-none text-sm">
                <button (click)="performSearch()" class="absolute right-3 top-1/2 -translate-y-1/2 text-avis-600">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                  </svg>
                </button>
              </div>
            </li>
            <li><a routerLink="/profile" (click)="toggleMobile()" class="block py-3 text-white font-semibold border-b border-avis-600">Rezervasyon Yönetimi</a></li>
            <li><a routerLink="/araclar" (click)="toggleMobile()" class="block py-3 text-white font-semibold border-b border-avis-600">Araçlar</a></li>
            <li><a routerLink="/kampanyalar" (click)="toggleMobile()" class="block py-3 text-white font-semibold border-b border-avis-600">Kampanyalar</a></li>
            <li><a routerLink="/ofisler" (click)="toggleMobile()" class="block py-3 text-white font-semibold border-b border-avis-600">Ofisler</a></li>
            <li><a routerLink="/hizmetler" (click)="toggleMobile()" class="block py-3 text-white font-semibold border-b border-avis-600">Hizmetler</a></li>
            <li class="pt-3 flex flex-col gap-2">
              @if (auth.isAuthenticated()) {
                <a routerLink="/profile" (click)="toggleMobile()" class="block text-center px-4 py-3 bg-avis-800 text-white font-bold rounded-full border border-avis-500">Profilim</a>
                <button (click)="logout()" class="w-full px-4 py-3 bg-white text-avis-600 font-bold rounded-full">Çıkış Yap</button>
              } @else {
                <a routerLink="/login" (click)="toggleMobile()" class="block text-center px-4 py-3 bg-white text-avis-600 font-bold rounded-full shadow-sm">Giriş Yap</a>
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
  private elementRef = inject(ElementRef);

  protected isMobileOpen = signal(false);
  protected isSearchOpen = signal(false);
  protected searchQuery = signal('');

  toggleMobile(): void {
    this.isMobileOpen.update(v => !v);
    if (this.isMobileOpen()) {
      this.isSearchOpen.set(false);
    }
  }

  toggleSearch(event: Event): void {
    event.stopPropagation();
    this.isSearchOpen.update(v => !v);
    if (this.isSearchOpen()) {
      this.isMobileOpen.set(false);
      this.searchQuery.set('');
    }
  }

  closeSearch(): void {
    this.isSearchOpen.set(false);
  }

  performSearch(): void {
    const query = this.searchQuery().trim();
    if (query) {
      this.router.navigate(['/araclar'], { queryParams: { q: query } });
      this.isSearchOpen.set(false);
      this.isMobileOpen.set(false);
      this.searchQuery.set('');
    }
  }

  logout(): void {
    this.auth.logout();
    this.isMobileOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.isSearchOpen() && !this.elementRef.nativeElement.contains(event.target)) {
      this.closeSearch();
    }
  }
}