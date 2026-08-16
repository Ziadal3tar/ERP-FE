import {
  Routes
} from '@angular/router';

export const SUPPLIERS_ROUTES: Routes = [

  {
    path: '',
    loadComponent: () =>
      import('./pages/supplier-list/supplier-list')
        .then(c => c.SupplierList)
  },

  {
    path: 'create',
    loadComponent: () =>
      import('./pages/supplier-create/supplier-create')
        .then(c => c.SupplierCreate)
  },

  {
    path: ':id/edit',
    loadComponent: () =>
      import('./pages/supplier-edit/supplier-edit')
        .then(c => c.SupplierEdit)
  },

  {
    path: ':id',
    loadComponent: () =>
      import('./pages/supplier-details/supplier-details')
        .then(c => c.SupplierDetails)
  }

];
