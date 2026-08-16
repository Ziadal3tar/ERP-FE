import {
  Routes
} from '@angular/router';


export const AUDIT_LOGS_ROUTES: Routes = [

  {
    path: '',

    loadComponent: () =>
      import(
        './pages/audit-log-list/audit-log-list'
      )
      .then(
        c => c.AuditLogList
      )
  },


  {
    path: ':id',

    loadComponent: () =>
      import(
        './pages/audit-log-details/audit-log-details'
      )
      .then(
        c => c.AuditLogDetails
      )
  }

];
