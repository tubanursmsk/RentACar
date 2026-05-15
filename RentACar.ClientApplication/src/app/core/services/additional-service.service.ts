import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { environment } from '../../../environments/environment';

// Bileşenin beklediği veri modeli
export interface AdditionalService {
  id: number;
  name: string;
  description: string;
  price: number;
}

@Injectable({ providedIn: 'root' })
export class AdditionalServiceService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/AdditionalService`;

  // Backend'deki GetAll metodunu çağırıyoruz
  getAll(): Observable<ApiResponse<AdditionalService[]>> {
    return this.http.get<ApiResponse<AdditionalService[]>>(`${this.apiUrl}/All`);
  }
}