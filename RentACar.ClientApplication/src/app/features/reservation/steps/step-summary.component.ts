import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReservationWizardService } from '../../../core/services/reservation-wizard.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-step-summary',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
      <!-- Sol: Özet -->
      <div class="card p-6 lg:p-8">
        <h2 class="text-2xl font-bold mb-6">Rezervasyon Özetiniz</h2>

        @if (wizard.state().car; as car) {
          <div class="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6">
            <div class="aspect-video bg-ink-100 rounded-lg overflow-hidden flex items-center justify-center">
              @if (car.imageUrl) {
                <img [src]="apiBaseUrl + car.imageUrl"
                     [alt]="car.brandName + ' ' + car.model"
                     class="w-full h-full object-cover">
              } @else {
                <span class="text-5xl">🚗</span>
              }
            </div>
            <div>
              <h3 class="text-xl font-bold">{{ car.brandName }} {{ car.model }}</h3>
              <p class="text-ink-500">{{ car.modelYear }} • {{ car.color }}</p>
              <div class="mt-3 space-y-1 text-sm">
                <div><span class="text-ink-500">Plaka:</span> <b>{{ car.plate }}</b></div>
                <div><span class="text-ink-500">Günlük:</span> <b class="text-avis-600">₺{{ car.dailyPrice | number:'1.0-0' }}</b></div>
              </div>
            </div>
          </div>

          <div class="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="bg-ink-100/40 rounded-lg p-4">
              <div class="text-xs text-ink-500 font-bold uppercase mb-1">Alış</div>
              <div class="font-semibold">{{ wizard.state().rentStartDate | date:'dd MMMM yyyy':'':'tr' }}</div>
              <div class="text-sm text-ink-500">{{ getPickupLocation() }}</div>
            </div>
            <div class="bg-ink-100/40 rounded-lg p-4">
              <div class="text-xs text-ink-500 font-bold uppercase mb-1">İade</div>
              <div class="font-semibold">{{ wizard.state().rentEndDate | date:'dd MMMM yyyy':'':'tr' }}</div>
              <div class="text-sm text-ink-500">{{ getDropoffLocation() }}</div>
            </div>
          </div>

          <div class="mt-6 p-4 bg-avis-50 border border-avis-100 rounded-lg flex items-center justify-between">
            <span class="text-sm">{{ wizard.totalDays() }} gün × ₺{{ car.dailyPrice | number:'1.0-0' }}</span>
            <span class="text-xl font-extrabold text-avis-600">
              ₺{{ (wizard.totalDays() * car.dailyPrice) | number:'1.2-2' }}
            </span>
          </div>
        } @else {
          <p class="text-ink-500">Araç bilgisi yükleniyor...</p>
        }
      </div>

      <!-- Sağ: Bilgi paneli -->
      <aside class="card p-6">
        <h3 class="font-bold text-lg mb-4">Sıradakı Adım</h3>
        <p class="text-sm text-ink-700 mb-6">
          Devam ettiğinizde size uygun güvence paketini seçeceksiniz.
        </p>

        <button (click)="next()"
                class="btn-primary w-full"
                [disabled]="!wizard.canProceedFromStep1()">
          DEVAM ET
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M9 5l7 7-7 7"/>
          </svg>
        </button>
      </aside>
    </div>
  `
})
export class StepSummaryComponent implements OnInit {
  protected wizard = inject(ReservationWizardService);
  protected apiBaseUrl = environment.apiBaseUrl;

  ngOnInit(): void {
    this.wizard.goToStep(1);
  }

  next(): void {
    this.wizard.nextStep();
  }

  getPickupLocation(): string {
    // İleride LocationService'ten doldurabiliriz
    return this.wizard.state().pickUpLocationId ? `Şube #${this.wizard.state().pickUpLocationId}` : '';
  }

  getDropoffLocation(): string {
    return this.wizard.state().dropOffLocationId ? `Şube #${this.wizard.state().dropOffLocationId}` : '';
  }
}
