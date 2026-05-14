import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import {
  CreateReservationRequest,
  PricePreview,
  PricePreviewRequest,
  ReservationDetail
} from '../models/reservation.model';

@Injectable({ providedIn: 'root' })
export class ReservationService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/Reservation`;

  // ── Fiyat hesaplama (login gerekmez) ──
  calculatePrice(request: PricePreviewRequest): Observable<ApiResponse<PricePreview>> {
    return this.http.post<ApiResponse<PricePreview>>(`${this.baseUrl}/PricePreview`, request);
  }

  // ── Rezervasyon oluştur (login gerekli — Customer rolü) ──
  create(request: CreateReservationRequest): Observable<ApiResponse<number>> {
    return this.http.post<ApiResponse<number>>(`${this.baseUrl}/Create`, request);
  }

  // ── Detay ──
  getDetail(id: number): Observable<ApiResponse<ReservationDetail>> {
    return this.http.get<ApiResponse<ReservationDetail>>(`${this.baseUrl}/${id}`);
  }
}
