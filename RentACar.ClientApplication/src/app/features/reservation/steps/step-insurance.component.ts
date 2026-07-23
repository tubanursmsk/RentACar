import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { ReservationWizardService } from '../../../core/services/reservation-wizard.service';
import { InsuranceService } from '../../../core/services/insurance.service';
import { ReservationService } from '../../../core/services/reservation.service';
import { InsurancePackage } from '../../../core/models/reservation.model';

@Component({
  selector: 'app-step-insurance',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div>
      <div class="mb-6">
        <h2 class="text-2xl font-bold text-brand-600 mb-2">{{ 'wizard.insurance.title' | translate }}</h2>
        <div class="flex items-center gap-2 text-sm text-ink-700">
          <svg class="w-5 h-5 text-success" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
          </svg>
          <span>{{ 'wizard.insurance.info' | translate }}</span>
        </div>
      </div>

      @if (loading()) {
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          @for (i of [1,2,3]; track i) {
            <div class="card p-6 animate-pulse">
              <div class="h-6 bg-ink-100 rounded w-3/4"></div>
              <div class="h-4 bg-ink-100 rounded mt-3 w-1/2"></div>
              <div class="h-32 bg-ink-100 rounded mt-4"></div>
            </div>
          }
        </div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          @for (pkg of packages(); track pkg.id) {
            <div class="card relative flex flex-col transition-all duration-200"
                 [class.ring-2]="isSelected(pkg.id)"
                 [class.ring-avis-600]="isSelected(pkg.id)"
                 [class.shadow-card-hover]="isSelected(pkg.id)">

              @if (pkg.isRecommended) {
                <div class="absolute -top-3 right-4 px-3 py-1 bg-success text-white text-xs font-bold rounded-full shadow-md flex items-center gap-1">
                  <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  {{ 'wizard.insurance.mostPopular' | translate }}
                </div>
              }

              <div class="p-5">
                <div class="flex items-baseline justify-between mb-1">
                  <h3 class="text-lg font-bold text-brand-600">{{ pkg.name }}</h3>
                </div>
                <div class="flex items-baseline gap-2 mb-4">
                  <span class="text-2xl font-extrabold text-ink-900">
                    ₺{{ (pkg.dailyPrice * wizard.totalDays()) | number:'1.0-0' }}
                  </span>
                  <span class="text-xs text-ink-500">/ {{ wizard.totalDays() }} {{ 'wizard.common.days' | translate }}</span>
                </div>
              </div>

              <div class="px-5 flex-1 max-h-[280px] overflow-y-auto">
                @for (feature of pkg.features; track feature.name) {
                  <div class="py-2 border-t border-ink-100 flex items-center justify-between gap-2 text-sm">
                    <span class="text-ink-700">{{ feature.name }}</span>
                    @if (feature.isIncluded) {
                      <svg class="w-5 h-5 text-success flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
                      </svg>
                    } @else {
                      <svg class="w-5 h-5 text-danger flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"/>
                      </svg>
                    }
                  </div>
                }
              </div>

              <div class="p-5 pt-3 border-t border-ink-100 flex items-center justify-between">
                <button class="text-xs font-bold text-ink-700 hover:text-brand-600 flex items-center gap-1">
                  {{ 'wizard.common.detailedInfo' | translate }}
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </button>

                <button (click)="selectPackage(pkg)"
                        class="inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition"
                        [class.bg-brand-600]="!isSelected(pkg.id)"
                        [class.hover:bg-avis-700]="!isSelected(pkg.id)"
                        [class.text-white]="!isSelected(pkg.id)"
                        [class.bg-success]="isSelected(pkg.id)"
                        [class.text-white]="isSelected(pkg.id)">
                  @if (isSelected(pkg.id)) {
                    <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                    </svg>
                    {{ 'wizard.insurance.selected' | translate }}
                  } @else {
                    {{ 'wizard.insurance.addPackage' | translate }}
                    <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"/>
                    </svg>
                  }
                </button>
              </div>
            </div>
          }
        </div>

        <div class="mt-6 text-center">
          <button (click)="skipInsurance()"
                  class="text-sm text-ink-500 hover:text-brand-600 underline">
            {{ 'wizard.insurance.skip' | translate }}
          </button>
        </div>

        @if (priceLoading()) {
          <div class="mt-4 text-center text-sm text-ink-500">
            <span class="inline-block animate-spin">⟳</span> {{ 'wizard.common.priceCalculating' | translate }}
          </div>
        }
      }

      <div class="mt-8 flex justify-between">
        <button (click)="wizard.prevStep()" class="btn-secondary">
          {{ 'wizard.common.back' | translate }}
        </button>
        <button (click)="continue()"
                [disabled]="!hasSelection()"
                class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
          {{ 'wizard.common.next' | translate }}
        </button>
      </div>
    </div>
  `
})
export class StepInsuranceComponent implements OnInit {
  protected wizard = inject(ReservationWizardService);
  private insuranceService = inject(InsuranceService);
  private reservationService = inject(ReservationService);

  protected packages = this.insuranceService.packages;
  protected loading = signal(true);
  protected priceLoading = signal(false);

  protected hasSelection = computed(() => {
    return this.wizard.state().selectedInsurance !== null || this.skippedExplicitly();
  });

  private skippedExplicitly = signal(false);

  ngOnInit(): void {
    this.wizard.goToStep(2);

    if (this.packages().length === 0) {
      this.insuranceService.getAll().subscribe({
        next: () => this.loading.set(false),
        error: () => this.loading.set(false)
      });
    } else {
      this.loading.set(false);
    }

    this.recalculatePrice();
  }

  isSelected(packageId: number): boolean {
    return this.wizard.state().selectedInsurance?.id === packageId;
  }

  selectPackage(pkg: InsurancePackage): void {
    if (this.isSelected(pkg.id)) {
      this.wizard.setInsurance(null);
    } else {
      this.wizard.setInsurance(pkg);
      this.skippedExplicitly.set(false);
    }
    this.recalculatePrice();
  }

  skipInsurance(): void {
    this.wizard.setInsurance(null);
    this.skippedExplicitly.set(true);
    this.recalculatePrice();
  }

  continue(): void {
    this.wizard.nextStep();
  }

  private recalculatePrice(): void {
    const s = this.wizard.state();
    if (!s.car || !s.rentStartDate || !s.rentEndDate) return;

    this.priceLoading.set(true);
    this.reservationService.calculatePrice({
      carId: s.car.id,
      rentStartDate: this.toIsoDate(s.rentStartDate),
      rentEndDate: this.toIsoDate(s.rentEndDate),
      insurancePackageId: s.selectedInsurance?.id ?? null,
      additionalProducts: this.wizard.getSelectedProducts()
    }).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.wizard.setPricePreview(res.data);
        }
        this.priceLoading.set(false);
      },
      error: () => this.priceLoading.set(false)
    });
  }

  private toIsoDate(d: Date): string {
    return d.toISOString().split('T')[0];
  }
}