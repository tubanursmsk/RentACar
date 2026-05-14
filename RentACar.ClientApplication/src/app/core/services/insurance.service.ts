import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { InsurancePackage } from '../models/reservation.model';

@Injectable({ providedIn: 'root' })
export class InsuranceService {
  private http = inject(HttpClient);

  private readonly _packages = signal<InsurancePackage[]>([]);
  readonly packages = this._packages.asReadonly();

  getAll(): Observable<ApiResponse<InsurancePackage[]>> {
    return this.http
      .get<ApiResponse<InsurancePackage[]>>(`${environment.apiUrl}/InsurancePackage`)
      .pipe(tap(res => {
        if (res.success && res.data) this._packages.set(res.data);
      }));
  }
}
