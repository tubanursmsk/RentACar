import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReservationManagementService, MyReservation, ReservationFilter } from '../../core/services/reservation-management.service';

import { environment } from '../../../environments/environment';
import { CancelReservationModalComponent } from './cancel-reservation-modal.component';
import { EditDatesModalComponent } from './edit-dates-modal.component';

@Component({
  selector: 'app-my-reservations',
  standalone: true,
  imports: [CommonModule, RouterLink, CancelReservationModalComponent, EditDatesModalComponent],
  template: `
    <div class="bg-ink-100/30 min-h-screen py-6 lg:py-8">
      <div class="max-w-[1400px] mx-auto px-4 sm:px-6">

        <!-- ═══ Başlık ═══ -->
        <div class="mb-6">
          <h1 class="text-2xl lg:text-3xl font-extrabold text-ink-900">Rezervasyonlarım</h1>
          <p class="text-sm text-ink-500 mt-1">Aktif ve geçmiş rezervasyonlarınızı buradan yönetin</p>
        </div>

        <!-- ═══ Filtre Sekmeleri ═══ -->
        <div class="bg-white rounded-2xl shadow-card mb-6 p-2 inline-flex gap-1 flex-wrap">
          @for (tab of filterTabs; track tab.id) {
            <button (click)="changeFilter(tab.id)"
                    class="px-4 py-2 rounded-full text-sm font-semibold transition"
                    [class.bg-ink-900]="activeFilter() === tab.id"
                    [class.text-white]="activeFilter() === tab.id"
                    [class.text-ink-700]="activeFilter() !== tab.id"
                    [class.hover:bg-ink-100]="activeFilter() !== tab.id">
              @if (tab.icon) {
                <span class="mr-1">{{ tab.icon }}</span>
              }
              {{ tab.label }}
              @if (countForFilter(tab.id) > 0 && activeFilter() !== tab.id) {
                <span class="ml-1 px-1.5 py-0.5 bg-ink-100 rounded-full text-xs">
                  {{ countForFilter(tab.id) }}
                </span>
              }
            </button>
          }
        </div>

        <!-- ═══ Liste ═══ -->
        @if (loading()) {
          <div class="space-y-4">
            @for (i of [1,2,3]; track i) {
              <div class="bg-white rounded-2xl shadow-card p-5 animate-pulse">
                <div class="flex gap-4">
                  <div class="w-40 h-28 bg-ink-100 rounded-xl flex-shrink-0"></div>
                  <div class="flex-1 space-y-3">
                    <div class="h-5 bg-ink-100 rounded w-1/3"></div>
                    <div class="h-4 bg-ink-100 rounded w-2/3"></div>
                    <div class="h-4 bg-ink-100 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            }
          </div>
        } @else if (reservations().length === 0) {
          <!-- Boş durum -->
          <div class="bg-white rounded-2xl shadow-card p-12 text-center">
            <div class="text-6xl mb-4">📋</div>
            <h3 class="text-xl font-bold text-ink-900 mb-2">
              @switch (activeFilter()) {
                @case ('active') { Aktif rezervasyonunuz yok }
                @case ('past') { Geçmiş rezervasyonunuz yok }
                @case ('cancelled') { İptal edilmiş rezervasyonunuz yok }
                @default { Henüz rezervasyonunuz yok }
              }
            </h3>
            <p class="text-ink-500 text-sm mb-6">
              Kiralamaya başlamak için araçlarımıza göz atın.
            </p>
            <a routerLink="/araclar" class="btn-primary inline-flex">
              Araçları Gör
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/>
              </svg>
            </a>
          </div>
        } @else {
          <!-- Rezervasyon Kartları -->
          <div class="space-y-4">
            @for (r of reservations(); track r.id) {
              <div class="bg-white rounded-2xl shadow-card overflow-hidden hover:shadow-card-hover transition">
                <div class="p-5 flex flex-col md:flex-row gap-5">

                  <!-- Görsel -->
                  <div class="w-full md:w-52 aspect-video md:aspect-auto md:h-36 bg-ink-100 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center">
                    @if (r.carImageUrl) {
                      <img [src]="apiBaseUrl + r.carImageUrl"
                           [alt]="r.carBrand + ' ' + r.carModel"
                           class="w-full h-full object-cover">
                    } @else {
                      <span class="text-5xl">🚗</span>
                    }
                  </div>

                  <!-- Bilgiler -->
                  <div class="flex-1 min-w-0">
                    <div class="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div class="flex items-center gap-2 flex-wrap mb-1">
                          @if (r.reservationCode) {
                            <span class="text-xs font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded">
                              {{ r.reservationCode }}
                            </span>
                          }
                          <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold"
                                [ngClass]="getStatusBadgeClasses(r.status)">
                            <span class="w-1.5 h-1.5 rounded-full" [ngClass]="getStatusDotClass(r.status)"></span>
                            {{ getStatusLabel(r.status) }}
                          </span>
                          @if (r.isPaid) {
                            <span class="text-xs bg-accent-success/10 text-accent-success px-2 py-0.5 rounded-full font-semibold">
                              ✓ Ödendi
                            </span>
                          } @else if (r.status === 'Pending') {
                            <span class="text-xs bg-accent-warning/10 text-accent-warning px-2 py-0.5 rounded-full font-semibold">
                              Ofiste Ödeme
                            </span>
                          }
                        </div>

                        <h3 class="text-lg font-bold text-ink-900">
                          {{ r.carBrand }} {{ r.carModel }}
                        </h3>
                        <p class="text-xs text-ink-500">{{ r.carPlate }}</p>
                      </div>

                      <!-- Fiyat -->
                      <div class="text-right">
                        <div class="text-lg font-extrabold text-brand-600">
                          ₺{{ r.totalAmount | number:'1.0-0' }}
                        </div>
                        <div class="text-xs text-ink-500">{{ r.totalDays }} gün</div>
                      </div>
                    </div>

                    <!-- Tarih & Ofis -->
                    <div class="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div class="flex items-start gap-2">
                        <svg class="w-4 h-4 mt-0.5 text-ink-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                        </svg>
                        <div>
                          <div class="text-xs text-ink-500">Alış</div>
                          <div class="font-semibold text-ink-900">
                            {{ r.rentStartDate | date:'dd MMM yyyy':'':'tr' }}
                          </div>
                          <div class="text-xs text-ink-500 truncate">
                            📍 {{ r.pickUpLocationName }}
                          </div>
                        </div>
                      </div>

                      <div class="flex items-start gap-2">
                        <svg class="w-4 h-4 mt-0.5 text-ink-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                        </svg>
                        <div>
                          <div class="text-xs text-ink-500">İade</div>
                          <div class="font-semibold text-ink-900">
                            {{ r.rentEndDate | date:'dd MMM yyyy':'':'tr' }}
                          </div>
                          <div class="text-xs text-ink-500 truncate">
                            📍 {{ r.dropOffLocationName }}
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Uyarı: Alışa yaklaşıyor -->
                    @if (r.hoursUntilPickup !== null && r.hoursUntilPickup !== undefined && r.hoursUntilPickup > 0 && r.hoursUntilPickup < 48 && r.status !== 'Cancelled') {
                      <div class="mt-3 text-xs bg-accent-warning/10 border border-accent-warning/20 rounded-lg px-3 py-2 text-ink-700 flex items-center gap-2">
                        <svg class="w-4 h-4 text-accent-warning flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        <span>
                          Alışa <strong>{{ r.hoursUntilPickup }} saat</strong> kaldı.
                          @if (r.hoursUntilPickup < 24) {
                            İptal/düzenleme süresi doldu.
                          }
                        </span>
                      </div>
                    }

                    <!-- Aksiyon butonları -->
                    <div class="mt-4 flex flex-wrap gap-2">
                      <a [routerLink]="['/rezervasyonlarim', r.id]"
                         class="px-4 py-2 rounded-full text-xs font-semibold bg-ink-100 hover:bg-ink-200 text-ink-700 transition">
                        Detayları Gör
                      </a>

                      @if (r.canEdit) {
                        <button (click)="openEditDates(r)"
                                class="px-4 py-2 rounded-full text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white transition">
                          ✏️ Tarih Düzenle
                        </button>
                      }

                      @if (r.canCancel) {
                        <button (click)="openCancel(r)"
                                class="px-4 py-2 rounded-full text-xs font-semibold bg-accent-danger hover:bg-red-700 text-white transition">
                          ✕ İptal Et
                        </button>
                      }
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>

    <!-- ═══ Modaller ═══ -->
    <app-cancel-reservation-modal
      [isOpen]="cancelModalOpen()"
      [reservationId]="selectedReservationId() ?? 0"
      [reservationCode]="selectedReservationCode()"
      (cancelled)="onCancelled()"
      (closed)="closeCancelModal()">
    </app-cancel-reservation-modal>

    <app-edit-dates-modal
      [isOpen]="editModalOpen()"
      [reservationId]="selectedReservationId() ?? 0"
      [currentStartDate]="selectedStartDate()"
      [currentEndDate]="selectedEndDate()"
      (updated)="onUpdated()"
      (closed)="closeEditModal()">
    </app-edit-dates-modal>
  `
})
export class MyReservationsComponent implements OnInit {
  private service = inject(ReservationManagementService);
  protected apiBaseUrl = environment.apiBaseUrl;

