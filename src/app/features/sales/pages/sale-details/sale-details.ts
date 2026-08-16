import {
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal
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
  Sale,
  SaleStatus
} from '../../models/sale.model';

import {
  SaleService
} from '../../services/sale';

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
  InvoiceService
} from '../../../invoices/services/invoice';
@Component({
  selector: 'app-sale-details',

  standalone: true,

  imports: [
    CurrencyPipe,
    DatePipe,
    DecimalPipe,
    RouterLink,
    PageHeader,
    ConfirmDialog
  ],

  templateUrl:
    './sale-details.html',

  styleUrl:
    './sale-details.scss'
})
export class SaleDetails
  implements OnInit {

  private readonly route =
    inject(ActivatedRoute);

  private readonly router =
    inject(Router);

  private readonly saleService =
    inject(SaleService);

  private readonly toast =
    inject(ToastService);

  private readonly destroyRef =
    inject(DestroyRef);
private readonly invoiceService =
  inject(InvoiceService);

protected readonly invoiceId =
  signal<string | null>(null);

protected readonly invoiceLoading =
  signal(false);
  protected readonly sale =
    signal<Sale | null>(null);

  protected readonly loading =
    signal(true);

  protected readonly actionLoading =
    signal(false);

  protected readonly error =
    signal('');

  protected readonly confirmOpen =
    signal(false);

  protected readonly confirmAction =
    signal<
      'confirm' |
      'cancel' |
      null
    >(null);

  private readonly saleId =
    this.route.snapshot.paramMap.get(
      'id'
    );

  ngOnInit(): void {

    if (!this.saleId) {

      this.router.navigate([
        '/admin/sales'
      ]);

      return;

    }

    this.loadSale();

  }

  protected loadSale(): void {

    this.loading.set(true);

    this.error.set('');

    this.saleService
      .getSaleById(
        this.saleId!
      )
      .pipe(
        takeUntilDestroyed(
          this.destroyRef
        )
      )
      .subscribe({

        next: sale => {

          this.sale.set(
            sale
          );

          this.loading.set(false);

        },

        error: error => {

          console.error(
            'Sale details error:',
            error
          );

          this.error.set(
            error?.error?.message ??
            'Unable to load sale.'
          );

          this.loading.set(false);

        }

      });

  }

  protected back(): void {

    this.router.navigate([
      '/admin/sales'
    ]);

  }

  protected statusClass(
    status: SaleStatus
  ): string {

    switch (status) {

      case 'Confirmed':
        return 'confirmed';

      case 'Cancelled':
        return 'cancelled';

      default:
        return 'draft';

    }

  }

  protected statusIcon(
    status: SaleStatus
  ): string {

    switch (status) {

      case 'Confirmed':
        return 'bi-check-circle-fill';

      case 'Cancelled':
        return 'bi-x-circle-fill';

      default:
        return 'bi-file-earmark-text';

    }

  }

  protected askConfirm(): void {

    this.confirmAction.set(
      'confirm'
    );

    this.confirmOpen.set(
      true
    );

  }

  protected askCancel(): void {

    this.confirmAction.set(
      'cancel'
    );

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

    this.confirmAction.set(
      null
    );

  }

  protected confirmOperation(): void {

    const action =
      this.confirmAction();

    if (
      !action ||
      !this.saleId
    ) {

      return;

    }

    this.actionLoading.set(
      true
    );

    const request$ =
      action === 'confirm'

        ? this.saleService
            .confirmSale(
              this.saleId
            )

        : this.saleService
            .cancelSale(
              this.saleId
            );

    request$
      .pipe(
        takeUntilDestroyed(
          this.destroyRef
        )
      )
      .subscribe({

        next: sale => {

          this.sale.set(
            sale
          );

          this.actionLoading.set(
            false
          );

          this.confirmOpen.set(
            false
          );

          this.confirmAction.set(
            null
          );

          this.toast.success(
            action === 'confirm'
              ? 'Sale confirmed successfully.'
              : 'Sale cancelled successfully.'
          );

        },

        error: error => {

          console.error(
            'Sale operation error:',
            error
          );

          this.actionLoading.set(
            false
          );

          this.error.set(
            error?.error?.message ??
            'Unable to complete sale operation.'
          );

        }

      });

  }

  protected get saleNumber(): string {

    const current =
      this.sale();

    return current
      ? `#${current._id
          .slice(-6)
          .toUpperCase()}`
      : '—';

  }

  protected productName(
    item: Sale['items'][number]
  ): string {

    if (
      typeof item.product === 'string'
    ) {

      return item.product;

    }

    return item.product.name;

  }

  protected productSku(
    item: Sale['items'][number]
  ): string {

    if (
      typeof item.product === 'string'
    ) {

      return '';

    }

    return item.product.sku;

  }

  protected get confirmationTitle(): string {

    return this.confirmAction() ===
      'confirm'

      ? 'Confirm Sale?'
      : 'Cancel Sale?';

  }

  protected get confirmationMessage(): string {

    const current =
      this.sale();

    const number =
      current
        ? `#${current._id
            .slice(-6)
            .toUpperCase()}`
        : 'this sale';

    if (
      this.confirmAction() ===
      'confirm'
    ) {

      return `Confirm sale ${number}? The system will validate stock availability and remove the sold quantities from the selected warehouse.`;

    }

    return `Cancel sale ${number}? Cancellation is only allowed while the sale is still in Draft status.`;

  }

  protected get confirmationText(): string {

    return this.confirmAction() ===
      'confirm'

      ? 'Confirm Sale'
      : 'Cancel Sale';

  }

  protected get confirmationVariant():
    'danger' |
    'primary' {

    return this.confirmAction() ===
      'cancel'

      ? 'danger'
      : 'primary';

  }
protected createInvoice(): void {

  if (!this.saleId) {
    return;
  }

  this.invoiceLoading.set(
    true
  );

  this.invoiceService

    .createInvoiceFromSale(
      this.saleId
    )

    .pipe(
      takeUntilDestroyed(
        this.destroyRef
      )
    )

    .subscribe({

      next: invoice => {

        this.invoiceLoading.set(
          false
        );

        this.toast.success(
          'Invoice created successfully.'
        );

        this.router.navigate([
          '/admin/invoices',
          invoice._id
        ]);

      },

      error: error => {

        console.error(
          'Create invoice error:',
          error
        );

        this.invoiceLoading.set(
          false
        );

        this.error.set(
          error?.error?.message ??
          'Unable to create invoice.'
        );

      }

    });

}
}
