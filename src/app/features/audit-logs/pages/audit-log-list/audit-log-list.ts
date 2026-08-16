import {
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal
} from '@angular/core';

import {
  FormBuilder,
  ReactiveFormsModule
} from '@angular/forms';

import {
  Router
} from '@angular/router';

import {
  takeUntilDestroyed
} from '@angular/core/rxjs-interop';

import {
  AuditAction,
  AuditLog,
  AuditModule
} from '../../models/audit-log.model';

import {
  AuditLogService
} from '../../services/audit-log';

import {
  UserService
} from '../../../users/services/user';

import {
  PageHeader
} from '../../../../shared/components/page-header/page-header';

import {
  DataTable,
  TableAction,
  TableColumn
} from '../../../../shared/components/data-table/data-table';

import {
  Pagination
} from '../../../../shared/components/pagination/pagination';


@Component({
  selector: 'app-audit-log-list',

  standalone: true,

  imports: [
    ReactiveFormsModule,
    PageHeader,
    DataTable,
    Pagination
  ],

  templateUrl:
    './audit-log-list.html',

  styleUrl:
    './audit-log-list.scss'
})
export class AuditLogList
  implements OnInit {

  private readonly fb =
    inject(FormBuilder);

  private readonly auditLogService =
    inject(AuditLogService);

  private readonly userService =
    inject(UserService);

  private readonly router =
    inject(Router);

  private readonly destroyRef =
    inject(DestroyRef);


  /*
  |--------------------------------------------------------------------------
  | Data
  |--------------------------------------------------------------------------
  */

  protected readonly logs =
    signal<AuditLog[]>([]);

  protected readonly users =
    signal<any[]>([]);


  /*
  |--------------------------------------------------------------------------
  | State
  |--------------------------------------------------------------------------
  */

  protected readonly loading =
    signal(false);

  protected readonly usersLoading =
    signal(true);

  protected readonly error =
    signal('');


  /*
  |--------------------------------------------------------------------------
  | Pagination
  |--------------------------------------------------------------------------
  */

  protected readonly page =
    signal(1);

  protected readonly limit =
    signal(20);

  protected readonly total =
    signal(0);

  protected readonly totalPages =
    signal(1);


  /*
  |--------------------------------------------------------------------------
  | Filters
  |--------------------------------------------------------------------------
  */

  protected readonly filterForm =
    this.fb.nonNullable.group({

      user: [''],

      module:
        ['' as AuditModule | ''],

      action:
        ['' as AuditAction | '']

    });


  /*
  |--------------------------------------------------------------------------
  | Options
  |--------------------------------------------------------------------------
  */

  protected readonly modules:
    AuditModule[] = [

    'Auth',
    'User',
    'Department',
    'Employee',
    'Attendance',
    'Leave',
    'Category',
    'Product',
    'Warehouse',
    'Stock',
    'Supplier',
    'Purchase',
    'Customer',
    'Sale',
    'Invoice',
    'Payment'

  ];


  protected readonly actions:
    AuditAction[] = [

    'LOGIN',
    'CREATE',
    'UPDATE',
    'DELETE',
    'RESTORE',
    'CONFIRM',
    'CANCEL',
    'RECEIVE',
    'PAYMENT'

  ];


  /*
  |--------------------------------------------------------------------------
  | Table
  |--------------------------------------------------------------------------
  */

  protected readonly columns:
    TableColumn<AuditLog>[] = [

    {
      key: 'createdAt',

      label: 'Date',

      type: 'date'
    },


    {
      key: 'user.name',

      label: 'User',

      render: log => {

        if (
          typeof log.user === 'string'
        ) {

          return log.user;

        }

        return log.user?.name ||
          'System';

      }

    },


    {
      key: 'action',

      label: 'Action',

      type: 'status',

      render: log =>
        log.action

    },


    {
      key: 'module',

      label: 'Module',

      render: log =>
        log.module

    },


    {
      key: 'description',

      label: 'Description',

      render: log =>
        log.description ||
        '—'

    },


    {
      key: 'resourceId',

      label: 'Resource',

      render: log =>
        log.resourceId
          ? log.resourceId
              .slice(-6)
              .toUpperCase()
          : '—'

    }

  ];


  protected readonly tableActions:
    TableAction<AuditLog>[] = [

    {
      key: 'view',

      label: 'View',

      icon: 'bi-eye',

      variant: 'default'

    }

  ];


  ngOnInit(): void {

    this.loadUsers();

    this.loadLogs();

  }


  /*
  |--------------------------------------------------------------------------
  | Users
  |--------------------------------------------------------------------------
  */

  private loadUsers(): void {

    this.usersLoading.set(
      true
    );


    this.userService

      .getUsers(
        1,
        100
      )

      .pipe(
        takeUntilDestroyed(
          this.destroyRef
        )
      )

      .subscribe({

        next: response => {

          this.users.set(
            response.data ?? []
          );

          this.usersLoading.set(
            false
          );

        },

        error: error => {

          console.error(
            'Audit users error:',
            error
          );

          this.usersLoading.set(
            false
          );

        }

      });

  }


  /*
  |--------------------------------------------------------------------------
  | Logs
  |--------------------------------------------------------------------------
  */

  protected loadLogs(): void {

    this.loading.set(true);

    this.error.set('');


    const {
      user,
      module,
      action
    } =
      this.filterForm.getRawValue();


    this.auditLogService

      .getAuditLogs(
        this.page(),
        this.limit(),
        user,
        module,
        action
      )

      .pipe(
        takeUntilDestroyed(
          this.destroyRef
        )
      )

      .subscribe({

        next: response => {

          this.logs.set(
            response.data ?? []
          );


          this.total.set(
            response.pagination?.total ??
            0
          );


          this.totalPages.set(
            response.pagination?.totalPages ??
            1
          );


          this.loading.set(
            false
          );

        },

        error: error => {

          console.error(
            'Audit logs error:',
            error
          );


          this.logs.set([]);

          this.error.set(
            error?.error?.message ??
            'Unable to load audit logs.'
          );


          this.loading.set(
            false
          );

        }

      });

  }


  /*
  |--------------------------------------------------------------------------
  | Filters
  |--------------------------------------------------------------------------
  */

  protected applyFilters(): void {

    this.page.set(1);

    this.loadLogs();

  }


  protected resetFilters(): void {

    this.filterForm.reset({

      user: '',

      module: '',

      action: ''

    });


    this.page.set(1);

    this.loadLogs();

  }


  /*
  |--------------------------------------------------------------------------
  | Pagination
  |--------------------------------------------------------------------------
  */

  protected changePage(
    page: number
  ): void {

    if (
      page < 1 ||
      page > this.totalPages() ||
      page === this.page()
    ) {

      return;

    }


    this.page.set(page);

    this.loadLogs();

  }


  /*
  |--------------------------------------------------------------------------
  | Refresh
  |--------------------------------------------------------------------------
  */

  protected refresh(): void {

    if (
      this.loading()
    ) {

      return;

    }

    this.loadLogs();

  }


  /*
  |--------------------------------------------------------------------------
  | Actions
  |--------------------------------------------------------------------------
  */

  protected handleAction(
    event: {
      action: TableAction<AuditLog>;
      row: AuditLog;
    }
  ): void {

    if (
      event.action.key === 'view'
    ) {

      this.router.navigate([
        '/admin/audit-logs',
        event.row._id
      ]);

    }

  }

}
