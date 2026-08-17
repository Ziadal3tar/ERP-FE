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
  RouterLink,
  Router
} from '@angular/router';

import {
  debounceTime,
  distinctUntilChanged,
  forkJoin,
  Subject
} from 'rxjs';

import {
  takeUntilDestroyed
} from '@angular/core/rxjs-interop';

import {
  StockService
} from '../../services/stock';

import {
  ProductService
} from '../../../products/services/product';

import {
  WarehouseService
} from '../../../warehouses/services/warehouse';

import {
  Stock
} from '../../models/stock.model';

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
  TableAction
} from '../../../../shared/components/data-table/data-table';

@Component({
  selector: 'app-stock-list',

  standalone: true,

  imports: [
    ReactiveFormsModule,
    RouterLink,
    PageHeader,
    DataTable,
    Pagination
  ],

  templateUrl: './stock-list.html',

  styleUrl: './stock-list.scss'
})
export class StockList
  implements OnInit {


  private readonly router =
    inject(Router);
  private readonly fb =
    inject(FormBuilder);

  private readonly stockService =
    inject(StockService);

  private readonly productService =
    inject(ProductService);

  private readonly warehouseService =
    inject(WarehouseService);

  private readonly destroyRef =
    inject(DestroyRef);



  protected readonly stocks =
    signal<Stock[]>([]);

  protected readonly products =
    signal<Product[]>([]);

  protected readonly warehouses =
    signal<Warehouse[]>([]);



  protected readonly loading =
    signal(false);

  protected readonly loadingFilters =
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



  private readonly searchSubject =
    new Subject<string>();

  protected readonly filterForm =
    this.fb.nonNullable.group({

      search: [''],

      product: [''],

      warehouse: [''],

      status: ['all']

    });



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
      label: 'Current Stock',
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
        this.getStockStatusLabel(stock)
    }

  ];
protected readonly actions:
  TableAction<Stock>[] = [

  {
    key: 'stock-in',
    label: 'Stock In',
    icon: 'bi-plus-lg',
    variant: 'success'
  },

  {
    key: 'stock-out',
    label: 'Stock Out',
    icon: 'bi-dash-lg',
    variant: 'danger'
  },

  {
    key: 'transfer',
    label: 'Transfer Stock',
    icon: 'bi-arrow-left-right',
    variant: 'primary'
  },

  {
    key: 'history',
    label: 'View Movements',
    icon: 'bi-clock-history'
  },

];


  ngOnInit(): void {

    this.loadFilters();

    this.setupSearch();

  }



  private loadFilters(): void {

    this.loadingFilters.set(true);

    forkJoin({

      products:
        this.productService
          .getProducts(
            1,
            100
          ),

      warehouses:
        this.warehouseService
          .getWarehouses(
            1,
            100
          )

    })

    .pipe(

      takeUntilDestroyed(
        this.destroyRef
      )

    )

    .subscribe({

      next: response => {

        this.products.set(
          response.products.data ?? []
        );

        this.warehouses.set(
          response.warehouses.data ?? []
        );

        this.loadingFilters.set(
          false
        );

        this.loadStock();

      },

      error: error => {

        console.error(
          'Stock filters error:',
          error
        );

        this.error.set(
          error?.error?.message ??
          'Unable to load products and warehouses.'
        );

        this.loadingFilters.set(
          false
        );

      }

    });

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

      .subscribe(() => {

        this.page.set(1);

        this.loadStock();

      });

  }

  protected onSearch(
    value: string
  ): void {

    this.searchSubject.next(
      value.trim()
    );

  }



  protected loadStock(): void {

    this.loading.set(true);

    this.error.set('');

    const {
      search,
      product,
      warehouse,
      status
    } =
      this.filterForm.getRawValue();

    /*
     * The current Stock API supports:
     * page + limit + product + warehouse.
     *
     * Search and status are handled on the
     * loaded result because the current API
     * does not expose search/status query params.
     */

    this.stockService

      .getStock(
        this.page(),
        this.limit(),
        product,
        warehouse
      )

      .pipe(

        takeUntilDestroyed(
          this.destroyRef
        )

      )

      .subscribe({

        next: response => {

          let data =
            response.data ?? [];



          if (search.trim()) {

            const value =
              search
                .trim()
                .toLowerCase();

            data =
              data.filter(
                stock => {

                  const productName =
                    stock.product?.name
                      ?.toLowerCase() ?? '';

                  const sku =
                    stock.product?.sku
                      ?.toLowerCase() ?? '';

                  return (
                    productName.includes(value) ||
                    sku.includes(value)
                  );

                }
              );

          }



          if (
            status !== 'all'
          ) {

            data =
              data.filter(
                stock =>
                  this.getStockStatus(stock) ===
                  status
              );

          }

          this.stocks.set(
            data
          );

          this.total.set(
            response.pagination?.total ??
            data.length
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
            'Stock list error:',
            error
          );

          this.error.set(
            error?.error?.message ??
            'Unable to load stock.'
          );

          this.stocks.set([]);

          this.loading.set(false);

        }

      });

  }



  protected applyFilters(): void {

    this.page.set(1);

    this.loadStock();

  }

  protected resetFilters(): void {

    this.filterForm.reset({

      search: '',

      product: '',

      warehouse: '',

      status: 'all'

    });

    this.page.set(1);

    this.loadStock();

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

    this.loadStock();

  }



  protected getStockStatus(
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

  protected getStockStatusLabel(
    stock: Stock
  ): string {

    switch (
      this.getStockStatus(stock)
    ) {

      case 'out':

        return 'Out of Stock';

      case 'low':

        return 'Low Stock';

      default:

        return 'Healthy';

    }

  }



  protected refresh(): void {

    if (
      this.loading()
    ) {

      return;

    }

    this.loadStock();

  }
protected handleTableAction(
  event: {
    action: TableAction<Stock>;
    row: Stock;
  }
): void {

  const {
    action,
    row
  } = event;

  const queryParams = {

    product: row.product._id,

    warehouse: row.warehouse._id

  };

  switch (action.key) {

    case 'stock-in':

      this.router.navigate(
        ['/admin/stock/in'],
        { queryParams }
      );

      break;

    case 'stock-out':

      this.router.navigate(
        ['/admin/stock/out'],
        { queryParams }
      );

      break;

    case 'transfer':

      this.router.navigate(
        ['/admin/stock/transfer'],
        { queryParams }
      );

      break;

    case 'history':

      this.router.navigate(
        ['/admin/stock/movements'],
        {
          queryParams: {
            product: row.product._id,
            warehouse: row.warehouse._id
          }
        }
      );

      break;

  }

}
}
