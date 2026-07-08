import { Component, EventEmitter, HostListener, Input, OnChanges, Output, SimpleChanges, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReservationManagementService } from '../../core/services/reservation-management.service';

@Component({
  selector: 'app-edit-dates-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (isOpen) {
      <div class="fixed inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
           style="z-index: 100;"
           (click)="close()"></div>

      <div class="fixed inset-0 flex items-center justify-center p-4 pointer-events-none"
           style="z-index: 101;">
        <div class="bg-white rounded-2xl shadow-2xl max-w-lg w-full pointer-events-auto animate-fade-in"
             (click)="$event.stopPropagation()">

          <!-- Header -->
          <div class="px-6 py-5 border-b border-ink-100 flex items-center gap-3">
            <div class="w-11 h-11 bg-brand-50 rounded-full flex items-center justify-center flex-shrink-0">
              <svg class="w-6 h-6 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-bold text-ink-900">Rezervasyon Tarihini Düzenle</h3>
              <p class="text-xs text-ink-500 mt-0.5">Yeni tarihleri seçin, fiyat yeniden hesaplanır</p>
            </div>
          </div>

          <!-- Body -->
          <div class="p-6 space-y-4">

            <!-- Mevcut tarih özet -->
            <div class="bg-ink-50 rounded-xl p-3 text-sm">
              <div class="text-xs font-bold text-ink-500 uppercase mb-1">Mevcut Tarihler</div>
              <div class="text-ink-700">
                {{ currentStartDate | date:'dd MMM yyyy':'':'tr' }}
                → {{ currentEndDate | date:'dd MMM yyyy':'':'tr' }}
                <span class="text-ink-500">({{ currentDays }} gün)</span>
              </div>
            </div>

            <!-- Yeni Alış -->
            <div>
              <label class="text-xs font-bold text-ink-700 uppercase tracking-wide mb-2 block">
                Yeni Alış Tarihi
              </label>
              <input type="date"
                     [(ngModel)]="newStartDate"
                     [min]="minDate"
                     (change)="onStartChange()"
                     class="input-field text-sm cursor-pointer"
                     style="color-scheme: light;">
            </div>

            <!-- Yeni İade -->
            <div>
              <label class="text-xs font-bold text-ink-700 uppercase tracking-wide mb-2 block">
                Yeni İade Tarihi
              </label>
              <input type="date"
                     [(ngModel)]="newEndDate"
                     [min]="minEndDate()"
                     class="input-field text-sm cursor-pointer"
                     style="color-scheme: light;">
            </div>

            <!-- Yeni özet -->
            @if (newDays() > 0) {
              <div class="bg-brand-50 border border-brand-100 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <div class="text-xs font-bold text-ink-500 uppercase mb-1">Yeni Süre</div>
                  <div class="text-lg font-bold text-brand-600">{{ newDays() }} gün</div>
                </div>
                @if (newDays() !== currentDays) {
                  <div class="text-xs text-ink-700 text-right">
                    Değişim: <b>{{ newDays() - currentDays > 0 ? '+' : '' }}{{ newDays() - currentDays }} gün</b>
                    <br>
                    <span class="text-ink-500">Fiyat yeniden hesaplanacak</span>
                  </div>
                }
              </div>
            }

            <!-- Bilgi -->
            <div class="text-xs text-ink-500 flex items-start gap-2 bg-ink-50 rounded-lg p-3">
              <svg class="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span>
                Minimum kiralama süresi 1 gün • Alış zamanı en az 30 dakika sonra olmalı •
                Aracın seçilen tarihte müsait olması gerekir
              </span>
            </div>

            @if (errorMessage()) {
              <div class="bg-accent-danger/10 border border-accent-danger/20 rounded-lg p-3 text-sm text-accent-danger">
                ⚠️ {{ errorMessage() }}
              </div>
            }
          </div>

          <!-- Footer -->
          <div class="px-6 py-4 border-t border-ink-100 flex gap-3">
            <button (click)="close()"
                    [disabled]="isSubmitting()"
                    class="flex-1 px-4 py-2.5 rounded-full text-sm font-semibold
                           bg-ink-100 hover:bg-ink-200 text-ink-700 transition
                           disabled:opacity-50">
              Vazgeç
            </button>
            <button (click)="confirm()"
                    [disabled]="isSubmitting() || !canConfirm()"
                    class="flex-1 px-4 py-2.5 rounded-full text-sm font-semibold
                           bg-brand-600 hover:bg-brand-700 text-white transition
                           disabled:opacity-50 disabled:cursor-not-allowed
                           flex items-center justify-center gap-2">
              @if (isSubmitting()) {
                <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Güncelleniyor...
              } @else {
                Tarihi Güncelle
              }
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class EditDatesModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() reservationId!: number;
  @Input() currentStartDate!: string;
  @Input() currentEndDate!: string;

  @Output() updated = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  private service = inject(ReservationManagementService);

  protected newStartDate = '';
  protected newEndDate = '';
  protected minDate = this.formatDate(new Date());
  protected isSubmitting = signal(false);
  protected errorMessage = signal<string | null>(null);

  protected get currentDays(): number {
    if (!this.currentStartDate || !this.currentEndDate) return 0;
    const diff = new Date(this.currentEndDate).getTime() - new Date(this.currentStartDate).getTime();
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  protected minEndDate = computed(() => {
    if (!this.newStartDate) return this.minDate;
    const d = new Date(this.newStartDate);
    d.setDate(d.getDate() + 1);
    return this.formatDate(d);
  });

  protected newDays = signal(0);

  protected canConfirm = computed(() =>
    !!this.newStartDate && !!this.newEndDate && this.newDays() > 0
  );

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && this.isOpen) {
      // Mevcut tarihleri form'a yükle
      if (this.currentStartDate) {
        this.newStartDate = this.currentStartDate.split('T')[0];
      }
      if (this.currentEndDate) {
        this.newEndDate = this.currentEndDate.split('T')[0];
      }
      this.recomputeDays();
      this.errorMessage.set(null);
    }
  }

  onStartChange(): void {
    // Bitiş < Başlangıç ise otomatik +1 gün
    if (this.newStartDate && this.newEndDate) {
      const s = new Date(this.newStartDate);
      const e = new Date(this.newEndDate);
      if (e <= s) {
        const newEnd = new Date(s);
        newEnd.setDate(newEnd.getDate() + 1);
        this.newEndDate = this.formatDate(newEnd);
      }
    }
    this.recomputeDays();
  }

  private recomputeDays(): void {
    if (!this.newStartDate || !this.newEndDate) {
      this.newDays.set(0);
      return;
    }
    const diff = new Date(this.newEndDate).getTime() - new Date(this.newStartDate).getTime();
    this.newDays.set(Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24))));
  }

  close(): void {
    if (this.isSubmitting()) return;
    this.closed.emit();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isOpen) this.close();
  }

  confirm(): void {
    if (!this.canConfirm() || this.isSubmitting()) return;

    // Alış saati mevcut zamanın saatinden başlar — service'te validate ediliyor
    const startDate = new Date(this.newStartDate + 'T09:00:00');
    const endDate = new Date(this.newEndDate + 'T09:00:00');

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    this.service.updateDates(this.reservationId, startDate, endDate).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        if (res.success) {
          this.updated.emit();
        } else {
          this.errorMessage.set(res.message || 'Güncelleme başarısız.');
        }
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(
          err.error?.message || 'Sunucuyla iletişim kurulamadı.'
        );
      }
    });
  }

  private formatDate(d: Date): string {
    const y = d.getFullYear();
    const m = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
}
