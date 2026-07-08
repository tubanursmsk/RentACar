import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// ═══ Model tipleri ═══
export interface MyReservation {
  id: number;
  reservationCode?: string | null;

  carId: number;
  carBrand: string;
  carModel: string;
  carPlate: string;
  carImageUrl?: string | null;

  rentStartDate: string;    // ISO date string
  rentEndDate: string;
  totalDays: number;
  pickUpLocationName: string;
  dropOffLocationName: string;

  totalAmount: number;
  status: 'Pending' | 'Approved' | 'Completed' | 'Cancelled';
  isPaid: boolean;

  canCancel: boolean;
  canEdit: boolean;
  hoursUntilPickup?: number | null;

  createdDate: string;
}

export interface ReservationDetail {
  id: number;
  reservationCode?: string | null;
  carInfo: string;
  carImageUrl?: string | null;
  pickUpLocationName: string;
  dropOffLocationName: string;
  rentStartDate: string;
  rentEndDate: string;
  totalDays: number;

  subTotal: number;
  insuranceTotal: number;
  additionalProductsTotal: number;
  totalAmount: number;

  status: string;
  isPaid: boolean;
  createdDate: string;

  cancelReason?: string | null;
  cancelledDate?: string | null;

  canCancel: boolean;
  canEdit: boolean;
  cannotCancelReason?: string | null;
  hoursUntilPickup?: number | null;

  insurancePackage?: {
    id: number;
    name: string;
    code: string;
    dailyPrice: number;
    description: string;
  } | null;

  additionalProducts: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export type ReservationFilter = 'active' | 'past' | 'cancelled' | 'all';

@Injectable({ providedIn: 'root' })
export class ReservationManagementService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/Reservation`;

  /** Kullanıcının rezervasyonları — filtreli */
  getMyReservations(filter: ReservationFilter = 'all'): Observable<ApiResponse<MyReservation[]>> {
    const params = filter && filter !== 'all' ? `?filter=${filter}` : '';
    return this.http.get<ApiResponse<MyReservation[]>>(`${this.apiUrl}/MyReservations${params}`);
  }

  /** Rezervasyon detayı */
  getDetail(id: number): Observable<ApiResponse<ReservationDetail>> {
    return this.http.get<ApiResponse<ReservationDetail>>(`${this.apiUrl}/${id}`);
  }

  /** Rezervasyonu iptal et */
  cancel(id: number, reason?: string): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(`${this.apiUrl}/${id}/Cancel`, {
      reason: reason ?? null
    });
  }

  /** Rezervasyon tarihlerini güncelle */
  updateDates(id: number, newStartDate: Date, newEndDate: Date): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(`${this.apiUrl}/${id}/UpdateDates`, {
      newRentStartDate: newStartDate.toISOString(),
      newRentEndDate: newEndDate.toISOString()
    });
  }
}
