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
  CreateSupplierRequest,
  Supplier,
  SupplierListResponse,
  UpdateSupplierRequest
} from '../models/supplier.model';

@Injectable({
  providedIn: 'root'
})
export class SupplierService {

  private readonly http =
    inject(HttpClient);

  private readonly api =
    `${environment.apiUrl}/suppliers`;

  /*
  |--------------------------------------------------------------------------
  | List
  |--------------------------------------------------------------------------
  */

  getSuppliers(
    page = 1,
    limit = 10,
    search = '',
    isActive?: boolean
  ): Observable<SupplierListResponse> {

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

    if (isActive !== undefined) {

      params =
        params.set(
          'isActive',
          isActive
        );

    }

    return this.http.get<SupplierListResponse>(
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

  getSupplierById(
    id: string
  ): Observable<Supplier> {

    return this.http
      .get<ApiResponse<Supplier>>(
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

  createSupplier(
    data: CreateSupplierRequest
  ): Observable<Supplier> {

    return this.http
      .post<ApiResponse<Supplier>>(
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

  updateSupplier(
    id: string,
    data: UpdateSupplierRequest
  ): Observable<Supplier> {

    return this.http
      .put<ApiResponse<Supplier>>(
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

  deactivateSupplier(
    id: string
  ): Observable<void> {

    return this.http
      .delete<ApiResponse<null>>(
        `${this.api}/${id}`
      )
      .pipe(
        map(
          () =>
            undefined
        )
      );

  }

  /*
  |--------------------------------------------------------------------------
  | Restore
  |--------------------------------------------------------------------------
  */

  restoreSupplier(
    id: string
  ): Observable<Supplier> {

    return this.http
      .patch<ApiResponse<Supplier>>(
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
