import {
  Routes
} from '@angular/router';

export const ATTENDANCE_ROUTES: Routes = [

  {
    path: '',

    loadComponent: () =>
      import(
        './pages/attendance-list/attendance-list'
      )
        .then(
          c => c.AttendanceList
        )
  }

];
