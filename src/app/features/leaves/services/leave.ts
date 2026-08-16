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
  Leave,
  LeaveListResponse,
  CreateLeaveRequest,
  RejectLeaveRequest
} from '../models/leave.model';

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
export class LeaveService {

  private readonly http =
    inject(HttpClient);

  private readonly api =
    `${environment.apiUrl}/leaves`;

  /*
  |--------------------------------------------------------------------------
  | Get Leaves
  |--------------------------------------------------------------------------
  */

  getLeaves(
    page = 1,
    limit = 10,
    search = '',
    status = '',
    employee = ''
  ): Observable<LeaveListResponse> {

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

    if (status) {

      params =
        params.set(
          'status',
          status
        );

    }

    if (employee) {

      params =
        params.set(
          'employee',
          employee
        );

    }

    return this.http
      .get<PaginatedResponse<Leave[]>>(
        this.api,
        { params }
      )
      .pipe(

        map(response => ({
          data: response.data,
          pagination: response.pagination
        }))

      );

  }

  /*
  |--------------------------------------------------------------------------
  | Get One
  |--------------------------------------------------------------------------
  */

  getLeave(
    id: string
  ): Observable<Leave> {

    return this.http
      .get<ApiResponse<Leave>>(
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

createLeaveByAdmin(
  data: CreateLeaveRequest
): Observable<Leave> {

  return this.http
    .post<ApiResponse<Leave>>(
      `${this.api}/admin`,
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
  | Approve
  |--------------------------------------------------------------------------
  */

  approveLeave(
    id: string
  ): Observable<Leave> {

    return this.http
      .patch<ApiResponse<Leave>>(
        `${this.api}/${id}/approve`,
        {}
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
  | Reject
  |--------------------------------------------------------------------------
  */

  rejectLeave(
    id: string,
    reason: string
  ): Observable<Leave> {

    const data:
      RejectLeaveRequest = {
      reason
    };

    return this.http
      .patch<ApiResponse<Leave>>(
        `${this.api}/${id}/reject`,
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
  | Cancel
  |--------------------------------------------------------------------------
  */

  cancelLeave(
    id: string
  ): Observable<Leave> {

    return this.http
      .patch<ApiResponse<Leave>>(
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
