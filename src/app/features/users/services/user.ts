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
  User,
  UserListResponse,
  CreateUserRequest,
  UpdateUserRequest
} from '../models/user.model';

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
export class UserService {

  private readonly http =
    inject(HttpClient);

  private readonly api =
    `${environment.apiUrl}/users`;



  getUsers(
    page = 1,
    limit = 10,
    search = ''
  ): Observable<UserListResponse> {

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
      .get<
        PaginatedResponse<User[]>
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



  getUser(
    id: string
  ): Observable<User> {

    return this.http

      .get<ApiResponse<User>>(
        `${this.api}/${id}`
      )

      .pipe(
        map(
          response =>
            response.data
        )
      );

  }



  createUser(
    data: CreateUserRequest
  ): Observable<User> {

    return this.http

      .post<ApiResponse<User>>(
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



  updateUser(
    id: string,
    data: UpdateUserRequest
  ): Observable<User> {

    return this.http

      .put<ApiResponse<User>>(
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



  deleteUser(
    id: string
  ): Observable<unknown> {

    return this.http

      .delete(
        `${this.api}/${id}`
      );

  }



  restoreUser(
    id: string
  ): Observable<User> {

    return this.http

      .patch<ApiResponse<User>>(
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



changeStatus(
  id: string,
  isActive: boolean
): Observable<User> {

  return this.http

    .patch<ApiResponse<User>>(
      `${this.api}/${id}/status`,
      {
        isActive
      }
    )

    .pipe(
      map(
        response =>
          response.data
      )
    );

}



changeRole(
  id: string,
  role: string
): Observable<User> {

  return this.http

    .patch<ApiResponse<User>>(
      `${this.api}/${id}/role`,
      {
        role
      }
    )

    .pipe(
      map(
        response =>
          response.data
      )
    );

}



resetPassword(
  id: string,
  password: string
): Observable<unknown> {

  return this.http

    .patch(
      `${this.api}/${id}/reset-password`,
      {
        password
      }
    );

}
}
