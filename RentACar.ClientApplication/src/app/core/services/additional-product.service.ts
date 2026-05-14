import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { AdditionalProduct } from '../models/reservation.model';

@Injectable({ providedIn: 'root' })
export class AdditionalProductService {
  private http = inject(HttpClient);

  private readonly _products = signal<AdditionalProduct[]>([]);
  readonly products = this._products.asReadonly();

  getAll(): Observable<ApiResponse<AdditionalProduct[]>> {
    return this.http
      .get<ApiResponse<AdditionalProduct[]>>(`${environment.apiUrl}/AdditionalProduct`)
      .pipe(tap(res => {
        if (res.success && res.data) this._products.set(res.data);
      }));
  }
}
