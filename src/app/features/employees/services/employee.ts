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
  Employee,
  EmployeeListResponse,
  CreateEmployeeRequest,
  UpdateEmployeeRequest,
  ChangeDepartmentRequest,
  ChangeSalaryRequest
} from '../models/employee.model';

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
export class EmployeeService {

  private readonly http =
    inject(HttpClient);

  private readonly api =
    `${environment.apiUrl}/employees`;

  /*
  |--------------------------------------------------------------------------
  | Get Employees
  |--------------------------------------------------------------------------
  */

  getEmployees(
    page = 1,
    limit = 10,
    search = ''
  ): Observable<EmployeeListResponse> {

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
      .get<PaginatedResponse<Employee[]>>(
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
  | Get Employee
  |--------------------------------------------------------------------------
  */

  getEmployee(
    id: string
  ): Observable<Employee> {

    return this.http

      .get<ApiResponse<Employee>>(
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

  createEmployee(
    data: CreateEmployeeRequest
  ): Observable<Employee> {

    return this.http

      .post<ApiResponse<Employee>>(
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

  updateEmployee(
    id: string,
    data: UpdateEmployeeRequest
  ): Observable<Employee> {

    return this.http

      .put<ApiResponse<Employee>>(
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
  | Delete
  |--------------------------------------------------------------------------
  */

  deleteEmployee(
    id: string
  ): Observable<unknown> {

    return this.http.delete(
      `${this.api}/${id}`
    );

  }

  /*
  |--------------------------------------------------------------------------
  | Restore
  |--------------------------------------------------------------------------
  */

  restoreEmployee(
    id: string
  ): Observable<Employee> {

    return this.http

      .patch<ApiResponse<Employee>>(
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

  /*
  |--------------------------------------------------------------------------
  | Change Department
  |--------------------------------------------------------------------------
  */

  changeDepartment(
    id: string,
    department: string
  ): Observable<Employee> {

    const data:
      ChangeDepartmentRequest = {
        department
      };

    return this.http

      .patch<ApiResponse<Employee>>(
        `${this.api}/${id}/department`,
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
  | Change Salary
  |--------------------------------------------------------------------------
  */

  changeSalary(
    id: string,
    salary: number
  ): Observable<Employee> {

    const data:
      ChangeSalaryRequest = {
        salary
      };

    return this.http

      .patch<ApiResponse<Employee>>(
        `${this.api}/${id}/salary`,
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
