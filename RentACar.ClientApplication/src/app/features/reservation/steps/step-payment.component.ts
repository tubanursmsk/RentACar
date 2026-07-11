import { Component, OnInit, computed, HostListener, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ReservationWizardService } from '../../../core/services/reservation-wizard.service';
import { ReservationService } from '../../../core/services/reservation.service';
import { PaymentService } from '../../../core/services/payment.service';
import { CreateReservationRequest } from '../../../core/models/reservation.model';

@Component({
  selector: 'app-step-payment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
      <!-- ═══ Sol: Ödeme ═══ -->
      <div class="space-y-4">

        <!-- ═══ Ödeme Seçenekleri ═══ -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button (click)="selectPayment('online')"
                  class="card p-5 text-left transition-all"
                  [class.ring-2]="paymentMethod() === 'online'"
                  [class.ring-brand-600]="paymentMethod() === 'online'">
            <div class="flex items-center gap-3 mb-2">
              <svg class="w-8 h-8 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
              </svg>
              <h3 class="font-bold text-lg">Online Ödeme</h3>
            </div>
            <div class="text-2xl font-extrabold text-brand-600 mb-1">
              ₺{{ getOnlinePrice() | number:'1.2-2' }}
            </div>
            <div class="text-xs text-accent-success font-semibold">
              ✓ Kazancınız: ₺{{ getOnlineSavings() | number:'1.2-2' }}
            </div>
          </button>

          <button (click)="selectPayment('office')"
                  class="card p-5 text-left transition-all"
                  [class.ring-2]="paymentMethod() === 'office'"
                  [class.ring-brand-600]="paymentMethod() === 'office'">
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

        <!-- ═══ Online Kart Formu ═══ -->
        @if (paymentMethod() === 'online') {
          <div class="card p-6 animate-fade-in">
            <h3 class="font-bold text-lg mb-2">Kart Bilgileri</h3>

            <div class="bg-brand-50 border border-brand-100 rounded-lg p-3 mb-4 text-sm text-ink-700">
              🔒 <b>Iyzico Sandbox</b> — Test için hazır: Kart <code class="bg-white px-1 rounded">5528790000000008</code>,
              CVC <code class="bg-white px-1 rounded">123</code>, Son kul. <code class="bg-white px-1 rounded">12/30</code>,
              SMS <code class="bg-white px-1 rounded">283126</code>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="md:col-span-2">
                <label class="label">Kart Üzerindeki İsim</label>
                <input type="text"
                       [(ngModel)]="cardData.holderName"
                       maxlength="200"
                       class="input-field"
                       placeholder="AD SOYAD">
              </div>

              <div class="md:col-span-2">
                <label class="label">Kart Numarası</label>
                <input type="text"
                       [ngModel]="cardData.number"
                       (ngModelChange)="onCardNumberChange($event)"
                       maxlength="19"
                       class="input-field font-mono tracking-wider"
                       placeholder="0000 0000 0000 0000">
              </div>

              <div>
                <label class="label">Son Kullanma (AA/YY)</label>
                <input type="text"
                       [ngModel]="cardData.expiry"
                       (ngModelChange)="onExpiryChange($event)"
                       maxlength="5"
                       class="input-field font-mono"
                       placeholder="12/30">
              </div>

              <div>
                <label class="label">CVC</label>
                <input type="text"
                       [(ngModel)]="cardData.cvc"
                       maxlength="4"
                       inputmode="numeric"
                       class="input-field font-mono"
                       placeholder="123">
              </div>
            </div>

            <div class="mt-4 flex items-center gap-2 text-xs text-ink-500">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
              <span>256-bit SSL • 3D Secure ile korumalı</span>
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
            <div class="mt-4 bg-brand-50 border border-brand-100 rounded-lg p-3 text-sm text-ink-700">
              ℹ️ Rezervasyonunuz "Beklemede" durumunda kalacak ve aracı teslim aldığınızda onaylanacaktır.
            </div>
          </div>
        }

        @if (submitError()) {
          <div class="bg-accent-danger/10 border border-accent-danger/20 rounded-lg p-4 text-sm text-accent-danger">
            ⚠️ {{ submitError() }}
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
              <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              İşleniyor...
            } @else {
              REZERVASYONU TAMAMLA ✓
            }
          </button>
        </div>
      </div>

      <!-- ═══ Sağ: Sipariş Özeti ═══ -->
      <aside class="space-y-4 lg:sticky lg:top-32 lg:self-start">
        <div class="card p-6">
          <h3 class="font-bold text-lg mb-4 pb-3 border-b border-ink-100">Sipariş Özeti</h3>
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
                  <div class="font-semibold text-right">₺{{ line.amount | number:'1.0-0' }}</div>
                </div>
              }
            </div>
            <div class="pt-3 border-t border-ink-100 flex items-baseline justify-between">
              <span class="font-bold">Toplam</span>
              <span class="text-2xl font-extrabold text-brand-600">
                ₺{{ price.grandTotal | number:'1.2-2' }}
              </span>
            </div>
          }
        </div>

        <div class="card p-5 text-sm">
          <h4 class="font-bold mb-2">Sürücü</h4>
          <p class="text-ink-700">
            {{ wizard.state().driverInfo.firstName }} {{ wizard.state().driverInfo.lastName }}
          </p>
          <p class="text-ink-500 text-xs">{{ wizard.state().driverInfo.email }}</p>
        </div>
      </aside>
    </div>

    <!-- ═══════════════════════════════════════════════════ -->
    <!-- 3DS IFRAME MODAL — Iyzico banka sayfası               -->
    <!-- ═══════════════════════════════════════════════════ -->
    @if (threeDSHtml()) {
      <div class="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <div class="px-6 py-4 border-b border-ink-100 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 bg-brand-50 rounded-full flex items-center justify-center">
                <svg class="w-5 h-5 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
              </div>
              <div>
                <div class="font-bold text-ink-900">3D Secure Doğrulama</div>
                <div class="text-xs text-ink-500">Bankanızdan gelen SMS kodunu girin</div>
              </div>
            </div>
            <button (click)="cancelThreeDS()"
                    class="w-9 h-9 rounded-full hover:bg-ink-100 flex items-center justify-center">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <iframe [srcdoc]="threeDSHtmlSafe()"
                  class="w-full flex-1 border-0"
                  style="min-height: 500px;"
                  sandbox="allow-forms allow-scripts allow-same-origin allow-top-navigation allow-popups">
          </iframe>
        </div>
      </div>
    }
  `
})
export class StepPaymentComponent implements OnInit {
  protected wizard = inject(ReservationWizardService);
  private reservationService = inject(ReservationService);
  private paymentService = inject(PaymentService);
  private router = inject(Router);
  private sanitizer = inject(DomSanitizer);

  protected paymentMethod = signal<'online' | 'office' | null>(null);
  protected submitting = signal(false);
  protected submitError = signal<string | null>(null);
  protected threeDSHtml = signal<string | null>(null);

  protected cardData = {
    holderName: '',
    number: '',
    expiry: '',
    cvc: ''
  };

  protected canSubmit = computed(() => {
    const method = this.paymentMethod();
    if (method === 'office') return true;
    if (method === 'online') {
      const c = this.cardData;
      const numDigits = c.number.replace(/\s/g, '');
      return !!(
        c.holderName.trim().length >= 3 &&
        numDigits.length === 16 &&
        /^\d{2}\/\d{2}$/.test(c.expiry) &&
        c.cvc.length >= 3
      );
    }
    return false;
  });

  protected threeDSHtmlSafe = computed((): SafeHtml =>
    this.sanitizer.bypassSecurityTrustHtml(this.threeDSHtml() ?? '')
  );

  ngOnInit(): void {
    this.wizard.goToStep(5);
    const prev = this.wizard.state().paymentMethod;
    if (prev) this.paymentMethod.set(prev);
  }

  selectPayment(method: 'online' | 'office'): void {
    this.paymentMethod.set(method);
    this.wizard.setPaymentMethod(method);
    this.submitError.set(null);
  }

  getOnlinePrice(): number {
    return (this.wizard.state().pricePreview?.grandTotal ?? 0) * 0.95;
  }
  getOnlineSavings(): number {
    return (this.wizard.state().pricePreview?.grandTotal ?? 0) * 0.05;
  }
  getOfficePrice(): number {
    return this.wizard.state().pricePreview?.grandTotal ?? 0;
  }

  // Kart no formatlaması: 1234 5678 9012 3456
  onCardNumberChange(value: string): void {
    const digits = value.replace(/\D/g, '').slice(0, 16);
    this.cardData.number = digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  }

  onExpiryChange(value: string): void {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    if (digits.length <= 2) {
      this.cardData.expiry = digits;
    } else {
      this.cardData.expiry = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }
  }

  @HostListener('window:message', ['$event'])
  onIframeMessage(event: MessageEvent): void {
    // Iyzico callback iframe içinden top-level navigation yaparsa buraya düşer
    // Kullanıcı ödeme sonuç sayfasına yönlenir — iframe kapanır
    if (event.data === 'payment-completed') {
      this.threeDSHtml.set(null);
    }
  }

  cancelThreeDS(): void {
    this.threeDSHtml.set(null);
    this.submitError.set('Ödeme iptal edildi. Kart bilgilerinizi tekrar girmek isterseniz onaylayın.');
  }

  // ═══════════════════════════════════════════════════
  // Ana submit metodu
  // ═══════════════════════════════════════════════════
  submitReservation(): void {
    const state = this.wizard.state();
    if (!state.car || !state.rentStartDate || !state.rentEndDate ||
        !state.pickUpLocationId || !state.dropOffLocationId) {
      this.submitError.set('Rezervasyon bilgileri eksik.');
      return;
    }

    if (this.paymentMethod() === 'office') {
      this.createReservationForOffice(state);
    } else if (this.paymentMethod() === 'online') {
      this.createAndInitPayment(state);
    }
  }

  // Ofiste ödeme akışı - eskisi gibi
  private createReservationForOffice(state: any): void {
    this.submitting.set(true);
    this.submitError.set(null);

    const request = this.buildCreateRequest(state);

    this.reservationService.create(request).subscribe({
      next: (res) => {
        this.submitting.set(false);
        if (res.success && res.data) {
          const reservationId = res.data;
          this.wizard.reset();
          this.router.navigate(['/rezervasyon-basarili', reservationId]);
        } else {
          this.submitError.set(res.message || 'Rezervasyon oluşturulamadı.');
        }
      },
      error: (err) => {
        this.submitting.set(false);
        this.submitError.set(err.error?.message || 'Bir hata oluştu.');
      }
    });
  }

  // Online ödeme akışı - iki adım: create + payment init
  private createAndInitPayment(state: any): void {
    this.submitting.set(true);
    this.submitError.set(null);

    const request = this.buildCreateRequest(state);

    // Adım 1: Rezervasyonu oluştur
    this.reservationService.create(request).subscribe({
      next: (createRes) => {
        if (!createRes.success || !createRes.data) {
          this.submitting.set(false);
          this.submitError.set(createRes.message || 'Rezervasyon oluşturulamadı.');
          return;
        }

        const rentalId = createRes.data;

        // Adım 2: Iyzico 3DS başlat
        const [expMonth, expYearShort] = this.cardData.expiry.split('/');
        const expYear = '20' + expYearShort;

        this.paymentService.initThreeDS({
          rentalId,
          cardHolderName: this.cardData.holderName.trim(),
          cardNumber: this.cardData.number.replace(/\s/g, ''),
          expireMonth: expMonth,
          expireYear: expYear,
          cvc: this.cardData.cvc
        }).subscribe({
          next: (paymentRes) => {
            this.submitting.set(false);
            if (paymentRes.success && paymentRes.data) {
              // 3DS iframe'i aç
              this.threeDSHtml.set(paymentRes.data.threeDSHtmlContent);
              // Wizard'ı temizleme — kullanıcı 3DS'ten geri dönebilir
            } else {
              this.submitError.set(paymentRes.message || 'Ödeme başlatılamadı.');
            }
          },
          error: (err) => {
            this.submitting.set(false);
            this.submitError.set(
              err.error?.message ||
              'Ödeme sistemi cevap vermiyor. Rezervasyon "Rezervasyonlarım" sayfanızda ofiste ödeme olarak bekliyor.'
            );
          }
        });
      },
      error: (err) => {
        this.submitting.set(false);
        this.submitError.set(err.error?.message || 'Rezervasyon oluşturulamadı.');
      }
    });
  }

  private buildCreateRequest(state: any): CreateReservationRequest {
    return {
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
  }

  private toIsoDate(d: Date): string {
    return d.toISOString().split('T')[0];
  }
}
