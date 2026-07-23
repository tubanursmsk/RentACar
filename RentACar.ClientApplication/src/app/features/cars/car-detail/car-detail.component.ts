import { Component, OnInit, computed, HostListener, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { CarService } from '../../../core/services/car.service';
import { LocationService } from '../../../core/services/location.service';
import { Car } from '../../../core/models/car.model';
import { BookingStateService } from '../../../core/services/booking-state.service';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-car-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslatePipe],
  template: `
    <div class="bg-ink-100/30 min-h-screen py-6 lg:py-8">
      <div class="max-w-[1400px] mx-auto px-4 sm:px-6">

        <!-- Breadcrumb -->
        <nav class="text-sm text-ink-500 mb-4 flex items-center gap-2 flex-wrap">
          <a routerLink="/" class="hover:text-brand-600">{{ 'common.home' | translate }}</a>
          <span>/</span>
          <a routerLink="/araclar" class="hover:text-brand-600">{{ 'header.cars' | translate }}</a>
          <span>/</span>
          <span class="text-ink-900 font-semibold">{{ car()?.brandName }} {{ car()?.model }}</span>
        </nav>

        @if (loading()) {
          <div class="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 animate-pulse">
            <div class="space-y-4">
              <div class="aspect-video bg-ink-100 rounded-2xl"></div>
              <div class="h-40 bg-ink-100 rounded-2xl"></div>
              <div class="h-64 bg-ink-100 rounded-2xl"></div>
            </div>
            <div class="h-96 bg-ink-100 rounded-2xl"></div>
          </div>
        } @else if (car(); as c) {
          <div class="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">

            <!-- SOL KOLON -->
            <div class="space-y-4">

              <!-- Başlık Kartı -->
              <div class="bg-white rounded-2xl shadow-card p-5 lg:p-6">
                <div class="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h1 class="text-2xl lg:text-3xl font-extrabold text-ink-900">
                      {{ c.brandName }} {{ c.model }}
                    </h1>
                    <p class="text-ink-500 mt-1 text-sm">
                      {{ 'cars.detail.orSimilar' | translate }}
                      @if (c.year) {
                        <span>• {{ c.year }}</span>
                      }
                      @if (c.color) {
                        <span>• {{ c.color }}</span>
                      }
                    </p>
                  </div>

                  <div class="flex gap-2">
                    <span class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold"
                          [class.bg-accent-success/10]="c.status === 1"
                          [class.text-accent-success]="c.status === 1"
                          [class.bg-ink-100]="c.status !== 1"
                          [class.text-ink-500]="c.status !== 1">
                      <span class="w-2 h-2 rounded-full"
                            [class.bg-accent-success]="c.status === 1"
                            [class.bg-ink-400]="c.status !== 1"></span>
                      {{ getStatusKey(c.status) | translate }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Fotoğraf Galerisi -->
              <div class="bg-white rounded-2xl shadow-card overflow-hidden">
                <div class="aspect-[16/10] bg-ink-100 relative">
                  @if (selectedImage(); as img) {
                    <img [src]="apiBaseUrl + img" [alt]="c.model"
                         class="w-full h-full object-cover">
                  } @else {
                    <div class="w-full h-full flex items-center justify-center text-9xl">🚗</div>
                  }

                  @if (galleryImages().length > 1) {
                    <button (click)="prevImage()"
                            class="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur rounded-full shadow-card hover:bg-white transition flex items-center justify-center">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"/>
                      </svg>
                    </button>
                    <button (click)="nextImage()"
                            class="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur rounded-full shadow-card hover:bg-white transition flex items-center justify-center">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/>
                      </svg>
                    </button>
                  }
                </div>

                @if (galleryImages().length > 1) {
                  <div class="p-3 grid grid-cols-6 gap-2">
                    @for (img of galleryImages(); track img; let i = $index) {
                      <button (click)="selectImage(img)"
                              class="aspect-video bg-ink-100 rounded-lg overflow-hidden border-2 transition"
                              [class.border-brand-600]="img === selectedImage()"
                              [class.border-transparent]="img !== selectedImage()">
                        <img [src]="apiBaseUrl + img" [alt]="'Photo ' + (i+1)"
                             class="w-full h-full object-cover">
                      </button>
                    }
                  </div>
                }
              </div>

              <!-- Şube Bilgisi -->
              @if (c.currentLocationName || c.locationName) {
                <div class="bg-white rounded-2xl shadow-card p-5 flex items-start gap-4">
                  <div class="w-12 h-12 bg-brand-50 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg class="w-6 h-6 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                  </div>
                  <div class="flex-1">
                    <div class="text-xs text-ink-500 font-bold uppercase tracking-wide">
                      {{ 'cars.detail.currentBranch' | translate }}
                    </div>
                    <div class="text-lg font-bold text-ink-900 mt-0.5">
                      {{ c.currentLocationName || c.locationName }}
                    </div>
                    <p class="text-sm text-ink-500 mt-1">
                      {{ 'cars.detail.branchDescription' | translate }}
                    </p>
                  </div>
                </div>
              }

              <!-- ARAÇ ÖZELLİKLERİ + KİRALAMA KOŞULLARI -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

                <!-- Araç Özellikleri -->
                <div class="bg-white rounded-2xl shadow-card p-5">
                  <div class="flex items-center gap-2 mb-4 pb-3 border-b border-ink-100">
                    <svg class="w-5 h-5 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M13 10V3L4 14h7v7l9-11h-7z"/>
                    </svg>
                    <h3 class="font-bold text-ink-900">{{ 'cars.detail.features' | translate }}</h3>
                  </div>

                  <div class="space-y-3 text-sm">
                    <div class="flex items-center gap-3">
                      <span class="w-6 text-brand-600">👥</span>
                      <span class="text-ink-700">
                        {{ 'cars.detail.adults' | translate: { count: c.seatCount } }}
                      </span>
                    </div>

                    @if (c.luggageCount > 0) {
                      <div class="flex items-center gap-3">
                        <span class="w-6 text-brand-600">🧳</span>
                        <span class="text-ink-700">
                          {{ 'cars.detail.largeLuggage' | translate: { count: c.luggageCount } }}
                        </span>
                      </div>
                    }

                    @if (c.hasAirbag) {
                      <div class="flex items-center gap-3">
                        <span class="w-6 text-brand-600">🛡️</span>
                        <span class="text-ink-700">{{ 'cars.detail.airbag' | translate }}</span>
                      </div>
                    }

                    @if (c.hasAbs) {
                      <div class="flex items-center gap-3">
                        <span class="w-6 text-brand-600">🔧</span>
                        <span class="text-ink-700">{{ 'cars.detail.abs' | translate }}</span>
                      </div>
                    }

                    @if (c.hasAirConditioning) {
                      <div class="flex items-center gap-3">
                        <span class="w-6 text-brand-600">❄️</span>
                        <span class="text-ink-700">{{ 'cars.detail.airConditioning' | translate }}</span>
                      </div>
                    }

                    @if (c.hasBluetooth) {
                      <div class="flex items-center gap-3">
                        <span class="w-6 text-brand-600">📶</span>
                        <span class="text-ink-700">{{ 'cars.detail.bluetooth' | translate }}</span>
                      </div>
                    }

                    @if (c.hasNavigation) {
                      <div class="flex items-center gap-3">
                        <span class="w-6 text-brand-600">🧭</span>
                        <span class="text-ink-700">{{ 'cars.detail.navigation' | translate }}</span>
                      </div>
                    }

                    <div class="flex items-center gap-3">
                      <span class="w-6 text-brand-600">⛽</span>
                      <span class="text-ink-700">{{ getFuelKey(c.fuelType) | translate }}</span>
                    </div>

                    <div class="flex items-center gap-3">
                      <span class="w-6 text-brand-600">⚙️</span>
                      <span class="text-ink-700">{{ getTransKey(c.transmissionType) | translate }}</span>
                    </div>

                    @if (c.doorCount > 0) {
                      <div class="flex items-center gap-3">
                        <span class="w-6 text-brand-600">🚪</span>
                        <span class="text-ink-700">
                          {{ 'cars.detail.doors' | translate: { count: c.doorCount } }}
                        </span>
                      </div>
                    }

                    @if (c.mileage) {
                      <div class="flex items-center gap-3">
                        <span class="w-6 text-brand-600">📏</span>
                        <span class="text-ink-700">
                          {{ 'cars.detail.kilometers' | translate: { km: (c.mileage | number:'1.0-0') } }}
                        </span>
                      </div>
                    }
                  </div>
                </div>

                <!-- Kiralama Koşulları -->
                <div class="bg-white rounded-2xl shadow-card p-5">
                  <div class="flex items-center gap-2 mb-4 pb-3 border-b border-ink-100">
                    <svg class="w-5 h-5 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                    </svg>
                    <h3 class="font-bold text-ink-900">{{ 'cars.detail.conditions' | translate }}</h3>
                  </div>

                  <div class="space-y-3 text-sm">
                    <div class="flex items-center gap-3">
                      <span class="w-6 text-brand-600">🎂</span>
                      <span class="text-ink-700">
                        {{ 'cars.detail.ageLimit' | translate: { age: c.minDriverAge } }}
                      </span>
                    </div>

                    <div class="flex items-center gap-3">
                      <span class="w-6 text-brand-600">🪪</span>
                      <span class="text-ink-700">
                        {{ 'cars.detail.licenseYears' | translate: { years: c.minLicenseYears } }}
                      </span>
                    </div>

                    @if (c.minFindeksScore > 0) {
                      <div class="flex items-center gap-3">
                        <span class="w-6 text-brand-600">📊</span>
                        <span class="text-ink-700">
                          {{ 'cars.detail.findeksScore' | translate: { score: c.minFindeksScore } }}
                        </span>
                      </div>
                    }

                    <div class="flex items-center gap-3">
                      <span class="w-6 text-brand-600">💳</span>
                      <span class="text-ink-700">{{ 'cars.detail.creditCard' | translate }}</span>
                    </div>

                    <div class="flex items-center gap-3">
                      <span class="w-6 text-brand-600">🆔</span>
                      <span class="text-ink-700">{{ 'cars.detail.idCard' | translate }}</span>
                    </div>

                    <div class="flex items-center gap-3">
                      <span class="w-6 text-brand-600">📄</span>
                      <span class="text-ink-700">{{ 'cars.detail.driverLicense' | translate }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Açıklama -->
              @if (c.description) {
                <div class="bg-white rounded-2xl shadow-card p-5">
                  <h3 class="font-bold text-ink-900 mb-3 flex items-center gap-2">
                    <svg class="w-5 h-5 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    </svg>
                    {{ 'cars.detail.about' | translate }}
                  </h3>
                  <p class="text-sm text-ink-700 leading-relaxed">{{ c.description }}</p>
                </div>
              }

              <!-- Bilgilendirme Kutusu -->
              <div class="bg-brand-50 border border-brand-100 rounded-2xl p-5">
                <div class="flex gap-3">
                  <svg class="w-5 h-5 text-brand-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <div class="text-sm text-ink-700 space-y-2">
                    <p><strong>{{ 'cars.detail.rentalTerms' | translate }}</strong></p>
                    <ul class="list-disc list-inside space-y-1 ml-1 text-xs">
                      <li>{{ 'cars.detail.term1' | translate }}</li>
                      <li>{{ 'cars.detail.term2' | translate }}</li>
                      <li>{{ 'cars.detail.term3' | translate }}</li>
                      <li>{{ 'cars.detail.term4' | translate }}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <!-- SAĞ KOLON -->
            <aside class="lg:sticky lg:top-24 lg:self-start space-y-4">

              <div class="bg-white rounded-2xl shadow-card p-5 lg:p-6">
                <div class="flex items-baseline justify-between mb-4 pb-4 border-b border-ink-100">
                  <div>
                    <div class="text-xs text-ink-500 uppercase font-bold tracking-wide">
                      {{ 'cars.detail.dailyPrice' | translate }}
                    </div>
                    <div class="text-3xl font-extrabold text-brand-600 mt-0.5">
                      ₺{{ c.dailyPrice | number:'1.0-0' }}
                    </div>
                  </div>
                  @if (rentalDays() > 0) {
                    <div class="text-right">
                      <div class="text-xs text-ink-500">
                        {{ 'cars.detail.totalDays' | translate: { days: rentalDays() } }}
                      </div>
                      <div class="text-xl font-bold text-ink-900 mt-0.5">
                        ₺{{ totalPrice() | number:'1.0-0' }}
                      </div>
                    </div>
                  }
                </div>

                @if (booking.hasSelection() && pickupDateFormatted() && returnDateFormatted()) {
                  <div class="space-y-3 mb-5">
                    <div class="flex items-start gap-3">
                      <div class="w-8 h-8 bg-accent-success/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg class="w-4 h-4 text-accent-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
                        </svg>
                      </div>
                      <div class="flex-1 text-sm">
                        <div class="text-xs text-ink-500 uppercase font-bold">
                          {{ 'cars.detail.pickup' | translate }}
                        </div>
                        <div class="font-semibold text-ink-900">
                          {{ pickupDateFormatted() }} • {{ booking.selection().pickupTime }}
                        </div>
                      </div>
                    </div>

                    <div class="flex items-start gap-3">
                      <div class="w-8 h-8 bg-accent-success/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg class="w-4 h-4 text-accent-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
                        </svg>
                      </div>
                      <div class="flex-1 text-sm">
                        <div class="text-xs text-ink-500 uppercase font-bold">
                          {{ 'cars.detail.return' | translate }}
                        </div>
                        <div class="font-semibold text-ink-900">
                          {{ returnDateFormatted() }} • {{ booking.selection().returnTime }}
                        </div>
                      </div>
                    </div>

                    @if (booking.selection().pickupLocationName) {
                      <div class="flex items-start gap-3">
                        <div class="w-8 h-8 bg-brand-50 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg class="w-4 h-4 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                          </svg>
                        </div>
                        <div class="flex-1 text-sm">
                          <div class="text-xs text-ink-500 uppercase font-bold">
                            {{ 'cars.detail.office' | translate }}
                          </div>
                          <div class="font-semibold text-ink-900 truncate">
                            {{ booking.selection().pickupLocationName }}
                          </div>
                        </div>
                      </div>
                    }

                    <button (click)="openBookingModal()"
                            class="text-xs font-semibold text-brand-600 hover:underline">
                      {{ 'cars.detail.editDateOffice' | translate }}
                    </button>
                  </div>
                } @else {
                  <div class="bg-brand-50 rounded-xl p-4 mb-5 flex items-start gap-3">
                    <svg class="w-5 h-5 text-brand-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <p class="text-sm text-ink-700">
                      {{ 'cars.detail.selectDatesFirst' | translate }}
                    </p>
                  </div>
                }

                <button (click)="onReserveClick()"
                        [disabled]="c.status !== 1"
                        class="btn-primary w-full text-base disabled:opacity-50 disabled:cursor-not-allowed">
                  @if (c.status !== 1) {
                    {{ 'cars.detail.carNotAvailable' | translate }}
                  } @else if (!hasValidBooking()) {
                    {{ 'cars.detail.clickToRent' | translate }}
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/>
                    </svg>
                  } @else {
                    {{ 'cars.detail.makeReservation' | translate }}
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/>
                    </svg>
                  }
                </button>

                @if (!auth.isAuthenticated() && hasValidBooking()) {
                  <p class="text-xs text-center text-ink-500 mt-3">
                    {{ 'cars.detail.loginRequired' | translate }}
                  </p>
                }
              </div>

              <!-- Güven Rozetleri -->
              <div class="bg-white rounded-2xl shadow-card p-5">
                <div class="space-y-3 text-sm">
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 bg-accent-success/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg class="w-5 h-5 text-accent-success" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
                      </svg>
                    </div>
                    <span class="font-semibold text-ink-900">{{ 'cars.detail.freeCancellation' | translate }}</span>
                  </div>
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 bg-brand-50 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg class="w-5 h-5 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                      </svg>
                    </div>
                    <span class="font-semibold text-ink-900">{{ 'cars.detail.securePayment' | translate }}</span>
                  </div>
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 bg-brand-50 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg class="w-5 h-5 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"/>
                      </svg>
                    </div>
                    <span class="font-semibold text-ink-900">{{ 'cars.detail.support247' | translate }}</span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        } @else {
          <div class="text-center py-20">
            <div class="text-6xl mb-4">😕</div>
            <h3 class="text-xl font-bold">{{ 'cars.detail.notFoundTitle' | translate }}</h3>
            <a routerLink="/araclar" class="btn-primary mt-4 inline-flex">
              {{ 'cars.detail.backToList' | translate }}
            </a>
          </div>
        }
      </div>
    </div>

    <!-- ═══ KİRALAMA MODALI ═══ -->
    @if (isModalOpen() && car(); as c) {
      <div class="fixed inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
           style="z-index: 100;"
           (click)="closeBookingModal()"></div>

      <div class="fixed inset-0 flex items-center justify-center p-4 pointer-events-none"
           style="z-index: 101;">
        <div class="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto pointer-events-auto animate-fade-in"
             (click)="$event.stopPropagation()">

          <div class="sticky top-0 bg-white z-10 flex items-center justify-between px-6 py-4 border-b border-ink-100">
            <h3 class="text-lg font-bold text-ink-900">{{ 'cars.detail.modal.title' | translate }}</h3>
            <button (click)="closeBookingModal()"
                    class="w-9 h-9 rounded-full hover:bg-ink-100 flex items-center justify-center transition">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <div class="px-6 py-4 bg-brand-50/50 border-b border-brand-100 flex items-center gap-4">
            <div class="w-20 h-14 bg-white rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0">
              @if (c.imageUrl) {
                <img [src]="apiBaseUrl + c.imageUrl" [alt]="c.model" class="w-full h-full object-cover">
              } @else {
                <span class="text-2xl">🚗</span>
              }
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-xs font-bold text-brand-600 uppercase tracking-wide">
                {{ 'cars.detail.modal.selectedCar' | translate }}
              </div>
              <div class="font-bold text-ink-900 truncate">{{ c.brandName }} {{ c.model }}</div>
              <div class="text-xs text-ink-500">{{ 'cars.detail.orSimilar' | translate }}</div>
            </div>
          </div>

          <div class="p-6 space-y-4">

            <div>
              <label class="text-xs font-bold text-ink-700 uppercase tracking-wide mb-2 block">
                {{ 'cars.detail.modal.pickupOffice' | translate }}
              </label>
              <div class="relative">
                <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-600 pointer-events-none"
                     fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                <select [(ngModel)]="modalPickupLocationId"
                        class="input-field pl-10 pr-4 text-sm cursor-pointer">
                  <option [ngValue]="null">{{ 'cars.detail.modal.selectLocation' | translate }}</option>
                  @for (loc of locations(); track loc.id) {
                    <option [ngValue]="loc.id">{{ loc.name }} — {{ loc.city }}</option>
                  }
                </select>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="text-xs font-bold text-ink-700 uppercase tracking-wide mb-2 block">
                  {{ 'cars.detail.modal.pickupDate' | translate }}
                </label>
                <div class="grid grid-cols-[1fr_auto] gap-2">
                  <input type="date"
                         [(ngModel)]="modalPickupDate"
                         [min]="todayString"
                         (change)="onPickupDateChange()"
                         class="input-field text-sm cursor-pointer"
                         style="color-scheme: light;">
                  <select [(ngModel)]="modalPickupTime"
                          class="input-field text-sm cursor-pointer w-20 px-2 appearance-none">
                    @for (t of pickupTimeOptions(); track t.value) {
                      <option [value]="t.value" [disabled]="t.disabled">{{ t.value }}</option>
                    }
                  </select>
                </div>
              </div>

              <div>
                <label class="text-xs font-bold text-ink-700 uppercase tracking-wide mb-2 block">
                  {{ 'cars.detail.modal.returnDate' | translate }}
                </label>
                <div class="grid grid-cols-[1fr_auto] gap-2">
                  <input type="date"
                         [(ngModel)]="modalReturnDate"
                         [min]="minReturnDate()"
                         class="input-field text-sm cursor-pointer"
                         style="color-scheme: light;">
                  <select [(ngModel)]="modalReturnTime"
                          class="input-field text-sm cursor-pointer w-20 px-2 appearance-none">
                    @for (t of timeOptions; track t) {
                      <option [value]="t">{{ t }}</option>
                    }
                  </select>
                </div>
              </div>
            </div>

            <div class="text-xs text-ink-500 bg-ink-50 rounded-lg p-3 flex items-start gap-2">
              <svg class="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span>{{ 'cars.detail.modal.info' | translate: { min: MIN_ADVANCE_MINUTES } }}</span>
            </div>

            @if (modalError()) {
              <div class="text-sm text-white bg-accent-danger rounded-lg py-2 px-3 font-medium">
                ⚠️ {{ modalError() }}
              </div>
            }

            @if (modalRentalDays() > 0) {
              <div class="bg-brand-50 border border-brand-100 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <div class="text-xs text-ink-500">
                    {{ 'cars.detail.totalDays' | translate: { days: modalRentalDays() } }}
                  </div>
                  <div class="text-2xl font-extrabold text-brand-600">
                    ₺{{ modalTotalPrice() | number:'1.0-0' }}
                  </div>
                </div>
                <div class="text-xs text-ink-500">
                  {{ 'cars.detail.modal.dailyLabel' | translate: { price: (c.dailyPrice | number:'1.0-0') } }}
                </div>
              </div>
            }

            <button (click)="confirmBooking()"
                    [disabled]="!canConfirm()"
                    class="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed">
              @if (modalRentalDays() > 0) {
                {{ 'cars.detail.modal.rentDays' | translate: { days: modalRentalDays() } }}
              } @else {
                {{ 'cars.detail.modal.makeReservation' | translate }}
              }
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class CarDetailComponent implements OnInit {
  private carService = inject(CarService);
  private locationService = inject(LocationService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private translate = inject(TranslateService);
  protected booking = inject(BookingStateService);
  protected auth = inject(AuthService);

  protected apiBaseUrl = environment.apiBaseUrl;
  protected car = signal<Car | null>(null);
  protected loading = signal(true);
  protected selectedImage = signal<string | null>(null);
  protected locations = this.locationService.locations;

  protected isModalOpen = signal(false);
  protected modalPickupLocationId = signal<number | null>(null);
  protected modalPickupDate = signal<string>('');
  protected modalReturnDate = signal<string>('');
  protected modalPickupTime = signal<string>('09:00');
  protected modalReturnTime = signal<string>('09:00');
  protected modalError = signal<string | null>(null);

  protected readonly MIN_ADVANCE_MINUTES = 30;
  protected readonly MIN_RENTAL_DAYS = 1;

  protected todayString = this.formatDateForInput(new Date());
  protected timeOptions = this.generateTimeOptions();

  protected pickupTimeOptions = computed(() => {
    const pd = this.modalPickupDate();
    if (!pd) return this.timeOptions.map(v => ({ value: v, disabled: false }));

    const now = new Date();
    const selectedDate = new Date(pd);
    const isToday = this.isSameDay(selectedDate, now);

    if (!isToday) return this.timeOptions.map(v => ({ value: v, disabled: false }));

    const minTime = new Date(now.getTime() + this.MIN_ADVANCE_MINUTES * 60 * 1000);
    const minHour = minTime.getHours();
    const minMinute = minTime.getMinutes();

    return this.timeOptions.map(v => {
      const [h, m] = v.split(':').map(Number);
      const disabled = (h < minHour) || (h === minHour && m < minMinute);
      return { value: v, disabled };
    });
  });

  protected minReturnDate = computed(() => {
    const pd = this.modalPickupDate();
    if (!pd) return this.todayString;
    const d = new Date(pd);
    d.setDate(d.getDate() + this.MIN_RENTAL_DAYS);
    return this.formatDateForInput(d);
  });

  protected modalRentalDays = computed(() => {
    const pd = this.modalPickupDate();
    const rd = this.modalReturnDate();
    if (!pd || !rd) return 0;
    const diff = new Date(rd).getTime() - new Date(pd).getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  });

  protected modalTotalPrice = computed(() => {
    const c = this.car();
    return c ? c.dailyPrice * this.modalRentalDays() : 0;
  });

  protected canConfirm = computed(() =>
    !!this.modalPickupLocationId() &&
    !!this.modalPickupDate() &&
    !!this.modalReturnDate() &&
    this.modalRentalDays() > 0
  );

  protected galleryImages = computed(() => {
    const c = this.car();
    if (!c) return [];
    const images: string[] = [];
    if (c.imageUrl) images.push(c.imageUrl);
    if (c.carImages?.length) {
      c.carImages
        .filter(img => img.imageUrl !== c.imageUrl)
        .forEach(img => images.push(img.imageUrl));
    }
    return images;
  });

  protected pickupDateFormatted = computed(() => {
    const d = this.booking.selection().pickupDate;
    if (!d) return null;
    const date = d instanceof Date ? d : new Date(d);
    if (isNaN(date.getTime())) return null;
    return this.formatDisplayDate(date);
  });

  protected returnDateFormatted = computed(() => {
    const d = this.booking.selection().returnDate;
    if (!d) return null;
    const date = d instanceof Date ? d : new Date(d);
    if (isNaN(date.getTime())) return null;
    return this.formatDisplayDate(date);
  });

  protected rentalDays = computed(() => {
    const s = this.booking.selection();
    if (!s.pickupDate || !s.returnDate) return 0;
    const p = s.pickupDate instanceof Date ? s.pickupDate : new Date(s.pickupDate);
    const r = s.returnDate instanceof Date ? s.returnDate : new Date(s.returnDate);
    if (isNaN(p.getTime()) || isNaN(r.getTime())) return 0;
    const diff = r.getTime() - p.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  });

  protected totalPrice = computed(() => {
    const c = this.car();
    return c ? c.dailyPrice * this.rentalDays() : 0;
  });

  protected hasValidBooking = computed(() =>
    this.booking.hasSelection() && this.rentalDays() > 0
  );

  ngOnInit(): void {
    if (this.locations().length === 0) {
      this.locationService.getAll().subscribe();
    }
    this.route.params.subscribe(params => {
      const id = +params['id'];
      if (!id) return;
      this.loadCar(id);
    });
  }

  private loadCar(id: number): void {
    this.loading.set(true);
    this.carService.getById(id).subscribe({
      next: res => {
        if (res.success && res.data) {
          this.car.set(res.data);
          if (res.data.imageUrl) this.selectedImage.set(res.data.imageUrl);
        }
        this.loading.set(false);
      },
      error: () => {
        this.car.set(null);
        this.loading.set(false);
      }
    });
  }

  selectImage(url: string): void {
    this.selectedImage.set(url);
  }

  nextImage(): void {
    const imgs = this.galleryImages();
    if (imgs.length <= 1) return;
    const currentIdx = imgs.indexOf(this.selectedImage() ?? '');
    const nextIdx = (currentIdx + 1) % imgs.length;
    this.selectedImage.set(imgs[nextIdx]);
  }

  prevImage(): void {
    const imgs = this.galleryImages();
    if (imgs.length <= 1) return;
    const currentIdx = imgs.indexOf(this.selectedImage() ?? '');
    const prevIdx = currentIdx <= 0 ? imgs.length - 1 : currentIdx - 1;
    this.selectedImage.set(imgs[prevIdx]);
  }

  onReserveClick(): void {
    if (!this.hasValidBooking()) {
      this.openBookingModal();
      return;
    }
    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: `/rezervasyon/ozet?carId=${this.car()?.id}` }
      });
      return;
    }
    this.router.navigate(['/rezervasyon/ozet'], {
      queryParams: { carId: this.car()?.id }
    });
  }

  openBookingModal(): void {
    const s = this.booking.selection();
    if (s.pickupLocationId) this.modalPickupLocationId.set(s.pickupLocationId);
    if (s.pickupDate) {
      const d = s.pickupDate instanceof Date ? s.pickupDate : new Date(s.pickupDate);
      if (!isNaN(d.getTime())) this.modalPickupDate.set(this.formatDateForInput(d));
    }
    if (s.returnDate) {
      const d = s.returnDate instanceof Date ? s.returnDate : new Date(s.returnDate);
      if (!isNaN(d.getTime())) this.modalReturnDate.set(this.formatDateForInput(d));
    }
    if (s.pickupTime) this.modalPickupTime.set(s.pickupTime);
    if (s.returnTime) this.modalReturnTime.set(s.returnTime);

    const c = this.car();
    if (c && !this.modalPickupLocationId()) {
      const locName = c.currentLocationName || c.locationName;
      if (locName) {
        const matched = this.locations().find(l => l.name === locName);
        if (matched) this.modalPickupLocationId.set(matched.id);
      }
    }

    this.modalError.set(null);
    this.isModalOpen.set(true);
    document.body.style.overflow = 'hidden';
  }

  closeBookingModal(): void {
    this.isModalOpen.set(false);
    this.modalError.set(null);
    document.body.style.overflow = '';
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isModalOpen()) this.closeBookingModal();
  }

  onPickupDateChange(): void {
    const pd = this.modalPickupDate();
    const rd = this.modalReturnDate();
    if (pd && rd) {
      const pickup = new Date(pd);
      const ret = new Date(rd);
      if (ret <= pickup) {
        const newReturn = new Date(pickup);
        newReturn.setDate(newReturn.getDate() + this.MIN_RENTAL_DAYS);
        this.modalReturnDate.set(this.formatDateForInput(newReturn));
      }
    }
    if (pd && this.isSameDay(new Date(pd), new Date())) {
      const opts = this.pickupTimeOptions();
      const currentValid = opts.find(o => o.value === this.modalPickupTime() && !o.disabled);
      if (!currentValid) {
        const firstAvailable = opts.find(o => !o.disabled);
        if (firstAvailable) this.modalPickupTime.set(firstAvailable.value);
      }
    }
    this.modalError.set(null);
  }

  confirmBooking(): void {
    if (!this.canConfirm()) return;

    const pickupDT = this.combineDateAndTime(this.modalPickupDate(), this.modalPickupTime());
    const returnDT = this.combineDateAndTime(this.modalReturnDate(), this.modalReturnTime());
    const now = new Date();

    if (pickupDT <= now) {
      this.modalError.set(this.translate.instant('home.errors.pastDateTime'));
      return;
    }
    const minPickup = new Date(now.getTime() + this.MIN_ADVANCE_MINUTES * 60 * 1000);
    if (pickupDT < minPickup) {
      this.modalError.set(this.translate.instant('home.errors.minAdvance', { min: this.MIN_ADVANCE_MINUTES }));
      return;
    }
    if (returnDT <= pickupDT) {
      this.modalError.set(this.translate.instant('home.errors.returnBeforePickup'));
      return;
    }

    const loc = this.locations().find(l => l.id === this.modalPickupLocationId());

    this.booking.setSelection({
      pickupLocationId: this.modalPickupLocationId(),
      pickupLocationName: loc?.name ?? null,
      returnLocationId: this.modalPickupLocationId(),
      returnLocationName: loc?.name ?? null,
      pickupDate: pickupDT,
      pickupTime: this.modalPickupTime(),
      returnDate: returnDT,
      returnTime: this.modalReturnTime()
    });

    this.closeBookingModal();

    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: `/rezervasyon/ozet?carId=${this.car()?.id}` }
      });
      return;
    }
    this.router.navigate(['/rezervasyon/ozet'], {
      queryParams: { carId: this.car()?.id }
    });
  }

  private formatDateForInput(d: Date): string {
    const y = d.getFullYear();
    const m = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  private formatDisplayDate(d: Date): string {
    const currentLang = this.translate.getCurrentLang() || 'tr';
    const locale = currentLang === 'en' ? 'en-US' : 'tr-TR';
    return new Intl.DateTimeFormat(locale, {
      day: 'numeric', month: 'short', year: 'numeric'
    }).format(d);
  }

  private isSameDay(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() &&
           a.getMonth() === b.getMonth() &&
           a.getDate() === b.getDate();
  }

  private combineDateAndTime(dateStr: string, timeStr: string): Date {
    const d = new Date(dateStr);
    const [h, m] = timeStr.split(':').map(Number);
    d.setHours(h, m, 0, 0);
    return d;
  }

  private generateTimeOptions(): string[] {
    const times: string[] = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 30) {
        times.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
      }
    }
    return times;
  }

  // ⭐ Translation key döner
  protected getFuelKey(fuel: number): string {
    return ({
      1: 'home.fuel.gasoline',
      2: 'home.fuel.diesel',
      3: 'home.fuel.electric',
      4: 'home.fuel.hybrid',
      5: 'home.fuel.lpg'
    } as any)[fuel] ?? '—';
  }

  protected getTransKey(trans: number): string {
    return ({
      1: 'home.transmission.manual',
      2: 'home.transmission.automatic',
      3: 'home.transmission.semiAutomatic'
    } as any)[trans] ?? '—';
  }

  protected getStatusKey(status: number): string {
    return ({
      1: 'cars.detail.status.available',
      2: 'cars.detail.status.rented',
      3: 'cars.detail.status.maintenance',
      4: 'cars.detail.status.inactive'
    } as any)[status] ?? '—';
  }
}