import { ApplicationConfig, LOCALE_ID, inject, provideAppInitializer, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { LanguageService } from './core/services/language.service';
import { ngrokBypassInterceptor } from './core/interceptors/ngrok-bypass.interceptor';  

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),

    provideHttpClient(
      withFetch(),
      withInterceptors([ngrokBypassInterceptor, authInterceptor])
    ),

    provideAnimations(),

    // ═══ Translation Service (ngx-translate v17) ═══
    provideTranslateService({
      loader: provideTranslateHttpLoader({
        prefix: '/i18n/',
        suffix: '.json'
      }),
      fallbackLang: 'tr',
      lang: 'tr'
    }),

    // ═══ Uygulama başlangıcında dil kullanıcı tercihine göre set edilir ═══
    provideAppInitializer(() => {
      const langService = inject(LanguageService);
      langService.init();
    }),

    // Angular date/currency/number pipe için default locale
    { provide: LOCALE_ID, useValue: 'tr' }
  ]
};