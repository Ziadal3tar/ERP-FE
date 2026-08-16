import {
  Routes
} from '@angular/router';

export const CUSTOMERS_ROUTES: Routes = [

  {
    path: '',

    loadComponent: () =>
      import(
        './pages/customer-list/customer-list'
      )
      .then(
        c => c.CustomerList
      )
  },

  {
    path: 'create',

    loadComponent: () =>
      import(
        './pages/customer-create/customer-create'
      )
      .then(
        c => c.CustomerCreate
      )
  },

  {
    path: ':id/edit',

    loadComponent: () =>
      import(
        './pages/customer-edit/customer-edit'
      )
      .then(
        c => c.CustomerEdit
      )
  },

  {
    path: ':id',

    loadComponent: () =>
      import(
        './pages/customer-details/customer-details'
      )
      .then(
        c => c.CustomerDetails
      )
  }

];
