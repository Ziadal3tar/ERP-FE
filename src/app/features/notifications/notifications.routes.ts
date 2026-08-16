import {
  Routes
} from '@angular/router';


export const NOTIFICATIONS_ROUTES: Routes = [

  {
    path: '',

    loadComponent: () =>
      import(
        './pages/notification-list/notification-list'
      )
      .then(
        c => c.NotificationList
      )
  }

];
