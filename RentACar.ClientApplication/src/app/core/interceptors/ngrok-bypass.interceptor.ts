import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Ngrok Ücretsiz Plan "Browser Warning" Bypass
 *
 * Sorun: Ngrok ücretsiz tüneller ilk ziyarette
 *        "You are about to visit..." HTML uyarı sayfası döner.
 *        Angular JSON beklerken HTML alıp patlar.
 *
 * Çözüm: Her ngrok isteğine `ngrok-skip-browser-warning` header'ı ekle.
 *        Ngrok bu header'ı gördüğünde uyarıyı atlar, direkt API cevabı döner.
 *
 * NOT: Production'da gerçek domain kullanılırsa bu interceptor kaldırılabilir.
 */
export const ngrokBypassInterceptor: HttpInterceptorFn = (req, next) => {
  // Sadece ngrok URL'lerine header ekle (gereksiz yaymamak için)
  if (req.url.includes('ngrok')) {
    const modified = req.clone({
      setHeaders: {
        'ngrok-skip-browser-warning': '1'
      }
    });
    return next(modified);
  }
  return next(req);
};
