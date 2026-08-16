import { Routes } from '@angular/router';

export const USERS_ROUTES: Routes = [

  /*
  |--------------------------------------------------------------------------
  | Users List
  |--------------------------------------------------------------------------
  */

  {
    path: '',

    loadComponent: () =>
      import('./pages/users-list/users-list')
        .then(c => c.UsersList)
  },

  /*
  |--------------------------------------------------------------------------
  | Create User
  |--------------------------------------------------------------------------
  */

  {
    path: 'create',

    loadComponent: () =>
      import('./pages/user-form/user-form')
        .then(c => c.UserForm)
  },

  /*
  |--------------------------------------------------------------------------
  | Edit User
  |--------------------------------------------------------------------------
  */

  {
    path: ':id/edit',

    loadComponent: () =>
      import('./pages/user-form/user-form')
        .then(c => c.UserForm)
  },

  /*
  |--------------------------------------------------------------------------
  | User Details
  |--------------------------------------------------------------------------
  */

  {
    path: ':id',

    loadComponent: () =>
      import('./pages/user-details/user-details')
        .then(c => c.UserDetails)
  }

];
