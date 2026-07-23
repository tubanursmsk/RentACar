import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContactService, ContactFormRequest } from '../../core/services/contact.service';

@Component({
  selector: 'app-contact-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- ═══ Kompakt Bar (Kapalı Hali) ═══ -->
    @if (!isExpanded()) {
      <section class="bg-gradient-to-r from-brand-600 to-brand-700 text-white">
        <div class="max-w-[1400px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
            </div>
            <div class="min-w-0">
              <div class="font-bold text-sm sm:text-base truncate">
                Bir sorunuz mu var? Hemen ulaşın!
              </div>
              <div class="text-xs opacity-90 hidden sm:block">
                Formu doldurun, en kısa sürede size dönüş yapalım.
              </div>
            </div>
          </div>
          <button (click)="openForm()"
                  class="flex-shrink-0 inline-flex items-center gap-2 bg-white text-brand-600 hover:bg-ink-100
                         font-bold text-sm px-4 py-2 rounded-full transition shadow-sm">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
            </svg>
            <span class="hidden sm:inline">Bize Ulaşın</span>
            <span class="sm:hidden">İletişim</span>
          </button>
        </div>
      </section>
    }

    <!-- ═══ Genişletilmiş Form ═══ -->
    @if (isExpanded()) {
      <section class="bg-gradient-to-r from-brand-600 to-brand-700 text-white animate-fade-in">
        <div class="max-w-[1400px] mx-auto px-4 sm:px-6 py-5 sm:py-6">

          <!-- Başlık + Kapat -->
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="font-bold text-lg sm:text-xl">📞 Bize Ulaşın</h3>
              <p class="text-xs sm:text-sm opacity-90 mt-0.5">
                Formu doldurun, en kısa sürede size dönüş yapalım
              </p>
            </div>
            <button (click)="closeForm()"
                    class="w-9 h-9 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          @if (!isSuccess()) {
            <!-- Form -->
            <div class="bg-white rounded-2xl shadow-card p-4 sm:p-6 text-ink-900">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">

                <div>
                  <label class="text-xs font-bold text-ink-700 uppercase tracking-wide mb-1.5 block">
                    Ad Soyad *
                  </label>
                  <input type="text"
                         [(ngModel)]="formData.name"
                         [class.border-accent-danger]="showErrors() && !isNameValid()"
                         class="input-field text-sm"
                         placeholder="Adınız Soyadınız"
                         maxlength="100">
                </div>

                <div>
                  <label class="text-xs font-bold text-ink-700 uppercase tracking-wide mb-1.5 block">
                    E-posta *
                  </label>
                  <input type="email"
                         [(ngModel)]="formData.email"
                         [class.border-accent-danger]="showErrors() && !isEmailValid()"
                         class="input-field text-sm"
                         placeholder="ornek@email.com"
                         maxlength="100">
                </div>

                <div>
                  <label class="text-xs font-bold text-ink-700 uppercase tracking-wide mb-1.5 block">
                    Telefon *
                  </label>
                  <input type="tel"
                         [(ngModel)]="formData.phone"
                         [class.border-accent-danger]="showErrors() && !isPhoneValid()"
                         class="input-field text-sm"
                         placeholder="0545 123 45 67"
                         maxlength="20">
                </div>

                <div>
                  <label class="text-xs font-bold text-ink-700 uppercase tracking-wide mb-1.5 block">
                    Konu *
                  </label>
                  <input type="text"
                         [(ngModel)]="formData.subject"
                         [class.border-accent-danger]="showErrors() && !isSubjectValid()"
                         class="input-field text-sm"
                         placeholder="Mesajınızın konusu"
                         maxlength="150">
                </div>

                <div class="md:col-span-2">
                  <label class="text-xs font-bold text-ink-700 uppercase tracking-wide mb-1.5 block">
                    Mesajınız *
                    <span class="text-ink-500 normal-case font-normal ml-2">
                      ({{ formData.message.length }}/2000)
                    </span>
                  </label>
                  <textarea [(ngModel)]="formData.message"
                            [class.border-accent-danger]="showErrors() && !isMessageValid()"
                            rows="3"
                            class="input-field text-sm resize-none"
                            placeholder="Mesajınızı detaylı olarak yazın..."
                            maxlength="2000"></textarea>
                </div>
              </div>

              <!-- Hata Mesajı -->
              @if (errorMessage()) {
                <div class="mt-3 bg-accent-danger/10 border border-accent-danger/30 rounded-lg px-3 py-2
                            text-sm text-accent-danger flex items-start gap-2">
                  <svg class="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"/>
                  </svg>
                  <span>{{ errorMessage() }}</span>
                </div>
              }

              <!-- Alt Bilgi + Gönder -->
              <div class="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div class="text-xs text-ink-500 flex items-center gap-1.5">
                  <svg class="w-4 h-4 text-accent-success" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
                  </svg>
                  <span>Bilgileriniz KVKK kapsamında korunur</span>
                </div>

                <button (click)="submit()"
                        [disabled]="submitting()"
                        class="btn-primary w-full sm:w-auto text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                  @if (submitting()) {
                    <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Gönderiliyor...</span>
                  } @else {
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                    </svg>
                    <span>MESAJI GÖNDER</span>
                  }
                </button>
              </div>
            </div>
          } @else {
            <!-- Başarı Ekranı -->
            <div class="bg-white rounded-2xl shadow-card p-6 text-center animate-fade-in">
              <div class="w-16 h-16 mx-auto bg-accent-success/10 rounded-full flex items-center justify-center mb-3">
                <svg class="w-8 h-8 text-accent-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              <h4 class="text-lg font-bold text-ink-900">Mesajınız İletildi! 🎉</h4>
              <p class="text-sm text-ink-700 mt-2 max-w-md mx-auto">
                Talebiniz alındı. E-postanıza otomatik onay gönderildi.
                Ekibimiz en kısa sürede sizinle iletişime geçecek.
              </p>
              <button (click)="closeForm()"
                      class="mt-4 text-sm font-semibold text-brand-600 hover:underline">
                Kapat
              </button>
            </div>
          }
        </div>
      </section>
    }
  `
})
export class ContactBarComponent {
  private contactService = inject(ContactService);

  protected isExpanded = signal(false);
  protected submitting = signal(false);
  protected isSuccess = signal(false);
  protected errorMessage = signal<string | null>(null);
  protected showErrors = signal(false);

  protected formData = {
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  };

  // ═══ Validation ═══
  protected isNameValid = () => this.formData.name.trim().length >= 2;
  protected isEmailValid = () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.formData.email.trim());
  protected isPhoneValid = () => this.formData.phone.trim().replace(/\D/g, '').length >= 10;
  protected isSubjectValid = () => this.formData.subject.trim().length >= 3;
  protected isMessageValid = () => {
    const len = this.formData.message.trim().length;
    return len >= 10 && len <= 2000;
  };

  protected isFormValid(): boolean {
    return this.isNameValid()
        && this.isEmailValid()
        && this.isPhoneValid()
        && this.isSubjectValid()
        && this.isMessageValid();
  }

  // ═══ İşlemler ═══
  openForm(): void {
    this.isExpanded.set(true);
    this.errorMessage.set(null);
    this.showErrors.set(false);
    this.isSuccess.set(false);
  }

  closeForm(): void {
    this.isExpanded.set(false);
    this.errorMessage.set(null);
    this.showErrors.set(false);

    // Başarıyla gönderildiyse formu temizle
    if (this.isSuccess()) {
      this.resetForm();
      this.isSuccess.set(false);
    }
  }

  submit(): void {
    this.errorMessage.set(null);
    this.showErrors.set(true);

    if (!this.isFormValid()) {
      this.errorMessage.set('Lütfen tüm alanları doğru doldurun.');
      return;
    }

    this.submitting.set(true);

    const request: ContactFormRequest = {
      name: this.formData.name.trim(),
      email: this.formData.email.trim(),
      phone: this.formData.phone.trim(),
      subject: this.formData.subject.trim(),
      message: this.formData.message.trim()
    };

    this.contactService.send(request).subscribe({
      next: (res) => {
        this.submitting.set(false);
        if (res.success) {
          this.isSuccess.set(true);
        } else {
          this.errorMessage.set(res.message || 'Mesaj gönderilemedi. Lütfen tekrar deneyin.');
        }
      },
      error: (err) => {
        this.submitting.set(false);
        this.errorMessage.set(
          err.error?.message ||
          'Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edip tekrar deneyin.'
        );
      }
    });
  }

  private resetForm(): void {
    this.formData = {
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    };
    this.showErrors.set(false);
  }
}
