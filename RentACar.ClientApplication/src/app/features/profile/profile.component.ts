import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ProfileService } from '../../core/services/profile.service';

type Tab = 'personal' | 'password';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="bg-ink-100/30 min-h-screen py-6 lg:py-8">
      <div class="max-w-[1200px] mx-auto px-4 sm:px-6">

        <!-- ═══ Başlık ═══ -->
        <div class="mb-6 flex items-center gap-4">
          <div class="w-16 h-16 bg-brand-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {{ getInitials() }}
          </div>
          <div>
            <h1 class="text-2xl lg:text-3xl font-extrabold text-ink-900">
              {{ auth.user()?.firstName }} {{ auth.user()?.lastName }}
            </h1>
            <p class="text-ink-500 text-sm mt-0.5">{{ auth.user()?.email }}</p>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">

          <!-- ═══ Sol: Sekme Menüsü ═══ -->
          <aside class="lg:sticky lg:top-24 lg:self-start space-y-2">
            <button (click)="activeTab.set('personal')"
                    class="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition text-left"
                    [class.bg-white]="activeTab() === 'personal'"
                    [class.shadow-card]="activeTab() === 'personal'"
                    [class.text-brand-600]="activeTab() === 'personal'"
                    [class.font-bold]="activeTab() === 'personal'"
                    [class.text-ink-700]="activeTab() !== 'personal'"
                    [class.hover:bg-white/50]="activeTab() !== 'personal'">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
              <span>Kişisel Bilgiler</span>
            </button>

            <button (click)="activeTab.set('password')"
                    class="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition text-left"
                    [class.bg-white]="activeTab() === 'password'"
                    [class.shadow-card]="activeTab() === 'password'"
                    [class.text-brand-600]="activeTab() === 'password'"
                    [class.font-bold]="activeTab() === 'password'"
                    [class.text-ink-700]="activeTab() !== 'password'"
                    [class.hover:bg-white/50]="activeTab() !== 'password'">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
              <span>Şifre Değiştir</span>
            </button>

            <div class="pt-4 mt-4 border-t border-ink-200">
              <a routerLink="/rezervasyonlarim"
                 class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-ink-700 hover:bg-white/50 transition">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                </svg>
                <span>Rezervasyonlarım</span>
              </a>
              <button (click)="logout()"
                      class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-accent-danger hover:bg-white/50 transition">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                </svg>
                <span>Çıkış Yap</span>
              </button>
            </div>
          </aside>

          <!-- ═══ Sağ: İçerik ═══ -->
          <div class="bg-white rounded-2xl shadow-card p-6 lg:p-8">

            <!-- ═══ TAB: Kişisel Bilgiler ═══ -->
            @if (activeTab() === 'personal') {
              <div>
                <h2 class="text-xl font-bold text-ink-900 mb-1">Kişisel Bilgiler</h2>
                <p class="text-sm text-ink-500 mb-6">
                  Ad, soyad, telefon ve adres bilgilerinizi güncelleyebilirsiniz.
                </p>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="label">Ad *</label>
                    <input type="text"
                           [(ngModel)]="profileForm.firstName"
                           class="input-field"
                           placeholder="Adınız">
                  </div>

                  <div>
                    <label class="label">Soyad *</label>
                    <input type="text"
                           [(ngModel)]="profileForm.lastName"
                           class="input-field"
                           placeholder="Soyadınız">
                  </div>

                  <div class="md:col-span-2">
                    <label class="label">E-posta</label>
                    <input type="email"
                           [value]="auth.user()?.email || ''"
                           disabled
                           class="input-field bg-ink-100/50 cursor-not-allowed">
                    <p class="text-xs text-ink-500 mt-1">E-posta değiştirilemez</p>
                  </div>

                  <div class="md:col-span-2">
                    <label class="label">Telefon *</label>
                    <input type="tel"
                           [(ngModel)]="profileForm.phone"
                           class="input-field"
                           placeholder="0545 123 45 67">
                  </div>

                  <div class="md:col-span-2">
                    <label class="label">Adres</label>
                    <textarea [(ngModel)]="profileForm.address"
                              rows="3"
                              maxlength="500"
                              class="input-field resize-none"
                              placeholder="Mahalle, sokak, ilçe, il..."></textarea>
                    <p class="text-xs text-ink-500 mt-1 text-right">
                      {{ profileForm.address.length }}/500
                    </p>
                  </div>
                </div>

                @if (profileMessage()) {
                  <div class="mt-4 p-3 rounded-lg text-sm"
                       [class.bg-accent-success/10]="profileMessageType() === 'success'"
                       [class.text-accent-success]="profileMessageType() === 'success'"
                       [class.bg-accent-danger/10]="profileMessageType() === 'error'"
                       [class.text-accent-danger]="profileMessageType() === 'error'">
                    {{ profileMessage() }}
                  </div>
                }

                <div class="mt-6 flex justify-end">
                  <button (click)="saveProfile()"
                          [disabled]="!isProfileValid() || savingProfile()"
                          class="px-6 py-2.5 rounded-full text-sm font-bold bg-brand-600 hover:bg-brand-700 text-white transition
                                 disabled:opacity-50 disabled:cursor-not-allowed
                                 flex items-center gap-2">
                    @if (savingProfile()) {
                      <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Kaydediliyor...
                    } @else {
                      Değişiklikleri Kaydet
                    }
                  </button>
                </div>
              </div>
            }

            <!-- ═══ TAB: Şifre Değiştir ═══ -->
            @if (activeTab() === 'password') {
              <div>
                <h2 class="text-xl font-bold text-ink-900 mb-1">Şifre Değiştir</h2>
                <p class="text-sm text-ink-500 mb-6">
                  Güvenliğiniz için düzenli olarak şifrenizi değiştirmenizi öneririz.
                </p>

                <div class="max-w-md space-y-4">
                  <div>
                    <label class="label">Mevcut Şifre *</label>
                    <div class="relative">
                      <input [type]="showCurrentPassword() ? 'text' : 'password'"
                             [(ngModel)]="passwordForm.currentPassword"
                             class="input-field pr-10"
                             placeholder="Mevcut şifreniz">
                      <button type="button"
                              (click)="showCurrentPassword.set(!showCurrentPassword())"
                              class="absolute right-3 top-1/2 -translate-y-1/2 text-ink-500 hover:text-ink-700">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          @if (showCurrentPassword()) {
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                          } @else {
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                          }
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label class="label">Yeni Şifre *</label>
                    <div class="relative">
                      <input [type]="showNewPassword() ? 'text' : 'password'"
                             [(ngModel)]="passwordForm.newPassword"
                             class="input-field pr-10"
                             placeholder="En az 6 karakter">
                      <button type="button"
                              (click)="showNewPassword.set(!showNewPassword())"
                              class="absolute right-3 top-1/2 -translate-y-1/2 text-ink-500 hover:text-ink-700">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          @if (showNewPassword()) {
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                          } @else {
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                          }
                        </svg>
                      </button>
                    </div>

                    <!-- Şifre gücü göstergesi -->
                    @if (passwordForm.newPassword.length > 0) {
                      <div class="mt-2 flex gap-1">
                        @for (i of [0,1,2,3]; track i) {
                          <div class="h-1 flex-1 rounded"
                               [class.bg-ink-200]="passwordStrength() <= i"
                               [class.bg-accent-danger]="passwordStrength() === 1 && i === 0"
                               [class.bg-accent-warning]="passwordStrength() === 2 && i <= 1"
                               [class.bg-brand-500]="passwordStrength() === 3 && i <= 2"
                               [class.bg-accent-success]="passwordStrength() === 4 && i <= 3">
                          </div>
                        }
                      </div>
                      <p class="text-xs mt-1"
                         [class.text-accent-danger]="passwordStrength() === 1"
                         [class.text-accent-warning]="passwordStrength() === 2"
                         [class.text-brand-600]="passwordStrength() === 3"
                         [class.text-accent-success]="passwordStrength() === 4">
                        Şifre gücü: {{ getStrengthLabel() }}
                      </p>
                    }
                  </div>

                  <div>
                    <label class="label">Yeni Şifre Tekrar *</label>
                    <input type="password"
                           [(ngModel)]="passwordForm.confirmPassword"
                           class="input-field"
                           placeholder="Yeni şifreyi tekrar girin">
                    @if (passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword) {
                      <p class="text-xs text-accent-danger mt-1">Şifreler eşleşmiyor</p>
                    }
                  </div>
                </div>

                @if (passwordMessage()) {
                  <div class="mt-4 max-w-md p-3 rounded-lg text-sm"
                       [class.bg-accent-success/10]="passwordMessageType() === 'success'"
                       [class.text-accent-success]="passwordMessageType() === 'success'"
                       [class.bg-accent-danger/10]="passwordMessageType() === 'error'"
                       [class.text-accent-danger]="passwordMessageType() === 'error'">
                    {{ passwordMessage() }}
                  </div>
                }

                <div class="mt-6 max-w-md flex justify-end">
                  <button (click)="changePassword()"
                          [disabled]="!isPasswordValid() || savingPassword()"
                          class="px-6 py-2.5 rounded-full text-sm font-bold bg-brand-600 hover:bg-brand-700 text-white transition
                                 disabled:opacity-50 disabled:cursor-not-allowed
                                 flex items-center gap-2">
                    @if (savingPassword()) {
                      <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Değiştiriliyor...
                    } @else {
                      Şifreyi Değiştir
                    }
                  </button>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProfileComponent implements OnInit {
  protected auth = inject(AuthService);
  private profileService = inject(ProfileService);

  protected activeTab = signal<Tab>('personal');

  // ═══ Personal Info Form ═══
  protected profileForm = {
    firstName: '',
    lastName: '',
    phone: '',
    address: ''
  };
  protected savingProfile = signal(false);
  protected profileMessage = signal<string | null>(null);
  protected profileMessageType = signal<'success' | 'error'>('success');

  // ═══ Password Form ═══
  protected passwordForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };
  protected savingPassword = signal(false);
  protected passwordMessage = signal<string | null>(null);
  protected passwordMessageType = signal<'success' | 'error'>('success');
  protected showCurrentPassword = signal(false);
  protected showNewPassword = signal(false);

  ngOnInit(): void {
    // Auth service'deki kullanıcı bilgilerini form'a yükle
    const user = this.auth.user();
    if (user) {
      this.profileForm.firstName = user.firstName || '';
      this.profileForm.lastName = user.lastName || '';
      this.profileForm.phone = user.phone || '';
      this.profileForm.address = (user as any).address || '';
    }
  }

  // ═══ Personal Info ═══
  isProfileValid(): boolean {
    const p = this.profileForm;
    return !!(p.firstName.trim().length >= 2 &&
              p.lastName.trim().length >= 2 &&
              p.phone.trim().length >= 10);
  }

  saveProfile(): void {
    if (!this.isProfileValid()) return;

    this.savingProfile.set(true);
    this.profileMessage.set(null);

    this.profileService.updateProfile({
      firstName: this.profileForm.firstName.trim(),
      lastName: this.profileForm.lastName.trim(),
      phone: this.profileForm.phone.trim(),
      address: this.profileForm.address?.trim() || null
    }).subscribe({
      next: (res) => {
        this.savingProfile.set(false);
        if (res.success && res.data) {
          this.profileMessage.set('Profil bilgileriniz başarıyla güncellendi.');
          this.profileMessageType.set('success');
          // Auth service'de kullanıcıyı güncelle
          this.auth.updateUser(res.data);
        } else {
          this.profileMessage.set(res.message || 'Güncelleme başarısız.');
          this.profileMessageType.set('error');
        }
      },
      error: (err) => {
        this.savingProfile.set(false);
        this.profileMessage.set(err.error?.message || 'Sunucu hatası.');
        this.profileMessageType.set('error');
      }
    });
  }

  // ═══ Password ═══
  isPasswordValid(): boolean {
    const p = this.passwordForm;
    return !!(p.currentPassword &&
              p.newPassword.length >= 6 &&
              p.newPassword === p.confirmPassword);
  }

  passwordStrength = computed((): number => {
    const pwd = this.passwordForm.newPassword;
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 10) score++;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
    if (/\d/.test(pwd) && /[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  });

  getStrengthLabel(): string {
    switch (this.passwordStrength()) {
      case 1: return 'Zayıf';
      case 2: return 'Orta';
      case 3: return 'İyi';
      case 4: return 'Güçlü';
      default: return '';
    }
  }

  changePassword(): void {
    if (!this.isPasswordValid()) return;

    this.savingPassword.set(true);
    this.passwordMessage.set(null);

    this.profileService.changePassword({
      currentPassword: this.passwordForm.currentPassword,
      newPassword: this.passwordForm.newPassword,
      confirmPassword: this.passwordForm.confirmPassword
    }).subscribe({
      next: (res) => {
        this.savingPassword.set(false);
        if (res.success) {
          this.passwordMessage.set('Şifreniz başarıyla değiştirildi.');
          this.passwordMessageType.set('success');
          // Formu temizle
          this.passwordForm = { currentPassword: '', newPassword: '', confirmPassword: '' };
        } else {
          this.passwordMessage.set(res.message || 'Şifre değiştirilemedi.');
          this.passwordMessageType.set('error');
        }
      },
      error: (err) => {
        this.savingPassword.set(false);
        this.passwordMessage.set(err.error?.message || 'Sunucu hatası.');
        this.passwordMessageType.set('error');
      }
    });
  }

  // ═══ Helpers ═══
  getInitials(): string {
    const u = this.auth.user();
    if (!u) return '?';
    return `${u.firstName?.[0] || ''}${u.lastName?.[0] || ''}`.toUpperCase();
  }

  logout(): void {
    this.auth.logout();
  }
}