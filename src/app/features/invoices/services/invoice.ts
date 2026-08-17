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
  Invoice,
  InvoiceApiResponse,
  InvoiceListResponse,
  InvoiceStatus
} from '../models/invoice.model';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {

  private readonly http =
    inject(HttpClient);

  private readonly api =
    `${environment.apiUrl}/invoices`;



  getInvoices(
    page = 1,
    limit = 10,
    customer = '',
    status: InvoiceStatus | '' = ''
  ): Observable<InvoiceListResponse> {

    let params =
      new HttpParams()
        .set('page', page)
        .set('limit', limit);

    if (customer) {

      params =
        params.set(
          'customer',
          customer
        );

    }

    if (status) {

      params =
        params.set(
          'status',
          status
        );

    }

    return this.http.get<InvoiceListResponse>(
      this.api,
      {
        params
      }
    );

  }



  getInvoiceById(
    id: string
  ): Observable<Invoice> {

    return this.http

      .get<InvoiceApiResponse<Invoice>>(
        `${this.api}/${id}`
      )

      .pipe(

        map(
          response =>
            response.data
        )

      );

  }



  createInvoiceFromSale(
    saleId: string
  ): Observable<Invoice> {

    return this.http

      .post<InvoiceApiResponse<Invoice>>(
        `${this.api}/sale/${saleId}`,
        {}
      )

      .pipe(

        map(
          response =>
            response.data
        )

      );

  }



  cancelInvoice(
    id: string
  ): Observable<Invoice> {

    return this.http

      .patch<InvoiceApiResponse<Invoice>>(
        `${this.api}/${id}/cancel`,
        {}
      )

      .pipe(

        map(
          response =>
            response.data
        )

      );

  }

}
