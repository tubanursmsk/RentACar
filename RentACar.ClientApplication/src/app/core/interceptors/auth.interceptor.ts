import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

/**
 * Tüm HTTP isteklerine `withCredentials: true` ekler — cookie'lerin gönderilmesi için şart.
 * 401 dönerse login sayfasına yönlendirir.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  // Cookie'lerin cross-origin gitmesi için şart
  const clonedReq = req.clone({
    withCredentials: true
  });

  return next(clonedReq).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        // Auth controller endpoint'ine giderken 401 olabilir, sonsuz redirect olmasın
        const isAuthCheck = req.url.includes('/Auth/Me') || req.url.includes('/Auth/Login');
        if (!isAuthCheck) {
          router.navigate(['/login'], {
            queryParams: { returnUrl: router.url }
          });
        }
      }
      return throwError(() => err);
    })
  );
};