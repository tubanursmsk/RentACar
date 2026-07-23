import { Component, OnInit, DestroyRef, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { Subject, EMPTY } from 'rxjs';
import { debounceTime, switchMap, catchError } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReservationWizardService } from '../../../core/services/reservation-wizard.service';
import { AdditionalProductService } from '../../../core/services/additional-product.service';
import { ReservationService } from '../../../core/services/reservation.service';
import { AdditionalProduct } from '../../../core/models/reservation.model';

@Component({
  selector: 'app-step-extras',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div>
      <div class="mb-6">
        <h2 class="text-2xl font-bold text-brand-600 mb-2">{{ 'wizard.extras.title' | translate }}</h2>
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3 text-sm">
          <svg class="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <span class="text-blue-900">
            {{ 'wizard.extras.winterTireInfo' | translate }}
          </span>
        </div>
      </div>

      @if (loading()) {
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          @for (i of [1,2,3,4]; track i) {
            <div class="card p-6 animate-pulse">
              <div class="h-6 bg-ink-100 rounded w-1/2"></div>
              <div class="h-4 bg-ink-100 rounded mt-3 w-full"></div>
              <div class="h-12 bg-ink-100 rounded mt-4"></div>
            </div>
          }
        </div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          @for (product of products(); track product.id) {
            <div class="card p-5">
              <div class="flex items-start justify-between mb-2">
                <div class="flex items-center gap-2">
                  <i class="fa-solid {{ product.iconName }} text-brand-600"></i>
                  <h3 class="text-lg font-bold text-brand-600">{{ product.name }}</h3>
                </div>
                <button class="text-xs font-bold text-ink-700 hover:text-brand-600 flex items-center gap-1">
                  {{ 'wizard.common.detailedInfo' | translate }}
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </button>
              </div>

              <p class="text-sm text-ink-700 leading-relaxed mb-4">
                {{ product.description }}
              </p>

              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <button (click)="decrease(product)"
                          [disabled]="getQuantity(product.id) === 0"
                          class="w-10 h-10 rounded-full bg-white border-2 border-avis-600 text-brand-600
                                 flex items-center justify-center font-bold text-xl
                                 hover:bg-avis-50 transition disabled:opacity-30 disabled:cursor-not-allowed">
                    −
                  </button>

                  <div class="min-w-[40px] text-center font-bold text-lg">
                    {{ getQuantity(product.id) }}
                  </div>

                  <button (click)="increase(product)"
                          [disabled]="getQuantity(product.id) >= product.maxQuantity"
                          class="w-10 h-10 rounded-full bg-brand-600 text-white
                                 flex items-center justify-center font-bold text-xl
                                 hover:bg-avis-700 transition disabled:opacity-30 disabled:cursor-not-allowed">
                    +
                  </button>
                </div>

                <div class="text-right">
                  <div class="text-lg font-extrabold text-ink-900">
                    @if (getQuantity(product.id) > 0) {
                      ₺{{ (product.dailyPrice * getQuantity(product.id) * wizard.totalDays()) | number:'1.0-0' }}
                    } @else {
                      ₺{{ (product.dailyPrice * wizard.totalDays()) | number:'1.0-0' }}
                    }
                  </div>
                  <div class="text-xs text-ink-500">
                    {{ wizard.totalDays() }} {{ 'wizard.common.days' | translate }}
                  </div>
                </div>
              </div>
            </div>
          }
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
        <button (click)="continue()" class="btn-primary">
          {{ 'wizard.common.next' | translate }}
        </button>
      </div>
    </div>
  `
})
export class StepExtrasComponent implements OnInit {
  protected wizard = inject(ReservationWizardService);
  private productService = inject(AdditionalProductService);
  private reservationService = inject(ReservationService);
  private destroyRef = inject(DestroyRef);

  protected products = this.productService.products;
  protected loading = signal(true);
  protected priceLoading = signal(false);

  private priceSubject = new Subject<void>();

  constructor() {
    this.priceSubject.pipe(
      debounceTime(350),
      switchMap(() => {
        const s = this.wizard.state();
        if (!s.car || !s.rentStartDate || !s.rentEndDate) return EMPTY;
        this.priceLoading.set(true);
        return this.reservationService.calculatePrice({
          carId: s.car.id,
          rentStartDate: this.toIsoDate(s.rentStartDate),
          rentEndDate: this.toIsoDate(s.rentEndDate),
          insurancePackageId: s.selectedInsurance?.id ?? null,
          additionalProducts: this.wizard.getSelectedProducts()
        }).pipe(
          catchError(() => { this.priceLoading.set(false); return EMPTY; })
        );
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(res => {
      if (res.success && res.data) this.wizard.setPricePreview(res.data);
      this.priceLoading.set(false);
    });
  }

  ngOnInit(): void {
    this.wizard.goToStep(3);

    if (this.products().length === 0) {
      this.productService.getAll().subscribe({
        next: () => this.loading.set(false),
        error: () => this.loading.set(false)
      });
    } else {
      this.loading.set(false);
    }

    this.recalculatePrice();
  }

  getQuantity(productId: number): number {
    return this.wizard.getProductQuantity(productId);
  }

  increase(product: AdditionalProduct): void {
    const current = this.getQuantity(product.id);
    if (current >= product.maxQuantity) return;
    this.wizard.setProductQuantity(product.id, current + 1);
    this.recalculatePrice();
  }

  decrease(product: AdditionalProduct): void {
    const current = this.getQuantity(product.id);
    if (current <= 0) return;
    this.wizard.setProductQuantity(product.id, current - 1);
    this.recalculatePrice();
  }

  continue(): void {
    this.wizard.nextStep();
  }

  private recalculatePrice(): void {
    this.priceSubject.next();
  }

  private toIsoDate(d: Date): string {
    return d.toISOString().split('T')[0];
  }
}