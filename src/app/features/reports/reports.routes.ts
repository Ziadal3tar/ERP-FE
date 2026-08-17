import {
  Routes
} from '@angular/router';


export const REPORTS_ROUTES: Routes = [



  {
    path: '',

    redirectTo: 'dashboard',

    pathMatch: 'full'
  },


  {
    path: 'dashboard',

    loadComponent: () =>
      import(
        './pages/report-dashboard/report-dashboard'
      )
      .then(
        c => c.ReportDashboard
      )
  },




  {
    path: 'sales',

    loadComponent: () =>
      import(
        './pages/sales-report/sales-report'
      )
      .then(
        c => c.SalesReport
      )
  },




  {
    path: 'purchases',

    loadComponent: () =>
      import(
        './pages/purchases-report/purchases-report'
      )
      .then(
        c => c.PurchasesReport
      )
  },




  {
    path: 'stock',

    loadComponent: () =>
      import(
        './pages/stock-report/stock-report'
      )
      .then(
        c => c.StockReport
      )
  },




  {
    path: 'low-stock',

    loadComponent: () =>
      import(
        './pages/low-stock-report/low-stock-report'
      )
      .then(
        c => c.LowStockReport
      )
  }

];
