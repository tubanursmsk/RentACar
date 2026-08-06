import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { ApiResponse, PagedResult } from '../models/api-response.model';
import { Car, CarFilter } from '../models/car.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CarService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/Car`;

  private readonly _lastSearchResults = signal<PagedResult<Car> | null>(null);
  readonly lastSearchResults = this._lastSearchResults.asReadonly();

  searchCars(filter: CarFilter): Observable<ApiResponse<PagedResult<Car>>> {
    let params = new HttpParams();

    if (filter.brandIds?.length) {
      filter.brandIds.forEach(id => {
        params = params.append('brandIds', id.toString());
      });
    }
    
    // GÜVENLİK DÜZELTMESİ: ID'si "0" olanları yutmaması için != null kullanıyoruz
    if (filter.locationId != null) params = params.set('locationId', filter.locationId.toString());
    if (filter.fuelType != null) params = params.set('fuelType', filter.fuelType.toString());
    if (filter.transmissionType != null) params = params.set('transmissionType', filter.transmissionType.toString());
    if (filter.minPrice != null) params = params.set('minPrice', filter.minPrice.toString());
    if (filter.maxPrice != null) params = params.set('maxPrice', filter.maxPrice.toString());
    if (filter.minSeatCount != null) params = params.set('minSeatCount', filter.minSeatCount.toString());
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

  getById(id: number): Observable<ApiResponse<Car>> {
    return this.http.get<ApiResponse<Car>>(`${this.baseUrl}/${id}`);
  }

  
  getAll(): Observable<ApiResponse<Car[]>> {
    return this.http.get<ApiResponse<Car[]>>(`${this.baseUrl}/All`);
  }
}