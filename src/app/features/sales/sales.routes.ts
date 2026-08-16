import {
  Routes
} from '@angular/router';

export const SALES_ROUTES: Routes = [

  {
    path: 'dashboard',

    loadComponent: () =>
      import(
        './pages/sale-dashboard/sale-dashboard'
      )
      .then(
        c => c.SalesDashboard
      )
  },

  {
    path: '',

    loadComponent: () =>
      import(
        './pages/sale-list/sale-list'
      )
      .then(
        c => c.SaleList
      )
  },

  {
    path: 'create',

    loadComponent: () =>
      import(
        './pages/sale-create/sale-create'
      )
      .then(
        c => c.SaleCreate
      )
  },

  {
    path: ':id',

    loadComponent: () =>
      import(
        './pages/sale-details/sale-details'
      )
      .then(
        c => c.SaleDetails
      )
  }

];
