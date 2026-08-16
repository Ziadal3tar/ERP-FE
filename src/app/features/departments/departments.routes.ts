import {
  Routes
} from '@angular/router';

export const DEPARTMENTS_ROUTES: Routes = [

  {
    path: '',

    loadComponent: () =>
      import(
        './pages/departments-list/departments-list'
      )
        .then(
          c => c.DepartmentsList
        )
  },

  {
    path: 'create',

    loadComponent: () =>
      import(
        './pages/department-form/department-form'
      )
        .then(
          c => c.DepartmentForm
        )
  },

  {
    path: ':id/edit',

    loadComponent: () =>
      import(
        './pages/department-form/department-form'
      )
        .then(
          c => c.DepartmentForm
        )
  }

];