  protected reservations = signal<MyReservation[]>([]);
  protected allReservations = signal<MyReservation[]>([]);  // sayaç için tüm liste
  protected loading = signal(true);
  protected activeFilter = signal<ReservationFilter>('active');

  // Modal state
  protected cancelModalOpen = signal(false);
  protected editModalOpen = signal(false);
  protected selectedReservationId = signal<number | null>(null);
  protected selectedReservationCode = signal<string | null>(null);
  protected selectedStartDate = signal<string>('');
  protected selectedEndDate = signal<string>('');

  protected filterTabs: { id: ReservationFilter; label: string; icon: string }[] = [
    { id: 'active',    label: 'Aktif',    icon: '🟢' },
    { id: 'past',      label: 'Geçmiş',   icon: '📁' },
    { id: 'cancelled', label: 'İptal',    icon: '✕' },
    { id: 'all',       label: 'Tümü',     icon: '📋' },
  ];

  ngOnInit(): void {
    this.loadAllForCounts();
    this.loadReservations();
  }

  changeFilter(filter: ReservationFilter): void {
    if (this.activeFilter() === filter) return;
    this.activeFilter.set(filter);
    this.loadReservations();
  }

  countForFilter(filter: ReservationFilter): number {
    const all = this.allReservations();
    if (filter === 'all') return all.length;
    return all.filter(r => {
      const isEndPast = new Date(r.rentEndDate) < new Date();
      if (filter === 'active') {
        return (r.status === 'Pending' || r.status === 'Approved') && !isEndPast;
      }
      if (filter === 'past') {
        return r.status === 'Completed' || (r.status === 'Approved' && isEndPast);
      }
      if (filter === 'cancelled') {
        return r.status === 'Cancelled';
      }
      return false;
    }).length;
  }

