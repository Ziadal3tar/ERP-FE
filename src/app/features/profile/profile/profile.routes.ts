import {
  Routes
} from '@angular/router';


export const PROFILE_ROUTES: Routes = [

  {
    path: '',

    loadComponent: () =>
      import(
        './profile'
      )
      .then(
        c => c.Profile
      )
  },


  {
    path: 'change-password',

    loadComponent: () =>
      import(
        '../change-password/change-password'
      )
      .then(
        c => c.ChangePassword
      )
  }

];
