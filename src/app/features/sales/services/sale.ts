import {
  HttpClient,
  HttpParams
} from '@angular/common/http';

import {
  Injectable,
  inject
} from '@angular/core';

import {
  Observable,
  map
} from 'rxjs';

import {
  environment
} from '../../../../environments/environment';

import {
  CreateSaleRequest,
  Sale,
  SaleApiResponse,
  SaleListResponse,
  SaleStatus
} from '../models/sale.model';

@Injectable({
  providedIn: 'root'
})
export class SaleService {

  private readonly http =
    inject(HttpClient);

  private readonly api =
    `${environment.apiUrl}/sales`;



  getSales(
    page = 1,
    limit = 10,
    customer = '',
    warehouse = '',
    status: SaleStatus | '' = ''
  ): Observable<SaleListResponse> {

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

    if (warehouse) {

      params =
        params.set(
          'warehouse',
          warehouse
        );

    }

    if (status) {

      params =
        params.set(
          'status',
          status
        );

    }

    return this.http.get<SaleListResponse>(
      this.api,
      {
        params
      }
    );

  }



  getSaleById(
    id: string
  ): Observable<Sale> {

    return this.http
      .get<SaleApiResponse<Sale>>(
        `${this.api}/${id}`
      )
      .pipe(
        map(
          response =>
            response.data
        )
      );

  }



  createSale(
    data: CreateSaleRequest
  ): Observable<Sale> {

    return this.http
      .post<SaleApiResponse<Sale>>(
        this.api,
        data
      )
      .pipe(
        map(
          response =>
            response.data
        )
      );

  }



  confirmSale(
    id: string
  ): Observable<Sale> {

    return this.http
      .patch<SaleApiResponse<Sale>>(
        `${this.api}/${id}/confirm`,
        {}
      )
      .pipe(
        map(
          response =>
            response.data
        )
      );

  }



  cancelSale(
    id: string
  ): Observable<Sale> {

    return this.http
      .patch<SaleApiResponse<Sale>>(
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
