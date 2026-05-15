import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class RentalService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/Rental`;

  // Kullanıcının tüm kiralamalarını getirir
  getUserRentals(userId: number): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/GetByUserId/${userId}`);
  }

  // Rezervasyon iptali (Backend'de Delete veya Update Status olarak kurgulanmış olmalı)
  cancelRental(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`);
  }
}