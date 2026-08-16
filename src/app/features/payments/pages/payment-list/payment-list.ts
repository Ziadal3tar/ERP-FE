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
  Router,
  RouterLink
} from '@angular/router';

import {
  takeUntilDestroyed
} from '@angular/core/rxjs-interop';

import {
  CustomerService
} from '../../../customers/services/customer';

import {
  InvoiceService
} from '../../../invoices/services/invoice';

import {
  PaymentService
} from '../../services/payment';

import {
  Payment
} from '../../models/payment.model';

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

@Component({
  selector: 'app-payment-list',

  standalone: true,

  imports: [
    ReactiveFormsModule,
    RouterLink,
    PageHeader,
    DataTable,
    Pagination
  ],

  templateUrl:
    './payment-list.html',

  styleUrl:
    './payment-list.scss'
})
export class PaymentList
  implements OnInit {

  private readonly fb =
    inject(FormBuilder);

  private readonly paymentService =
    inject(PaymentService);

  private readonly customerService =
    inject(CustomerService);

  private readonly invoiceService =
    inject(InvoiceService);

  private readonly router =
    inject(Router);

  private readonly destroyRef =
    inject(DestroyRef);

  protected readonly payments =
    signal<Payment[]>([]);

  protected readonly customers =
    signal<any[]>([]);

  protected readonly invoices =
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

      invoice: [''],

      customer: ['']

    });

  protected readonly columns:
    TableColumn<Payment>[] = [

    {
      key: '_id',

      label: 'Payment',

      render: payment =>
        `#${payment._id
          .slice(-6)
          .toUpperCase()}`
    },

    {
      key: 'invoice',

      label: 'Invoice',

      render: payment => {

        if (
          typeof payment.invoice === 'string'
        ) {

          return `#${payment.invoice
            .slice(-6)
            .toUpperCase()}`;

        }

        return payment.invoice.invoiceNumber;

      }
    },

    {
      key: 'customer.name',

      label: 'Customer'
    },

    {
      key: 'amount',

      label: 'Amount',

      render: payment =>
        payment.amount.toLocaleString(
          'en-US',
          {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          }
        )
    },

    {
      key: 'method',

      label: 'Method'
    },

    {
      key: 'reference',

      label: 'Reference',

      render: payment =>
        payment.reference || '—'
    },

    {
      key: 'paymentDate',

      label: 'Payment Date',

      type: 'date'
    }

  ];

  protected readonly actions:
    TableAction<Payment>[] = [

    {
      key: 'view',

      label: 'View',

      icon: 'bi-eye',

      variant: 'default'
    }

  ];

  ngOnInit(): void {

    this.loadFilters();

    this.loadPayments();

  }

  private loadFilters(): void {

    let customersLoaded = false;

    let invoicesLoaded = false;

    this.customerService

      .getCustomers(
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

          this.customers.set(
            response.data ?? []
          );

          customersLoaded = true;

          this.finishFilters(
            customersLoaded,
            invoicesLoaded
          );

        },

        error: error => {

          console.error(
            'Payment customer filter error:',
            error
          );

          customersLoaded = true;

          this.finishFilters(
            customersLoaded,
            invoicesLoaded
          );

        }

      });

    this.invoiceService

      .getInvoices(
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

          this.invoices.set(
            response.data ?? []
          );

          invoicesLoaded = true;

          this.finishFilters(
            customersLoaded,
            invoicesLoaded
          );

        },

        error: error => {

          console.error(
            'Payment invoice filter error:',
            error
          );

          invoicesLoaded = true;

          this.finishFilters(
            customersLoaded,
            invoicesLoaded
          );

        }

      });

  }

  private finishFilters(
    customersLoaded: boolean,
    invoicesLoaded: boolean
  ): void {

    if (
      customersLoaded &&
      invoicesLoaded
    ) {

      this.filtersLoading.set(
        false
      );

    }

  }

  protected loadPayments(): void {

    this.loading.set(true);

    this.error.set('');

    const {
      invoice,
      customer
    } =
      this.filterForm.getRawValue();

    this.paymentService

      .getPayments(
        this.page(),
        this.limit(),
        invoice,
        customer
      )

      .pipe(
        takeUntilDestroyed(
          this.destroyRef
        )
      )

      .subscribe({

        next: response => {

          this.payments.set(
            response.data ?? []
          );

          this.total.set(
            response.pagination?.total ??
            0
          );

          this.totalPages.set(
            response.pagination?.totalPages ??
            1
          );

          this.loading.set(false);

        },

        error: error => {

          console.error(
            'Payment list error:',
            error
          );

          this.payments.set([]);

          this.error.set(
            error?.error?.message ??
            'Unable to load payments.'
          );

          this.loading.set(false);

        }

      });

  }

  protected applyFilters(): void {

    this.page.set(1);

    this.loadPayments();

  }

  protected resetFilters(): void {

    this.filterForm.reset({

      invoice: '',

      customer: ''

    });

    this.page.set(1);

    this.loadPayments();

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

    this.loadPayments();

  }

  protected refresh(): void {

    if (
      this.loading()
    ) {

      return;

    }

    this.loadPayments();

  }

  protected handleAction(
    event: {
      action: TableAction<Payment>;
      row: Payment;
    }
  ): void {

    if (
      event.action.key === 'view'
    ) {

      this.router.navigate([
        '/admin/payments',
        event.row._id
      ]);

    }

  }

}
