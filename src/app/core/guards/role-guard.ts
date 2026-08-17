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



    if (
      !authService.isAuthenticated()
    ) {

      return router.createUrlTree([
        '/login'
      ]);

    }



    const userRole =
      authService.user()?.role;



    if (
      userRole &&
      allowedRoles.includes(userRole)
    ) {

      return true;

    }



    return router.createUrlTree([
      '/admin/dashboard'
    ]);

  };

};
