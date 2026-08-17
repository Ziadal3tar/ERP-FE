import {
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal
} from '@angular/core';

import {
  ReactiveFormsModule,
  FormBuilder
} from '@angular/forms';

import {
  Router,
  RouterLink
} from '@angular/router';

import {
  takeUntilDestroyed
} from '@angular/core/rxjs-interop';

import {
  SupplierService
} from '../../../suppliers/services/supplier';

import {
  WarehouseService
} from '../../../warehouses/services/warehouse';

import {
  PurchaseService
} from '../../services/purchase';

import {
  Purchase,
  PurchaseStatus
} from '../../models/purchase.model';

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
  selector: 'app-purchase-list',

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
    './purchase-list.html',

  styleUrl:
    './purchase-list.scss'
})
export class PurchaseList
  implements OnInit {

  private readonly fb =
    inject(FormBuilder);

  private readonly purchaseService =
    inject(PurchaseService);

  private readonly supplierService =
    inject(SupplierService);

  private readonly warehouseService =
    inject(WarehouseService);

  private readonly router =
    inject(Router);

  private readonly toast =
    inject(ToastService);

  private readonly destroyRef =
    inject(DestroyRef);



  protected readonly purchases =
    signal<Purchase[]>([]);

  protected readonly suppliers =
    signal<any[]>([]);

  protected readonly warehouses =
    signal<any[]>([]);



  protected readonly loading =
    signal(false);

  protected readonly filtersLoading =
    signal(true);

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



  protected readonly filterForm =
    this.fb.nonNullable.group({

      supplier: [''],

      warehouse: [''],

      status:
        ['' as PurchaseStatus | '']

    });



  protected readonly confirmOpen =
    signal(false);

  protected readonly actionLoading =
    signal(false);

  protected readonly confirmPurchase =
    signal<Purchase | null>(null);

  protected readonly confirmAction =
    signal<
      'confirm' |
      'receive' |
      'cancel' |
      null
    >(null);



  protected readonly columns:
    TableColumn<Purchase>[] = [

    {
      key: '_id',
      label: 'Purchase',

      render: purchase =>
        `#${purchase._id.slice(-6).toUpperCase()}`
    },

    {
      key: 'supplier.name',
      label: 'Supplier'
    },

    {
      key: 'warehouse.name',
      label: 'Warehouse'
    },

    {
      key: 'items',
      label: 'Items',

      render: purchase =>
        String(
          purchase.items.length
        )
    },

    {
      key: 'total',
      label: 'Total',

      type: 'number',

      render: purchase =>
        purchase.total.toLocaleString(
          'en-US',
          {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          }
        )
    },

    {
      key: 'status',
      label: 'Status',

      type: 'status',

      render: purchase =>
        purchase.status
    },

    {
      key: 'createdAt',
      label: 'Date',

      type: 'date'
    }

  ];

  protected readonly actions:
    TableAction<Purchase>[] = [

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

      show: purchase =>
        purchase.status === 'Draft'
    },

    {
      key: 'receive',

      label: 'Receive',

      icon: 'bi-box-arrow-in-down',

      variant: 'success',

      show: purchase =>
        purchase.status === 'Confirmed'
    },

    {
      key: 'cancel',

      label: 'Cancel',

      icon: 'bi-x-circle',

      variant: 'danger',

      show: purchase =>
        purchase.status === 'Draft' ||
        purchase.status === 'Confirmed'
    }

  ];

  ngOnInit(): void {

    this.loadFilters();

    this.loadPurchases();

  }



  private loadFilters(): void {

    this.filtersLoading.set(true);

    let suppliersLoaded = false;

    let warehousesLoaded = false;

    this.supplierService
      .getSuppliers(
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

          this.suppliers.set(
            response.data ?? []
          );

          suppliersLoaded = true;

          this.finishFilterLoading(
            suppliersLoaded,
            warehousesLoaded
          );

        },

        error: error => {

          console.error(
            'Suppliers filter error:',
            error
          );

          suppliersLoaded = true;

          this.finishFilterLoading(
            suppliersLoaded,
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
            suppliersLoaded,
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
            suppliersLoaded,
            warehousesLoaded
          );

        }

      });

  }

  private finishFilterLoading(
    suppliersLoaded: boolean,
    warehousesLoaded: boolean
  ): void {

    if (
      suppliersLoaded &&
      warehousesLoaded
    ) {

      this.filtersLoading.set(
        false
      );

    }

  }

  protected loadPurchases(): void {

    this.loading.set(true);

    this.error.set('');

    const {
      supplier,
      warehouse,
      status
    } =
      this.filterForm.getRawValue();

    this.purchaseService
      .getPurchases(
        this.page(),
        this.limit(),
        supplier,
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

          this.purchases.set(
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
            'Purchase list error:',
            error
          );

          this.purchases.set([]);

          this.error.set(
            error?.error?.message ??
            'Unable to load purchases.'
          );

          this.loading.set(false);

        }

      });

  }

  protected applyFilters(): void {

    this.page.set(1);

    this.loadPurchases();

  }

  protected resetFilters(): void {

    this.filterForm.reset({

      supplier: '',

      warehouse: '',

      status: ''

    });

    this.page.set(1);

    this.loadPurchases();

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

    this.loadPurchases();

  }

  protected refresh(): void {

    if (
      this.loading()
    ) {

      return;

    }

    this.loadPurchases();

  }



  protected handleAction(
    event: {
      action: TableAction<Purchase>;
      row: Purchase;
    }
  ): void {

    const {
      action,
      row
    } = event;

    if (
      action.key === 'view'
    ) {

      this.router.navigate([
        '/admin/purchases',
        row._id
      ]);

      return;

    }

    if (
      action.key === 'confirm'
    ) {

      this.openConfirmation(
        row,
        'confirm'
      );

      return;

    }

    if (
      action.key === 'receive'
    ) {

      this.openConfirmation(
        row,
        'receive'
      );

      return;

    }

    if (
      action.key === 'cancel'
    ) {

      this.openConfirmation(
        row,
        'cancel'
      );

    }

  }



  private openConfirmation(
    purchase: Purchase,
    action:
      'confirm' |
      'receive' |
      'cancel'
  ): void {

    this.confirmPurchase.set(
      purchase
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

    this.confirmOpen.set(false);

    this.confirmPurchase.set(null);

    this.confirmAction.set(null);

  }

  protected confirmOperation(): void {

    const purchase =
      this.confirmPurchase();

    const action =
      this.confirmAction();

    if (
      !purchase ||
      !action
    ) {

      return;

    }

    this.actionLoading.set(true);

    let request$;

    switch (action) {

      case 'confirm':

        request$ =
          this.purchaseService
            .confirmPurchase(
              purchase._id
            );

        break;

      case 'receive':

        request$ =
          this.purchaseService
            .receivePurchase(
              purchase._id
            );

        break;

      case 'cancel':

        request$ =
          this.purchaseService
            .cancelPurchase(
              purchase._id
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
            this.successMessage(action)
          );

          this.loadPurchases();

        },

        error: error => {

          console.error(
            'Purchase action error:',
            error
          );

          this.actionLoading.set(
            false
          );

          this.error.set(
            error?.error?.message ??
            'Unable to complete purchase action.'
          );

        }

      });

  }

  private successMessage(
    action:
      'confirm' |
      'receive' |
      'cancel'
  ): string {

    switch (action) {

      case 'confirm':

        return 'Purchase confirmed successfully.';

      case 'receive':

        return 'Purchase received successfully.';

      case 'cancel':

        return 'Purchase cancelled successfully.';

    }

  }



  protected get confirmationTitle():
    string {

    switch (
      this.confirmAction()
    ) {

      case 'confirm':

        return 'Confirm Purchase?';

      case 'receive':

        return 'Receive Purchase?';

      case 'cancel':

        return 'Cancel Purchase?';

      default:

        return 'Confirm Action?';

    }

  }

  protected get confirmationMessage():
    string {

    const purchase =
      this.confirmPurchase();

    const number =
      purchase
        ? `#${purchase._id
            .slice(-6)
            .toUpperCase()}`
        : 'this purchase';

    switch (
      this.confirmAction()
    ) {

      case 'confirm':

        return `Confirm purchase ${number}? Once confirmed, it can be received into stock.`;

      case 'receive':

        return `Receive purchase ${number}? This will add all purchase quantities to the selected warehouse stock.`;

      case 'cancel':

        return `Cancel purchase ${number}? This action cannot be applied to a received purchase.`;

      default:

        return 'Are you sure you want to continue?';

    }

  }

  protected get confirmationText():
    string {

    switch (
      this.confirmAction()
    ) {

      case 'confirm':

        return 'Confirm Purchase';

      case 'receive':

        return 'Receive Purchase';

      case 'cancel':

        return 'Cancel Purchase';

      default:

        return 'Confirm';

    }

  }

  protected get confirmationVariant():
    | 'danger'
    | 'warning'
    | 'primary'
    | 'success' {

    switch (
      this.confirmAction()
    ) {

      case 'receive':

        return 'success';

      case 'cancel':

        return 'danger';

      default:

        return 'primary';

    }

  }

}
