import {
  Routes
} from '@angular/router';

export const PRODUCTS_ROUTES: Routes = [

  {
    path: '',

    loadComponent: () =>
      import(
        './pages/products-list/products-list'
      )
      .then(
        c => c.ProductsList
      )
  },

  {
    path: 'create',

    loadComponent: () =>
      import(
        './pages/products-form/products-form'
      )
      .then(
        c => c.ProductForm
      )
  },

  {
    path: ':id/edit',

    loadComponent: () =>
      import(
        './pages/products-form/products-form'
      )
      .then(
        c => c.ProductForm
      )
  },

  {
    path: ':id',

    loadComponent: () =>
      import(
        './pages/products-details/products-details'
      )
      .then(
        c => c.ProductDetails
      )
  }

];
