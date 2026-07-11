import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-payment-result',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="bg-ink-100/30 min-h-screen py-8 lg:py-12">
      <div class="max-w-2xl mx-auto px-4 sm:px-6">

        @if (status() === 'success') {
          <!-- ═══ Başarılı ═══ -->
          <div class="bg-white rounded-3xl shadow-card p-6 lg:p-10 text-center">
            <div class="w-24 h-24 mx-auto bg-accent-success/10 rounded-full flex items-center justify-center mb-6 animate-fade-in">
              <div class="w-16 h-16 bg-accent-success rounded-full flex items-center justify-center">
                <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                </svg>
              </div>
            </div>

            <h1 class="text-2xl lg:text-3xl font-extrabold text-ink-900 mb-3">
              Ödemeniz Başarıyla Tamamlandı! 🎉
            </h1>
            <p class="text-ink-500 max-w-md mx-auto">
              Rezervasyonunuz onaylandı. Onay detayları e-posta adresinize gönderildi.
            </p>

            <div class="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <a [routerLink]="['/rezervasyon-basarili', rentalId()]"
                 class="px-6 py-3 rounded-full text-sm font-bold bg-brand-600 hover:bg-brand-700 text-white transition flex items-center justify-center gap-2">
                Rezervasyon Detayı
              </a>
              <a routerLink="/rezervasyonlarim"
                 class="px-6 py-3 rounded-full text-sm font-bold bg-ink-100 hover:bg-ink-200 text-ink-700 transition">
                Rezervasyonlarım
              </a>
            </div>
          </div>
        } @else {
          <!-- ═══ Başarısız ═══ -->
          <div class="bg-white rounded-3xl shadow-card p-6 lg:p-10 text-center">
            <div class="w-24 h-24 mx-auto bg-accent-danger/10 rounded-full flex items-center justify-center mb-6 animate-fade-in">
              <div class="w-16 h-16 bg-accent-danger rounded-full flex items-center justify-center">
                <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </div>
            </div>

            <h1 class="text-2xl lg:text-3xl font-extrabold text-ink-900 mb-3">
              Ödeme Tamamlanamadı
            </h1>
            <p class="text-ink-700 max-w-md mx-auto">
              {{ errorMessage() || 'Ödemenizi işleyemedik. Lütfen kart bilgilerinizi kontrol edip tekrar deneyin.' }}
            </p>

            <div class="mt-6 bg-accent-warning/10 border border-accent-warning/20 rounded-xl p-4 text-left text-sm text-ink-700 max-w-md mx-auto">
              <div class="font-bold text-ink-900 mb-1">💡 Ne yapabilirsiniz?</div>
              <ul class="list-disc list-inside space-y-1 text-xs">
                <li>Kart bilgilerinizi kontrol edin</li>
                <li>Farklı bir kart deneyin</li>
                <li>Ofiste ödeme seçeneğini kullanın</li>
              </ul>
            </div>

            <div class="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <button (click)="tryAgain()"
                      class="px-6 py-3 rounded-full text-sm font-bold bg-brand-600 hover:bg-brand-700 text-white transition">
                Tekrar Dene
              </button>
              <a routerLink="/"
                 class="px-6 py-3 rounded-full text-sm font-bold bg-ink-100 hover:bg-ink-200 text-ink-700 transition">
                Ana Sayfaya Dön
              </a>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; transform: scale(0.9); }
      to { opacity: 1; transform: scale(1); }
    }
    .animate-fade-in { animation: fadeIn 0.5s ease-out; }
  `]
})
export class PaymentResultComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  protected status = signal<'success' | 'failed'>('failed');
  protected rentalId = signal<number>(0);
  protected errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    const params = this.route.snapshot.queryParams;
    this.status.set(params['status'] === 'success' ? 'success' : 'failed');
    this.rentalId.set(+(params['rentalId'] || 0));
    this.errorMessage.set(params['message'] || null);
  }

  tryAgain(): void {
    this.router.navigate(['/rezervasyon/odeme']);
  }
}
