import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ReservationManagementService, ReservationDetail } from '../../core/services/reservation-management.service';

@Component({
  selector: 'app-reservation-success',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="bg-ink-100/30 min-h-screen py-8 lg:py-12">
      <div class="max-w-2xl mx-auto px-4 sm:px-6">

        <!-- ═══ Başarı Kartı ═══ -->
        <div class="bg-white rounded-3xl shadow-card p-6 lg:p-10 text-center">

          <!-- Yeşil Check İkonu -->
          <div class="w-24 h-24 mx-auto bg-accent-success/10 rounded-full flex items-center justify-center mb-6 animate-fade-in">
            <div class="w-16 h-16 bg-accent-success rounded-full flex items-center justify-center">
              <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
          </div>

          <h1 class="text-2xl lg:text-3xl font-extrabold text-ink-900 mb-3">
            Rezervasyonunuz Başarıyla Oluşturuldu! 🎉
          </h1>

          <p class="text-ink-500 max-w-md mx-auto">
            Rezervasyon bilgileri e-posta adresinize gönderildi.
            Kısa süre içinde bir onay mesajı alacaksınız.
          </p>

          @if (loading()) {
            <div class="mt-8 py-8">
              <div class="w-8 h-8 mx-auto border-4 border-brand-100 border-t-brand-600 rounded-full animate-spin"></div>
              <p class="text-sm text-ink-500 mt-3">Rezervasyon bilgileri yükleniyor...</p>
            </div>
          } @else if (reservation(); as r) {

            <!-- Rezervasyon Kodu -->
            @if (r.reservationCode) {
              <div class="mt-8 inline-block bg-brand-50 border-2 border-brand-100 rounded-2xl px-6 py-4">
                <div class="text-xs font-bold text-ink-500 uppercase tracking-wider mb-1">
                  Rezervasyon Kodunuz
                </div>
                <div class="text-2xl font-black text-brand-600 tracking-widest">
                  {{ r.reservationCode }}
                </div>
              </div>
            }

            <!-- Özet -->
            <div class="mt-8 text-left bg-ink-50 rounded-2xl p-5 space-y-3">
              <div class="flex items-start justify-between gap-4">
                <div class="text-sm text-ink-500">Araç</div>
                <div class="text-sm font-bold text-ink-900 text-right">{{ r.carInfo }}</div>
              </div>

              <div class="flex items-start justify-between gap-4">
                <div class="text-sm text-ink-500">Alış</div>
                <div class="text-sm font-bold text-ink-900 text-right">
                  {{ r.rentStartDate | date:'dd MMM yyyy - HH:mm' }}<br>
                  <span class="text-xs text-ink-500">📍 {{ r.pickUpLocationName }}</span>
                </div>
              </div>

              <div class="flex items-start justify-between gap-4">
                <div class="text-sm text-ink-500">İade</div>
                <div class="text-sm font-bold text-ink-900 text-right">
                  {{ r.rentEndDate | date:'dd MMM yyyy - HH:mm' }}<br>
                  <span class="text-xs text-ink-500">📍 {{ r.dropOffLocationName }}</span>
                </div>
              </div>

              <div class="flex items-center justify-between gap-4 pt-3 border-t border-ink-200">
                <div class="text-sm text-ink-500">Toplam</div>
                <div class="text-lg font-extrabold text-brand-600">
                  ₺{{ r.totalAmount | number:'1.0-0' }}
                </div>
              </div>

              <div class="flex items-center justify-between gap-4">
                <div class="text-sm text-ink-500">Durum</div>
                <div class="text-sm">
                  @if (r.status === 'Pending') {
                    <span class="inline-flex items-center gap-1 bg-accent-warning/10 text-accent-warning px-3 py-1 rounded-full text-xs font-bold">
                      ⏳ Ofiste Ödeme Bekleniyor
                    </span>
                  } @else if (r.status === 'Approved') {
                    <span class="inline-flex items-center gap-1 bg-accent-success/10 text-accent-success px-3 py-1 rounded-full text-xs font-bold">
                      ✓ Onaylandı
                    </span>
                  } @else {
                    <span class="inline-flex items-center gap-1 bg-ink-100 text-ink-700 px-3 py-1 rounded-full text-xs font-bold">
                      {{ r.status }}
                    </span>
                  }
                </div>
              </div>
            </div>

            <!-- Ofiste ödeme uyarısı -->
            @if (r.status === 'Pending' && !r.isPaid) {
              <div class="mt-4 bg-accent-warning/5 border border-accent-warning/20 rounded-xl p-4 text-left">
                <div class="flex items-start gap-2">
                  <svg class="w-5 h-5 text-accent-warning flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <div class="text-sm text-ink-700">
                    <div class="font-semibold mb-1">Ofiste Ödeme Seçildi</div>
                    Aracı teslim aldığınız ofiste kredi kartı veya nakit ile ödemenizi yapabilirsiniz.
                    Ödeme yapıldıktan sonra rezervasyonunuz onaylanacaktır.
                  </div>
                </div>
              </div>
            }
          }

          <!-- Aksiyon Butonları -->
          <div class="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <a routerLink="/rezervasyonlarim"
               class="px-6 py-3 rounded-full text-sm font-bold bg-brand-600 hover:bg-brand-700 text-white transition flex items-center justify-center gap-2">
              Rezervasyonlarımı Gör
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/>
              </svg>
            </a>
            <a routerLink="/"
               class="px-6 py-3 rounded-full text-sm font-bold bg-ink-100 hover:bg-ink-200 text-ink-700 transition">
              Ana Sayfaya Dön
            </a>
          </div>
        </div>

        <!-- Alt Bilgi -->
        <div class="mt-6 text-center text-xs text-ink-500">
          Sorunuz mu var? <a href="mailto:destek@rentacar.com" class="text-brand-600 font-semibold hover:underline">Bize ulaşın</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; transform: scale(0.9); }
      to { opacity: 1; transform: scale(1); }
    }
    .animate-fade-in {
      animation: fadeIn 0.5s ease-out;
    }
  `]
})
export class ReservationSuccessComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private service = inject(ReservationManagementService);

  protected reservation = signal<ReservationDetail | null>(null);
  protected loading = signal(true);

  ngOnInit(): void {
    const id = +this.route.snapshot.params['id'];
    if (!id) {
      this.loading.set(false);
      return;
    }

    this.service.getDetail(id).subscribe({
      next: (res) => {
        this.reservation.set(res.data ?? null);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }
}
