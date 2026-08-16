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
  RouterLink
} from '@angular/router';

import {
  takeUntilDestroyed
} from '@angular/core/rxjs-interop';

import {
  ReportService
} from '../../services/report';

import {
  LowStockItem
} from '../../models/report.model';

import {
  PageHeader
} from '../../../../shared/components/page-header/page-header';


@Component({
  selector: 'app-low-stock-report',

  standalone: true,

  imports: [
    DecimalPipe,
    RouterLink,
    PageHeader
  ],

  templateUrl:
    './low-stock-report.html',

  styleUrl:
    './low-stock-report.scss'
})
export class LowStockReport
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

  protected readonly items =
    signal<LowStockItem[]>([]);


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

      .getLowStock()

      .pipe(
        takeUntilDestroyed(
          this.destroyRef
        )
      )

      .subscribe({

        next: data => {

          this.items.set(
            data
          );

          this.loading.set(false);

        },

        error: error => {

          console.error(
            'Low stock report error:',
            error
          );

          this.items.set([]);

          this.error.set(
            error?.error?.message ??
            'Unable to load low stock report.'
          );

          this.loading.set(false);

        }

      });

  }


  /*
  |--------------------------------------------------------------------------
  | Statistics
  |--------------------------------------------------------------------------
  */

  protected get totalItems(): number {

    return this.items().length;

  }


  protected get totalMissingUnits(): number {

    return this.items()
      .reduce(
        (
          total,
          item
        ) => {

          const shortage =
            Math.max(
              item.product.minStock -
              item.quantity,
              0
            );

          return total + shortage;

        },

        0
      );

  }


  protected get criticalItems(): number {

    return this.items()
      .filter(
        item =>
          item.quantity <= 0
      )
      .length;

  }


  protected get warningItems(): number {

    return (
      this.totalItems -
      this.criticalItems
    );

  }


  protected shortage(
    item: LowStockItem
  ): number {

    return Math.max(
      item.product.minStock -
      item.quantity,
      0
    );

  }


  protected stockPercentage(
    item: LowStockItem
  ): number {

    if (
      item.product.minStock <= 0
    ) {

      return 0;

    }


    return Math.min(
      (
        item.quantity /
        item.product.minStock
      ) * 100,

      100
    );

  }

}
