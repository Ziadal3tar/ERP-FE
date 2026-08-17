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
} from '../../services/invoice';

import {
  Invoice,
  InvoiceStatus
} from '../../models/invoice.model';

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

import {
  ConfirmDialog
} from '../../../../shared/components/confirm-dialog/confirm-dialog';

import {
  ToastService
} from '../../../../core/services/toast';

@Component({
  selector: 'app-invoice-list',

  standalone: true,

  imports: [
    ReactiveFormsModule,
    RouterLink,
    PageHeader,
    DataTable,
    Pagination,
    ConfirmDialog
  ],

  templateUrl:
    './invoice-list.html',

  styleUrl:
    './invoice-list.scss'
})
export class InvoiceList
  implements OnInit {

  private readonly fb =
    inject(FormBuilder);

  private readonly invoiceService =
    inject(InvoiceService);

  private readonly customerService =
    inject(CustomerService);

  private readonly router =
    inject(Router);

  private readonly toast =
    inject(ToastService);

  private readonly destroyRef =
    inject(DestroyRef);



  protected readonly invoices =
    signal<Invoice[]>([]);

  protected readonly customers =
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

      customer: [''],

      status:
        ['' as InvoiceStatus | '']

    });



  protected readonly confirmOpen =
    signal(false);

  protected readonly confirmInvoice =
    signal<Invoice | null>(null);

  protected readonly actionLoading =
    signal(false);



  protected readonly columns:
    TableColumn<Invoice>[] = [

    {
      key: 'invoiceNumber',

      label: 'Invoice'
    },

    {
      key: 'customer.name',

      label: 'Customer'
    },

    {
      key: 'sale',

      label: 'Sale',

      render: invoice => {

        if (
          typeof invoice.sale === 'string'
        ) {

          return `#${invoice.sale
            .slice(-6)
            .toUpperCase()}`;

        }

        return `#${invoice.sale._id
          .slice(-6)
          .toUpperCase()}`;

      }

    },

    {
      key: 'total',

      label: 'Total',

      render: invoice =>
        invoice.total.toLocaleString(
          'en-US',
          {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          }
        )

    },

    {
      key: 'paidAmount',

      label: 'Paid',

      render: invoice =>
        invoice.paidAmount.toLocaleString(
          'en-US',
          {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          }
        )

    },

    {
      key: 'remainingAmount',

      label: 'Remaining',

      render: invoice =>
        invoice.remainingAmount.toLocaleString(
          'en-US',
          {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          }
        )

    },

    {
      key: 'status',

      label: 'Status',

      type: 'status',

      render: invoice =>
        invoice.status

    },

    {
      key: 'issueDate',

      label: 'Issue Date',

      type: 'date'

    }

  ];



  protected readonly actions:
    TableAction<Invoice>[] = [

    {
      key: 'view',

      label: 'View',

      icon: 'bi-eye',

      variant: 'default'
    },

    {
      key: 'cancel',

      label: 'Cancel',

      icon: 'bi-x-circle',

      variant: 'danger',

      show: invoice =>
        invoice.status !== 'Paid' &&
        invoice.status !== 'Cancelled'
    }

  ];



  ngOnInit(): void {

    this.loadCustomers();

    this.loadInvoices();

  }



  private loadCustomers(): void {

    this.filtersLoading.set(
      true
    );

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

          this.filtersLoading.set(
            false
          );

        },

        error: error => {

          console.error(
            'Invoice customers filter error:',
            error
          );

          this.filtersLoading.set(
            false
          );

        }

      });

  }



  protected loadInvoices(): void {

    this.loading.set(true);

    this.error.set('');

    const {
      customer,
      status
    } =
      this.filterForm.getRawValue();

    this.invoiceService

      .getInvoices(
        this.page(),
        this.limit(),
        customer,
        status
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

          this.total.set(
            response.pagination?.total ??
            0
          );

          this.totalPages.set(
            response.pagination?.totalPages ??
            1
          );

          this.loading.set(
            false
          );

        },

        error: error => {

          console.error(
            'Invoice list error:',
            error
          );

          this.invoices.set([]);

          this.error.set(
            error?.error?.message ??
            'Unable to load invoices.'
          );

          this.loading.set(
            false
          );

        }

      });

  }



  protected applyFilters(): void {

    this.page.set(1);

    this.loadInvoices();

  }

  protected resetFilters(): void {

    this.filterForm.reset({

      customer: '',

      status: ''

    });

    this.page.set(1);

    this.loadInvoices();

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

    this.loadInvoices();

  }



  protected refresh(): void {

    if (
      this.loading()
    ) {

      return;

    }

    this.loadInvoices();

  }



  protected handleAction(
    event: {
      action: TableAction<Invoice>;
      row: Invoice;
    }
  ): void {

    const {
      action,
      row
    } = event;

    switch (
      action.key
    ) {

      case 'view':

        this.router.navigate([
          '/admin/invoices',
          row._id
        ]);

        break;

      case 'cancel':

        this.confirmInvoice.set(
          row
        );

        this.confirmOpen.set(
          true
        );

        break;

    }

  }



  protected confirmCancel(): void {

    const invoice =
      this.confirmInvoice();

    if (!invoice) {
      return;
    }

    this.actionLoading.set(
      true
    );

    this.invoiceService

      .cancelInvoice(
        invoice._id
      )

      .pipe(
        takeUntilDestroyed(
          this.destroyRef
        )
      )

      .subscribe({

        next: () => {

          this.actionLoading.set(
            false
          );

          this.closeConfirmation();

          this.toast.success(
            'Invoice cancelled successfully.'
          );

          this.loadInvoices();

        },

        error: error => {

          console.error(
            'Cancel invoice error:',
            error
          );

          this.actionLoading.set(
            false
          );

          this.error.set(
            error?.error?.message ??
            'Unable to cancel invoice.'
          );

        }

      });

  }

  protected closeConfirmation(): void {

    if (
      this.actionLoading()
    ) {

      return;

    }

    this.confirmOpen.set(
      false
    );

    this.confirmInvoice.set(
      null
    );

  }

}
