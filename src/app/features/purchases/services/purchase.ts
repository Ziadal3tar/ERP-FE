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
  ApiResponse,
  CreatePurchaseRequest,
  Purchase,
  PurchaseListResponse,
  PurchaseStatus
} from '../models/purchase.model';

@Injectable({
  providedIn: 'root'
})
export class PurchaseService {

  private readonly http =
    inject(HttpClient);

  private readonly api =
    `${environment.apiUrl}/purchases`;



  getPurchases(
    page = 1,
    limit = 10,
    supplier = '',
    warehouse = '',
    status: PurchaseStatus | '' = ''
  ): Observable<PurchaseListResponse> {

    let params =
      new HttpParams()
        .set('page', page)
        .set('limit', limit);

    if (supplier) {

      params =
        params.set(
          'supplier',
          supplier
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

    return this.http.get<PurchaseListResponse>(
      this.api,
      {
        params
      }
    );

  }



  getPurchaseById(
    id: string
  ): Observable<Purchase> {

    return this.http
      .get<ApiResponse<Purchase>>(
        `${this.api}/${id}`
      )
      .pipe(
        map(
          response =>
            response.data
        )
      );

  }



  createPurchase(
    data: CreatePurchaseRequest
  ): Observable<Purchase> {

    return this.http
      .post<ApiResponse<Purchase>>(
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



  confirmPurchase(
    id: string
  ): Observable<Purchase> {

    return this.http
      .patch<ApiResponse<Purchase>>(
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



  receivePurchase(
    id: string
  ): Observable<Purchase> {

    return this.http
      .patch<ApiResponse<Purchase>>(
        `${this.api}/${id}/receive`,
        {}
      )
      .pipe(
        map(
          response =>
            response.data
        )
      );

  }



  cancelPurchase(
    id: string
  ): Observable<Purchase> {

    return this.http
      .patch<ApiResponse<Purchase>>(
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
