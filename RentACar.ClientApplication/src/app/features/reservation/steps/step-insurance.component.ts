import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReservationWizardService } from '../../../../core/services/reservation-wizard.service';

@Component({
  selector: 'app-step-insurance',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card p-6 lg:p-8">
      <h2 class="text-2xl font-bold mb-2">Güvence Paketleri</h2>
      <p class="text-ink-500 mb-6">Bu adım henüz tam içerikli değil — sonraki turda paketleri göreceksin.</p>

      <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
        🚧 Bu step yapım aşamasında. Şu an sadece navigasyon test ediliyor.
      </div>

      <div class="mt-6 flex justify-between">
        <button (click)="wizard.prevStep()" class="btn-secondary">‹ GERİ</button>
        <button (click)="wizard.nextStep()" class="btn-primary">DEVAM ET ›</button>
      </div>
    </div>
  `
})
export class StepInsuranceComponent implements OnInit {
  protected wizard = inject(ReservationWizardService);

  ngOnInit(): void {
    this.wizard.goToStep(2);
  }
}
