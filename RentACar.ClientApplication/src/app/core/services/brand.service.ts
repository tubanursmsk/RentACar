import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Brand } from '../models/brand-location.model';

@Injectable({ providedIn: 'root' })
export class BrandService {
  private http = inject(HttpClient);

  private readonly _brands = signal<Brand[]>([]);
  readonly brands = this._brands.asReadonly();

  getAll(): Observable<ApiResponse<Brand[]>> {
    return this.http.get<ApiResponse<Brand[]>>(`${environment.apiUrl}/Brand`).pipe(
      tap(res => {
        if (res.success && res.data) {
          this._brands.set(res.data);
        }
      })
    );
  }
}