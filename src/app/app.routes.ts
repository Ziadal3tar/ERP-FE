import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth-guard';
import { roleGuard } from './core/guards/role-guard';

export const routes: Routes = [

  /*
  |--------------------------------------------------------------------------
  | Authentication
  |--------------------------------------------------------------------------
  */

  {
    path: 'login',

    loadComponent: () =>
      import('./features/auth/login/login')
        .then(c => c.Login)
  },

  {
    path: 'forgot-password',

    loadComponent: () =>
      import('./features/auth/forgot-password/forgot-password')
        .then(c => c.ForgotPassword)
  },

  {
    path: 'reset-password/:token',

    loadComponent: () =>
      import('./features/auth/reset-password/reset-password')
        .then(c => c.ResetPassword)
  },

  /*
  |--------------------------------------------------------------------------
  | Profile
  |--------------------------------------------------------------------------
  */

  {
    path: 'profile',

    canActivate: [
      authGuard
    ],

    loadComponent: () =>
      import('./features/profile/profile/profile')
        .then(c => c.Profile)
  },

  {
    path: 'change-password',

    canActivate: [
      authGuard
    ],

    loadComponent: () =>
      import('./features/profile/change-password/change-password')
        .then(c => c.ChangePassword)
  },

  /*
  |--------------------------------------------------------------------------
  | Admin
  |--------------------------------------------------------------------------
  */

  {
    path: 'admin',

    canActivate: [
      authGuard,
      roleGuard(['Admin'])
    ],

    loadComponent: () =>
      import('./layouts/admin-layout/admin-layout')
        .then(c => c.AdminLayout),

    children: [
      {
        path: 'departments',

        loadChildren: () =>
          import(
            './features/departments/departments.routes'
          )
            .then(
              m => m.DEPARTMENTS_ROUTES
            )
      },
      {
        path: 'employees',

        loadChildren: () =>
          import(
            './features/employees/employees.routes'
          )
            .then(
              m => m.EMPLOYEES_ROUTES
            )
      },
      {
        path: 'attendance',

        loadChildren: () =>
          import(
            './features/attendance/attendance.routes'
          )
            .then(
              m => m.ATTENDANCE_ROUTES
            )
      },
      {
        path: 'leaves',

        loadChildren: () =>
          import(
            './features/leaves/leaves.routes'
          )
            .then(
              m => m.LEAVES_ROUTES
            )
      },
      {
        path: 'categories',

        loadChildren: () =>
          import(
            './features/categories/categories.routes'
          )
            .then(
              m => m.CATEGORIES_ROUTES
            )
      },
      {
        path: 'products',

        loadChildren: () =>
          import(
            './features/products/products.routes'
          )
            .then(
              m => m.PRODUCTS_ROUTES
            )
      },
      {
        path: 'warehouses',

        loadChildren: () =>
          import(
            './features/warehouses/warehouses.routes'
          )
            .then(
              m => m.WAREHOUSES_ROUTES
            )
      },
     {
  path: 'stock',

  loadChildren: () =>
    import(
      './features/stock/stock.routes'
    )
    .then(
      m => m.STOCK_ROUTES
    )
},
{
  path: 'purchases',

  loadChildren: () =>
    import(
      './features/purchases/purchases.routes'
    )
    .then(
      m => m.PURCHASES_ROUTES
    )
},
{
  path: 'suppliers',

  loadChildren: () =>
    import(
      './features/suppliers/suppliers.routes'
    )
    .then(
      m => m.SUPPLIERS_ROUTES
    )
},
{
  path: 'customers',

  loadChildren: () =>
    import(
      './features/customers/customers.routes'
    )
    .then(
      m => m.CUSTOMERS_ROUTES
    )
},
{
  path: 'sales',

  loadChildren: () =>
    import(
      './features/sales/sales.routes'
    )
    .then(
      m => m.SALES_ROUTES
    )
},
{
  path: 'invoices',

  loadChildren: () =>
    import(
      './features/invoices/invoices.routes'
    )
    .then(
      m => m.INVOICES_ROUTES
    )
},
{
  path: 'payments',

  loadChildren: () =>
    import(
      './features/payments/payments.routes'
    )
    .then(
      m => m.PAYMENTS_ROUTES
    )
},
{
  path: 'reports',

  loadChildren: () =>
    import(
      './features/reports/reports.routes'
    )
    .then(
      m => m.REPORTS_ROUTES
    )
},
{
  path: 'audit-logs',

  loadChildren: () =>
    import(
      './features/audit-logs/audit-logs.routes'
    )
    .then(
      m => m.AUDIT_LOGS_ROUTES
    )
},
{
  path: 'notifications',

  loadChildren: () =>
    import(
      './features/notifications/notifications.routes'
    )
    .then(
      m => m.NOTIFICATIONS_ROUTES
    )
},
      /*
      |--------------------------------------------------------------------------
      | Admin Default
      |--------------------------------------------------------------------------
      */

      {
        path: '',

        redirectTo: 'dashboard',

        pathMatch: 'full'
      },

      /*
      |--------------------------------------------------------------------------
      | Dashboard
      |--------------------------------------------------------------------------
      */

      {
        path: 'dashboard',

        loadComponent: () =>
          import(
            './features/dashboard/dashboard/dashboard'
          )
            .then(c => c.Dashboard)
      },

      /*
      |--------------------------------------------------------------------------
      | Users
      |--------------------------------------------------------------------------
      */

      {
        path: 'users',

        loadChildren: () =>
          import('./features/users/users.routes')
            .then(m => m.USERS_ROUTES)
      }

    ]

  },

  /*
  |--------------------------------------------------------------------------
  | Default
  |--------------------------------------------------------------------------
  */

  {
    path: '',

    redirectTo: 'login',

    pathMatch: 'full'
  },

  /*
  |--------------------------------------------------------------------------
  | Not Found
  |--------------------------------------------------------------------------
  */

  {
    path: '**',

    redirectTo: 'login'
  }

];
