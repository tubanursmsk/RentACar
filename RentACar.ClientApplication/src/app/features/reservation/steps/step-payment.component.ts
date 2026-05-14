import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ReservationWizardService } from '../../../core/services/reservation-wizard.service';
import { ReservationService } from '../../../core/services/reservation.service';
import { CreateReservationRequest } from '../../../core/models/reservation.model';

@Component({
  selector: 'app-step-payment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
      <!-- ═══ Sol: Ödeme Yöntemi + Form ═══ -->
      <div class="space-y-4">
        <!-- ═══ Ödeme Seçenekleri ═══ -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Online Ödeme -->
          <button (click)="selectPayment('online')"
                  class="card p-5 text-left transition-all"
                  [class.ring-2]="paymentMethod() === 'online'"
                  [class.ring-avis-600]="paymentMethod() === 'online'">
            <div class="flex items-center gap-3 mb-2">
              <svg class="w-8 h-8 text-avis-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
              </svg>
              <h3 class="font-bold text-lg">Online Ödeme</h3>
            </div>
            <div class="text-2xl font-extrabold text-avis-600 mb-1">
              ₺{{ getOnlinePrice() | number:'1.2-2' }}
            </div>
            <div class="text-xs text-success font-semibold">
              ✓ Kazancınız: ₺{{ getOnlineSavings() | number:'1.2-2' }}
            </div>
          </button>

          <!-- Ofiste Ödeme -->
          <button (click)="selectPayment('office')"
                  class="card p-5 text-left transition-all"
                  [class.ring-2]="paymentMethod() === 'office'"
                  [class.ring-avis-600]="paymentMethod() === 'office'">
            <div class="flex items-center gap-3 mb-2">
              <svg class="w-8 h-8 text-ink-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
              </svg>
              <h3 class="font-bold text-lg">Ofiste Ödeme</h3>
            </div>
            <div class="text-2xl font-extrabold text-ink-700 mb-1">
              ₺{{ getOfficePrice() | number:'1.2-2' }}
            </div>
            <div class="text-xs text-ink-500">Aracı teslim alırken ödeyin</div>
          </button>
        </div>

        <!-- ═══ Kart Bilgileri (Mock) ═══ -->
        @if (paymentMethod() === 'online') {
          <div class="card p-6 animate-fade-in">
            <h3 class="font-bold text-lg mb-2">Kart Bilgileri</h3>
            <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 text-sm text-yellow-900">
              🚧 <b>Demo modu:</b> Gerçek Iyzico entegrasyonu sonraki turda eklenecek.
              Test için "Onayla" butonuna tıklayın.
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="md:col-span-2">
                <label class="label">Kart Üzerindeki İsim</label>
                <input type="text"
                       [(ngModel)]="cardData.holderName"
                       class="input-field"
                       placeholder="AD SOYAD">
              </div>

              <div class="md:col-span-2">
                <label class="label">Kart Numarası</label>
                <input type="text"
                       [(ngModel)]="cardData.number"
                       maxlength="19"
                       class="input-field font-mono"
                       placeholder="0000 0000 0000 0000">
              </div>

              <div>
                <label class="label">Son Kullanma</label>
                <input type="text"
                       [(ngModel)]="cardData.expiry"
                       maxlength="5"
                       class="input-field"
                       placeholder="AA/YY">
              </div>

              <div>
                <label class="label">CVV</label>
                <input type="text"
                       [(ngModel)]="cardData.cvv"
                       maxlength="3"
                       class="input-field"
                       placeholder="123">
              </div>
            </div>

            <div class="mt-4 flex items-center gap-2 text-xs text-ink-500">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
              <span>256-bit SSL ile şifrelenmiş güvenli ödeme</span>
            </div>
          </div>
        }

        @if (paymentMethod() === 'office') {
          <div class="card p-6 animate-fade-in">
            <h3 class="font-bold text-lg mb-2">Ofiste Ödeme</h3>
            <p class="text-sm text-ink-700">
              Rezervasyonunuz onaylandığında, aracı teslim aldığınız ofiste
              kredi kartı veya nakit ile ödemenizi yapabilirsiniz.
            </p>
            <div class="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-900">
              ℹ️ Rezervasyonunuz "Beklemede" durumunda kalacak ve aracı teslim aldığınızda onaylanacaktır.
            </div>
          </div>
        }

        @if (submitError()) {
          <div class="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">
            {{ submitError() }}
          </div>
        }

        <!-- Alt Navigasyon -->
        <div class="flex justify-between">
          <button (click)="wizard.prevStep()"
                  [disabled]="submitting()"
                  class="btn-secondary disabled:opacity-50">
            ‹ GERİ
          </button>
          <button (click)="submitReservation()"
                  [disabled]="!canSubmit() || submitting()"
                  class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
            @if (submitting()) {
              <span class="inline-block animate-spin">⟳</span> İşleniyor...
            } @else {
              REZERVASYONU TAMAMLA ✓
            }
          </button>
        </div>
      </div>

      <!-- ═══ Sağ: Sipariş Özeti ═══ -->
      <aside class="space-y-4 lg:sticky lg:top-32 lg:self-start">
        <div class="card p-6">
          <h3 class="font-bold text-lg mb-4 pb-3 border-b border-ink-100">
            Sipariş Özeti
          </h3>

          @if (wizard.state().pricePreview; as price) {
            <div class="space-y-2 text-sm mb-4">
              @for (line of price.lines; track line.label) {
                <div class="flex justify-between gap-2">
                  <div class="min-w-0 flex-1">
                    <div class="text-ink-700">{{ line.label }}</div>
                    @if (line.detail) {
                      <div class="text-xs text-ink-500">{{ line.detail }}</div>
                    }
                  </div>
                  <div class="font-semibold text-right">
                    ₺{{ line.amount | number:'1.0-0' }}
                  </div>
                </div>
              }
            </div>

            <div class="pt-3 border-t border-ink-100 flex items-baseline justify-between">
              <span class="font-bold">Toplam</span>
              <span class="text-2xl font-extrabold text-avis-600">
                ₺{{ price.grandTotal | number:'1.2-2' }}
              </span>
            </div>
          }
        </div>

        <!-- Müşteri Bilgisi -->
        <div class="card p-5 text-sm">
          <h4 class="font-bold mb-2">Sürücü</h4>
          <p class="text-ink-700">
            {{ wizard.state().driverInfo.firstName }} {{ wizard.state().driverInfo.lastName }}
          </p>
          <p class="text-ink-500 text-xs">{{ wizard.state().driverInfo.email }}</p>
        </div>
      </aside>
    </div>
  `
})
export class StepPaymentComponent implements OnInit {
  protected wizard = inject(ReservationWizardService);
  private reservationService = inject(ReservationService);
  private router = inject(Router);

  protected paymentMethod = signal<'online' | 'office' | null>(null);
  protected submitting = signal(false);
  protected submitError = signal<string | null>(null);

  protected cardData = {
    holderName: '',
    number: '',
    expiry: '',
    cvv: ''
  };

  protected canSubmit = computed(() => {
    const method = this.paymentMethod();
    if (method === 'office') return true;
    if (method === 'online') {
      const c = this.cardData;
      return !!(c.holderName && c.number && c.expiry && c.cvv);
    }
    return false;
  });

  ngOnInit(): void {
    this.wizard.goToStep(5);

    // Önceki seçimi geri yükle
    const prev = this.wizard.state().paymentMethod;
    if (prev) this.paymentMethod.set(prev);
  }

  selectPayment(method: 'online' | 'office'): void {
    this.paymentMethod.set(method);
    this.wizard.setPaymentMethod(method);
  }

  getOnlinePrice(): number {
    const total = this.wizard.state().pricePreview?.grandTotal ?? 0;
    // Online ödeme %5 indirimli (örnek)
    return total * 0.95;
  }

  getOnlineSavings(): number {
    const total = this.wizard.state().pricePreview?.grandTotal ?? 0;
    return total * 0.05;
  }

  getOfficePrice(): number {
    return this.wizard.state().pricePreview?.grandTotal ?? 0;
  }

  // ─── REZERVASYON OLUŞTURMA ───
  submitReservation(): void {
    const state = this.wizard.state();
    if (!state.car || !state.rentStartDate || !state.rentEndDate ||
        !state.pickUpLocationId || !state.dropOffLocationId) {
      this.submitError.set('Rezervasyon bilgileri eksik.');
      return;
    }

    this.submitting.set(true);
    this.submitError.set(null);

    const request: CreateReservationRequest = {
      carId: state.car.id,
      pickUpLocationId: state.pickUpLocationId,
      dropOffLocationId: state.dropOffLocationId,
      rentStartDate: this.toIsoDate(state.rentStartDate),
      rentEndDate: this.toIsoDate(state.rentEndDate),
      insurancePackageId: state.selectedInsurance?.id ?? null,
      additionalProducts: this.wizard.getSelectedProducts(),

      driverIdentityNumber: state.driverInfo.identityNumber,
      driverFirstName: state.driverInfo.firstName,
      driverLastName: state.driverInfo.lastName,
      driverBirthDate: state.driverInfo.birthDate,
      driverLicenseNumber: state.driverInfo.licenseNumber,
      driverPhone: state.driverInfo.phone,
      driverEmail: state.driverInfo.email,
      driverAddress: state.driverInfo.address
    };

    this.reservationService.create(request).subscribe({
      next: (res) => {
        this.submitting.set(false);
        if (res.success && res.data) {
          // Başarı sayfasına yönlendir
          const reservationId = res.data;
          this.wizard.reset(); // Wizard state'i temizle
          this.router.navigate(['/rezervasyon-basarili', reservationId]);
        } else {
          this.submitError.set(res.message || 'Rezervasyon oluşturulamadı.');
        }
      },
      error: (err) => {
        this.submitting.set(false);
        this.submitError.set(err.error?.message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
      }
    });
  }

  private toIsoDate(d: Date): string {
    return d.toISOString().split('T')[0];
  }
}