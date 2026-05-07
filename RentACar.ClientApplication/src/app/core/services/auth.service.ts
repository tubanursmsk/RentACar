import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { User, LoginRequest, RegisterRequest, AuthResponse } from '../models/user.model';
import { environment } from '../../../environments/environment';

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
      tap()
    ) as unknown as Observable<User | null>;
  }

  // ── Login ──
  login(credentials: LoginRequest): Observable<ApiResponse<AuthResponse>> {
    this._isLoading.set(true);
    return this.http.post<ApiResponse<AuthResponse>>(
      `${environment.apiUrl}/Auth/Login`,
      credentials
    ).pipe(
      tap(res => {
        if (res.success && res.data?.user) {
          this._user.set(res.data.user);
        }
        this._isLoading.set(false);
      }),
      catchError(err => {
        this._isLoading.set(false);
        throw err;
      })
    );
  }

  // ── Register ──
  register(data: RegisterRequest): Observable<ApiResponse<AuthResponse>> {
    this._isLoading.set(true);
    return this.http.post<ApiResponse<AuthResponse>>(
      `${environment.apiUrl}/Auth/Register`,
      data
    ).pipe(
      tap(res => {
        if (res.success && res.data?.user) {
          this._user.set(res.data.user);
        }
        this._isLoading.set(false);
      }),
      catchError(err => {
        this._isLoading.set(false);
        throw err;
      })
    );
  }

  // ── Logout ──
  logout(): void {
    this.http.post(`${environment.apiUrl}/Auth/Logout`, {}).subscribe({
      next: () => {
        this._user.set(null);
        this.router.navigate(['/']);
      },
      error: () => {
        // Hata olsa da local state'i temizle
        this._user.set(null);
        this.router.navigate(['/']);
      }
    });
  }
}