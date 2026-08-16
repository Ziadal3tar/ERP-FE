import {
  Routes
} from '@angular/router';

export const INVOICES_ROUTES: Routes = [

  {
    path: 'dashboard',

    loadComponent: () =>
      import(
        './pages/invoice-dashboard/invoice-dashboard'
      )
      .then(
        c => c.InvoiceDashboard
      )
  },

  {
    path: '',

    loadComponent: () =>
      import(
        './pages/invoice-list/invoice-list'
      )
      .then(
        c => c.InvoiceList
      )
  },

  {
    path: ':id',

    loadComponent: () =>
      import(
        './pages/invoice-details/invoice-details'
      )
      .then(
        c => c.InvoiceDetails
      )
  }

];
