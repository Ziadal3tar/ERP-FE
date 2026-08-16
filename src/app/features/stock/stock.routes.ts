import {
  Routes
} from '@angular/router';

export const STOCK_ROUTES: Routes = [

  {
    path: '',

    loadComponent: () =>
      import(
        './pages/stock-dashboard/stock-dashboard'
      )
      .then(
        c => c.StockDashboard
      )
  },

  {
    path: 'list',

    loadComponent: () =>
      import(
        './pages/stock-list/stock-list'
      )
      .then(
        c => c.StockList
      )
  },

  {
    path: 'in',

    loadComponent: () =>
      import(
        './pages/stock-in/stock-in'
      )
      .then(
        c => c.StockIn
      )
  },

  {
    path: 'out',

    loadComponent: () =>
      import(
        './pages/stock-out/stock-out'
      )
      .then(
        c => c.StockOut
      )
  },

  {
    path: 'transfer',

    loadComponent: () =>
      import(
        './pages/stock-transfer/stock-transfer'
      )
      .then(
        c => c.StockTransfer
      )
  },

  {
    path: 'movements',

    loadComponent: () =>
      import(
        './pages/stock-movements/stock-movements'
      )
      .then(
        c => c.StockMovements
      )
  },
  {
  path: 'warehouse',

  loadComponent: () =>
    import(
      './pages/stock-warehouse/stock-warehouse'
    )
    .then(
      c => c.StockWarehouse
    )
},

];
