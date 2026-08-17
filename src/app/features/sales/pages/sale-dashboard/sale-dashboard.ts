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
  forkJoin
} from 'rxjs';

import {
  takeUntilDestroyed
} from '@angular/core/rxjs-interop';

import {
  Router,
  RouterLink
} from '@angular/router';

import {
  Sale,
  SaleStatus
} from '../../models/sale.model';

import {
  SaleService
} from '../../services/sale';

import {
  PageHeader
} from '../../../../shared/components/page-header/page-header';

@Component({
  selector: 'app-sales-dashboard',

  standalone: true,

  imports: [
    DecimalPipe,
    RouterLink,
    PageHeader
  ],

  templateUrl:
    './sale-dashboard.html',

  styleUrl:
    './sale-dashboard.scss'
})
export class SalesDashboard
  implements OnInit {

  private readonly saleService =
    inject(SaleService);

  private readonly router =
    inject(Router);

  private readonly destroyRef =
    inject(DestroyRef);



  protected readonly loading =
    signal(true);

  protected readonly error =
    signal('');



  protected readonly totalSales =
    signal(0);

  protected readonly draftSales =
    signal(0);

  protected readonly confirmedSales =
    signal(0);

  protected readonly cancelledSales =
    signal(0);



  protected readonly recentSales =
    signal<Sale[]>([]);



  protected get activeSales(): number {

    return (
      this.draftSales() +
      this.confirmedSales()
    );

  }

  protected get confirmationRate(): number {

    const total =
      this.totalSales();

    if (!total) {
      return 0;
    }

    return Math.round(
      (
        this.confirmedSales() /
        total
      ) * 100
    );

  }



  ngOnInit(): void {

    this.loadDashboard();

  }



  protected loadDashboard(): void {

    this.loading.set(true);

    this.error.set('');

    forkJoin({

      all:
        this.saleService.getSales(
          1,
          1
        ),

      draft:
        this.saleService.getSales(
          1,
          1,
          '',
          '',
          'Draft'
        ),

      confirmed:
        this.saleService.getSales(
          1,
          1,
          '',
          '',
          'Confirmed'
        ),

      cancelled:
        this.saleService.getSales(
          1,
          1,
          '',
          '',
          'Cancelled'
        ),

      recent:
        this.saleService.getSales(
          1,
          8
        )

    })

    .pipe(
      takeUntilDestroyed(
        this.destroyRef
      )
    )

    .subscribe({

      next: response => {

        this.totalSales.set(
          response.all.pagination?.total ?? 0
        );

        this.draftSales.set(
          response.draft.pagination?.total ?? 0
        );

        this.confirmedSales.set(
          response.confirmed.pagination?.total ?? 0
        );

        this.cancelledSales.set(
          response.cancelled.pagination?.total ?? 0
        );

        this.recentSales.set(
          response.recent.data ?? []
        );

        this.loading.set(false);

      },

      error: error => {

        console.error(
          'Sales dashboard error:',
          error
        );

        this.error.set(
          error?.error?.message ??
          'Unable to load sales dashboard.'
        );

        this.loading.set(false);

      }

    });

  }



  protected openSales(
    status?: SaleStatus
  ): void {

    if (!status) {

      this.router.navigate([
        '/admin/sales'
      ]);

      return;

    }

    this.router.navigate(
      ['/admin/sales'],
      {
        queryParams: {
          status
        }
      }
    );

  }

  protected saleNumber(
    sale: Sale
  ): string {

    return `#${sale._id
      .slice(-6)
      .toUpperCase()}`;

  }

  protected customerName(
    sale: Sale
  ): string {

    if (
      typeof sale.customer === 'string'
    ) {

      return sale.customer;

    }

    return sale.customer.name;

  }

  protected warehouseName(
    sale: Sale
  ): string {

    if (
      typeof sale.warehouse === 'string'
    ) {

      return sale.warehouse;

    }

    return sale.warehouse.name;

  }

  protected statusClass(
    status: SaleStatus
  ): string {

    return status.toLowerCase();

  }

}
