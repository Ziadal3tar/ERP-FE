import {
  HttpClient,
  HttpParams
} from '@angular/common/http';

import {
  Injectable,
  inject
} from '@angular/core';

import {
  Observable
} from 'rxjs';

import {
  environment
} from '../../../../environments/environment';

import {
  Stock,
  StockHistoryResponse,
  StockInRequest,
  StockListResponse,
  StockOperationResponse,
  StockOutRequest,
  StockTransferRequest,
  StockTransactionType
} from '../models/stock.model';

@Injectable({
  providedIn: 'root'
})
export class StockService {

  private readonly http =
    inject(HttpClient);

  private readonly api =
    `${environment.apiUrl}/stock`;



getStock(
  page = 1,
  limit = 10,
  product = '',
  warehouse = ''
): Observable<StockListResponse> {

  let params = new HttpParams()
    .set('page', page)
    .set('limit', limit);

  if (product) {
    params = params.set('product', product);
  }

  if (warehouse) {
    params = params.set('warehouse', warehouse);
  }

  return this.http.get<StockListResponse>(
    this.api,
    { params }
  );
}



  getStockHistory(
    page = 1,
    limit = 20,
    product = '',
    warehouse = '',
    type: StockTransactionType | '' = ''
  ): Observable<StockHistoryResponse> {

    let params =
      new HttpParams()
        .set('page', page)
        .set('limit', limit);

    if (product) {

      params = params.set(
        'product',
        product
      );

    }

    if (warehouse) {

      params = params.set(
        'warehouse',
        warehouse
      );

    }

    if (type) {

      params = params.set(
        'type',
        type
      );

    }

    return this.http.get<StockHistoryResponse>(
      `${this.api}/history`,
      {
        params
      }
    );

  }



  stockIn(
    data: StockInRequest
  ): Observable<StockOperationResponse> {

    return this.http.post<StockOperationResponse>(
      `${this.api}/in`,
      data
    );

  }



  stockOut(
    data: StockOutRequest
  ): Observable<StockOperationResponse> {

    return this.http.post<StockOperationResponse>(
      `${this.api}/out`,
      data
    );

  }



  transferStock(
    data: StockTransferRequest
  ): Observable<StockOperationResponse> {

    return this.http.post<StockOperationResponse>(
      `${this.api}/transfer`,
      data
    );

  }

}
