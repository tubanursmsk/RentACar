import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { Location } from '../models/brand-location.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class LocationService {
  private http = inject(HttpClient);

  // Cache (bir kez çekilir, tekrar tekrar istek atılmaz)
  private readonly _locations = signal<Location[]>([]);
  readonly locations = this._locations.asReadonly();

  
  getLocations(): Observable<ApiResponse<any>> {
    // API bizden POST isteği ve bir PaginationModel bekliyor
    return this.http.post<ApiResponse<any>>(`${environment.apiUrl}/Location/GetAll`, {
      pageNumber: 1,
      pageSize: 100 // Şube dropdown'ını doldurmak için yeterince büyük bir sayfa boyutu veriyoruz
    });
  }

  getAll(): Observable<ApiResponse<Location[]>> {
    return this.http.get<ApiResponse<Location[]>>(`${environment.apiUrl}/Location/All`).pipe(
      tap(res => {
        if (res.success && res.data) {
          this._locations.set(res.data);
        }
      })
    );
  }

  getById(id: number): Observable<ApiResponse<Location>> {
    return this.http.get<ApiResponse<Location>>(`${environment.apiUrl}/Location/${id}`);
  }

}