import { Routes } from '@angular/router';

export const USERS_ROUTES: Routes = [



  {
    path: '',

    loadComponent: () =>
      import('./pages/users-list/users-list')
        .then(c => c.UsersList)
  },



  {
    path: 'create',

    loadComponent: () =>
      import('./pages/user-form/user-form')
        .then(c => c.UserForm)
  },



  {
    path: ':id/edit',

    loadComponent: () =>
      import('./pages/user-form/user-form')
        .then(c => c.UserForm)
  },



  {
    path: ':id',

    loadComponent: () =>
      import('./pages/user-details/user-details')
        .then(c => c.UserDetails)
  }

];
