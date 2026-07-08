import { ApplicationConfig, LOCALE_ID, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { registerLocaleData } from '@angular/common';
import localeTr from '@angular/common/locales/tr';
import localeTrExtra from '@angular/common/locales/extra/tr';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';

// ═══ Türkçe locale kayıt ═══
// Bu, tüm date, number, currency pipe'larının Türkçe formatta çıkmasını sağlar.
// Örn: 2999.50 → "2.999,50" (binlik nokta, ondalık virgül)
registerLocaleData(localeTr, 'tr', localeTrExtra);

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor])
    ),
    provideAnimations(),

    // 'tr-TR' yerine 'tr' kullanın
    { provide: LOCALE_ID, useValue: 'tr' }, 
  ]
};