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
  Attendance,
  AttendanceListResponse,
  CreateAttendanceRequest
} from '../models/attendance.model';

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
export class AttendanceService {

  private readonly http =
    inject(HttpClient);

  private readonly api =
    `${environment.apiUrl}/attendance`;

  /*
  |--------------------------------------------------------------------------
  | Get Attendance
  |--------------------------------------------------------------------------
  */

  getAttendance(
    page = 1,
    limit = 10,
    search = '',
    date = ''
  ): Observable<AttendanceListResponse> {

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

    if (date) {

      params =
        params.set(
          'date',
          date
        );

    }

    return this.http
      .get<
        PaginatedResponse<Attendance[]>
      >(
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

  /*
  |--------------------------------------------------------------------------
  | Get One
  |--------------------------------------------------------------------------
  */

  getAttendanceById(
    id: string
  ): Observable<Attendance> {

    return this.http

      .get<ApiResponse<Attendance>>(
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

  createAttendance(
    data: CreateAttendanceRequest
  ): Observable<Attendance> {

    return this.http

      .post<ApiResponse<Attendance>>(
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

}
