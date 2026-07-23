import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { environment } from '../../../environments/environment';

export interface ContactFormRequest {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ContactService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/Contact`;

  send(request: ContactFormRequest): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`${this.baseUrl}/Send`, request);
  }
}
