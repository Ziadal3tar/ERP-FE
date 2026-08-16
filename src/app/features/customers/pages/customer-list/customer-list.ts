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
  Router,
  RouterLink
} from '@angular/router';

import {
  debounceTime,
  distinctUntilChanged,
  Subject
} from 'rxjs';

import {
  takeUntilDestroyed
} from '@angular/core/rxjs-interop';

import {
  CustomerService
} from '../../services/customer';

import {
  Customer
} from '../../models/customer.model';

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

import {
  ConfirmDialog
} from '../../../../shared/components/confirm-dialog/confirm-dialog';

import {
  ToastService
} from '../../../../core/services/toast';

@Component({
  selector: 'app-customer-list',

  standalone: true,

  imports: [
    ReactiveFormsModule,
    RouterLink,
    PageHeader,
    DataTable,
    Pagination,
    ConfirmDialog
  ],

  templateUrl:
    './customer-list.html',

  styleUrl:
    './customer-list.scss'
})
export class CustomerList
  implements OnInit {

  private readonly fb =
    inject(FormBuilder);

  private readonly customerService =
    inject(CustomerService);

  private readonly router =
    inject(Router);

  private readonly toast =
    inject(ToastService);

  private readonly destroyRef =
    inject(DestroyRef);

  /*
  |--------------------------------------------------------------------------
  | Data
  |--------------------------------------------------------------------------
  */

  protected readonly customers =
    signal<Customer[]>([]);

  /*
  |--------------------------------------------------------------------------
  | State
  |--------------------------------------------------------------------------
  */

  protected readonly loading =
    signal(false);

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
    signal(10);

  protected readonly total =
    signal(0);

  protected readonly totalPages =
    signal(1);

  /*
  |--------------------------------------------------------------------------
  | Search
  |--------------------------------------------------------------------------
  */

  private readonly searchSubject =
    new Subject<string>();

  /*
  |--------------------------------------------------------------------------
  | Filters
  |--------------------------------------------------------------------------
  */

  protected readonly filterForm =
    this.fb.nonNullable.group({

      search: [''],

      status: [
        'all'
      ]

    });

  /*
  |--------------------------------------------------------------------------
  | Confirmation
  |--------------------------------------------------------------------------
  */

  protected readonly confirmOpen =
    signal(false);

  protected readonly confirmCustomer =
    signal<Customer | null>(null);

  protected readonly actionLoading =
    signal(false);

  /*
  |--------------------------------------------------------------------------
  | Table Columns
  |--------------------------------------------------------------------------
  */

  protected readonly columns:
    TableColumn<Customer>[] = [

    {
      key: 'name',
      label: 'Customer'
    },

    {
      key: 'code',
      label: 'Code'
    },

    {
      key: 'email',
      label: 'Email'
    },

    {
      key: 'phone',
      label: 'Phone'
    },

    {
      key: 'creditLimit',
      label: 'Credit Limit',
      type: 'number'
    },

    {
      key: 'isActive',
      label: 'Status',

      type: 'status',

      render: customer =>
        customer.isActive
          ? 'Active'
          : 'Inactive'
    }

  ];

  /*
  |--------------------------------------------------------------------------
  | Actions
  |--------------------------------------------------------------------------
  */

  protected readonly actions:
    TableAction<Customer>[] = [

    {
      key: 'view',

      label: 'View',

      icon: 'bi-eye',

      variant: 'default'
    },

    {
      key: 'edit',

      label: 'Edit',

      icon: 'bi-pencil',

      variant: 'primary',

      show: customer =>
        customer.isActive
    },

    {
      key: 'deactivate',

      label: 'Deactivate',

      icon: 'bi-pause-circle',

      variant: 'danger',

      show: customer =>
        customer.isActive
    },

    {
      key: 'restore',

      label: 'Restore',

      icon: 'bi-arrow-counterclockwise',

      variant: 'success',

      show: customer =>
        !customer.isActive
    }

  ];

  ngOnInit(): void {

    this.setupSearch();

    this.loadCustomers();

  }

  /*
  |--------------------------------------------------------------------------
  | Search
  |--------------------------------------------------------------------------
  */

  private setupSearch(): void {

    this.searchSubject

      .pipe(

        debounceTime(350),

        distinctUntilChanged(),

        takeUntilDestroyed(
          this.destroyRef
        )

      )

      .subscribe(
        search => {

          this.page.set(1);

          this.loadCustomers(
            search
          );

        }
      );

  }

  protected onSearch(
    value: string
  ): void {

    this.searchSubject.next(
      value.trim()
    );

  }

  /*
  |--------------------------------------------------------------------------
  | Load
  |--------------------------------------------------------------------------
  */

  protected loadCustomers(
    searchOverride?: string
  ): void {

    this.loading.set(true);

    this.error.set('');

    const search =
      searchOverride ??
      this.filterForm.controls.search.value;

    const status =
      this.filterForm.controls.status.value;

    const isActive =
      status === 'all'
        ? undefined
        : status === 'active';

    this.customerService

      .getCustomers(
        this.page(),
        this.limit(),
        search,
        isActive
      )

      .pipe(
        takeUntilDestroyed(
          this.destroyRef
        )
      )

      .subscribe({

        next: response => {

          this.customers.set(
            response.data ?? []
          );

          this.total.set(
            response.pagination?.total ?? 0
          );

          this.totalPages.set(
            response.pagination?.totalPages ?? 1
          );

          this.loading.set(false);

        },

        error: error => {

          console.error(
            'Customer list error:',
            error
          );

          this.customers.set([]);

          this.error.set(
            error?.error?.message ??
            'Unable to load customers.'
          );

          this.loading.set(false);

        }

      });

  }

  /*
  |--------------------------------------------------------------------------
  | Filters
  |--------------------------------------------------------------------------
  */

  protected applyStatus(): void {

    this.page.set(1);

    this.loadCustomers();

  }

  protected resetFilters(): void {

    this.filterForm.reset({

      search: '',

      status: 'all'

    });

    this.page.set(1);

    this.loadCustomers();

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

    this.loadCustomers();

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

    this.loadCustomers();

  }

  /*
  |--------------------------------------------------------------------------
  | Actions
  |--------------------------------------------------------------------------
  */

  protected handleAction(
    event: {
      action: TableAction<Customer>;
      row: Customer;
    }
  ): void {

    const {
      action,
      row
    } = event;

    switch (
      action.key
    ) {

      case 'view':

        this.router.navigate([
          '/admin/customers',
          row._id
        ]);

        break;

      case 'edit':

        this.router.navigate([
          '/admin/customers',
          row._id,
          'edit'
        ]);

        break;

      case 'deactivate':

        this.confirmCustomer.set(
          row
        );

        this.confirmOpen.set(
          true
        );

        break;

      case 'restore':

        this.restore(
          row
        );

        break;

    }

  }

  /*
  |--------------------------------------------------------------------------
  | Deactivate
  |--------------------------------------------------------------------------
  */

  protected confirmDeactivate(): void {

    const customer =
      this.confirmCustomer();

    if (!customer) {
      return;
    }

    this.actionLoading.set(
      true
    );

    this.customerService

      .deactivateCustomer(
        customer._id
      )

      .pipe(
        takeUntilDestroyed(
          this.destroyRef
        )
      )

      .subscribe({

        next: () => {

          this.actionLoading.set(
            false
          );

          this.closeConfirmation();

          this.toast.success(
            'Customer deactivated successfully.'
          );

          this.loadCustomers();

        },

        error: error => {

          console.error(
            'Deactivate customer error:',
            error
          );

          this.actionLoading.set(
            false
          );

          this.error.set(
            error?.error?.message ??
            'Unable to deactivate customer.'
          );

        }

      });

  }

  /*
  |--------------------------------------------------------------------------
  | Restore
  |--------------------------------------------------------------------------
  */

  protected restore(
    customer: Customer
  ): void {

    this.customerService

      .restoreCustomer(
        customer._id
      )

      .pipe(
        takeUntilDestroyed(
          this.destroyRef
        )
      )

      .subscribe({

        next: () => {

          this.toast.success(
            'Customer restored successfully.'
          );

          this.loadCustomers();

        },

        error: error => {

          console.error(
            'Restore customer error:',
            error
          );

          this.error.set(
            error?.error?.message ??
            'Unable to restore customer.'
          );

        }

      });

  }

  /*
  |--------------------------------------------------------------------------
  | Confirmation
  |--------------------------------------------------------------------------
  */

  protected closeConfirmation(): void {

    if (
      this.actionLoading()
    ) {

      return;

    }

    this.confirmOpen.set(
      false
    );

    this.confirmCustomer.set(
      null
    );

  }

}
