import {
  Routes
} from '@angular/router';

export const LEAVES_ROUTES: Routes = [

  {
    path: '',

    loadComponent: () =>
      import(
        './pages/leaves-list/leaves-list'
      )
      .then(
        c => c.LeavesList
      )
  },

  {
    path: 'create',

    loadComponent: () =>
      import(
        './pages/leave-form/leave-form'
      )
      .then(
        c => c.LeaveForm
      )
  },

  {
    path: ':id',

    loadComponent: () =>
      import(
        './pages/leave-details/leave-details'
      )
      .then(
        c => c.LeaveDetails
      )
  }

];
