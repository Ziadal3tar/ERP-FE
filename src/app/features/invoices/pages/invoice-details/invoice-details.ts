import {
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
  computed
} from '@angular/core';

import {
  CurrencyPipe,
  DatePipe,
  DecimalPipe
} from '@angular/common';

import {
  ActivatedRoute,
  Router,
  RouterLink
} from '@angular/router';

import {
  takeUntilDestroyed
} from '@angular/core/rxjs-interop';

import {
  Invoice,
  InvoiceItem,
  InvoiceStatus
} from '../../models/invoice.model';

import {
  InvoiceService
} from '../../services/invoice';

import {
  PageHeader
} from '../../../../shared/components/page-header/page-header';

import {
  ConfirmDialog
} from '../../../../shared/components/confirm-dialog/confirm-dialog';

import {
  ToastService
} from '../../../../core/services/toast';
import {
  PaymentService
} from '../../../payments/services/payment';

import {
  PaymentForm
} from '../../../payments/components/payment-form/payment-form';
import {
  CreatePaymentRequest
} from '../../../payments/models/payment.model';
@Component({
  selector: 'app-invoice-details',

  standalone: true,

  imports: [
   CurrencyPipe,
  DatePipe,
  DecimalPipe,
  RouterLink,
  PageHeader,
  ConfirmDialog,
  PaymentForm
],

  templateUrl:
    './invoice-details.html',

  styleUrl:
    './invoice-details.scss'
})
export class InvoiceDetails
  implements OnInit {

  private readonly route =
    inject(ActivatedRoute);

  private readonly router =
    inject(Router);

  private readonly invoiceService =
    inject(InvoiceService);

  private readonly toast =
    inject(ToastService);

  private readonly destroyRef =
    inject(DestroyRef);

  protected readonly invoice =
    signal<Invoice | null>(null);

  protected readonly loading =
    signal(true);

  protected readonly actionLoading =
    signal(false);

  protected readonly error =
    signal('');

  protected readonly confirmOpen =
    signal(false);

  private readonly invoiceId =
    this.route.snapshot.paramMap.get(
      'id'
    );
private readonly paymentService =
  inject(PaymentService);

protected readonly paymentOpen =
  signal(false);

protected readonly paymentLoading =
  signal(false);
currentInvoice: any;
  ngOnInit(): void {

    if (!this.invoiceId) {

      this.router.navigate([
        '/admin/invoices'
      ]);

      return;

    }

    this.loadInvoice();

  }

  protected loadInvoice(): void {

    this.loading.set(true);

    this.error.set('');

    this.invoiceService

      .getInvoiceById(
        this.invoiceId!
      )

      .pipe(
        takeUntilDestroyed(
          this.destroyRef
        )
      )

      .subscribe({

        next: invoice => {

          this.invoice.set(
            invoice
          );

          this.loading.set(false);

        },

        error: error => {

          console.error(
            'Invoice details error:',
            error
          );

          this.error.set(
            error?.error?.message ??
            'Unable to load invoice.'
          );

          this.loading.set(false);

        }

      });

  }

  protected back(): void {

    this.router.navigate([
      '/admin/invoices'
    ]);

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

  protected statusIcon(
    status: InvoiceStatus
  ): string {

    switch (status) {

      case 'Paid':
        return 'bi-check-circle-fill';

      case 'PartiallyPaid':
        return 'bi-hourglass-split';

      case 'Cancelled':
        return 'bi-x-circle-fill';

      default:
        return 'bi-clock';

    }

  }

  protected productName(
    item: InvoiceItem
  ): string {

    if (
      typeof item.product === 'string'
    ) {

      return item.product;

    }

    return item.product.name;

  }

  protected productSku(
    item: InvoiceItem
  ): string {

    if (
      typeof item.product === 'string'
    ) {

      return '';

    }

    return item.product.sku;

  }

  protected saleNumber(): string {

    const current =
      this.invoice();

    if (!current) {
      return '—';
    }

    if (
      typeof current.sale === 'string'
    ) {

      return `#${current.sale
        .slice(-6)
        .toUpperCase()}`;

    }

    return `#${current.sale._id
      .slice(-6)
      .toUpperCase()}`;

  }



  protected askCancel(): void {

    this.confirmOpen.set(
      true
    );

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

  }

  protected confirmCancel(): void {

    if (!this.invoiceId) {
      return;
    }

    this.actionLoading.set(
      true
    );

    this.invoiceService

      .cancelInvoice(
        this.invoiceId
      )

      .pipe(
        takeUntilDestroyed(
          this.destroyRef
        )
      )

      .subscribe({

        next: invoice => {

          this.invoice.set(
            invoice
          );

          this.actionLoading.set(
            false
          );

          this.confirmOpen.set(
            false
          );

          this.toast.success(
            'Invoice cancelled successfully.'
          );

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
protected openPayment(): void {

  const current =
    this.invoice();

  if (
    !current ||
    current.status === 'Paid' ||
    current.status === 'Cancelled'
  ) {
    return;
  }

  this.paymentOpen.set(true);

}

protected closePayment(): void {

  if (
    this.paymentLoading()
  ) {
    return;
  }

  this.paymentOpen.set(false);

}

protected submitPayment(
  data: CreatePaymentRequest
): void {

  const current =
    this.invoice();

  if (
    !current ||
    current.status === 'Paid' ||
    current.status === 'Cancelled'
  ) {
    return;
  }

  this.paymentLoading.set(true);

  this.error.set('');

  this.paymentService

    .createPayment(
      current._id,
      data
    )

    .pipe(
      takeUntilDestroyed(
        this.destroyRef
      )
    )

    .subscribe({

      next: response => {

        /*
         * Backend returns the updated invoice
         * after recording the payment.
         */

        this.invoice.set(
          response.invoice
        );

        this.paymentLoading.set(
          false
        );

        this.paymentOpen.set(
          false
        );

        this.toast.success(
          'Payment recorded successfully.'
        );

      },

      error: error => {

        console.error(
          'Payment error:',
          error
        );

        this.paymentLoading.set(
          false
        );

        this.error.set(
          error?.error?.message ??
          'Unable to record payment.'
        );

      }

    });

}
protected readonly paymentRemaining =
  computed(
    () =>
      this.invoice()
        ?.remainingAmount ?? 0
  );
}
