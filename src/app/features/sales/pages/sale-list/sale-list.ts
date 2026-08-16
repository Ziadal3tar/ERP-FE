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
  takeUntilDestroyed
} from '@angular/core/rxjs-interop';

import {
  CustomerService
} from '../../../customers/services/customer';

import {
  WarehouseService
} from '../../../warehouses/services/warehouse';

import {
  SaleService
} from '../../services/sale';

import {
  Sale,
  SaleStatus
} from '../../models/sale.model';

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
  selector: 'app-sale-list',

  standalone: true,

  imports: [
    ReactiveFormsModule,
    RouterLink,
    PageHeader,
    DataTable,
    Pagination,
    ConfirmDialog
  ],

  templateUrl: './sale-list.html',

  styleUrl: './sale-list.scss'
})
export class SaleList
  implements OnInit {

  private readonly fb =
    inject(FormBuilder);

  private readonly saleService =
    inject(SaleService);

  private readonly customerService =
    inject(CustomerService);

  private readonly warehouseService =
    inject(WarehouseService);

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

  protected readonly sales =
    signal<Sale[]>([]);

  protected readonly customers =
    signal<any[]>([]);

  protected readonly warehouses =
    signal<any[]>([]);

  /*
  |--------------------------------------------------------------------------
  | State
  |--------------------------------------------------------------------------
  */

  protected readonly loading =
    signal(false);

  protected readonly filtersLoading =
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
    signal(10);

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

      customer: [''],

      warehouse: [''],

      status:
        ['' as SaleStatus | '']

    });

  /*
  |--------------------------------------------------------------------------
  | Confirmation
  |--------------------------------------------------------------------------
  */

  protected readonly confirmOpen =
    signal(false);

  protected readonly actionLoading =
    signal(false);

  protected readonly confirmSale =
    signal<Sale | null>(null);

  protected readonly confirmAction =
    signal<
      'confirm' |
      'cancel' |
      null
    >(null);

  /*
  |--------------------------------------------------------------------------
  | Columns
  |--------------------------------------------------------------------------
  */

  protected readonly columns:
    TableColumn<Sale>[] = [

    {
      key: '_id',

      label: 'Sale',

      render: sale =>
        `#${sale._id
          .slice(-6)
          .toUpperCase()}`
    },

    {
      key: 'customer.name',

      label: 'Customer'
    },

    {
      key: 'warehouse.name',

      label: 'Warehouse'
    },

    {
      key: 'items',

      label: 'Items',

      render: sale =>
        String(
          sale.items.length
        )
    },

    {
      key: 'total',

      label: 'Total',

      type: 'number',

      render: sale =>
        sale.total.toLocaleString(
          'en-US',
          {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          }
        )
    },

    {
      key: 'paymentMethod',

      label: 'Payment'
    },

    {
      key: 'status',

      label: 'Status',

      type: 'status',

      render: sale =>
        sale.status
    },

    {
      key: 'createdAt',

      label: 'Date',

      type: 'date'
    }

  ];

  /*
  |--------------------------------------------------------------------------
  | Actions
  |--------------------------------------------------------------------------
  */

  protected readonly actions:
    TableAction<Sale>[] = [

    {
      key: 'view',

      label: 'View',

      icon: 'bi-eye',

      variant: 'default'
    },

    {
      key: 'confirm',

      label: 'Confirm',

      icon: 'bi-check2-circle',

      variant: 'primary',

      show: sale =>
        sale.status === 'Draft'
    },

    {
      key: 'cancel',

      label: 'Cancel',

      icon: 'bi-x-circle',

      variant: 'danger',

      show: sale =>
        sale.status === 'Draft'
    }

  ];

  /*
  |--------------------------------------------------------------------------
  | Lifecycle
  |--------------------------------------------------------------------------
  */

  ngOnInit(): void {

    this.loadFilters();

    this.loadSales();

  }

  /*
  |--------------------------------------------------------------------------
  | Filters Data
  |--------------------------------------------------------------------------
  */

  private loadFilters(): void {

    this.filtersLoading.set(
      true
    );

    let customersLoaded = false;

    let warehousesLoaded = false;

    this.customerService
      .getCustomers(
        1,
        100,
        '',
        true
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

          customersLoaded = true;

          this.finishFilterLoading(
            customersLoaded,
            warehousesLoaded
          );

        },

        error: error => {

          console.error(
            'Customers filter error:',
            error
          );

          customersLoaded = true;

          this.finishFilterLoading(
            customersLoaded,
            warehousesLoaded
          );

        }

      });

    this.warehouseService
      .getWarehouses(
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

          this.warehouses.set(
            response.data ?? []
          );

          warehousesLoaded = true;

          this.finishFilterLoading(
            customersLoaded,
            warehousesLoaded
          );

        },

        error: error => {

          console.error(
            'Warehouses filter error:',
            error
          );

          warehousesLoaded = true;

          this.finishFilterLoading(
            customersLoaded,
            warehousesLoaded
          );

        }

      });

  }

  private finishFilterLoading(
    customersLoaded: boolean,
    warehousesLoaded: boolean
  ): void {

    if (
      customersLoaded &&
      warehousesLoaded
    ) {

      this.filtersLoading.set(
        false
      );

    }

  }

  /*
  |--------------------------------------------------------------------------
  | Load Sales
  |--------------------------------------------------------------------------
  */

  protected loadSales(): void {

    this.loading.set(true);

    this.error.set('');

    const {
      customer,
      warehouse,
      status
    } =
      this.filterForm.getRawValue();

    this.saleService
      .getSales(
        this.page(),
        this.limit(),
        customer,
        warehouse,
        status
      )

      .pipe(
        takeUntilDestroyed(
          this.destroyRef
        )
      )

      .subscribe({

        next: response => {

          this.sales.set(
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

          this.loading.set(false);

        },

        error: error => {

          console.error(
            'Sales list error:',
            error
          );

          this.sales.set([]);

          this.error.set(
            error?.error?.message ??
            'Unable to load sales.'
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

  protected applyFilters(): void {

    this.page.set(1);

    this.loadSales();

  }

  protected resetFilters(): void {

    this.filterForm.reset({

      customer: '',

      warehouse: '',

      status: ''

    });

    this.page.set(1);

    this.loadSales();

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

    this.loadSales();

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

    this.loadSales();

  }

  /*
  |--------------------------------------------------------------------------
  | Actions
  |--------------------------------------------------------------------------
  */

  protected handleAction(
    event: {
      action: TableAction<Sale>;
      row: Sale;
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
          '/admin/sales',
          row._id
        ]);

        break;

      case 'confirm':

        this.openConfirmation(
          row,
          'confirm'
        );

        break;

      case 'cancel':

        this.openConfirmation(
          row,
          'cancel'
        );

        break;

    }

  }

  /*
  |--------------------------------------------------------------------------
  | Confirmation
  |--------------------------------------------------------------------------
  */

  private openConfirmation(
    sale: Sale,
    action:
      'confirm' |
      'cancel'
  ): void {

    this.confirmSale.set(
      sale
    );

    this.confirmAction.set(
      action
    );

    this.confirmOpen.set(
      true
    );

  }

  protected closeConfirmation(): void {

    if (
      this.actionLoading()
    ) {

      return;

    }

    this.confirmOpen.set(
      false
    );

    this.confirmSale.set(
      null
    );

    this.confirmAction.set(
      null
    );

  }

  protected confirmOperation(): void {

    const sale =
      this.confirmSale();

    const action =
      this.confirmAction();

    if (
      !sale ||
      !action
    ) {

      return;

    }

    this.actionLoading.set(
      true
    );

    let request$;

    switch (action) {

      case 'confirm':

        request$ =
          this.saleService
            .confirmSale(
              sale._id
            );

        break;

      case 'cancel':

        request$ =
          this.saleService
            .cancelSale(
              sale._id
            );

        break;

    }

    request$

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
            this.successMessage(
              action
            )
          );

          this.loadSales();

        },

        error: error => {

          console.error(
            'Sale operation error:',
            error
          );

          this.actionLoading.set(
            false
          );

          this.error.set(
            error?.error?.message ??
            'Unable to complete sale operation.'
          );

        }

      });

  }

  private successMessage(
    action:
      'confirm' |
      'cancel'
  ): string {

    switch (action) {

      case 'confirm':

        return 'Sale confirmed successfully.';

      case 'cancel':

        return 'Sale cancelled successfully.';

    }

  }

  /*
  |--------------------------------------------------------------------------
  | Confirmation UI
  |--------------------------------------------------------------------------
  */

  protected get confirmationTitle(): string {

    return this.confirmAction() ===
      'confirm'

      ? 'Confirm Sale?'

      : 'Cancel Sale?';

  }

  protected get confirmationMessage(): string {

    const sale =
      this.confirmSale();

    const number =
      sale
        ? `#${sale._id
            .slice(-6)
            .toUpperCase()}`
        : 'this sale';

    if (
      this.confirmAction() ===
      'confirm'
    ) {

      return `Confirm sale ${number}? The system will validate the available stock and remove the sold quantities from the selected warehouse.`;

    }

    return `Cancel sale ${number}? This action can only be performed while the sale is still in Draft status.`;

  }

  protected get confirmationText(): string {

    return this.confirmAction() ===
      'confirm'

      ? 'Confirm Sale'

      : 'Cancel Sale';

  }

  protected get confirmationVariant():
    'danger' |
    'primary' {

    return this.confirmAction() ===
      'cancel'

      ? 'danger'
      : 'primary';

  }

}
