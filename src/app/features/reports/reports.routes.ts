import {
  Routes
} from '@angular/router';


export const REPORTS_ROUTES: Routes = [

  /*
  |--------------------------------------------------------------------------
  | Dashboard
  |--------------------------------------------------------------------------
  */

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


  /*
  |--------------------------------------------------------------------------
  | Sales
  |--------------------------------------------------------------------------
  */

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


  /*
  |--------------------------------------------------------------------------
  | Purchases
  |--------------------------------------------------------------------------
  */

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


  /*
  |--------------------------------------------------------------------------
  | Stock
  |--------------------------------------------------------------------------
  */

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


  /*
  |--------------------------------------------------------------------------
  | Low Stock
  |--------------------------------------------------------------------------
  */

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
