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
  DashboardSummary,
  LowStockItem,
  PurchasesReport,
  ReportApiResponse,
  SalesReport,
  StockReportItem
} from '../models/report.model';


@Injectable({
  providedIn: 'root'
})
export class ReportService {

  private readonly http =
    inject(HttpClient);


  private readonly api =
    `${environment.apiUrl}/reports`;




  getDashboardSummary():
    Observable<DashboardSummary> {

    return this.http

      .get<
        ReportApiResponse<DashboardSummary>
      >(
        `${this.api}/dashboard`
      )

      .pipe(
        map(
          response =>
            response.data
        )
      );

  }




 getSalesReport(
  customer = '',
  warehouse = ''
): Observable<SalesReport> {

  let params =
    new HttpParams();


  if (
    customer &&
    customer.trim()
  ) {

    params =
      params.set(
        'customer',
        customer.trim()
      );

  }


  if (
    warehouse &&
    warehouse.trim()
  ) {

    params =
      params.set(
        'warehouse',
        warehouse.trim()
      );

  }


  console.log(
    'Sales Report params:',
    params.toString()
  );


  return this.http

    .get<
      ReportApiResponse<SalesReport>
    >(
      `${this.api}/sales`,
      {
        params
      }
    )

    .pipe(
      map(
        response =>
          response.data
      )
    );

}




  getPurchasesReport(
    supplier = '',
    warehouse = ''
  ): Observable<PurchasesReport> {

    let params =
      new HttpParams();


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


    return this.http

      .get<
        ReportApiResponse<PurchasesReport>
      >(
        `${this.api}/purchases`,
        {
          params
        }
      )

      .pipe(
        map(
          response =>
            response.data
        )
      );

  }




  getStockReport():
    Observable<StockReportItem[]> {

    return this.http

      .get<
        ReportApiResponse<StockReportItem[]>
      >(
        `${this.api}/stock`
      )

      .pipe(
        map(
          response =>
            response.data ?? []
        )
      );

  }




  getLowStock():
    Observable<LowStockItem[]> {

    return this.http

      .get<
        ReportApiResponse<LowStockItem[]>
      >(
        `${this.api}/low-stock`
      )

      .pipe(
        map(
          response =>
            response.data ?? []
        )
      );

  }

}
