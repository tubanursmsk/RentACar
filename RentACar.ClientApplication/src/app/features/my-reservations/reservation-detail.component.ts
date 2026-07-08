import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';
import { EditDatesModalComponent } from './edit-dates-modal.component';
import { CancelReservationModalComponent } from './cancel-reservation-modal.component';
import { ReservationDetail, ReservationManagementService } from '../../core/services/reservation-management.service';

@Component({
  selector: 'app-reservation-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, CancelReservationModalComponent, EditDatesModalComponent],
  template: `
    <div class="bg-ink-100/30 min-h-screen py-6 lg:py-8">
      <div class="max-w-[1400px] mx-auto px-4 sm:px-6">

        <!-- Breadcrumb -->
        <nav class="text-sm text-ink-500 mb-4 flex items-center gap-2 flex-wrap">
          <a routerLink="/" class="hover:text-brand-600">Ana Sayfa</a>
          <span>/</span>
          <a routerLink="/rezervasyonlarim" class="hover:text-brand-600">Rezervasyonlarım</a>
          <span>/</span>
          <span class="text-ink-900 font-semibold">
            @if (reservation()?.reservationCode) {
              {{ reservation()!.reservationCode }}
            } @else {
              #{{ reservation()?.id }}
            }
          </span>
        </nav>

        @if (loading()) {
          <div class="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 animate-pulse">
            <div class="space-y-4">
              <div class="h-40 bg-ink-100 rounded-2xl"></div>
              <div class="h-64 bg-ink-100 rounded-2xl"></div>
            </div>
            <div class="h-96 bg-ink-100 rounded-2xl"></div>
          </div>
        } @else if (reservation(); as r) {
          <div class="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">

            <!-- ═══ SOL: Bilgiler ═══ -->
            <div class="space-y-4">

              <!-- Başlık -->
              <div class="bg-white rounded-2xl shadow-card p-5 lg:p-6">
                <div class="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div class="flex items-center gap-2 mb-2 flex-wrap">
                      @if (r.reservationCode) {
                        <span class="text-sm font-bold text-brand-600 bg-brand-50 px-3 py-1 rounded-full">
                          {{ r.reservationCode }}
                        </span>
                      }
                      <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
                            [ngClass]="getStatusBadgeClasses(r.status)">
                        <span class="w-1.5 h-1.5 rounded-full" [ngClass]="getStatusDotClass(r.status)"></span>
                        {{ getStatusLabel(r.status) }}
                      </span>
                      @if (r.isPaid) {
                        <span class="text-xs bg-accent-success/10 text-accent-success px-2 py-1 rounded-full font-semibold">
                          ✓ Ödendi
                        </span>
                      }
                    </div>
                    <h1 class="text-xl lg:text-2xl font-extrabold text-ink-900">{{ r.carInfo }}</h1>
                    <p class="text-sm text-ink-500 mt-1">
                      Rezervasyon Tarihi:
                      {{ r.createdDate | date:'dd MMM yyyy - HH:mm':'':'tr' }}
                    </p>
                  </div>
                </div>

                <!-- Uyarı: alışa yaklaşıyor -->
                @if (r.hoursUntilPickup !== null && r.hoursUntilPickup !== undefined && r.hoursUntilPickup > 0 && r.hoursUntilPickup < 48 && r.status !== 'Cancelled') {
                  <div class="mt-4 bg-accent-warning/10 border border-accent-warning/20 rounded-lg px-4 py-3 flex items-start gap-3">
                    <svg class="w-5 h-5 text-accent-warning flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <div class="text-sm">
                      <div class="font-semibold text-ink-900">
                        Alışa {{ r.hoursUntilPickup }} saat kaldı
                      </div>
                      @if (r.hoursUntilPickup < 24) {
                        <div class="text-ink-700 mt-0.5">
                          İptal ve düzenleme süresi doldu.
                        </div>
                      }
                    </div>
                  </div>
                }

                <!-- İptal bilgisi -->
                @if (r.status === 'Cancelled' && r.cancelledDate) {
                  <div class="mt-4 bg-accent-danger/10 border border-accent-danger/20 rounded-lg px-4 py-3">
                    <div class="text-sm font-semibold text-accent-danger">
                      Bu rezervasyon iptal edildi
                    </div>
                    <div class="text-xs text-ink-500 mt-1">
                      İptal Tarihi: {{ r.cancelledDate | date:'dd MMM yyyy - HH:mm':'':'tr' }}
                    </div>
                    @if (r.cancelReason) {
                      <div class="mt-2 text-sm text-ink-700">
                        <span class="text-xs text-ink-500 uppercase font-bold">Sebep:</span>
                        <br>{{ r.cancelReason }}
                      </div>
                    }
                  </div>
                }
              </div>

              <!-- Görsel + Araç -->
              <div class="bg-white rounded-2xl shadow-card overflow-hidden">
                <div class="aspect-video bg-ink-100 flex items-center justify-center">
                  @if (r.carImageUrl) {
                    <img [src]="apiBaseUrl + r.carImageUrl" [alt]="r.carInfo"
                         class="w-full h-full object-cover">
                  } @else {
                    <span class="text-8xl">🚗</span>
                  }
                </div>
              </div>

              <!-- Alış / İade Detayı -->
              <div class="bg-white rounded-2xl shadow-card p-5 lg:p-6">
                <h3 class="font-bold text-ink-900 mb-4">Alış ve İade</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="bg-ink-50 rounded-xl p-4">
                    <div class="text-xs font-bold text-ink-500 uppercase tracking-wide mb-2">📥 Alış</div>
                    <div class="font-bold text-ink-900">
                      {{ r.rentStartDate | date:'dd MMM yyyy':'':'tr' }}
                    </div>
                    <div class="text-sm text-brand-600 font-semibold">
                      {{ r.rentStartDate | date:'HH:mm':'':'tr' }}
                    </div>
                    <div class="text-sm text-ink-700 mt-2 flex items-start gap-1">
                      <span>📍</span>
                      <span>{{ r.pickUpLocationName }}</span>
                    </div>
                  </div>

                  <div class="bg-ink-50 rounded-xl p-4">
                    <div class="text-xs font-bold text-ink-500 uppercase tracking-wide mb-2">📤 İade</div>
                    <div class="font-bold text-ink-900">
                      {{ r.rentEndDate | date:'dd MMM yyyy':'':'tr' }}
                    </div>
                    <div class="text-sm text-brand-600 font-semibold">
                      {{ r.rentEndDate | date:'HH:mm':'':'tr' }}
                    </div>
                    <div class="text-sm text-ink-700 mt-2 flex items-start gap-1">
                      <span>📍</span>
                      <span>{{ r.dropOffLocationName }}</span>
                    </div>
                  </div>
                </div>

                <div class="mt-4 flex items-center justify-between text-sm">
                  <span class="text-ink-500">Toplam Süre</span>
                  <span class="font-bold text-ink-900">{{ r.totalDays }} gün</span>
                </div>
              </div>

              <!-- Sigorta + Ek Ürünler -->
              @if (r.insurancePackage || r.additionalProducts.length > 0) {
                <div class="bg-white rounded-2xl shadow-card p-5 lg:p-6">
                  <h3 class="font-bold text-ink-900 mb-4">Ek Hizmetler</h3>
                  <div class="space-y-3">
                    @if (r.insurancePackage) {
                      <div class="flex items-center justify-between text-sm border-b border-ink-100 pb-3">
                        <div>
                          <div class="font-semibold text-ink-900">🛡️ {{ r.insurancePackage.name }}</div>
                          <div class="text-xs text-ink-500 mt-0.5">{{ r.insurancePackage.description }}</div>
                        </div>
                        <div class="font-bold text-brand-600">
                          ₺{{ r.insuranceTotal | number:'1.0-0' }}
                        </div>
                      </div>
                    }
                    @for (p of r.additionalProducts; track p.name) {
                      <div class="flex items-center justify-between text-sm">
                        <div>
                          <div class="font-semibold text-ink-900">
                            {{ p.name }} <span class="text-ink-500">(×{{ p.quantity }})</span>
                          </div>
                          <div class="text-xs text-ink-500">
                            Birim: ₺{{ p.unitPrice | number:'1.0-0' }}
                          </div>
                        </div>
                        <div class="font-bold text-brand-600">
                          ₺{{ p.totalPrice | number:'1.0-0' }}
                        </div>
                      </div>
                    }
                  </div>
                </div>
              }
            </div>

            <!-- ═══ SAĞ: Fiyat Özeti + Aksiyonlar ═══ -->
            <aside class="lg:sticky lg:top-24 lg:self-start space-y-4">

              <!-- Fiyat Özeti -->
              <div class="bg-white rounded-2xl shadow-card p-5 lg:p-6">
                <h3 class="font-bold text-ink-900 mb-4">Fiyat Özeti</h3>
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span class="text-ink-700">Araç Kira Bedeli</span>
                    <span class="font-semibold">₺{{ r.subTotal | number:'1.0-0' }}</span>
                  </div>
                  @if (r.insuranceTotal > 0) {
                    <div class="flex justify-between">
                      <span class="text-ink-700">Güvence Paketi</span>
                      <span class="font-semibold">₺{{ r.insuranceTotal | number:'1.0-0' }}</span>
                    </div>
                  }
                  @if (r.additionalProductsTotal > 0) {
                    <div class="flex justify-between">
                      <span class="text-ink-700">Ek Ürünler</span>
                      <span class="font-semibold">₺{{ r.additionalProductsTotal | number:'1.0-0' }}</span>
                    </div>
                  }
                </div>
                <div class="mt-4 pt-4 border-t border-ink-100 flex justify-between items-baseline">
                  <span class="text-sm font-bold text-ink-900">Toplam</span>
                  <span class="text-2xl font-extrabold text-brand-600">
                    ₺{{ r.totalAmount | number:'1.0-0' }}
                  </span>
                </div>
              </div>

              <!-- Aksiyonlar -->
              @if (r.canEdit || r.canCancel) {
                <div class="bg-white rounded-2xl shadow-card p-5 space-y-2">
                  @if (r.canEdit) {
                    <button (click)="openEditDates()"
                            class="w-full px-4 py-3 rounded-full text-sm font-semibold
                                   bg-brand-600 hover:bg-brand-700 text-white transition
                                   flex items-center justify-center gap-2">
                      ✏️ Tarih Düzenle
                    </button>
                  }
                  @if (r.canCancel) {
                    <button (click)="openCancel()"
                            class="w-full px-4 py-3 rounded-full text-sm font-semibold
                                   bg-accent-danger hover:bg-red-700 text-white transition
                                   flex items-center justify-center gap-2">
                      ✕ Rezervasyonu İptal Et
                    </button>
                  }
                </div>
              } @else if (r.cannotCancelReason) {
                <div class="bg-ink-50 rounded-2xl p-4 flex items-start gap-3 text-sm">
                  <svg class="w-5 h-5 text-ink-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <div class="text-ink-700">
                    {{ r.cannotCancelReason }}
                  </div>
                </div>
              }

              <!-- Geri Dön -->
              <a routerLink="/rezervasyonlarim"
                 class="w-full px-4 py-3 rounded-full text-sm font-semibold
                        bg-ink-100 hover:bg-ink-200 text-ink-700 transition
                        flex items-center justify-center gap-2">
                ‹ Rezervasyonlarıma Dön
              </a>
            </aside>
          </div>
        } @else {
          <div class="bg-white rounded-2xl shadow-card p-12 text-center">
            <div class="text-6xl mb-4">😕</div>
            <h3 class="text-xl font-bold text-ink-900">Rezervasyon bulunamadı</h3>
            <p class="text-ink-500 mt-2">Bu rezervasyona ait bilgi bulunamadı veya erişim yetkiniz yok.</p>
            <a routerLink="/rezervasyonlarim" class="btn-primary mt-4 inline-flex">Rezervasyonlarıma Dön</a>
          </div>
        }
      </div>
    </div>

    <!-- Modaller -->
    <app-cancel-reservation-modal
      [isOpen]="cancelModalOpen()"
      [reservationId]="reservation()?.id ?? 0"
      [reservationCode]="reservation()?.reservationCode"
      (cancelled)="onCancelled()"
      (closed)="closeCancelModal()">
    </app-cancel-reservation-modal>

    <app-edit-dates-modal
      [isOpen]="editModalOpen()"
      [reservationId]="reservation()?.id ?? 0"
      [currentStartDate]="reservation()?.rentStartDate ?? ''"
      [currentEndDate]="reservation()?.rentEndDate ?? ''"
      (updated)="onUpdated()"
      (closed)="closeEditModal()">
    </app-edit-dates-modal>
  `
})
export class ReservationDetailComponent implements OnInit {
  private service = inject(ReservationManagementService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  protected apiBaseUrl = environment.apiBaseUrl;
  protected reservation = signal<ReservationDetail | null>(null);
  protected loading = signal(true);

  protected cancelModalOpen = signal(false);
  protected editModalOpen = signal(false);

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = +params['id'];
      if (id) this.loadDetail(id);
    });
  }

  private loadDetail(id: number): void {
    this.loading.set(true);
    this.service.getDetail(id).subscribe({
      next: (res) => {
        this.reservation.set(res.data ?? null);
        this.loading.set(false);
      },
      error: () => {
        this.reservation.set(null);
        this.loading.set(false);
      }
    });
  }

  openCancel(): void { this.cancelModalOpen.set(true); }
  closeCancelModal(): void { this.cancelModalOpen.set(false); }
  onCancelled(): void {
    this.closeCancelModal();
    const id = this.reservation()?.id;
    if (id) this.loadDetail(id);
  }

  openEditDates(): void { this.editModalOpen.set(true); }
  closeEditModal(): void { this.editModalOpen.set(false); }
  onUpdated(): void {
    this.closeEditModal();
    const id = this.reservation()?.id;
    if (id) this.loadDetail(id);
  }

  getStatusLabel(status: string): string {
    return ({
      'Pending': 'Beklemede',
      'Approved': 'Onaylı',
      'Completed': 'Tamamlandı',
      'Cancelled': 'İptal'
    } as Record<string, string>)[status] ?? status;
  }

  getStatusBadgeClasses(status: string): string {
    return ({
      'Pending':   'bg-accent-warning/10 text-accent-warning',
      'Approved':  'bg-accent-success/10 text-accent-success',
      'Completed': 'bg-ink-200 text-ink-700',
      'Cancelled': 'bg-accent-danger/10 text-accent-danger'
    } as Record<string, string>)[status] ?? 'bg-ink-100 text-ink-500';
  }

  getStatusDotClass(status: string): string {
    return ({
      'Pending':   'bg-accent-warning',
      'Approved':  'bg-accent-success',
      'Completed': 'bg-ink-500',
      'Cancelled': 'bg-accent-danger'
    } as Record<string, string>)[status] ?? 'bg-ink-400';
  }
}