  private loadReservations(): void {
    this.loading.set(true);
    this.service.getMyReservations(this.activeFilter()).subscribe({
      next: (res) => {
        this.reservations.set(res.data ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.reservations.set([]);
        this.loading.set(false);
      }
    });
  }

  private loadAllForCounts(): void {
    this.service.getMyReservations('all').subscribe({
      next: (res) => this.allReservations.set(res.data ?? [])
    });
  }

  // ═══ Modal işlemleri ═══
  openCancel(r: MyReservation): void {
    this.selectedReservationId.set(r.id);
    this.selectedReservationCode.set(r.reservationCode ?? null);
    this.cancelModalOpen.set(true);
  }

  closeCancelModal(): void {
    this.cancelModalOpen.set(false);
    this.selectedReservationId.set(null);
    this.selectedReservationCode.set(null);
  }

  onCancelled(): void {
    this.closeCancelModal();
    this.loadReservations();
    this.loadAllForCounts();
  }

  openEditDates(r: MyReservation): void {
    this.selectedReservationId.set(r.id);
    this.selectedStartDate.set(r.rentStartDate);
    this.selectedEndDate.set(r.rentEndDate);
    this.editModalOpen.set(true);
  }

  closeEditModal(): void {
    this.editModalOpen.set(false);
    this.selectedReservationId.set(null);
  }

  onUpdated(): void {
    this.closeEditModal();
    this.loadReservations();
    this.loadAllForCounts();
  }

  // ═══ Status helpers ═══
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
