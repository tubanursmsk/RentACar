import { Component, EventEmitter, HostListener, Input, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReservationManagementService } from '../../core/services/reservation-management.service';

@Component({
  selector: 'app-cancel-reservation-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (isOpen) {
      <!-- Backdrop -->
      <div class="fixed inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
           style="z-index: 100;"
           (click)="close()"></div>

      <!-- Modal -->
      <div class="fixed inset-0 flex items-center justify-center p-4 pointer-events-none"
           style="z-index: 101;">
        <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full pointer-events-auto animate-fade-in"
             (click)="$event.stopPropagation()">

          <!-- Header -->
          <div class="px-6 py-5 border-b border-ink-100 flex items-center gap-3">
            <div class="w-11 h-11 bg-accent-danger/10 rounded-full flex items-center justify-center flex-shrink-0">
              <svg class="w-6 h-6 text-accent-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-bold text-ink-900">Rezervasyonu İptal Et</h3>
              <p class="text-xs text-ink-500 mt-0.5">Bu işlem geri alınamaz</p>
            </div>
          </div>

          <!-- Body -->
          <div class="p-6">
            <p class="text-sm text-ink-700 leading-relaxed">
              Bu rezervasyonu iptal etmek istediğinize emin misiniz?
              @if (reservationCode) {
                <br><span class="text-xs text-ink-500 mt-1 inline-block">
                  Rezervasyon: <strong>{{ reservationCode }}</strong>
                </span>
              }
            </p>

            <div class="mt-4">
              <label class="text-xs font-bold text-ink-700 uppercase tracking-wide mb-2 block">
                İptal Sebebi <span class="text-ink-400 font-normal normal-case">(Opsiyonel)</span>
              </label>
              <textarea [(ngModel)]="reason"
                        rows="3"
                        maxlength="500"
                        placeholder="İsteğe bağlı olarak iptal sebebinizi belirtin..."
                        class="input-field text-sm resize-none"></textarea>
              <p class="text-xs text-ink-400 mt-1 text-right">{{ reason.length }}/500</p>
            </div>

            @if (errorMessage()) {
              <div class="mt-3 bg-accent-danger/10 border border-accent-danger/20 rounded-lg p-3 text-sm text-accent-danger">
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
                           disabled:opacity-50 disabled:cursor-not-allowed">
              Vazgeç
            </button>
            <button (click)="confirmCancel()"
                    [disabled]="isSubmitting()"
                    class="flex-1 px-4 py-2.5 rounded-full text-sm font-semibold
                           bg-accent-danger hover:bg-red-700 text-white transition
                           disabled:opacity-50 disabled:cursor-not-allowed
                           flex items-center justify-center gap-2">
              @if (isSubmitting()) {
                <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                İptal Ediliyor...
              } @else {
                Evet, İptal Et
              }
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class CancelReservationModalComponent {
  @Input() isOpen = false;
  @Input() reservationId!: number;
  @Input() reservationCode?: string | null;

  @Output() cancelled = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  private service = inject(ReservationManagementService);

  protected reason = '';
  protected isSubmitting = signal(false);
  protected errorMessage = signal<string | null>(null);

  close(): void {
    if (this.isSubmitting()) return;
    this.reason = '';
    this.errorMessage.set(null);
    this.closed.emit();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isOpen) this.close();
  }

  confirmCancel(): void {
    if (this.isSubmitting()) return;
    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    this.service.cancel(this.reservationId, this.reason.trim() || undefined).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        if (res.success) {
          this.cancelled.emit();
          this.reason = '';
        } else {
          this.errorMessage.set(res.message || 'İptal işlemi başarısız.');
        }
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(
          err.error?.message || 'Sunucuyla iletişim kurulamadı. Lütfen tekrar deneyin.'
        );
      }
    });
  }
}
