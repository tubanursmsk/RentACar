import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of, switchMap, map } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { User, LoginRequest, RegisterRequest } from '../models/user.model';
import { environment } from '../../../environments/environment';
import { UserProfile } from './profile.service';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private http = inject(HttpClient);
  private router = inject(Router);

  // ── Signals ──
  private readonly _user = signal<User | null>(null);
  private readonly _isLoading = signal(false);

  // Public read-only signals
  readonly user = this._user.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly isAuthenticated = computed(() => this._user() !== null);
  readonly userRole = computed(() => this._user()?.role ?? null);

  // ── Mevcut oturumu kontrol et (sayfa açılışında çağrılır) ──
  checkAuth(): Observable<User | null> {
    this._isLoading.set(true);
    return this.http.get<ApiResponse<User>>(`${environment.apiUrl}/Auth/Me`).pipe(
      tap(res => {
        if (res.success && res.data) {
          this._user.set(res.data);
        } else {
          this._user.set(null);
        }
        this._isLoading.set(false);
      }),
      catchError(() => {
        this._user.set(null);
        this._isLoading.set(false);
        return of(null);
      }),

    ) as unknown as Observable<User | null>;
  }

  // ── Login ──
  login(credentials: LoginRequest): Observable<ApiResponse<string>> {
    this._isLoading.set(true);
    return this.http.post<ApiResponse<string>>(
      `${environment.apiUrl}/Auth/Login`,
      credentials
    ).pipe(
      switchMap(res => {
        if (res.success) {
          // Cookie set edildi, /Me ile user bilgisini çek
          return this.http.get<ApiResponse<User>>(`${environment.apiUrl}/Auth/Me`).pipe(
            tap(meRes => {
              if (meRes.success && meRes.data) {
                this._user.set(meRes.data);
              }
            }),
            map(() => res),
            catchError(() => of(res))
          );
        }
        return of(res);
      }),
      tap(() => this._isLoading.set(false)),
      catchError(err => {
        this._isLoading.set(false);
        throw err;
      })
    );
  }

  // ── Register ──
  register(data: RegisterRequest): Observable<ApiResponse<number>> {
    this._isLoading.set(true);
    return this.http.post<ApiResponse<number>>(
      `${environment.apiUrl}/Auth/RegisterCustomer`,
      data
    ).pipe(
      tap(() => this._isLoading.set(false)),
      catchError(err => {
        this._isLoading.set(false);
        throw err;
      })
    );
  }



  updateUser(updatedUser: Partial<User>): void {
    const current = this.user();
    if (!current) return;

    const merged = { ...current, ...updatedUser };
    this._user.set(merged);

    // localStorage/sessionStorage'ta tutuyorsan burayı da güncelle:
    // localStorage.setItem('user', JSON.stringify(merged));
  }

  // ── Logout ──
  logout(): void {
    this.http.post(`${environment.apiUrl}/Auth/Logout`, {}).subscribe({
      next: () => {
        this._user.set(null);
        this.clearAllUserData();   
        this.router.navigate(['/']);
      },
      error: () => {
        this._user.set(null);
        this.clearAllUserData();   
        this.router.navigate(['/']);
      }
    });
  }

  /**
   * - Logout'ta kullanıcıya ait TÜM local state'i temizle.
   * - Wizard state (yarım kalmış rezervasyon)
   * - Booking selection (ana sayfa arama tercihleri)
   * - Diğer localStorage/sessionStorage anahtarları
   */
  private clearAllUserData(): void {
    try {
      // Wizard state (sessionStorage + localStorage - iki yerde de temizle)
      sessionStorage.removeItem('rentacar_wizard');
      localStorage.removeItem('rentacar_wizard');

      // Booking state (ana sayfada seçilen tarih/lokasyon)
      sessionStorage.removeItem('rentacar_booking');
      localStorage.removeItem('rentacar_booking');
    } catch { /* sessizce yut */ }
  }

}