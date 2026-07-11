import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface InitPaymentRequest {
  rentalId: number;
  cardHolderName: string;
  cardNumber: string;
  expireMonth: string;   // "01".."12"
  expireYear: string;    // "2030" (4 haneli)
  cvc: string;
}

export interface PaymentInitResponse {
  threeDSHtmlContent: string;
  conversationId: string;
  paymentId?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/Payment`;

  /**
   * 3DS ödemeyi başlatır. Iyzico'nun döndürdüğü HTML content ile iframe'i doldururuz.
   */
  initThreeDS(request: InitPaymentRequest): Observable<ApiResponse<PaymentInitResponse>> {
    return this.http.post<ApiResponse<PaymentInitResponse>>(
      `${this.apiUrl}/InitThreeDS`,
      request
    );
  }
}
