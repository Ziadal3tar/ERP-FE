import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { environment } from '../../../../environments/environment';

import {
  Category,
  CategoryListResponse,
  CreateCategoryRequest,
  UpdateCategoryRequest
} from '../models/category.model';

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
export class CategoryService {

  private readonly http = inject(HttpClient);

  private readonly api =
    `${environment.apiUrl}/categories`;

  getCategories(
    page = 1,
    limit = 10,
    search = ''
  ): Observable<CategoryListResponse> {

    let params = new HttpParams()
      .set('page', page)
      .set('limit', limit);

    if (search.trim()) {
      params = params.set(
        'search',
        search.trim()
      );
    }

    return this.http
      .get<PaginatedResponse<Category[]>>(
        this.api,
        { params }
      );
  }

  getCategory(
    id: string
  ): Observable<Category> {

    return this.http
      .get<ApiResponse<Category>>(
        `${this.api}/${id}`
      )
      .pipe(
        map(response => response.data)
      );
  }

  createCategory(
    data: CreateCategoryRequest
  ): Observable<Category> {

    return this.http
      .post<ApiResponse<Category>>(
        this.api,
        data
      )
      .pipe(
        map(response => response.data)
      );
  }

  updateCategory(
    id: string,
    data: UpdateCategoryRequest
  ): Observable<Category> {

    return this.http
      .put<ApiResponse<Category>>(
        `${this.api}/${id}`,
        data
      )
      .pipe(
        map(response => response.data)
      );
  }

  deleteCategory(
    id: string
  ): Observable<void> {

    return this.http.delete<void>(
      `${this.api}/${id}`
    );
  }
restoreCategory(
  id: string
): Observable<Category> {

  return this.http
    .patch<ApiResponse<Category>>(
      `${this.api}/${id}/restore`,
      {}
    )
    .pipe(
      map(response => response.data)
    );

}
}
