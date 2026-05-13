import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-12 bg-ink-100/30">
      <div class="w-full max-w-lg">
        <div class="bg-white rounded-2xl shadow-card p-8">

          <h1 class="text-2xl font-extrabold text-ink-900 text-center">Üye Ol</h1>
          <p class="text-sm text-ink-500 text-center mt-2">
            Ücretsiz hesap oluşturun, hemen araç kiralayın.
          </p>

          <form (submit)="register($event)" class="mt-6 space-y-4" novalidate>

            <!-- Ad / Soyad -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="text-xs font-bold text-ink-700 uppercase">Ad</label>
                <input type="text"
                       [(ngModel)]="firstName"
                       name="firstName"
                       required
                       autocomplete="given-name"
                       class="input-field mt-2"
                       placeholder="Adınız">
              </div>
              <div>
                <label class="text-xs font-bold text-ink-700 uppercase">Soyad</label>
                <input type="text"
                       [(ngModel)]="lastName"
                       name="lastName"
                       required
                       autocomplete="family-name"
                       class="input-field mt-2"
                       placeholder="Soyadınız">
              </div>
            </div>

            <!-- E-posta -->
            <div>
              <label class="text-xs font-bold text-ink-700 uppercase">E-posta</label>
              <input type="email"
                     [(ngModel)]="email"
                     name="email"
                     required
                     autocomplete="email"
                     class="input-field mt-2"
                     placeholder="ornek@email.com">
            </div>

            <!-- Telefon -->
            <div>
              <label class="text-xs font-bold text-ink-700 uppercase">Telefon</label>
              <input type="tel"
                     [(ngModel)]="phone"
                     name="phone"
                     required
                     autocomplete="tel"
                     class="input-field mt-2"
                     placeholder="05XX XXX XX XX">
            </div>

            <!-- TC Kimlik No -->
            <div>
              <label class="text-xs font-bold text-ink-700 uppercase">TC Kimlik No</label>
              <input type="text"
                     [(ngModel)]="identityNumber"
                     name="identityNumber"
                     required
                     maxlength="11"
                     inputmode="numeric"
                     class="input-field mt-2"
                     placeholder="11 haneli TC Kimlik numaranız">
            </div>

            <!-- Doğum Tarihi -->
            <div>
              <label class="text-xs font-bold text-ink-700 uppercase">Doğum Tarihi</label>
              <input type="date"
                     [(ngModel)]="dateOfBirth"
                     name="dateOfBirth"
                     required
                     [max]="maxBirthDate"
                     class="input-field mt-2 cursor-pointer">
            </div>

            <!-- Şifre -->
            <div>
              <label class="text-xs font-bold text-ink-700 uppercase">Şifre</label>
              <input type="password"
                     [(ngModel)]="password"
                     name="password"
                     required
                     autocomplete="new-password"
                     class="input-field mt-2"
                     placeholder="••••••••">
              <p class="text-[11px] text-ink-400 mt-1">
                En az 6 karakter; büyük harf, küçük harf ve rakam içermelidir.
              </p>
            </div>

            <!-- Şifre Tekrar -->
            <div>
              <label class="text-xs font-bold text-ink-700 uppercase">Şifre Tekrar</label>
              <input type="password"
                     [(ngModel)]="confirmPassword"
                     name="confirmPassword"
                     required
                     autocomplete="new-password"
                     class="input-field mt-2"
                     placeholder="••••••••">
            </div>

            <!-- Hata mesajı -->
            @if (error()) {
              <div class="bg-avis-50 border border-avis-200 text-avis-700 text-sm p-3 rounded-lg">
                {{ error() }}
              </div>
            }

            <button type="submit"
                    [disabled]="isSubmitting() || !isFormValid()"
                    class="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed mt-2">
              @if (isSubmitting()) {
                Kayıt yapılıyor...
              } @else {
                ÜYE OL
              }
            </button>
          </form>

          <div class="mt-6 text-center text-sm text-ink-500">
            Zaten hesabınız var mı?
            <a routerLink="/login" class="text-avis-600 font-bold hover:underline ml-1">
              Giriş yapın
            </a>
          </div>

        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  protected auth = inject(AuthService);
  private router = inject(Router);

  protected firstName = '';
  protected lastName = '';
  protected email = '';
  protected phone = '';
  protected identityNumber = '';
  protected dateOfBirth = '';
  protected password = '';
  protected confirmPassword = '';

  protected error = signal<string | null>(null);
  protected isSubmitting = signal(false);

  protected maxBirthDate = (() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 18);
    return d.toISOString().split('T')[0];
  })();

  protected isFormValid(): boolean {
    return !!(
      this.firstName &&
      this.lastName &&
      this.email &&
      this.phone &&
      this.identityNumber &&
      this.dateOfBirth &&
      this.password &&
      this.confirmPassword
    );
  }

  register(event: Event): void {
    event.preventDefault();
    this.error.set(null);

    if (this.password !== this.confirmPassword) {
      this.error.set('Şifreler eşleşmiyor.');
      return;
    }

    if (this.identityNumber.length !== 11) {
      this.error.set('TC Kimlik numarası 11 haneli olmalıdır.');
      return;
    }

    this.isSubmitting.set(true);

    this.auth.register({
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      phone: this.phone,
      identityNumber: this.identityNumber,
      dateOfBirth: this.dateOfBirth,
      password: this.password
    }).subscribe({
      next: res => {
        if (res.success) {
          this.auth.login({ email: this.email, password: this.password }).subscribe({
            next: loginRes => {
              this.isSubmitting.set(false);
              this.router.navigate([loginRes.success ? '/' : '/login']);
            },
            error: () => {
              this.isSubmitting.set(false);
              this.router.navigate(['/login']);
            }
          });
        } else {
          this.isSubmitting.set(false);
          this.error.set(res.message || 'Kayıt başarısız. Lütfen bilgilerinizi kontrol edin.');
        }
      },
      error: err => {
        this.isSubmitting.set(false);
        this.error.set(
          err.error?.message ??
          err.error?.errors?.[0] ??
          'Kayıt yapılamadı. Lütfen bilgilerinizi kontrol edin.'
        );
      }
    });
  }
}
