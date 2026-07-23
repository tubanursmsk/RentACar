import { Component, OnInit, computed, HostListener, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ReservationWizardService } from '../../../core/services/reservation-wizard.service';
import { LocationService } from '../../../core/services/location.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-step-summary',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  template: `
    <div class="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
      <!-- Sol: Özet -->
      <div class="card p-6 lg:p-8">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold">{{ 'wizard.summary.title' | translate }}</h2>
          <button (click)="openEditModal()"
                  class="text-sm font-semibold text-brand-600 hover:underline">
            {{ 'wizard.summary.edit' | translate }}
          </button>
        </div>

        @if (wizard.state().car; as car) {
          <div class="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6">
            <div class="aspect-video bg-ink-100 rounded-lg overflow-hidden flex items-center justify-center">
              @if (car.imageUrl) {
                <img [src]="apiBaseUrl + car.imageUrl"
                     [alt]="car.brandName + ' ' + car.model"
                     class="w-full h-full object-cover">
              } @else {
                <span class="text-5xl">🚗</span>
              }
            </div>
            <div>
              <h3 class="text-xl font-bold">{{ car.brandName }} {{ car.model }}</h3>
              <p class="text-ink-500">{{ car.modelYear }} • {{ car.color }}</p>
              <div class="mt-3 space-y-1 text-sm">
                <div><span class="text-ink-500">{{ 'wizard.summary.plate' | translate }}</span> <b>{{ car.plate }}</b></div>
                <div><span class="text-ink-500">{{ 'wizard.summary.daily' | translate }}</span> <b class="text-brand-600">₺{{ car.dailyPrice | number:'1.0-0' }}</b></div>
              </div>
            </div>
          </div>

          <div class="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="bg-ink-100/40 rounded-lg p-4">
              <div class="text-xs text-ink-500 font-bold uppercase mb-1">
                {{ 'wizard.summary.pickup' | translate }}
              </div>
              <div class="font-semibold">{{ formatDate(wizard.state().rentStartDate) }}</div>
              <div class="text-sm text-ink-500 mt-1">
                📍 {{ pickupLocationName() }}
              </div>
            </div>
            <div class="bg-ink-100/40 rounded-lg p-4">
              <div class="text-xs text-ink-500 font-bold uppercase mb-1">
                {{ 'wizard.summary.return' | translate }}
              </div>
              <div class="font-semibold">{{ formatDate(wizard.state().rentEndDate) }}</div>
              <div class="text-sm text-ink-500 mt-1">
                📍 {{ dropoffLocationName() }}
              </div>
            </div>
          </div>

          <div class="mt-6 p-4 bg-avis-50 border border-avis-100 rounded-lg flex items-center justify-between">
            <span class="text-sm">
              {{ wizard.totalDays() }} {{ 'wizard.common.days' | translate }} × ₺{{ car.dailyPrice | number:'1.0-0' }}
            </span>
            <span class="text-xl font-extrabold text-brand-600">
              ₺{{ (wizard.totalDays() * car.dailyPrice) | number:'1.2-2' }}
            </span>
          </div>
        } @else {
          <p class="text-ink-500">{{ 'wizard.summary.loadingCar' | translate }}</p>
        }
      </div>

      <!-- Sağ: Bilgi paneli -->
      <aside class="card p-6">
        <h3 class="font-bold text-lg mb-4">{{ 'wizard.summary.nextStep' | translate }}</h3>
        <p class="text-sm text-ink-700 mb-6">
          {{ 'wizard.summary.nextStepDesc' | translate }}
        </p>

        <button (click)="next()"
                class="btn-primary w-full"
                [disabled]="!wizard.canProceedFromStep1()">
          {{ 'wizard.common.continue' | translate }}
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M9 5l7 7-7 7"/>
          </svg>
        </button>
      </aside>
    </div>

    <!-- ═══════════════════════════════════════════════════ -->
    <!-- DÜZENLE MODALI                                       -->
    <!-- ═══════════════════════════════════════════════════ -->
    @if (isEditModalOpen()) {
      <div class="fixed inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
           style="z-index: 100;"
           (click)="closeEditModal()"></div>

      <div class="fixed inset-0 flex items-center justify-center p-4 pointer-events-none"
           style="z-index: 101;">
        <div class="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto pointer-events-auto animate-fade-in"
             (click)="$event.stopPropagation()">

          <div class="sticky top-0 bg-white z-10 flex items-center justify-between px-6 py-4 border-b border-ink-100">
            <h3 class="text-lg font-bold text-ink-900">
              {{ 'wizard.summary.editModal.title' | translate }}
            </h3>
            <button (click)="closeEditModal()"
                    class="w-9 h-9 rounded-full hover:bg-ink-100 flex items-center justify-center transition">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <div class="p-6 space-y-4">

            <!-- Alış Ofisi -->
            <div>
              <label class="text-xs font-bold text-ink-700 uppercase tracking-wide mb-2 block">
                {{ 'wizard.summary.editModal.pickupOffice' | translate }}
              </label>
              <select [(ngModel)]="editPickupLocationId"
                      (change)="onPickupLocationChange()"
                      class="input-field text-sm cursor-pointer">
                <option [ngValue]="null">{{ 'wizard.summary.editModal.selectLocation' | translate }}</option>
                @for (loc of locations(); track loc.id) {
                  <option [ngValue]="loc.id">{{ loc.name }} — {{ loc.city }}</option>
                }
              </select>
            </div>

            <!-- Aynı ofis checkbox -->
            <label class="flex items-center gap-2 cursor-pointer text-sm text-ink-700">
              <input type="checkbox"
                     [(ngModel)]="sameLocation"
                     (change)="onSameLocationToggle()"
                     class="w-4 h-4 accent-brand-600">
              {{ 'wizard.summary.editModal.sameLocation' | translate }}
            </label>

            <!-- İade Ofisi -->
            @if (!sameLocation) {
              <div>
                <label class="text-xs font-bold text-ink-700 uppercase tracking-wide mb-2 block">
                  {{ 'wizard.summary.editModal.dropoffOffice' | translate }}
                </label>
                <select [(ngModel)]="editDropoffLocationId"
                        class="input-field text-sm cursor-pointer">
                  <option [ngValue]="null">{{ 'wizard.summary.editModal.selectLocation' | translate }}</option>
                  @for (loc of locations(); track loc.id) {
                    <option [ngValue]="loc.id">{{ loc.name }} — {{ loc.city }}</option>
                  }
                </select>
              </div>
            }

            <!-- Tarihler -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="text-xs font-bold text-ink-700 uppercase tracking-wide mb-2 block">
                  {{ 'wizard.summary.editModal.pickupDate' | translate }}
                </label>
                <input type="date"
                       [(ngModel)]="editPickupDate"
                       [min]="todayString"
                       (change)="onPickupDateChange()"
                       class="input-field text-sm cursor-pointer"
                       style="color-scheme: light;">
              </div>

              <div>
                <label class="text-xs font-bold text-ink-700 uppercase tracking-wide mb-2 block">
                  {{ 'wizard.summary.editModal.returnDate' | translate }}
                </label>
                <input type="date"
                       [(ngModel)]="editReturnDate"
                       [min]="minReturnDate()"
                       class="input-field text-sm cursor-pointer"
                       style="color-scheme: light;">
              </div>
            </div>

            <div class="text-xs text-ink-500 bg-ink-50 rounded-lg p-3 flex items-start gap-2">
              <svg class="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span>{{ 'wizard.summary.editModal.info' | translate }}</span>
            </div>

            @if (editError()) {
              <div class="text-sm text-white bg-accent-danger rounded-lg py-2 px-3 font-medium">
                ⚠️ {{ editError() }}
              </div>
            }

            <div class="flex gap-3 pt-2">
              <button (click)="closeEditModal()"
                      class="flex-1 btn-secondary">
                {{ 'wizard.summary.editModal.cancel' | translate }}
              </button>
              <button (click)="saveEdit()"
                      [disabled]="!canSaveEdit()"
                      class="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
                {{ 'wizard.summary.editModal.save' | translate }}
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class StepSummaryComponent implements OnInit {
  protected wizard = inject(ReservationWizardService);
  private locationService = inject(LocationService);
  private translate = inject(TranslateService);

  protected apiBaseUrl = environment.apiBaseUrl;
  protected locations = this.locationService.locations;

  // Modal state
  protected isEditModalOpen = signal(false);
  protected editPickupLocationId: number | null = null;
  protected editDropoffLocationId: number | null = null;
  protected editPickupDate = '';
  protected editReturnDate = '';
  protected sameLocation = true;
  protected editError = signal<string | null>(null);

  protected todayString = this.formatDateForInput(new Date());

  protected minReturnDate = computed(() => {
    if (!this.editPickupDate) return this.todayString;
    const d = new Date(this.editPickupDate);
    d.setDate(d.getDate() + 1);
    return this.formatDateForInput(d);
  });

  // Şube adları — location ID'yi isme çevirir
  protected pickupLocationName = computed(() => {
    const id = this.wizard.state().pickUpLocationId;
    if (!id) return '';
    const loc = this.locations().find(l => l.id === id);
    if (!loc) return this.translate.instant('wizard.summary.unknownBranch');
    return `${loc.name} — ${loc.city}`;
  });

  protected dropoffLocationName = computed(() => {
    const id = this.wizard.state().dropOffLocationId;
    if (!id) return '';
    const loc = this.locations().find(l => l.id === id);
    if (!loc) return this.translate.instant('wizard.summary.unknownBranch');
    return `${loc.name} — ${loc.city}`;
  });

  protected canSaveEdit(): boolean {
    if (!this.editPickupLocationId) return false;
    if (!this.sameLocation && !this.editDropoffLocationId) return false;
    if (!this.editPickupDate || !this.editReturnDate) return false;

    const pd = new Date(this.editPickupDate);
    const rd = new Date(this.editReturnDate);
    if (rd <= pd) return false;

    return true;
  }

  ngOnInit(): void {
    this.wizard.goToStep(1);

    // Locations yoksa yükle
    if (this.locations().length === 0) {
      this.locationService.getAll().subscribe();
    }
  }

  next(): void {
    this.wizard.nextStep();
  }

  // ═══ Modal İşlemleri ═══
  openEditModal(): void {
    const state = this.wizard.state();
    this.editPickupLocationId = state.pickUpLocationId ?? null;
    this.editDropoffLocationId = state.dropOffLocationId ?? null;
    this.sameLocation = state.pickUpLocationId === state.dropOffLocationId;

    if (state.rentStartDate) {
      this.editPickupDate = this.formatDateForInput(new Date(state.rentStartDate));
    }
    if (state.rentEndDate) {
      this.editReturnDate = this.formatDateForInput(new Date(state.rentEndDate));
    }

    this.editError.set(null);
    this.isEditModalOpen.set(true);
    document.body.style.overflow = 'hidden';
  }

  closeEditModal(): void {
    this.isEditModalOpen.set(false);
    this.editError.set(null);
    document.body.style.overflow = '';
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isEditModalOpen()) this.closeEditModal();
  }

  onPickupLocationChange(): void {
    // Aynı ofis işaretliyse iade ofisini de senkronize et
    if (this.sameLocation) {
      this.editDropoffLocationId = this.editPickupLocationId;
    }
    this.editError.set(null);
  }

  onSameLocationToggle(): void {
    if (this.sameLocation) {
      this.editDropoffLocationId = this.editPickupLocationId;
    }
    this.editError.set(null);
  }

  onPickupDateChange(): void {
    // İade tarihi geçmiş veya eşitse, otomatik +1 gün
    if (this.editPickupDate && this.editReturnDate) {
      const pd = new Date(this.editPickupDate);
      const rd = new Date(this.editReturnDate);
      if (rd <= pd) {
        const newReturn = new Date(pd);
        newReturn.setDate(newReturn.getDate() + 1);
        this.editReturnDate = this.formatDateForInput(newReturn);
      }
    }
    this.editError.set(null);
  }

  saveEdit(): void {
    if (!this.canSaveEdit()) return;

    const pickup = new Date(this.editPickupDate);
    const ret = new Date(this.editReturnDate);

    // Mevcut saat bilgisini koru (state'ten al)
    const state = this.wizard.state();
    if (state.rentStartDate) {
      const oldPickup = new Date(state.rentStartDate);
      pickup.setHours(oldPickup.getHours(), oldPickup.getMinutes(), 0, 0);
    }
    if (state.rentEndDate) {
      const oldReturn = new Date(state.rentEndDate);
      ret.setHours(oldReturn.getHours(), oldReturn.getMinutes(), 0, 0);
    }

    // Wizard'ı güncelle
    this.wizard.setDates(pickup, ret);
    this.wizard.setLocations(
      this.editPickupLocationId!,
      this.sameLocation ? this.editPickupLocationId! : this.editDropoffLocationId!
    );

    this.closeEditModal();
  }

  // ═══ Tarih Formatları — Locale bazlı ═══
  protected formatDate(date: Date | null | undefined): string {
    if (!date) return '';
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) return '';

    const currentLang = this.translate.currentLang || 'tr';
    const locale = currentLang() === 'en' ? 'en-US' : 'tr-TR';

    return new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(d);
  }

  private formatDateForInput(d: Date): string {
    const y = d.getFullYear();
    const m = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
}