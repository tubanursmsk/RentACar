import { Component, OnInit, DestroyRef, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReservationWizardService } from '../../core/services/reservation-wizard.service';
import { CarService } from '../../core/services/car.service';
import { BookingStateService } from '../../core/services/booking-state.service';

interface Step {
  number: number;
  title: string;
}

@Component({
  selector: 'app-reservation-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <div class="min-h-screen bg-ink-100/30">
      <!-- ═══ ÜST: AVIS Banner ═══ -->
      <div class="bg-avis-600 py-4">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <h1 class="text-white text-xl font-bold">
            Rezervasyonunuz
            @if (wizard.totalDays() > 0) {
              <span class="font-normal text-white/80">({{ wizard.totalDays() }} Gün)</span>
            }
          </h1>
        </div>
      </div>

      <!-- ═══ STEPPER ═══ -->
      <div class="bg-white shadow-sm sticky top-0 z-30">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex">
            @for (step of steps; track step.number; let i = $index) {
              <div class="flex-1 relative">
                <!-- Progress bar -->
                <div class="absolute top-0 left-0 right-0 h-1"
                     [class.bg-avis-600]="step.number <= wizard.currentStep()"
                     [class.bg-ink-100]="step.number > wizard.currentStep()">
                </div>

                <button
                  (click)="goToStep(step.number)"
                  [disabled]="!canGoToStep(step.number)"
                  class="w-full py-4 px-2 text-left transition-colors group"
                  [class.cursor-not-allowed]="!canGoToStep(step.number)"
                  [class.cursor-pointer]="canGoToStep(step.number)">

                  <div class="flex items-center gap-2">
                    @if (step.number < wizard.currentStep()) {
                      <!-- Tamamlanmış -->
                      <svg class="w-5 h-5 text-success" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
                      </svg>
                    } @else if (step.number === wizard.currentStep()) {
                      <!-- Aktif -->
                      <div class="w-5 h-5 rounded-full bg-avis-600 text-white flex items-center justify-center text-xs font-bold">
                        {{ step.number }}
                      </div>
                    } @else {
                      <!-- Sıradaki -->
                      <div class="w-5 h-5 rounded-full bg-ink-100 text-ink-500 flex items-center justify-center text-xs font-bold">
                        {{ step.number }}
                      </div>
                    }
                    <span class="text-sm font-bold hidden md:inline"
                          [class.text-avis-600]="step.number === wizard.currentStep()"
                          [class.text-ink-700]="step.number < wizard.currentStep()"
                          [class.text-ink-500]="step.number > wizard.currentStep()">
                      {{ step.number }} - {{ step.title }}
                    </span>
                  </div>

                  <!-- Mevcut adım için "DÜZENLE" linki -->
                  @if (step.number < wizard.currentStep()) {
                    <span class="text-[10px] font-bold text-avis-600 hidden md:inline-block mt-1">
                      DÜZENLE
                    </span>
                  }
                </button>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- ═══ İçerik + Sticky Özet ═══ -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <router-outlet />
      </div>

      <!-- ═══ Alt Sticky Toplam (Avis stili) ═══ -->
      @if (wizard.state().pricePreview; as price) {
        <div class="sticky bottom-0 bg-ink-700 text-white py-3 shadow-2xl z-20">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center gap-6">
            <span class="text-sm">Toplam Tutar</span>
            <span class="text-2xl font-extrabold text-avis-300">
              ₺{{ price.grandTotal | number:'1.2-2' }}
            </span>
          </div>
        </div>
      }
    </div>
  `
})
export class ReservationLayoutComponent implements OnInit {
  protected wizard = inject(ReservationWizardService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private carService = inject(CarService);
  private bookingState = inject(BookingStateService);
  private destroyRef = inject(DestroyRef);

  protected steps: Step[] = [
    { number: 1, title: 'Alış & İade Ofisi' },
    { number: 2, title: 'Güvence Paketleri' },
    { number: 3, title: 'Ek Ürünler' },
    { number: 4, title: 'Sürücü Bilgileri' },
    { number: 5, title: 'Ödeme Bilgileri' }
  ];

  constructor() {
    // Adımı erken restore et — effect'in ilk çalışması doğru adımı görsün
    this.wizard.restoreStep();

    // Wizard currentStep her değiştiğinde route'u güncelle
    effect(() => {
      const step = this.wizard.currentStep();
      const target = `/rezervasyon/${this.routeForStep(step)}`;
      const currentBase = this.router.url.split('?')[0];
      if (currentBase !== target) {
        this.router.navigate(['/rezervasyon', this.routeForStep(step)], {
          queryParamsHandling: 'preserve'
        });
      }
    });
  }

  ngOnInit(): void {
    this.route.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => {
        const carId = +params['carId'];
        if (carId && !this.wizard.state().car) {
          this.initializeFromQueryParams(carId);
        }
      });
  }

  goToStep(step: number): void {
    if (this.canGoToStep(step)) {
      this.wizard.goToStep(step);
      // effect() route sync'i halleder
    }
  }

  canGoToStep(stepNumber: number): boolean {
    return stepNumber <= this.wizard.currentStep();
  }

  private initializeFromQueryParams(carId: number): void {
    const booking = this.bookingState.selection();
    this.carService.getById(carId).subscribe(res => {
      if (res.success && res.data && booking.pickupLocationId && booking.pickupDate && booking.returnDate) {
        this.wizard.setCarAndDates(
          res.data,
          booking.pickupLocationId,
          booking.returnLocationId ?? booking.pickupLocationId,
          booking.pickupDate,
          booking.returnDate
        );
      } else {
        this.router.navigate(['/']);
      }
    });
  }

  private routeForStep(step: number): string {
    const map: Record<number, string> = {
      1: 'ozet',
      2: 'guvence',
      3: 'ek-urunler',
      4: 'surucu',
      5: 'odeme'
    };
    return map[step] ?? 'ozet';
  }
}
