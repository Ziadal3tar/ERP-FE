import {
  Routes
} from '@angular/router';

export const PAYMENTS_ROUTES: Routes = [

  {
    path: 'dashboard',

    loadComponent: () =>
      import(
        './pages/payment-dashboard/payment-dashboard'
      )
      .then(
        c => c.PaymentDashboard
      )
  },

  {
    path: '',

    loadComponent: () =>
      import(
        './pages/payment-list/payment-list'
      )
      .then(
        c => c.PaymentList
      )
  },

  {
    path: ':id',

    loadComponent: () =>
      import(
        './pages/payment-details/payment-details'
      )
      .then(
        c => c.PaymentDetails
      )
  }

];
