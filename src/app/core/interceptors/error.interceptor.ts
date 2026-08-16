import {
  HttpErrorResponse,
  HttpInterceptorFn
} from '@angular/common/http';

import {
  inject
} from '@angular/core';

import {
  catchError,
  throwError
} from 'rxjs';

import {
  AuthService
} from '../services/auth';
export const errorInterceptor: HttpInterceptorFn = (
  req,
  next
) => {

  const authService =
    inject(AuthService);

  return next(req).pipe(

    catchError(
      (error: HttpErrorResponse) => {

        /*
        |--------------------------------------------------------------------------
        | Unauthorized
        |--------------------------------------------------------------------------
        */

        if (
          error.status === 401 &&
          !req.url.includes('/auth/login')
        ) {

          authService.logout();

        }

        return throwError(
          () => error
        );

      }
    )

  );

};
