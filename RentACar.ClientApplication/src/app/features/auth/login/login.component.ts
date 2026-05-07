import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-12 bg-ink-100/30">
      <div class="w-full max-w-md">
        <div class="bg-white rounded-2xl shadow-card p-8">
          <h1 class="text-2xl font-extrabold text-ink-900 text-center">Giriş Yap</h1>
          <p class="text-sm text-ink-500 text-center mt-2">
            Hesabınıza giriş yaparak rezervasyon yapabilirsiniz.
          </p>

          <form (submit)="login($event)" class="mt-6 space-y-4">
            <div>
              <label class="text-xs font-bold text-ink-700 uppercase">E-posta</label>
              <input type="email"
                     [(ngModel)]="email"
                     name="email"
                     required
                     class="input-field mt-2"
                     placeholder="ornek@email.com">
            </div>

            <div>
              <label class="text-xs font-bold text-ink-700 uppercase">Şifre</label>
              <input type="password"
                     [(ngModel)]="password"
                     name="password"
                     required
                     class="input-field mt-2"
                     placeholder="••••••••">
            </div>

            @if (error()) {
              <div class="bg-avis-50 border border-avis-200 text-avis-700 text-sm p-3 rounded-lg">
                {{ error() }}
              </div>
            }

            <button type="submit"
                    [disabled]="auth.isLoading() || !email || !password"
                    class="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed">
              @if (auth.isLoading()) {
                Giriş yapılıyor...
              } @else {
                GİRİŞ YAP
              }
            </button>
          </form>

          <div class="mt-6 text-center text-sm text-ink-500">
            Hesabınız yok mu?
            <a routerLink="/register" class="text-avis-600 font-bold hover:underline ml-1">
              Kayıt olun
            </a>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  protected auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  protected email = '';
  protected password = '';
  protected error = signal<string | null>(null);

  login(event: Event): void {
    event.preventDefault();
    this.error.set(null);

    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: res => {
        if (res.success) {
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
          this.router.navigateByUrl(returnUrl);
        } else {
          this.error.set(res.message || 'Giriş başarısız.');
        }
      },
      error: err => {
        this.error.set(err.error?.message || 'Giriş yapılamadı. Bilgilerinizi kontrol edin.');
      }
    });
  }
}