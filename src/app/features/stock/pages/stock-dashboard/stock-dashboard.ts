import {
  Component,
  inject,
  OnInit,
  signal
} from '@angular/core';

import {
  FormsModule
} from '@angular/forms';

import {
  DatePipe,
  DecimalPipe
} from '@angular/common';

import {
    RouterLink,
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  StockService
} from '../../services/stock';

import {
  Stock
} from '../../models/stock.model';

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
  StockOperationModal
} from '../../components/stock-operation-modal/stock-operation-modal';

@Component({
  selector: 'app-stock-dashboard',

  imports: [
    FormsModule,
    DatePipe,
    DecimalPipe,
    PageHeader,
    DataTable,
    Pagination,
    StockOperationModal,
    RouterLink
  ],

  templateUrl:
    './stock-dashboard.html',

  styleUrl:
    './stock-dashboard.scss'
})
export class StockDashboard implements OnInit {

  private readonly stockService =
    inject(StockService);

  private readonly productService =
    inject(ProductService);

  private readonly warehouseService =
    inject(WarehouseService);

  private readonly route =
    inject(ActivatedRoute);

  private readonly router =
    inject(Router);



  protected readonly stock =
    signal<Stock[]>([]);

  protected readonly products =
    signal<Product[]>([]);

  protected readonly warehouses =
    signal<Warehouse[]>([]);

  protected readonly loading =
    signal(true);

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
    signal(0);



  protected selectedProduct = '';

  protected selectedWarehouse = '';



  protected readonly operationModalOpen =
    signal(false);



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
      key: 'warehouse.name',
      label: 'Warehouse'
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
        this.stockStatusLabel(stock)
    },

    {
      key: 'updatedAt',
      label: 'Updated'
    }

  ];

  ngOnInit(): void {

    const product =
      this.route.snapshot.queryParamMap.get(
        'product'
      );

    const warehouse =
      this.route.snapshot.queryParamMap.get(
        'warehouse'
      );

    if (product) {

      this.selectedProduct =
        product;

    }

    if (warehouse) {

      this.selectedWarehouse =
        warehouse;

    }

    this.loadFilters();

    this.loadStock();

  }



  private loadFilters(): void {

    this.filtersLoading.set(true);

    let productsLoaded = false;

    let warehousesLoaded = false;

    this.productService
      .getProducts(
        1,
        100
      )
      .subscribe({

        next: response => {

          this.products.set(
            response.data
          );

          productsLoaded = true;

          this.finishFiltersLoading(
            productsLoaded,
            warehousesLoaded
          );

        },

        error: error => {

          console.error(
            'Products filter error:',
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
      .subscribe({

        next: response => {

          this.warehouses.set(
            response.data
          );

          warehousesLoaded = true;

          this.finishFiltersLoading(
            productsLoaded,
            warehousesLoaded
          );

        },

        error: error => {

          console.error(
            'Warehouses filter error:',
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

      this.filtersLoading.set(
        false
      );

    }

  }



  protected loadStock(): void {

    this.loading.set(true);

    this.error.set('');

    this.stockService
      .getStock(
        this.page(),
        this.limit(),
        this.selectedProduct,
        this.selectedWarehouse
      )
      .subscribe({

        next: response => {

          this.stock.set(
            response.data
          );

          this.total.set(
            response.pagination.total
          );

          this.totalPages.set(
            response.pagination.totalPages
          );

          this.loading.set(false);

        },

        error: error => {

          console.error(
            'Stock error:',
            error
          );

          this.error.set(
            error?.error?.message ||
            'Unable to load stock.'
          );

          this.loading.set(false);

        }

      });

  }



  protected applyFilters(): void {

    this.page.set(1);

    this.loadStock();

  }

  protected clearFilters(): void {

    this.selectedProduct = '';

    this.selectedWarehouse = '';

    this.page.set(1);

    this.loadStock();

  }



  protected changePage(
    page: number
  ): void {

    this.page.set(page);

    this.loadStock();

  }

  /*
  |--------------------------------------------------------------------------
  | Statistics
  |--------------------------------------------------------------------------
  |
  | These statistics are for the currently loaded page.
  | The Backend does not currently expose a global summary endpoint.
  |
  */

  protected get totalQuantity(): number {

    return this.stock()
      .reduce(
        (total, stock) =>
          total + stock.quantity,
        0
      );

  }

  protected get healthyStockCount(): number {

    return this.stock()
      .filter(
        stock =>
          this.stockStatus(stock) === 'healthy'
      )
      .length;

  }

  protected get lowStockCount(): number {

    return this.stock()
      .filter(
        stock =>
          this.stockStatus(stock) === 'low'
      )
      .length;

  }

  protected get outOfStockCount(): number {

    return this.stock()
      .filter(
        stock =>
          this.stockStatus(stock) === 'out'
      )
      .length;

  }



  protected stockStatus(
    stock: Stock
  ): 'healthy' | 'low' | 'out' {

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

  protected stockStatusLabel(
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



  protected openOperation(): void {

    this.operationModalOpen.set(
      true
    );

  }

  protected closeOperation(): void {

    this.operationModalOpen.set(
      false
    );

  }

  protected operationCompleted(): void {

    this.operationModalOpen.set(
      false
    );

    this.loadStock();

  }



  protected openMovements(): void {

    this.router.navigate([
      '/admin/stock/movements'
    ]);

  }



  protected refresh(): void {

    this.loadStock();

  }

}
