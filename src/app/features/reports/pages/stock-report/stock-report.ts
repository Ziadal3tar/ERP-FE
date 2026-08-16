import {
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal
} from '@angular/core';

import {
  DecimalPipe
} from '@angular/common';

import {
  takeUntilDestroyed
} from '@angular/core/rxjs-interop';

import {
  ReportService
} from '../../services/report';

import {
  StockReportItem
} from '../../models/report.model';

import {
  PageHeader
} from '../../../../shared/components/page-header/page-header';

import {
  DataTable,
  TableColumn
} from '../../../../shared/components/data-table/data-table';


@Component({
  selector: 'app-stock-report',

  standalone: true,

  imports: [
    DecimalPipe,
    PageHeader,
    DataTable
  ],

  templateUrl:
    './stock-report.html',

  styleUrl:
    './stock-report.scss'
})
export class StockReport
  implements OnInit {

  private readonly reportService =
    inject(ReportService);

  private readonly destroyRef =
    inject(DestroyRef);


  /*
  |--------------------------------------------------------------------------
  | Data
  |--------------------------------------------------------------------------
  */

  protected readonly stock =
    signal<StockReportItem[]>([]);


  /*
  |--------------------------------------------------------------------------
  | State
  |--------------------------------------------------------------------------
  */

  protected readonly loading =
    signal(true);

  protected readonly error =
    signal('');


  /*
  |--------------------------------------------------------------------------
  | Columns
  |--------------------------------------------------------------------------
  */

  protected readonly columns:
    TableColumn<StockReportItem>[] = [

    {
      key: 'product.name',

      label: 'Product'
    },


    {
      key: 'product.sku',

      label: 'SKU',

      render: item =>
        item.product.sku || '—'
    },


    {
      key: 'warehouse.name',

      label: 'Warehouse'
    },


    {
      key: 'warehouse.code',

      label: 'Code'
    },


    {
      key: 'quantity',

      label: 'Quantity',

      render: item =>
        item.quantity.toLocaleString(
          'en-US',
          {
            maximumFractionDigits: 2
          }
        )
    },


    {
      key: 'product.minStock',

      label: 'Min Stock',

      render: item =>
        item.product.minStock.toLocaleString(
          'en-US',
          {
            maximumFractionDigits: 2
          }
        )
    },


    {
      key: 'isLowStock',

      label: 'Status',

      type: 'status',

      render: item =>
        item.isLowStock
          ? 'Low Stock'
          : 'Normal'

    }

  ];


  /*
  |--------------------------------------------------------------------------
  | Lifecycle
  |--------------------------------------------------------------------------
  */

  ngOnInit(): void {

    this.loadReport();

  }


  /*
  |--------------------------------------------------------------------------
  | Load
  |--------------------------------------------------------------------------
  */

  protected loadReport(): void {

    this.loading.set(true);

    this.error.set('');


    this.reportService

      .getStockReport()

      .pipe(
        takeUntilDestroyed(
          this.destroyRef
        )
      )

      .subscribe({

        next: data => {

          this.stock.set(
            data
          );

          this.loading.set(false);

        },

        error: error => {

          console.error(
            'Stock report error:',
            error
          );

          this.stock.set([]);

          this.error.set(
            error?.error?.message ??
            'Unable to load stock report.'
          );

          this.loading.set(false);

        }

      });

  }


  /*
  |--------------------------------------------------------------------------
  | Derived Statistics
  |--------------------------------------------------------------------------
  */

  protected get totalRecords(): number {

    return this.stock().length;

  }


  protected get totalQuantity(): number {

    return this.stock()
      .reduce(
        (
          total,
          item
        ) =>
          total +
          Number(item.quantity || 0),

        0
      );

  }


  protected get lowStockCount(): number {

    return this.stock()
      .filter(
        item =>
          item.isLowStock
      )
      .length;

  }


  protected get normalStockCount(): number {

    return (
      this.totalRecords -
      this.lowStockCount
    );

  }

}
