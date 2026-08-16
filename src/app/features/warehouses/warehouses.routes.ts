import {
  Routes
} from '@angular/router';

export const WAREHOUSES_ROUTES: Routes = [

  {
    path: '',

    loadComponent: () =>
      import(
        './pages/warehouses-list/warehouses-list'
      )
      .then(
        c => c.WarehousesList
      )
  },

  {
    path: 'create',

    loadComponent: () =>
      import(
        './pages/warehouses-form/warehouses-form'
      )
      .then(
        c => c.WarehouseForm
      )
  },

  {
    path: ':id/edit',

    loadComponent: () =>
      import(
        './pages/warehouses-form/warehouses-form'
      )
      .then(
        c => c.WarehouseForm
      )
  },

  {
    path: ':id',

    loadComponent: () =>
      import(
        './pages/warehouses-details/warehouses-details'
      )
      .then(
        c => c.WarehouseDetails
      )
  }

];
