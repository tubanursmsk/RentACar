import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../environments/environment';
import { ApiResponse, PagedResult } from '../models/api-response.model';
import { Car, CarFilter } from '../models/car.model';

@Injectable({ providedIn: 'root' })
export class CarService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/Car`;

  // ── Cache'lenebilir signal'lar ──
  private readonly _lastSearchResults = signal<PagedResult<Car> | null>(null);
  readonly lastSearchResults = this._lastSearchResults.asReadonly();

  // ── Liste + filtre ──
  searchCars(filter: CarFilter): Observable<ApiResponse<PagedResult<Car>>> {
    let params = new HttpParams();

    if (filter.brandIds?.length) {
      filter.brandIds.forEach(id => {
        params = params.append('brandIds', id.toString());
      });
    }
    if (filter.locationId) params = params.set('locationId', filter.locationId.toString());
    if (filter.fuelType) params = params.set('fuelType', filter.fuelType.toString());
    if (filter.transmissionType) params = params.set('transmissionType', filter.transmissionType.toString());
    if (filter.minPrice != null) params = params.set('minPrice', filter.minPrice.toString());
    if (filter.maxPrice != null) params = params.set('maxPrice', filter.maxPrice.toString());
    if (filter.minSeatCount) params = params.set('minSeatCount', filter.minSeatCount.toString());
    if (filter.searchTerm) params = params.set('searchTerm', filter.searchTerm);

    params = params.set('pageNumber', (filter.pageNumber ?? 1).toString());
    params = params.set('pageSize', (filter.pageSize ?? 12).toString());

    return this.http.get<ApiResponse<PagedResult<Car>>>(`${this.baseUrl}/Paged`, { params }).pipe(
      tap(res => {
        if (res.success && res.data) {
          this._lastSearchResults.set(res.data);
        }
      })
    );
  }

  // ── Detay ──
  getById(id: number): Observable<ApiResponse<Car>> {
    return this.http.get<ApiResponse<Car>>(`${this.baseUrl}/${id}`);
  }

  // ── Tüm araçlar (basit liste, anasayfa için) ──
  getAll(): Observable<ApiResponse<Car[]>> {
    return this.http.get<ApiResponse<Car[]>>(this.baseUrl);
  }
}