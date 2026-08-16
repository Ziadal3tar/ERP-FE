import {
  Injectable,
  inject
} from '@angular/core';

import {
  HttpClient,
  HttpParams
} from '@angular/common/http';

import {
  map,
  Observable
} from 'rxjs';

import {
  environment
} from '../../../../environments/environment';

import {
  Warehouse,
  WarehouseListResponse,
  CreateWarehouseRequest,
  UpdateWarehouseRequest
} from '../models/warehouse.model';

@Injectable({
  providedIn: 'root'
})
export class WarehouseService {

  private readonly http =
    inject(HttpClient);

  private readonly api =
    `${environment.apiUrl}/warehouses`;

  getWarehouses(
    page = 1,
    limit = 10,
    search = '',
    status = ''
  ): Observable<WarehouseListResponse> {

    let params =
      new HttpParams()
        .set('page', page)
        .set('limit', limit);

    if (search.trim()) {

      params = params.set(
        'search',
        search.trim()
      );

    }

    if (status) {

      params = params.set(
        'isActive',
        status
      );

    }

    return this.http.get<WarehouseListResponse>(
      this.api,
      { params }
    );

  }

  getWarehouse(
    id: string
  ): Observable<{ data: Warehouse }> {

    return this.http.get<{ data: Warehouse }>(
      `${this.api}/${id}`
    );

  }

  createWarehouse(
    data: CreateWarehouseRequest
  ): Observable<{ data: Warehouse }> {

    return this.http.post<{ data: Warehouse }>(
      this.api,
      data
    );

  }

  updateWarehouse(
    id: string,
    data: UpdateWarehouseRequest
  ): Observable<{ data: Warehouse }> {

    return this.http.put<{ data: Warehouse }>(
      `${this.api}/${id}`,
      data
    );

  }

  deleteWarehouse(
    id: string
  ): Observable<void> {

    return this.http.delete<void>(
      `${this.api}/${id}`
    );

  }

restoreWarehouse(
  id: string
): Observable<Warehouse> {

  return this.http
    .patch<{ data: Warehouse }>(
      `${this.api}/${id}/restore`,
      {}
    )
    .pipe(
      map(response => response.data)
    );

}

}
