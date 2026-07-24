import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-12 bg-ink-100/30">
      <div class="w-full max-w-md">
        <div class="bg-white rounded-2xl shadow-card p-8">

          @if (!isSuccess()) {
            <!-- ═══ Form Ekranı ═══ -->
            <div class="text-center mb-6">
              <div class="w-16 h-16 mx-auto bg-brand-50 rounded-full flex items-center justify-center mb-4">
                <span class="text-3xl">🔐</span>
              </div>
              <h1 class="text-2xl font-extrabold text-ink-900">Şifremi Unuttum</h1>
              <p class="text-sm text-ink-500 mt-2">
                E-posta adresinizi girin. Size şifre sıfırlama bağlantısı göndereceğiz.
              </p>
            </div>

            <form (submit)="submit($event)" class="space-y-4">
              <div>
                <label class="text-xs font-bold text-ink-700 uppercase">E-posta</label>
                <input type="email"
                       [(ngModel)]="email"
                       name="email"
                       required
                       [disabled]="isSubmitting()"
                       class="input-field mt-2"
                       placeholder="ornek@email.com">
              </div>

              @if (error()) {
                <div class="bg-avis-50 border border-avis-200 text-avis-700 text-sm p-3 rounded-lg">
                  ⚠️ {{ error() }}
                </div>
              }

              <button type="submit"
                      [disabled]="isSubmitting() || !isEmailValid()"
                      class="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed">
                @if (isSubmitting()) {
                  <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Gönderiliyor...
                } @else {
                  BAĞLANTI GÖNDER
                }
              </button>
            </form>

            <div class="mt-6 pt-6 border-t border-ink-100 text-center text-sm">
              <a routerLink="/login"
                 class="text-brand-600 font-semibold hover:underline inline-flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"/>
                </svg>
                Giriş sayfasına dön
              </a>
            </div>
          } @else {
            <!-- ═══ Başarı Ekranı ═══ -->
            <div class="text-center animate-fade-in">
              <div class="w-20 h-20 mx-auto bg-accent-success/10 rounded-full flex items-center justify-center mb-4">
                <svg class="w-10 h-10 text-accent-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              <h1 class="text-2xl font-extrabold text-ink-900">E-posta Gönderildi 📧</h1>
              <p class="text-sm text-ink-700 mt-3 leading-relaxed">
                <strong>{{ email }}</strong> adresi sistemde kayıtlıysa, şifre sıfırlama bağlantısı gönderildi.
              </p>

              <div class="mt-6 bg-brand-50 border border-brand-100 rounded-lg p-4 text-left text-sm">
                <div class="flex items-start gap-2 text-ink-700">
                  <span>💡</span>
                  <div>
                    <p class="font-semibold mb-1">Sonraki adımlar:</p>
                    <ul class="space-y-1 text-xs">
                      <li>1. E-posta kutunuzu kontrol edin</li>
                      <li>2. Spam/Junk klasörünü de kontrol etmeyi unutmayın</li>
                      <li>3. Bağlantı <strong>1 saat</strong> geçerlidir</li>
                      <li>4. Butona tıklayıp yeni şifrenizi belirleyin</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div class="mt-6 pt-6 border-t border-ink-100 space-y-3">
                <a routerLink="/login"
                   class="btn-primary w-full inline-flex justify-center">
                  Giriş Sayfasına Dön
                </a>
                <button (click)="reset()"
                        class="w-full text-sm text-ink-500 hover:text-brand-600 hover:underline">
                  Farklı bir e-posta deneyin
                </button>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class ForgotPasswordComponent {
  protected auth = inject(AuthService);

  protected email = '';
  protected isSubmitting = signal(false);
  protected isSuccess = signal(false);
  protected error = signal<string | null>(null);

  protected isEmailValid(): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email.trim());
  }

  submit(event: Event): void {
    event.preventDefault();
    this.error.set(null);

    if (!this.isEmailValid()) {
      this.error.set('Geçerli bir e-posta adresi girin.');
      return;
    }

    this.isSubmitting.set(true);

    this.auth.forgotPassword(this.email.trim()).subscribe({
      next: res => {
        this.isSubmitting.set(false);
        if (res.success) {
          this.isSuccess.set(true);
        } else {
          this.error.set(res.message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
        }
      },
      error: err => {
        this.isSubmitting.set(false);
        this.error.set(
          err.error?.message ||
          'Sunucuya bağlanılamadı. İnternet bağlantınızı kontrol edin.'
        );
      }
    });
  }

  reset(): void {
    this.email = '';
    this.isSuccess.set(false);
    this.error.set(null);
  }
}
