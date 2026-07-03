import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ReservationService } from '../../core/services/reservation.service';
import { ReservationDetail } from '../../core/models/reservation.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-reservation-success',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="bg-ink-100/30 min-h-screen py-12">
      <div class="max-w-3xl mx-auto px-4">
        @if (loading()) {
          <div class="card p-8 text-center animate-pulse">
            <div class="w-16 h-16 mx-auto bg-ink-100 rounded-full"></div>
            <div class="h-6 bg-ink-100 rounded mt-4 mx-auto w-1/2"></div>
          </div>
        } @else if (reservation(); as r) {
          <!-- ✓ Başarı Banner -->
          <div class="card p-8 text-center">
            <div class="w-20 h-20 mx-auto bg-success/10 rounded-full flex items-center justify-center mb-4">
              <svg class="w-12 h-12 text-success" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
              </svg>
            </div>
            <h1 class="text-3xl font-extrabold text-ink-900 mb-2">
              Rezervasyonunuz Alındı!
            </h1>
            <p class="text-ink-700">
              Rezervasyon numaranız: <b class="text-brand-600">#{{ r.id }}</b>
            </p>
            <p class="text-sm text-ink-500 mt-2">
              E-posta adresinize onay maili gönderilecektir.
            </p>
          </div>

          <!-- Detay -->
          <div class="card p-6 mt-4">
            <h2 class="text-xl font-bold mb-4 pb-3 border-b border-ink-100">
              Rezervasyon Detayları
            </h2>

            <div class="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-4 mb-6">
              <div class="aspect-video bg-ink-100 rounded-lg overflow-hidden flex items-center justify-center">
                @if (r.carImageUrl) {
                  <img [src]="apiBaseUrl + r.carImageUrl" [alt]="r.carInfo" class="w-full h-full object-cover">
                } @else {
                  <span class="text-4xl">🚗</span>
                }
              </div>
              <div>
                <h3 class="font-bold text-lg">{{ r.carInfo }}</h3>
                <p class="text-sm text-ink-500">{{ r.totalDays }} gün</p>
                <div class="mt-2 text-xs inline-flex items-center px-2 py-1 rounded-full"
                     [class.bg-yellow-100]="r.status === 'Pending'"
                     [class.text-yellow-800]="r.status === 'Pending'"
                     [class.bg-blue-100]="r.status === 'Approved'"
                     [class.text-blue-800]="r.status === 'Approved'">
                  {{ statusLabel(r.status) }}
                </div>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3 mb-6 text-sm">
              <div class="bg-ink-100/30 rounded-lg p-3">
                <div class="text-xs text-ink-500 uppercase">Alış</div>
                <div class="font-semibold">{{ r.rentStartDate | date:'dd MMMM yyyy':'':'tr' }}</div>
                <div class="text-xs text-ink-500">{{ r.pickUpLocationName }}</div>
              </div>
              <div class="bg-ink-100/30 rounded-lg p-3">
                <div class="text-xs text-ink-500 uppercase">İade</div>
                <div class="font-semibold">{{ r.rentEndDate | date:'dd MMMM yyyy':'':'tr' }}</div>
                <div class="text-xs text-ink-500">{{ r.dropOffLocationName }}</div>
              </div>
            </div>

            <!-- Fiyat Detayı -->
            <div class="space-y-2 pb-4 border-b border-ink-100">
              <div class="flex justify-between text-sm">
                <span class="text-ink-700">Araç Kira Bedeli</span>
                <span class="font-semibold">₺{{ r.subTotal | number:'1.0-0' }}</span>
              </div>
              @if (r.insuranceTotal > 0) {
                <div class="flex justify-between text-sm">
                  <span class="text-ink-700">{{ r.insurancePackage?.name }}</span>
                  <span class="font-semibold">₺{{ r.insuranceTotal | number:'1.0-0' }}</span>
                </div>
              }
              @for (p of r.additionalProducts; track p.name) {
                <div class="flex justify-between text-sm">
                  <span class="text-ink-700">{{ p.name }} (×{{ p.quantity }})</span>
                  <span class="font-semibold">₺{{ p.totalPrice | number:'1.0-0' }}</span>
                </div>
              }
            </div>

            <div class="flex items-baseline justify-between pt-3">
              <span class="font-bold text-lg">Toplam</span>
              <span class="text-3xl font-extrabold text-brand-600">
                ₺{{ r.totalAmount | number:'1.2-2' }}
              </span>
            </div>
          </div>

          <!-- Aksiyon Butonları -->
          <div class="mt-6 flex flex-col sm:flex-row gap-3">
            <a routerLink="/" class="btn-secondary flex-1 text-center">
              ANA SAYFA
            </a>
            <a routerLink="/araclar" class="btn-primary flex-1 text-center">
              YENİ KİRALAMA
            </a>
          </div>
        } @else {
          <div class="card p-8 text-center">
            <h2 class="font-bold text-xl">Rezervasyon bulunamadı</h2>
            <a routerLink="/" class="btn-primary mt-4 inline-flex">Ana sayfaya dön</a>
          </div>
        }
      </div>
    </div>
  `
})
export class ReservationSuccessComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private reservationService = inject(ReservationService);

  protected reservation = signal<ReservationDetail | null>(null);
  protected loading = signal(true);
  protected apiBaseUrl = environment.apiBaseUrl;

  ngOnInit(): void {
    const id = +this.route.snapshot.params['id'];
    if (!id) {
      this.router.navigate(['/']);
      return;
    }

    this.reservationService.getDetail(id).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.reservation.set(res.data);
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  statusLabel(status: string): string {
    return ({
      'Pending': 'Onay Bekliyor',
      'Approved': 'Onaylandı',
      'Completed': 'Tamamlandı',
      'Cancelled': 'İptal Edildi'
    } as any)[status] ?? status;
  }
}