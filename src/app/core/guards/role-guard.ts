import {
  inject
} from '@angular/core';

import {
  CanActivateFn,
  Router
} from '@angular/router';

import {
  AuthService
} from '../services/auth';

export const roleGuard = (
  allowedRoles: string[]
): CanActivateFn => {

  return () => {

    const authService =
      inject(AuthService);

    const router =
      inject(Router);

    /*
    |--------------------------------------------------------------------------
    | Authentication
    |--------------------------------------------------------------------------
    */

    if (
      !authService.isAuthenticated()
    ) {

      return router.createUrlTree([
        '/login'
      ]);

    }

    /*
    |--------------------------------------------------------------------------
    | User Role
    |--------------------------------------------------------------------------
    */

    const userRole =
      authService.user()?.role;

    /*
    |--------------------------------------------------------------------------
    | Authorization
    |--------------------------------------------------------------------------
    */

    if (
      userRole &&
      allowedRoles.includes(userRole)
    ) {

      return true;

    }

    /*
    |--------------------------------------------------------------------------
    | Forbidden
    |--------------------------------------------------------------------------
    */

    return router.createUrlTree([
      '/admin/dashboard'
    ]);

  };

};
