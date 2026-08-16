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
  SupplierService
} from '../../services/supplier';

import {
  Supplier
} from '../../models/supplier.model';

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
@Component({
  selector: 'app-supplier-list',

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
    './supplier-list.html',

  styleUrl:
    './supplier-list.scss'
})
export class SupplierList
  implements OnInit {

  private readonly fb =
    inject(FormBuilder);

  private readonly supplierService =
    inject(SupplierService);

  private readonly router =
    inject(Router);

  private readonly destroyRef =
    inject(DestroyRef);

  protected readonly suppliers =
    signal<Supplier[]>([]);

  protected readonly loading =
    signal(false);

  protected readonly error =
    signal('');

  protected readonly page =
    signal(1);

  protected readonly limit =
    signal(10);

  protected readonly total =
    signal(0);

  protected readonly totalPages =
    signal(1);
protected readonly confirmOpen =
  signal(false);

protected readonly confirmSupplier =
  signal<Supplier | null>(null);

protected readonly actionLoading =
  signal(false);
  private readonly searchSubject =
    new Subject<string>();

  protected readonly filterForm =
    this.fb.nonNullable.group({

      search: [''],

      status: ['all']

    });

  protected readonly columns:
    TableColumn<Supplier>[] = [

    {
      key: 'name',
      label: 'Supplier'
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
      key: 'isActive',
      label: 'Status',

      type: 'status',

      render: supplier =>
        supplier.isActive
          ? 'Active'
          : 'Inactive'
    }

  ];

  protected readonly actions:
    TableAction<Supplier>[] = [

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

      show: supplier =>
        supplier.isActive
    },

    {
      key: 'deactivate',

      label: 'Deactivate',

      icon: 'bi-pause-circle',

      variant: 'danger',

      show: supplier =>
        supplier.isActive
    },

    {
      key: 'restore',

      label: 'Restore',

      icon: 'bi-arrow-counterclockwise',

      variant: 'success',

      show: supplier =>
        !supplier.isActive
    }

  ];
// confirmMessage: string;

  ngOnInit(): void {

    this.setupSearch();

    this.loadSuppliers();

  }

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

          this.loadSuppliers(
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

  protected loadSuppliers(
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

    this.supplierService

      .getSuppliers(
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

          this.suppliers.set(
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
            'Suppliers loading error:',
            error
          );

          this.suppliers.set([]);

          this.error.set(
            error?.error?.message ??
            'Unable to load suppliers.'
          );

          this.loading.set(false);

        }

      });

  }

  protected applyStatus(): void {

    this.page.set(1);

    this.loadSuppliers();

  }

  protected resetFilters(): void {

    this.filterForm.reset({

      search: '',

      status: 'all'

    });

    this.page.set(1);

    this.loadSuppliers();

  }

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

    this.loadSuppliers();

  }

  protected refresh(): void {

    if (
      this.loading()
    ) {

      return;

    }

    this.loadSuppliers();

  }

  protected handleAction(
    event: {
      action: TableAction<Supplier>;
      row: Supplier;
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
          '/admin/suppliers',
          row._id
        ]);

        break;

      case 'edit':

        this.router.navigate([
          '/admin/suppliers',
          row._id,
          'edit'
        ]);

        break;

case 'deactivate':

  this.confirmSupplier.set(row);

  this.confirmOpen.set(true);

  break;

      case 'restore':

        this.restore(
          row
        );

        break;

    }

  }

  protected deactivate(
    supplier: Supplier
  ): void {

    this.supplierService
      .deactivateSupplier(
        supplier._id
      )

      .pipe(
        takeUntilDestroyed(
          this.destroyRef
        )
      )

      .subscribe({

        next: () => {

          this.loadSuppliers();

        },

        error: error => {

          console.error(
            'Deactivate supplier error:',
            error
          );

          this.error.set(
            error?.error?.message ??
            'Unable to deactivate supplier.'
          );

        }

      });

  }

  protected restore(
    supplier: Supplier
  ): void {

    this.supplierService
      .restoreSupplier(
        supplier._id
      )

      .pipe(
        takeUntilDestroyed(
          this.destroyRef
        )
      )

      .subscribe({

        next: () => {

          this.loadSuppliers();

        },

        error: error => {

          console.error(
            'Restore supplier error:',
            error
          );

          this.error.set(
            error?.error?.message ??
            'Unable to restore supplier.'
          );

        }

      });

  }
protected cancelDeactivate(): void {

  if (this.actionLoading()) {
    return;
  }

  this.confirmOpen.set(false);

  this.confirmSupplier.set(null);

}
protected confirmDeactivate(): void {

  const supplier =
    this.confirmSupplier();

  if (!supplier) {
    return;
  }

  this.actionLoading.set(true);

  this.supplierService
    .deactivateSupplier(
      supplier._id
    )
    .pipe(
      takeUntilDestroyed(
        this.destroyRef
      )
    )
    .subscribe({

      next: () => {

        this.actionLoading.set(false);

        this.confirmOpen.set(false);

        this.confirmSupplier.set(null);

        this.loadSuppliers();

      },

      error: error => {

        this.actionLoading.set(false);

        this.error.set(
          error?.error?.message ??
          'Unable to deactivate supplier.'
        );

      }

    });

}
}
