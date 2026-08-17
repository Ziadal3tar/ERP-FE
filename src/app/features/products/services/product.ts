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
  Product,
  ProductListResponse,
  CreateProductRequest,
  UpdateProductRequest
} from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private readonly http =
    inject(HttpClient);

  private readonly api =
    `${environment.apiUrl}/products`;



  getProducts(
    page = 1,
    limit = 10,
    search = '',
    category = '',
    status = ''
  ): Observable<ProductListResponse> {

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

    if (category) {

      params =
        params.set(
          'category',
          category
        );

    }

    if (status) {

      params =
        params.set(
          'isActive',
          status
        );

    }

    return this.http
      .get<ProductListResponse>(
        this.api,
        { params }
      );

  }



  getProduct(
    id: string
  ): Observable<Product> {

    return this.http
      .get<{ data: Product }>(
        `${this.api}/${id}`
      )
      .pipe(
        map(
          response =>
            response.data
        )
      );

  }



  createProduct(
    data: CreateProductRequest
  ): Observable<Product> {

    return this.http
      .post<{ data: Product }>(
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



  updateProduct(
    id: string,
    data: UpdateProductRequest
  ): Observable<Product> {

    return this.http
      .put<{ data: Product }>(
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



  deactivateProduct(
    id: string
  ): Observable<Product> {

    return this.http
      .delete<{ data: Product }>(
        `${this.api}/${id}`
      )
      .pipe(
        map(
          response =>
            response.data
        )
      );

  }



  restoreProduct(
    id: string
  ): Observable<Product> {

    return this.http
      .patch<{ data: Product }>(
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
