import {
  HttpClient
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
  RecentPurchase,
  RecentSale
} from '../models/dashboard.model';


@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private readonly http =
    inject(HttpClient);


  private readonly api =
    `${environment.apiUrl}`;


  /*
  |--------------------------------------------------------------------------
  | Recent Sales
  |--------------------------------------------------------------------------
  */

  getRecentSales():
    Observable<RecentSale[]> {

    return this.http

      .get<
        {
          success: boolean;

          data: RecentSale[];
        }
      >(
        `${this.api}/sales`,
        {
          params: {
            page: 1,
            limit: 5
          }
        }
      )

      .pipe(

        map(
          response =>
            response.data ?? []
        )

      );

  }


  /*
  |--------------------------------------------------------------------------
  | Recent Purchases
  |--------------------------------------------------------------------------
  */

  getRecentPurchases():
    Observable<RecentPurchase[]> {

    return this.http

      .get<
        {
          success: boolean;

          data: RecentPurchase[];
        }
      >(
        `${this.api}/purchases`,
        {
          params: {
            page: 1,
            limit: 5
          }
        }
      )

      .pipe(

        map(
          response =>
            response.data ?? []
        )

      );

  }

}
