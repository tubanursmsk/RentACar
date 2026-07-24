import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-12 bg-ink-100/30">
      <div class="w-full max-w-md">
        <div class="bg-white rounded-2xl shadow-card p-8">

          @if (!token) {
            <!-- ═══ Token Yok / Geçersiz URL ═══ -->
            <div class="text-center">
              <div class="w-20 h-20 mx-auto bg-avis-50 rounded-full flex items-center justify-center mb-4">
                <svg class="w-10 h-10 text-avis-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <h1 class="text-2xl font-extrabold text-ink-900">Geçersiz Bağlantı</h1>
              <p class="text-sm text-ink-500 mt-2">
                Bu şifre sıfırlama bağlantısı geçersiz veya eksik.
              </p>
              <a routerLink="/sifremi-unuttum"
                 class="btn-primary w-full mt-6 inline-flex justify-center">
                Yeni Bağlantı İste
              </a>
            </div>
          } @else if (isSuccess()) {
            <!-- ═══ Başarı Ekranı (Otomatik yönlendirme) ═══ -->
            <div class="text-center animate-fade-in">
              <div class="w-20 h-20 mx-auto bg-accent-success/10 rounded-full flex items-center justify-center mb-4">
                <svg class="w-10 h-10 text-accent-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              <h1 class="text-2xl font-extrabold text-ink-900">Şifreniz Değiştirildi! 🎉</h1>
              <p class="text-sm text-ink-700 mt-3">
                Yeni şifreniz başarıyla ayarlandı. Otomatik olarak giriş yapıldı.
              </p>
              <p class="text-xs text-ink-500 mt-4">
                {{ redirectCountdown() }} saniye içinde yönlendiriliyor...
              </p>
              <button (click)="goToHome()"
                      class="btn-primary w-full mt-6">
                Ana Sayfaya Git
              </button>
            </div>
          } @else {
            <!-- ═══ Form Ekranı ═══ -->
            <div class="text-center mb-6">
              <div class="w-16 h-16 mx-auto bg-brand-50 rounded-full flex items-center justify-center mb-4">
                <span class="text-3xl">🔑</span>
              </div>
              <h1 class="text-2xl font-extrabold text-ink-900">Yeni Şifre Belirle</h1>
              <p class="text-sm text-ink-500 mt-2">
                Güvenli bir şifre seçin. Şifreniz en az 6 karakter olmalı, büyük-küçük harf ve rakam içermelidir.
              </p>
            </div>

            <form (submit)="submit($event)" class="space-y-4">
              <div>
                <label class="text-xs font-bold text-ink-700 uppercase">Yeni Şifre</label>
                <div class="relative">
                  <input [type]="showPassword() ? 'text' : 'password'"
                         [(ngModel)]="newPassword"
                         name="newPassword"
                         required
                         [disabled]="isSubmitting()"
                         class="input-field mt-2 pr-10"
                         placeholder="••••••••">
                  <button type="button"
                          (click)="showPassword.set(!showPassword())"
                          class="absolute right-3 top-1/2 mt-1 text-ink-400 hover:text-ink-700"
                          tabindex="-1">
                    @if (showPassword()) {
                      <!-- Kapalı göz -->
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                      </svg>
                    } @else {
                      <!-- Açık göz -->
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                      </svg>
                    }
                  </button>
                </div>
              </div>

              <div>
                <label class="text-xs font-bold text-ink-700 uppercase">Şifre Tekrar</label>
                <input type="password"
                       [(ngModel)]="confirmPassword"
                       name="confirmPassword"
                       required
                       [disabled]="isSubmitting()"
                       class="input-field mt-2"
                       placeholder="••••••••">
              </div>

              <!-- Şifre Gücü Göstergesi -->
              @if (newPassword) {
                <div class="space-y-1">
                  <div class="flex items-center gap-1 text-xs" [class.text-accent-success]="hasMinLength()" [class.text-ink-400]="!hasMinLength()">
                    <span>{{ hasMinLength() ? '✓' : '○' }}</span> En az 6 karakter
                  </div>
                  <div class="flex items-center gap-1 text-xs" [class.text-accent-success]="hasUpperLower()" [class.text-ink-400]="!hasUpperLower()">
                    <span>{{ hasUpperLower() ? '✓' : '○' }}</span> Büyük ve küçük harf
                  </div>
                  <div class="flex items-center gap-1 text-xs" [class.text-accent-success]="hasNumber()" [class.text-ink-400]="!hasNumber()">
                    <span>{{ hasNumber() ? '✓' : '○' }}</span> En az bir rakam
                  </div>
                  @if (confirmPassword) {
                    <div class="flex items-center gap-1 text-xs" [class.text-accent-success]="passwordsMatch()" [class.text-avis-600]="!passwordsMatch()">
                      <span>{{ passwordsMatch() ? '✓' : '✗' }}</span>
                      {{ passwordsMatch() ? 'Şifreler eşleşiyor' : 'Şifreler eşleşmiyor' }}
                    </div>
                  }
                </div>
              }

              @if (error()) {
                <div class="bg-avis-50 border border-avis-200 text-avis-700 text-sm p-3 rounded-lg">
                  ⚠️ {{ error() }}
                </div>
              }

              <button type="submit"
                      [disabled]="isSubmitting() || !isFormValid()"
                      class="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed">
                @if (isSubmitting()) {
                  <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  İşleniyor...
                } @else {
                  ŞİFREYİ DEĞİŞTİR
                }
              </button>
            </form>

            <div class="mt-6 pt-6 border-t border-ink-100 text-center text-sm">
              <a routerLink="/login" class="text-brand-600 font-semibold hover:underline">
                Giriş sayfasına dön
              </a>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class ResetPasswordComponent implements OnInit {
  private auth = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  protected token: string | null = null;
  protected newPassword = '';
  protected confirmPassword = '';
  protected showPassword = signal(false);
  protected isSubmitting = signal(false);
  protected isSuccess = signal(false);
  protected error = signal<string | null>(null);
  protected redirectCountdown = signal(5);

  // ═══ Şifre validation ═══
  protected hasMinLength = () => this.newPassword.length >= 6;
  protected hasUpperLower = () => /[a-z]/.test(this.newPassword) && /[A-Z]/.test(this.newPassword);
  protected hasNumber = () => /\d/.test(this.newPassword);
  protected passwordsMatch = () => this.newPassword === this.confirmPassword;

  protected isFormValid(): boolean {
    return this.hasMinLength()
        && this.hasUpperLower()
        && this.hasNumber()
        && this.passwordsMatch();
  }

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParams['token'] || null;
  }

  submit(event: Event): void {
    event.preventDefault();
    this.error.set(null);

    if (!this.token) {
      this.error.set('Geçersiz bağlantı.');
      return;
    }

    if (!this.isFormValid()) {
      this.error.set('Lütfen tüm alanları doğru doldurun.');
      return;
    }

    this.isSubmitting.set(true);

    this.auth.resetPassword(this.token, this.newPassword).subscribe({
      next: res => {
        this.isSubmitting.set(false);
        if (res.success) {
          this.isSuccess.set(true);
          this.startRedirectCountdown();
        } else {
          this.error.set(res.message || 'Şifre değiştirilemedi. Lütfen yeni bir bağlantı isteyin.');
        }
      },
      error: err => {
        this.isSubmitting.set(false);
        this.error.set(
          err.error?.message ||
          'Bir hata oluştu. Bağlantı süresi dolmuş olabilir.'
        );
      }
    });
  }

  private startRedirectCountdown(): void {
    const interval = setInterval(() => {
      this.redirectCountdown.update(n => n - 1);
      if (this.redirectCountdown() <= 0) {
        clearInterval(interval);
        this.goToHome();
      }
    }, 1000);
  }

  goToHome(): void {
    this.router.navigate(['/']);
  }
}
