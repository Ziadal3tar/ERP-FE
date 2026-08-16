import {
  HttpClient,
  HttpParams
} from '@angular/common/http';

import {
  Injectable,
  inject
} from '@angular/core';

import {
  map,
  Observable
} from 'rxjs';

import {
  environment
} from '../../../../environments/environment';

import {
  CreatePaymentRequest,
  Payment,
  PaymentApiResponse,
  PaymentListResponse
} from '../models/payment.model';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  private readonly http =
    inject(HttpClient);

  private readonly api =
    `${environment.apiUrl}/payments`;

  /*
  |--------------------------------------------------------------------------
  | List
  |--------------------------------------------------------------------------
  */

  getPayments(
    page = 1,
    limit = 10,
    invoice = '',
    customer = ''
  ): Observable<PaymentListResponse> {

    let params =
      new HttpParams()
        .set('page', page)
        .set('limit', limit);

    if (invoice) {

      params =
        params.set(
          'invoice',
          invoice
        );

    }

    if (customer) {

      params =
        params.set(
          'customer',
          customer
        );

    }

    return this.http
      .get<PaymentListResponse>(
        this.api,
        {
          params
        }
      );

  }

  /*
  |--------------------------------------------------------------------------
  | Get By ID
  |--------------------------------------------------------------------------
  */

  getPaymentById(
    id: string
  ): Observable<Payment> {

    return this.http

      .get<PaymentApiResponse<Payment>>(
        `${this.api}/${id}`
      )

      .pipe(

        map(
          response =>
            response.data
        )

      );

  }

  /*
  |--------------------------------------------------------------------------
  | Create Payment
  |--------------------------------------------------------------------------
  */

  createPayment(
    invoiceId: string,
    data: CreatePaymentRequest
  ): Observable<{
    payment: Payment;
    invoice: any;
  }> {

    return this.http

      .post<
        PaymentApiResponse<{
          payment: Payment;
          invoice: any;
        }>
      >(
        `${this.api}/invoice/${invoiceId}`,
        data
      )

      .pipe(

        map(
          response =>
            response.data
        )

      );

  }

}
