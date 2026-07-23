import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ReservationWizardService } from '../../../core/services/reservation-wizard.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-step-driver',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  template: `
    <div class="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
      <!-- Sol: Form -->
      <div class="card p-6 lg:p-8">
        <h2 class="text-2xl font-bold text-brand-600 mb-2">{{ 'wizard.driver.title' | translate }}</h2>
        <p class="text-sm text-ink-700 mb-6 leading-relaxed">
          {{ 'wizard.driver.description' | translate }}
        </p>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="label">{{ 'wizard.driver.firstName' | translate }}</label>
            <input type="text"
                   [(ngModel)]="formData.firstName"
                   (blur)="syncToWizard()"
                   class="input-field"
                   [placeholder]="'wizard.driver.firstNamePlaceholder' | translate">
          </div>

          <div>
            <label class="label">{{ 'wizard.driver.lastName' | translate }}</label>
            <input type="text"
                   [(ngModel)]="formData.lastName"
                   (blur)="syncToWizard()"
                   class="input-field"
                   [placeholder]="'wizard.driver.lastNamePlaceholder' | translate">
          </div>

          <div>
            <label class="label">{{ 'wizard.driver.tcNumber' | translate }}</label>
            <input type="text"
                   [(ngModel)]="formData.identityNumber"
                   (blur)="syncToWizard(); validateTc()"
                   maxlength="11"
                   class="input-field"
                   [class.border-danger]="tcError()"
                   [placeholder]="'wizard.driver.tcPlaceholder' | translate">
            @if (tcError()) {
              <p class="text-xs text-danger mt-1">{{ tcError() }}</p>
            }
          </div>

          <div>
            <label class="label">{{ 'wizard.driver.licenseNumber' | translate }}</label>
            <input type="text"
                   [(ngModel)]="formData.licenseNumber"
                   (blur)="syncToWizard()"
                   class="input-field"
                   [placeholder]="'wizard.driver.licensePlaceholder' | translate">
          </div>

          <div>
            <label class="label">{{ 'wizard.driver.birthDate' | translate }}</label>
            <input type="date"
                   [(ngModel)]="formData.birthDate"
                   (blur)="syncToWizard(); validateAge()"
                   [max]="maxBirthDate"
                   class="input-field"
                   [class.border-danger]="ageError()">
            @if (ageError()) {
              <p class="text-xs text-danger mt-1">{{ ageError() }}</p>
            }
          </div>

          <div>
            <label class="label">{{ 'wizard.driver.phone' | translate }}</label>
            <input type="tel"
                   [(ngModel)]="formData.phone"
                   (blur)="syncToWizard()"
                   class="input-field"
                   [placeholder]="'wizard.driver.phonePlaceholder' | translate">
          </div>

          <div class="md:col-span-2">
            <label class="label">{{ 'wizard.driver.email' | translate }}</label>
            <input type="email"
                   [(ngModel)]="formData.email"
                   (blur)="syncToWizard()"
                   class="input-field"
                   [placeholder]="'wizard.driver.emailPlaceholder' | translate">
          </div>

          <div class="md:col-span-2">
            <label class="label">{{ 'wizard.driver.address' | translate }}</label>
            <textarea [(ngModel)]="formData.address"
                      (blur)="syncToWizard()"
                      rows="3"
                      class="input-field"
                      [placeholder]="'wizard.driver.addressPlaceholder' | translate"></textarea>
          </div>
        </div>

        <div class="mt-6 space-y-3">
          <label class="flex items-start gap-2 cursor-pointer">
            <input type="checkbox"
                   [(ngModel)]="acceptTerms"
                   class="w-4 h-4 mt-1 accent-brand-600">
            <span class="text-sm text-ink-700">
              {{ 'wizard.driver.acceptTermsPre' | translate }}
              <a href="#" class="text-brand-600 underline font-semibold">{{ 'wizard.driver.acceptTermsLink' | translate }}</a>
              {{ 'wizard.driver.acceptTermsPost' | translate }}
            </span>
          </label>
        </div>

        @if (validationError()) {
          <div class="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
            {{ validationError() }}
          </div>
        }

        <div class="mt-8 flex justify-between">
          <button (click)="wizard.prevStep()" class="btn-secondary">
            {{ 'wizard.common.back' | translate }}
          </button>
          <button (click)="continue()"
                  [disabled]="!isFormValid()"
                  class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
            {{ 'wizard.common.next' | translate }}
          </button>
        </div>
      </div>

      <!-- Sağ: Bilgi -->
      <aside class="space-y-4">
        <div class="card p-5">
          <h3 class="font-bold mb-3 flex items-center gap-2">
            <svg class="w-5 h-5 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
            </svg>
            {{ 'wizard.driver.dataSecurity' | translate }}
          </h3>
          <p class="text-sm text-ink-700 leading-relaxed">
            {{ 'wizard.driver.dataSecurityDesc' | translate }}
          </p>
        </div>

        <div class="card p-5 bg-blue-50 border border-blue-200">
          <h3 class="font-bold mb-2 text-blue-900">{{ 'wizard.driver.ageLimitTitle' | translate }}</h3>
          <p class="text-sm text-blue-800 leading-relaxed" [innerHTML]="'wizard.driver.ageLimitDesc' | translate"></p>
        </div>
      </aside>
    </div>
  `
})
export class StepDriverComponent implements OnInit {
  protected wizard = inject(ReservationWizardService);
  protected auth = inject(AuthService);
  private translate = inject(TranslateService);

