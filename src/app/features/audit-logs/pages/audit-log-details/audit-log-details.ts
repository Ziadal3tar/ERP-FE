import {
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal
} from '@angular/core';

import {
  DatePipe,
  JsonPipe
} from '@angular/common';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  takeUntilDestroyed
} from '@angular/core/rxjs-interop';

import {
  AuditLog
} from '../../models/audit-log.model';

import {
  AuditLogService
} from '../../services/audit-log';

import {
  PageHeader
} from '../../../../shared/components/page-header/page-header';


@Component({
  selector: 'app-audit-log-details',

  standalone: true,

  imports: [
    DatePipe,
    JsonPipe,
    PageHeader
  ],

  templateUrl:
    './audit-log-details.html',

  styleUrl:
    './audit-log-details.scss'
})
export class AuditLogDetails
  implements OnInit {

  private readonly route =
    inject(ActivatedRoute);

  private readonly router =
    inject(Router);

  private readonly auditLogService =
    inject(AuditLogService);

  private readonly destroyRef =
    inject(DestroyRef);


  protected readonly log =
    signal<AuditLog | null>(null);

  protected readonly loading =
    signal(true);

  protected readonly error =
    signal('');


  private readonly logId =
    this.route.snapshot.paramMap.get(
      'id'
    );


  ngOnInit(): void {

    if (!this.logId) {

      this.router.navigate([
        '/admin/audit-logs'
      ]);

      return;

    }


    this.loadLog();

  }


  protected loadLog(): void {

    this.loading.set(true);

    this.error.set('');


    this.auditLogService

      .getAuditLogById(
        this.logId!
      )

      .pipe(
        takeUntilDestroyed(
          this.destroyRef
        )
      )

      .subscribe({

        next: log => {

          this.log.set(
            log
          );

          this.loading.set(false);

        },

        error: error => {

          console.error(
            'Audit log details error:',
            error
          );

          this.error.set(
            error?.error?.message ??
            'Unable to load audit log.'
          );

          this.loading.set(false);

        }

      });

  }


  protected back(): void {

    this.router.navigate([
      '/admin/audit-logs'
    ]);

  }


  protected get userName(): string {

    const current =
      this.log();

    if (!current?.user) {

      return 'System';

    }


    if (
      typeof current.user === 'string'
    ) {

      return current.user;

    }


    return current.user.name;

  }


  protected get userEmail(): string {

    const current =
      this.log();

    if (
      !current?.user ||
      typeof current.user === 'string'
    ) {

      return '';

    }


    return current.user.email;

  }


  protected get resourceValue(): string {

    const value =
      this.log()?.resourceId;

    return value || '—';

  }


  protected actionClass(): string {

    const action =
      this.log()?.action;

    switch (action) {

      case 'DELETE':
      case 'CANCEL':

        return 'danger';

      case 'CREATE':
      case 'RESTORE':
      case 'RECEIVE':
      case 'CONFIRM':
      case 'PAYMENT':

        return 'success';

      case 'LOGIN':

        return 'info';

      default:

        return 'neutral';

    }

  }

}
