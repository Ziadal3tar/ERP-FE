import {
  Routes
} from '@angular/router';

export const PURCHASES_ROUTES: Routes = [

  {
    path: '',

    loadComponent: () =>
      import(
        './pages/purchase-list/purchase-list'
      )
      .then(
        c => c.PurchaseList
      )
  },

  {
    path: 'create',

    loadComponent: () =>
      import(
        './pages/purchase-create/purchase-create'
      )
      .then(
        c => c.PurchaseCreate
      )
  },

  {
    path: ':id',

    loadComponent: () =>
      import(
        './pages/purchase-details/purchase-details'
      )
      .then(
        c => c.PurchaseDetails
      )
  }

];
