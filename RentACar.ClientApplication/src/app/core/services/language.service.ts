import { Injectable, computed, inject, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { registerLocaleData } from '@angular/common';
import localeTr from '@angular/common/locales/tr';
import localeTrExtra from '@angular/common/locales/extra/tr';
import localeEn from '@angular/common/locales/en';

export type SupportedLang = 'tr' | 'en';

const STORAGE_KEY = 'rentacar_lang';
const DEFAULT_LANG: SupportedLang = 'tr';

/**
 * Kullanıcının dil tercihini yönetir.
 * - localStorage'da saklar
 * - ngx-translate ile senkronize eder
 * - Angular LOCALE'i günceller (date/number pipe için)
 */
@Injectable({ providedIn: 'root' })
export class LanguageService {
  private translate = inject(TranslateService);

  private readonly _currentLang = signal<SupportedLang>(DEFAULT_LANG);
  readonly currentLang = this._currentLang.asReadonly();

  readonly isTurkish = computed(() => this._currentLang() === 'tr');
  readonly isEnglish = computed(() => this._currentLang() === 'en');

  /**
   * Uygulama başlatıldığında bir kere çağrılır (app.config.ts'de).
   * localStorage'dan dil tercihini okur, ngx-translate'i başlatır.
   */
  init(): void {
    // Locale kayıtları — date/currency/number pipe için
    registerLocaleData(localeTr, 'tr', localeTrExtra);
    registerLocaleData(localeEn, 'en');

    // ngx-translate v17: setDefaultLang KALDIRILDI
    // fallbackLang provider'da (app.config.ts) tanımlandı
    this.translate.addLangs(['tr', 'en']);

    const savedLang = this.getSavedLang();
    this.setLang(savedLang);
  }

  /**
   * Dili değiştirir - localStorage'a kaydeder, translate service'e bildirir.
   */
  setLang(lang: SupportedLang): void {
    this._currentLang.set(lang);
    this.translate.use(lang);
    document.documentElement.lang = lang;

    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch { /* sessizce yut */ }
  }

  /**
   * TR ↔ EN toggle
   */
  toggle(): void {
    this.setLang(this._currentLang() === 'tr' ? 'en' : 'tr');
  }

  /**
   * Anlık çeviri (TypeScript içinde kullanılır).
   * Örn: this.language.instant('common.loading')
   */
  instant(key: string, params?: any): string {
    return this.translate.instant(key, params);
  }

  private getSavedLang(): SupportedLang {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'tr' || saved === 'en') return saved;
    } catch { /* ignore */ }

    // localStorage boşsa tarayıcı dilinden tahmin et
    const browserLang = navigator.language.slice(0, 2).toLowerCase();
    return browserLang === 'en' ? 'en' : DEFAULT_LANG;
  }
}