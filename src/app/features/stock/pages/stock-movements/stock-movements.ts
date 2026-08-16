import {
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal
} from '@angular/core';

import {
  FormsModule
} from '@angular/forms';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  takeUntilDestroyed
} from '@angular/core/rxjs-interop';

import {
  ProductService
} from '../../../products/services/product';

import {
  WarehouseService
} from '../../../warehouses/services/warehouse';

import {
  Product
} from '../../../products/models/product.model';

import {
  Warehouse
} from '../../../warehouses/models/warehouse.model';

import {
  StockService
} from '../../services/stock';

import {
  StockTransaction,
  StockTransactionType
} from '../../models/stock.model';

import {
  PageHeader
} from '../../../../shared/components/page-header/page-header';

import {
  DataTable,
  TableColumn
} from '../../../../shared/components/data-table/data-table';

import {
  Pagination
} from '../../../../shared/components/pagination/pagination';

@Component({
  selector: 'app-stock-movements',

  standalone: true,

  imports: [
    FormsModule,
    PageHeader,
    DataTable,
    Pagination
  ],

  templateUrl:
    './stock-movements.html',

  styleUrl:
    './stock-movements.scss'
})
export class StockMovements
  implements OnInit {

  private readonly stockService =
    inject(StockService);

  private readonly productService =
    inject(ProductService);

  private readonly warehouseService =
    inject(WarehouseService);

  private readonly destroyRef =
    inject(DestroyRef);

  private readonly router =
    inject(Router);
  private readonly route =
    inject(ActivatedRoute);
  /*
  |--------------------------------------------------------------------------
  | Data
  |--------------------------------------------------------------------------
  */

  protected readonly transactions =
    signal<StockTransaction[]>([]);

  protected readonly products =
    signal<Product[]>([]);

  protected readonly warehouses =
    signal<Warehouse[]>([]);

  /*
  |--------------------------------------------------------------------------
  | State
  |--------------------------------------------------------------------------
  */

  protected readonly loading =
    signal(false);

  protected readonly loadingFilters =
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

  protected selectedProduct = '';

  protected selectedWarehouse = '';

  protected selectedType:
    StockTransactionType | '' = '';

  protected readonly movementTypes:
    {
      value: StockTransactionType;
      label: string;
    }[] = [

    {
      value: 'IN',
      label: 'Stock In'
    },

    {
      value: 'OUT',
      label: 'Stock Out'
    },

    {
      value: 'ADJUSTMENT',
      label: 'Adjustment'
    },

    {
      value: 'TRANSFER_IN',
      label: 'Transfer In'
    },

    {
      value: 'TRANSFER_OUT',
      label: 'Transfer Out'
    }

  ];

  /*
  |--------------------------------------------------------------------------
  | Table Columns
  |--------------------------------------------------------------------------
  */

  protected readonly columns:
    TableColumn<StockTransaction>[] = [

    {
      key: 'product.name',
      label: 'Product'
    },

    {
      key: 'product.sku',
      label: 'SKU'
    },

    {
      key: 'warehouse.name',
      label: 'Warehouse'
    },

    {
      key: 'type',
      label: 'Movement',

      type: 'status',

      render: transaction =>
        this.getMovementLabel(
          transaction.type
        )
    },

    {
      key: 'quantity',
      label: 'Quantity',
      type: 'number',

      render: transaction =>
        this.getSignedQuantity(
          transaction
        )
    },

    {
      key: 'reference',
      label: 'Reference'
    },

    {
      key: 'createdBy.name',
      label: 'Created By'
    },

    {
      key: 'createdAt',
      label: 'Date',
      type: 'date'
    }

  ];

  ngOnInit(): void {
 this.route.queryParams.subscribe(params => {
    const product = params['product'];
    const warehouse = params['warehouse'];

    this.selectedProduct = product
    this.selectedWarehouse = warehouse
    this.applyFilters
  })
    this.loadFilters();

    this.loadMovements();

  }

  /*
  |--------------------------------------------------------------------------
  | Load Filters
  |--------------------------------------------------------------------------
  */

  private loadFilters(): void {

    this.loadingFilters.set(
      true
    );

    let productsLoaded = false;

    let warehousesLoaded = false;

    this.productService
      .getProducts(
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

          this.products.set(
            response.data ?? []
          );

          productsLoaded = true;

          this.finishFiltersLoading(
            productsLoaded,
            warehousesLoaded
          );

        },

        error: error => {

          console.error(
            'Movement products error:',
            error
          );

          productsLoaded = true;

          this.finishFiltersLoading(
            productsLoaded,
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

          this.finishFiltersLoading(
            productsLoaded,
            warehousesLoaded
          );

        },

        error: error => {

          console.error(
            'Movement warehouses error:',
            error
          );

          warehousesLoaded = true;

          this.finishFiltersLoading(
            productsLoaded,
            warehousesLoaded
          );

        }

      });

  }

  private finishFiltersLoading(
    productsLoaded: boolean,
    warehousesLoaded: boolean
  ): void {

    if (
      productsLoaded &&
      warehousesLoaded
    ) {

      this.loadingFilters.set(
        false
      );

    }

  }

  /*
  |--------------------------------------------------------------------------
  | Load Movements
  |--------------------------------------------------------------------------
  */

  protected loadMovements(): void {

    this.loading.set(true);

    this.error.set('');

    this.stockService

      .getStockHistory(
        this.page(),
        this.limit(),
        this.selectedProduct,
        this.selectedWarehouse,
        this.selectedType
      )

      .pipe(
        takeUntilDestroyed(
          this.destroyRef
        )
      )

      .subscribe({

        next: response => {

          this.transactions.set(
            response.data ?? []
          );

          this.total.set(
            response.pagination?.total ??
            response.data?.length ??
            0
          );

          this.totalPages.set(
            response.pagination?.totalPages ??
            Math.max(
              1,
              Math.ceil(
                this.total() /
                this.limit()
              )
            )
          );

          this.loading.set(false);

        },

        error: error => {

          console.error(
            'Stock movements error:',
            error
          );

          this.error.set(
            error?.error?.message ??
            'Unable to load stock movements.'
          );

          this.transactions.set([]);

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

    this.loadMovements();

  }

  protected resetFilters(): void {

    this.selectedProduct = '';

    this.selectedWarehouse = '';

    this.selectedType = '';

    this.page.set(1);

    this.loadMovements();

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

    this.loadMovements();

  }

  /*
  |--------------------------------------------------------------------------
  | Movement Helpers
  |--------------------------------------------------------------------------
  */

  protected getMovementLabel(
    type: StockTransactionType
  ): string {

    switch (type) {

      case 'IN':
        return 'Stock In';

      case 'OUT':
        return 'Stock Out';

      case 'ADJUSTMENT':
        return 'Adjustment';

      case 'TRANSFER_IN':
        return 'Transfer In';

      case 'TRANSFER_OUT':
        return 'Transfer Out';

      default:
        return type;

    }

  }

  protected getSignedQuantity(
    transaction: StockTransaction
  ): string {

    const quantity =
      transaction.quantity
        .toLocaleString('en-US');

    if (
      transaction.type === 'OUT' ||
      transaction.type === 'TRANSFER_OUT'
    ) {

      return `-${quantity}`;

    }

    if (
      transaction.type === 'IN' ||
      transaction.type === 'TRANSFER_IN'
    ) {

      return `+${quantity}`;

    }

    return quantity;

  }

  /*
  |--------------------------------------------------------------------------
  | Navigation
  |--------------------------------------------------------------------------
  */

  protected back(): void {

    this.router.navigate([
      '/admin/stock'
    ]);

  }

  protected refresh(): void {

    if (
      this.loading()
    ) {

      return;

    }

    this.loadMovements();

  }

}
