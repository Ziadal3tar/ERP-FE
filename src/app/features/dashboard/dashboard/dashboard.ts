import {
  Component,
  DestroyRef,
  OnInit,
  inject,
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
  DashboardService
} from '../services/dashboard';


import {
  ReportService
} from '../../reports/services/report';


import {
  DashboardSummary,
  LowStockProduct,
  RecentSale,
  RecentPurchase
} from '../models/dashboard.model';


@Component({
  selector: 'app-dashboard',

  standalone: true,

  imports: [
    DecimalPipe,
    RouterLink
  ],

  templateUrl:
    './dashboard.html',

  styleUrl:
    './dashboard.scss'
})
export class Dashboard
  implements OnInit {


  /*
  |--------------------------------------------------------------------------
  | Services
  |--------------------------------------------------------------------------
  */

  private readonly dashboardService =
    inject(DashboardService);


  private readonly reportService =
    inject(ReportService);


  private readonly destroyRef =
    inject(DestroyRef);


  /*
  |--------------------------------------------------------------------------
  | Dashboard Summary
  |--------------------------------------------------------------------------
  */

  protected readonly summary =
    signal<DashboardSummary | null>(null);


  protected readonly summaryLoading =
    signal(true);


  protected readonly summaryError =
    signal('');


  /*
  |--------------------------------------------------------------------------
  | Low Stock
  |--------------------------------------------------------------------------
  */

  protected readonly lowStock =
    signal<LowStockProduct[]>([]);


  protected readonly lowStockLoading =
    signal(true);


  protected readonly lowStockError =
    signal('');


  protected readonly lowStockCount =
    signal(0);


  protected readonly outOfStockCount =
    signal(0);


  /*
  |--------------------------------------------------------------------------
  | Recent Sales
  |--------------------------------------------------------------------------
  */

  protected readonly recentSales =
    signal<RecentSale[]>([]);


  protected readonly recentSalesLoading =
    signal(true);


  /*
  |--------------------------------------------------------------------------
  | Recent Purchases
  |--------------------------------------------------------------------------
  */

  protected readonly recentPurchases =
    signal<RecentPurchase[]>([]);


  protected readonly recentPurchasesLoading =
    signal(true);


  /*
  |--------------------------------------------------------------------------
  | Lifecycle
  |--------------------------------------------------------------------------
  */

  ngOnInit(): void {

    this.loadDashboard();

  }


  /*
  |--------------------------------------------------------------------------
  | Load Dashboard
  |--------------------------------------------------------------------------
  */

  protected loadDashboard(): void {

    this.loadSummary();

    this.loadLowStock();

    this.loadRecentSales();

    this.loadRecentPurchases();

  }


  /*
  |--------------------------------------------------------------------------
  | Summary
  |--------------------------------------------------------------------------
  */

  private loadSummary(): void {

    this.summaryLoading.set(
      true
    );


    this.summaryError.set(
      ''
    );


    this.reportService

      .getDashboardSummary()

      .pipe(
        takeUntilDestroyed(
          this.destroyRef
        )
      )

      .subscribe({

        next: data => {

          this.summary.set(
            data
          );


          this.summaryLoading.set(
            false
          );

        },


        error: error => {

          console.error(
            'Dashboard summary error:',
            error
          );


          this.summaryError.set(
            error?.error?.message ??
            'Unable to load dashboard summary.'
          );


          this.summaryLoading.set(
            false
          );

        }

      });

  }


  /*
  |--------------------------------------------------------------------------
  | Low Stock
  |--------------------------------------------------------------------------
  */

  private loadLowStock(): void {

    this.lowStockLoading.set(
      true
    );


    this.lowStockError.set(
      ''
    );


    this.reportService

      .getLowStock()

      .pipe(
        takeUntilDestroyed(
          this.destroyRef
        )
      )

      .subscribe({

        next: data => {

          this.lowStock.set(
            data
          );


          this.calculateStockAlerts(
            data
          );


          this.lowStockLoading.set(
            false
          );

        },


        error: error => {

          console.error(
            'Dashboard low stock error:',
            error
          );


          this.lowStock.set([]);


          this.lowStockCount.set(
            0
          );


          this.outOfStockCount.set(
            0
          );


          this.lowStockError.set(
            error?.error?.message ??
            'Unable to load stock alerts.'
          );


          this.lowStockLoading.set(
            false
          );

        }

      });

  }


  /*
  |--------------------------------------------------------------------------
  | Recent Sales
  |--------------------------------------------------------------------------
  */

  private loadRecentSales(): void {

    this.recentSalesLoading.set(
      true
    );


    this.dashboardService

      .getRecentSales()

      .pipe(
        takeUntilDestroyed(
          this.destroyRef
        )
      )

      .subscribe({

        next: data => {

          this.recentSales.set(
            data
          );


          this.recentSalesLoading.set(
            false
          );

        },


        error: error => {

          console.error(
            'Recent sales error:',
            error
          );


          this.recentSales.set([]);


          this.recentSalesLoading.set(
            false
          );

        }

      });

  }


  /*
  |--------------------------------------------------------------------------
  | Recent Purchases
  |--------------------------------------------------------------------------
  */

  private loadRecentPurchases(): void {

    this.recentPurchasesLoading.set(
      true
    );


    this.dashboardService

      .getRecentPurchases()

      .pipe(
        takeUntilDestroyed(
          this.destroyRef
        )
      )

      .subscribe({

        next: data => {

          this.recentPurchases.set(
            data
          );


          this.recentPurchasesLoading.set(
            false
          );

        },


        error: error => {

          console.error(
            'Recent purchases error:',
            error
          );


          this.recentPurchases.set([]);


          this.recentPurchasesLoading.set(
            false
          );

        }

      });

  }


  /*
  |--------------------------------------------------------------------------
  | Stock Alerts
  |--------------------------------------------------------------------------
  */

  private calculateStockAlerts(
    items: LowStockProduct[]
  ): void {

    const outOfStock =
      items.filter(
        item =>
          Number(
            item.quantity ?? 0
          ) <= 0
      );


    const lowStock =
      items.filter(
        item =>
          Number(
            item.quantity ?? 0
          ) > 0
      );


    this.outOfStockCount.set(
      outOfStock.length
    );


    this.lowStockCount.set(
      lowStock.length
    );

  }


  /*
  |--------------------------------------------------------------------------
  | Refresh
  |--------------------------------------------------------------------------
  */

  protected refresh(): void {

    this.loadDashboard();

  }

}
