import {
  Routes
} from '@angular/router';

export const EMPLOYEES_ROUTES: Routes = [

  {
    path: '',

    loadComponent: () =>
      import(
        './pages/employees-list/employees-list'
      ).then(
        c => c.EmployeesList
      )
  },

  {
    path: 'create',

    loadComponent: () =>
      import(
        './pages/employee-form/employee-form'
      ).then(
        c => c.EmployeeForm
      )
  },

  {
    path: ':id/edit',

    loadComponent: () =>
      import(
        './pages/employee-form/employee-form'
      ).then(
        c => c.EmployeeForm
      )
  },

  {
    path: ':id',

    loadComponent: () =>
      import(
        './pages/employee-details/employee-details'
      ).then(
        c => c.EmployeeDetails
      )
  }

];