  protected acceptTerms = signal(false);
  protected tcError = signal<string | null>(null);
  protected ageError = signal<string | null>(null);
  protected validationError = signal<string | null>(null);

  private _formVersion = signal(0);

  protected formData = {
    firstName: '',
    lastName: '',
    identityNumber: '',
    licenseNumber: '',
    birthDate: '',
    phone: '',
    email: '',
    address: ''
  };

  protected maxBirthDate = (() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 18);
    return d.toISOString().split('T')[0];
  })();

  protected isFormValid = computed(() => {
    this._formVersion();
    const d = this.formData;
    return !!(
      d.firstName.trim() &&
      d.lastName.trim() &&
      d.identityNumber.length === 11 &&
      d.licenseNumber.trim() &&
      d.birthDate &&
      d.phone.trim() &&
      this.isValidEmail(d.email) &&
      d.address.trim() &&
      this.acceptTerms() &&
      !this.tcError() &&
      !this.ageError()
    );
  });

  ngOnInit(): void {
    this.wizard.goToStep(4);

    const driver = this.wizard.state().driverInfo;
    this.formData = { ...driver };

    const user = this.auth.user();
    if (user && !this.formData.firstName) {
      this.formData.firstName = user.firstName;
      this.formData.lastName = user.lastName;
      this.formData.email = user.email;
      if (user.phone) this.formData.phone = user.phone;
    }
  }

  syncToWizard(): void {
    this.wizard.setDriverInfo(this.formData);
    this._formVersion.update(v => v + 1);
    this.validationError.set(null);
  }

  validateTc(): void {
    const tc = this.formData.identityNumber;

    if (!tc) {
      this.tcError.set(null);
      return;
    }

    if (tc.length !== 11) {
      this.tcError.set(this.translate.instant('wizard.driver.errors.tcLength'));
      return;
    }

    if (!/^\d{11}$/.test(tc)) {
      this.tcError.set(this.translate.instant('wizard.driver.errors.tcOnlyDigits'));
      return;
    }

    if (tc[0] === '0') {
      this.tcError.set(this.translate.instant('wizard.driver.errors.tcCannotStartWithZero'));
      return;
    }

    const digits = tc.split('').map(Number);
    const oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
    const evenSum = digits[1] + digits[3] + digits[5] + digits[7];

    const digit10 = (oddSum * 7 - evenSum) % 10;
    if (digit10 < 0) {
      this.tcError.set(this.translate.instant('wizard.driver.errors.tcInvalid'));
      return;
    }

    if (digit10 !== digits[9]) {
      this.tcError.set(this.translate.instant('wizard.driver.errors.tcInvalid'));
      return;
    }

    const totalFirst10 = digits.slice(0, 10).reduce((s, n) => s + n, 0);
    if (totalFirst10 % 10 !== digits[10]) {
      this.tcError.set(this.translate.instant('wizard.driver.errors.tcInvalid'));
      return;
    }

    this.tcError.set(null);
  }

  validateAge(): void {
    if (!this.formData.birthDate) {
      this.ageError.set(null);
      return;
    }

    const birth = new Date(this.formData.birthDate);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
      age--;
    }

    if (age < 18) {
      this.ageError.set(this.translate.instant('wizard.driver.errors.minAge18'));
      return;
    }

    if (age < 21) {
      const hasYoungDriver = false;

      if (!hasYoungDriver) {
        this.ageError.set(this.translate.instant('wizard.driver.errors.youngDriverRequired'));
        return;
      }
    }

    this.ageError.set(null);
  }

  continue(): void {
    this.validateTc();
    this.validateAge();

    if (!this.isFormValid()) {
      this.validationError.set(this.translate.instant('wizard.driver.errors.fillAllFields'));
      return;
    }

    this.syncToWizard();
    this.wizard.nextStep();
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}