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
  Customer,
  CustomerApiResponse,
  CustomerListResponse,
  CreateCustomerRequest,
  UpdateCustomerRequest
} from '../models/customer.model';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {

  private readonly http =
    inject(HttpClient);

  private readonly api =
    `${environment.apiUrl}/customers`;

  /*
  |--------------------------------------------------------------------------
  | List
  |--------------------------------------------------------------------------
  */

  getCustomers(
    page = 1,
    limit = 10,
    search = '',
    isActive?: boolean
  ): Observable<CustomerListResponse> {

    let params =
      new HttpParams()
        .set('page', page)
        .set('limit', limit);

    if (search.trim()) {

      params =
        params.set(
          'search',
          search.trim()
        );

    }

    if (
      isActive !== undefined
    ) {

      params =
        params.set(
          'isActive',
          isActive
        );

    }

    return this.http.get<CustomerListResponse>(
      this.api,
      { params }
    );

  }

  /*
  |--------------------------------------------------------------------------
  | Get By ID
  |--------------------------------------------------------------------------
  */

  getCustomerById(
    id: string
  ): Observable<Customer> {

    return this.http
      .get<CustomerApiResponse<Customer>>(
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
  | Create
  |--------------------------------------------------------------------------
  */

  createCustomer(
    data: CreateCustomerRequest
  ): Observable<Customer> {

    return this.http
      .post<CustomerApiResponse<Customer>>(
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

  /*
  |--------------------------------------------------------------------------
  | Update
  |--------------------------------------------------------------------------
  */

  updateCustomer(
    id: string,
    data: UpdateCustomerRequest
  ): Observable<Customer> {

    return this.http
      .put<CustomerApiResponse<Customer>>(
        `${this.api}/${id}`,
        data
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
  | Deactivate
  |--------------------------------------------------------------------------
  */

  deactivateCustomer(
    id: string
  ): Observable<void> {

    return this.http
      .delete<CustomerApiResponse<null>>(
        `${this.api}/${id}`
      )
      .pipe(
        map(
          () => undefined
        )
      );

  }

  /*
  |--------------------------------------------------------------------------
  | Restore
  |--------------------------------------------------------------------------
  */

  restoreCustomer(
    id: string
  ): Observable<Customer> {

    return this.http
      .patch<CustomerApiResponse<Customer>>(
        `${this.api}/${id}/restore`,
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
