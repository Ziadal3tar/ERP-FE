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
  Invoice,
  InvoiceStatus
} from '../../models/invoice.model';

import {
  InvoiceService
} from '../../services/invoice';

import {
  PageHeader
} from '../../../../shared/components/page-header/page-header';

@Component({
  selector: 'app-invoice-dashboard',

  standalone: true,

  imports: [
    DecimalPipe,
    RouterLink,
    PageHeader
  ],

  templateUrl:
    './invoice-dashboard.html',

  styleUrl:
    './invoice-dashboard.scss'
})
export class InvoiceDashboard
  implements OnInit {

  private readonly invoiceService =
    inject(InvoiceService);

  private readonly router =
    inject(Router);

  private readonly destroyRef =
    inject(DestroyRef);

  protected readonly loading =
    signal(true);

  protected readonly error =
    signal('');

  protected readonly totalInvoices =
    signal(0);

  protected readonly unpaidInvoices =
    signal(0);

  protected readonly partiallyPaidInvoices =
    signal(0);

  protected readonly paidInvoices =
    signal(0);

  protected readonly cancelledInvoices =
    signal(0);

  protected readonly recentInvoices =
    signal<Invoice[]>([]);

  protected get activeInvoices(): number {

    return (
      this.unpaidInvoices() +
      this.partiallyPaidInvoices()
    );

  }

  protected get paidRate(): number {

    const total =
      this.totalInvoices();

    if (!total) {
      return 0;
    }

    return Math.round(
      (
        this.paidInvoices() /
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
        this.invoiceService.getInvoices(
          1,
          1
        ),

      unpaid:
        this.invoiceService.getInvoices(
          1,
          1,
          '',
          'Unpaid'
        ),

      partiallyPaid:
        this.invoiceService.getInvoices(
          1,
          1,
          '',
          'PartiallyPaid'
        ),

      paid:
        this.invoiceService.getInvoices(
          1,
          1,
          '',
          'Paid'
        ),

      cancelled:
        this.invoiceService.getInvoices(
          1,
          1,
          '',
          'Cancelled'
        ),

      recent:
        this.invoiceService.getInvoices(
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

        this.totalInvoices.set(
          response.all.pagination?.total ?? 0
        );

        this.unpaidInvoices.set(
          response.unpaid.pagination?.total ?? 0
        );

        this.partiallyPaidInvoices.set(
          response.partiallyPaid.pagination?.total ?? 0
        );

        this.paidInvoices.set(
          response.paid.pagination?.total ?? 0
        );

        this.cancelledInvoices.set(
          response.cancelled.pagination?.total ?? 0
        );

        this.recentInvoices.set(
          response.recent.data ?? []
        );

        this.loading.set(false);

      },

      error: error => {

        console.error(
          'Invoice dashboard error:',
          error
        );

        this.error.set(
          error?.error?.message ??
          'Unable to load invoice dashboard.'
        );

        this.loading.set(false);

      }

    });

  }

  protected openInvoices(
    status?: InvoiceStatus
  ): void {

    if (!status) {

      this.router.navigate([
        '/admin/invoices'
      ]);

      return;

    }

    this.router.navigate(
      ['/admin/invoices'],
      {
        queryParams: {
          status
        }
      }
    );

  }

  protected invoiceCustomerName(
    invoice: Invoice
  ): string {

    if (
      typeof invoice.customer === 'string'
    ) {

      return invoice.customer;

    }

    return invoice.customer.name;

  }

  protected statusClass(
    status: InvoiceStatus
  ): string {

    switch (status) {

      case 'Paid':
        return 'paid';

      case 'PartiallyPaid':
        return 'partially-paid';

      case 'Cancelled':
        return 'cancelled';

      default:
        return 'unpaid';

    }

  }

}
