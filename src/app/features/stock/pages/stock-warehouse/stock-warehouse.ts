import {
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal
} from '@angular/core';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  takeUntilDestroyed
} from '@angular/core/rxjs-interop';

import {
  WarehouseService
} from '../../../warehouses/services/warehouse';

import {
  Warehouse
} from '../../../warehouses/models/warehouse.model';

import {
  Stock
} from '../../models/stock.model';

import {
  StockService
} from '../../services/stock';

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
import {
  DecimalPipe
} from '@angular/common';
@Component({
  selector: 'app-stock-warehouse',

  standalone: true,

  imports: [
    PageHeader,
    DataTable,
    Pagination,
    DecimalPipe
  ],

  templateUrl: './stock-warehouse.html',

  styleUrl: './stock-warehouse.scss'
})
export class StockWarehouse
  implements OnInit {

  private readonly stockService =
    inject(StockService);

  private readonly warehouseService =
    inject(WarehouseService);

  private readonly route =
    inject(ActivatedRoute);

  private readonly router =
    inject(Router);

  private readonly destroyRef =
    inject(DestroyRef);

  protected readonly warehouses =
    signal<Warehouse[]>([]);

  protected readonly stocks =
    signal<Stock[]>([]);

  protected readonly selectedWarehouse =
    signal<Warehouse | null>(null);

  protected readonly loading =
    signal(true);

  protected readonly loadingWarehouses =
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

  protected readonly columns:
    TableColumn<Stock>[] = [

    {
      key: 'product.name',
      label: 'Product'
    },

    {
      key: 'product.sku',
      label: 'SKU'
    },

    {
      key: 'quantity',
      label: 'Quantity',
      type: 'number'
    },

    {
      key: 'product.minStock',
      label: 'Minimum',
      type: 'number'
    },

    {
      key: 'status',
      label: 'Status',

      type: 'status',

      render: stock =>
        this.statusLabel(stock)
    }

  ];

  ngOnInit(): void {

    const warehouseId =
      this.route.snapshot.queryParamMap.get(
        'warehouse'
      );

    this.loadWarehouses(
      warehouseId
    );

  }

  private loadWarehouses(
    warehouseId: string | null
  ): void {

    this.loadingWarehouses.set(true);

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

          const warehouses =
            response.data ?? [];

          this.warehouses.set(
            warehouses
          );

          const selected =
            warehouseId
              ? warehouses.find(
                  warehouse =>
                    warehouse._id === warehouseId
                )
              : warehouses[0];

          if (selected) {

            this.selectedWarehouse.set(
              selected
            );

            this.loadStock(
              selected._id
            );

          } else {

            this.loading.set(false);

          }

          this.loadingWarehouses.set(
            false
          );

        },

        error: error => {

          console.error(
            'Warehouse loading error:',
            error
          );

          this.error.set(
            error?.error?.message ??
            'Unable to load warehouses.'
          );

          this.loadingWarehouses.set(
            false
          );

          this.loading.set(false);

        }

      });

  }

  protected selectWarehouse(
    warehouse: Warehouse
  ): void {

    if (
      warehouse._id ===
      this.selectedWarehouse()?._id
    ) {

      return;

    }

    this.selectedWarehouse.set(
      warehouse
    );

    this.page.set(1);

    this.router.navigate(
      [],
      {
        relativeTo:
          this.route,

        queryParams: {
          warehouse:
            warehouse._id
        },

        queryParamsHandling:
          'merge'
      }
    );

    this.loadStock(
      warehouse._id
    );

  }

  private loadStock(
    warehouseId: string
  ): void {

    this.loading.set(true);

    this.error.set('');

    this.stockService
      .getStock(
        this.page(),
        this.limit(),
        '',
        warehouseId
      )

      .pipe(
        takeUntilDestroyed(
          this.destroyRef
        )
      )

      .subscribe({

        next: response => {

          this.stocks.set(
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
            'Warehouse stock error:',
            error
          );

          this.error.set(
            error?.error?.message ??
            'Unable to load warehouse stock.'
          );

          this.stocks.set([]);

          this.loading.set(false);

        }

      });

  }

  protected changePage(
    page: number
  ): void {

    const warehouse =
      this.selectedWarehouse();

    if (!warehouse) {
      return;
    }

    this.page.set(page);

    this.loadStock(
      warehouse._id
    );

  }

  protected stockStatus(
    stock: Stock
  ):
    'healthy' |
    'low' |
    'out' {

    if (
      stock.quantity === 0
    ) {

      return 'out';

    }

    if (
      stock.quantity <=
      stock.product.minStock
    ) {

      return 'low';

    }

    return 'healthy';

  }

  protected statusLabel(
    stock: Stock
  ): string {

    switch (
      this.stockStatus(stock)
    ) {

      case 'out':
        return 'Out of Stock';

      case 'low':
        return 'Low Stock';

      default:
        return 'Healthy';

    }

  }

  protected get totalQuantity(): number {

    return this.stocks()
      .reduce(
        (total, stock) =>
          total + stock.quantity,
        0
      );

  }

  protected get lowStockCount(): number {

    return this.stocks()
      .filter(
        stock =>
          this.stockStatus(stock) === 'low'
      )
      .length;

  }

  protected get outOfStockCount(): number {

    return this.stocks()
      .filter(
        stock =>
          this.stockStatus(stock) === 'out'
      )
      .length;

  }

  protected back(): void {

    this.router.navigate([
      '/admin/stock'
    ]);

  }

}
