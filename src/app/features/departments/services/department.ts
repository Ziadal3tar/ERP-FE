import {
  Injectable,
  inject
} from '@angular/core';

import {
  HttpClient,
  HttpParams
} from '@angular/common/http';

import {
  Observable,
  map
} from 'rxjs';

import {
  environment
} from '../../../../environments/environment';

import {
  Department,
  DepartmentListResponse,
  CreateDepartmentRequest,
  UpdateDepartmentRequest
} from '../models/department.model';

interface ApiResponse<T> {
  data: T;
}

interface PaginatedResponse<T> {
  data: T;

  pagination: {

    total: number;

    page: number;

    limit: number;

    totalPages: number;

  };
}

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {

  private readonly http =
    inject(HttpClient);

  private readonly api =
    `${environment.apiUrl}/departments`;



  getDepartments(
    page = 1,
    limit = 10,
    search = ''
  ): Observable<DepartmentListResponse> {

    let params =
      new HttpParams()

        .set(
          'page',
          page
        )

        .set(
          'limit',
          limit
        );

    if (search.trim()) {

      params =
        params.set(
          'search',
          search.trim()
        );

    }

    return this.http
      .get<PaginatedResponse<Department[]>>(
        this.api,
        { params }
      )
      .pipe(

        map(response => ({

          data:
            response.data,

          pagination:
            response.pagination

        }))

      );

  }



  getDepartment(
    id: string
  ): Observable<Department> {

    return this.http
      .get<ApiResponse<Department>>(
        `${this.api}/${id}`
      )
      .pipe(
        map(
          response =>
            response.data
        )
      );

  }



  createDepartment(
    data: CreateDepartmentRequest
  ): Observable<Department> {

    return this.http
      .post<ApiResponse<Department>>(
        `${this.api}/createDepartment`,
        data
      )
      .pipe(
        map(
          response =>
            response.data
        )
      );

  }



  updateDepartment(
    id: string,
    data: UpdateDepartmentRequest
  ): Observable<Department> {

    return this.http
      .put<ApiResponse<Department>>(
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



  deleteDepartment(
    id: string
  ): Observable<unknown> {

    return this.http.delete(
      `${this.api}/${id}`
    );

  }



  restoreDepartment(
    id: string
  ): Observable<Department> {

    return this.http
      .patch<ApiResponse<Department>>(
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
