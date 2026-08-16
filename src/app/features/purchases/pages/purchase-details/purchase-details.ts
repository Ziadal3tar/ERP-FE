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
  Purchase,
  PurchaseStatus
} from '../../models/purchase.model';

import {
  PurchaseService
} from '../../services/purchase';

import {
  PageHeader
} from '../../../../shared/components/page-header/page-header';

import {
  ConfirmDialog
} from '../../../../shared/components/confirm-dialog/confirm-dialog';

import {
  ToastService
} from '../../../../core/services/toast';

@Component({
  selector: 'app-purchase-details',

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
    './purchase-details.html',

  styleUrl:
    './purchase-details.scss'
})
export class PurchaseDetails
  implements OnInit {

  private readonly route =
    inject(ActivatedRoute);

  private readonly router =
    inject(Router);

  private readonly purchaseService =
    inject(PurchaseService);

  private readonly toast =
    inject(ToastService);

  private readonly destroyRef =
    inject(DestroyRef);

  /*
  |--------------------------------------------------------------------------
  | State
  |--------------------------------------------------------------------------
  */

  protected readonly purchase =
    signal<Purchase | null>(null);

  protected readonly loading =
    signal(true);

  protected readonly actionLoading =
    signal(false);

  protected readonly error =
    signal('');

  /*
  |--------------------------------------------------------------------------
  | Confirmation
  |--------------------------------------------------------------------------
  */

  protected readonly confirmOpen =
    signal(false);

  protected readonly confirmAction =
    signal<
      'confirm' |
      'receive' |
      'cancel' |
      null
    >(null);

  private readonly purchaseId =
    this.route.snapshot.paramMap.get(
      'id'
    );

  /*
  |--------------------------------------------------------------------------
  | Lifecycle
  |--------------------------------------------------------------------------
  */

  ngOnInit(): void {

    if (!this.purchaseId) {

      this.router.navigate([
        '/admin/purchases'
      ]);

      return;

    }

    this.loadPurchase();

  }

  /*
  |--------------------------------------------------------------------------
  | Load
  |--------------------------------------------------------------------------
  */

  protected loadPurchase(): void {

    this.loading.set(true);

    this.error.set('');

    this.purchaseService

      .getPurchaseById(
        this.purchaseId!
      )

      .pipe(
        takeUntilDestroyed(
          this.destroyRef
        )
      )

      .subscribe({

        next: purchase => {

          this.purchase.set(
            purchase
          );

          this.loading.set(false);

        },

        error: error => {

          console.error(
            'Purchase details error:',
            error
          );

          this.error.set(
            error?.error?.message ??
            'Unable to load purchase.'
          );

          this.loading.set(false);

        }

      });

  }

  /*
  |--------------------------------------------------------------------------
  | Navigation
  |--------------------------------------------------------------------------
  */

  protected back(): void {

    this.router.navigate([
      '/admin/purchases'
    ]);

  }

  /*
  |--------------------------------------------------------------------------
  | Status
  |--------------------------------------------------------------------------
  */

  protected statusClass(
    status: PurchaseStatus
  ): string {

    switch (status) {

      case 'Received':

        return 'received';

      case 'Confirmed':

        return 'confirmed';

      case 'Cancelled':

        return 'cancelled';

      default:

        return 'draft';

    }

  }

  protected statusIcon(
    status: PurchaseStatus
  ): string {

    switch (status) {

      case 'Received':

        return 'bi-check-circle-fill';

      case 'Confirmed':

        return 'bi-check2-circle';

      case 'Cancelled':

        return 'bi-x-circle-fill';

      default:

        return 'bi-file-earmark-text';

    }

  }

  /*
  |--------------------------------------------------------------------------
  | Confirmation
  |--------------------------------------------------------------------------
  */

  protected askConfirm(): void {

    this.openConfirmation(
      'confirm'
    );

  }

  protected askReceive(): void {

    this.openConfirmation(
      'receive'
    );

  }

  protected askCancel(): void {

    this.openConfirmation(
      'cancel'
    );

  }

  private openConfirmation(
    action:
      'confirm' |
      'receive' |
      'cancel'
  ): void {

    this.confirmAction.set(
      action
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

    this.confirmOpen.set(false);

    this.confirmAction.set(null);

  }

  protected confirmOperation(): void {

    const action =
      this.confirmAction();

    if (
      !action ||
      !this.purchaseId
    ) {

      return;

    }

    this.actionLoading.set(true);

    let request$;

    switch (action) {

      case 'confirm':

        request$ =
          this.purchaseService
            .confirmPurchase(
              this.purchaseId
            );

        break;

      case 'receive':

        request$ =
          this.purchaseService
            .receivePurchase(
              this.purchaseId
            );

        break;

      case 'cancel':

        request$ =
          this.purchaseService
            .cancelPurchase(
              this.purchaseId
            );

        break;

    }

    request$

      .pipe(
        takeUntilDestroyed(
          this.destroyRef
        )
      )

      .subscribe({

        next: purchase => {

          this.purchase.set(
            purchase
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
            this.successMessage(action)
          );

        },

        error: error => {

          console.error(
            'Purchase operation error:',
            error
          );

          this.actionLoading.set(
            false
          );

          this.error.set(
            error?.error?.message ??
            'Unable to complete purchase operation.'
          );

        }

      });

  }

  private successMessage(
    action:
      'confirm' |
      'receive' |
      'cancel'
  ): string {

    switch (action) {

      case 'confirm':

        return 'Purchase confirmed successfully.';

      case 'receive':

        return 'Purchase received successfully.';

      case 'cancel':

        return 'Purchase cancelled successfully.';

    }

  }

  /*
  |--------------------------------------------------------------------------
  | Confirmation UI
  |--------------------------------------------------------------------------
  */

  protected get confirmationTitle(): string {

    switch (
      this.confirmAction()
    ) {

      case 'confirm':

        return 'Confirm Purchase?';

      case 'receive':

        return 'Receive Purchase?';

      case 'cancel':

        return 'Cancel Purchase?';

      default:

        return 'Confirm Action?';

    }

  }

  protected get confirmationMessage(): string {

    const current =
      this.purchase();

    const number =
      current
        ? `#${current._id
            .slice(-6)
            .toUpperCase()}`
        : 'this purchase';

    switch (
      this.confirmAction()
    ) {

      case 'confirm':

        return `Confirm purchase ${number}? It will move from Draft to Confirmed.`;

      case 'receive':

        return `Receive purchase ${number}? All purchase quantities will be added to the selected warehouse stock.`;

      case 'cancel':

        return `Cancel purchase ${number}? A received purchase cannot be cancelled.`;

      default:

        return 'Are you sure you want to continue?';

    }

  }

  protected get confirmationText(): string {

    switch (
      this.confirmAction()
    ) {

      case 'confirm':

        return 'Confirm Purchase';

      case 'receive':

        return 'Receive Purchase';

      case 'cancel':

        return 'Cancel Purchase';

      default:

        return 'Confirm';

    }

  }

  protected get confirmationVariant():
    'danger' |
    'warning' |
    'primary' |
    'success' {

    switch (
      this.confirmAction()
    ) {

      case 'receive':

        return 'success';

      case 'cancel':

        return 'danger';

      default:

        return 'primary';

    }

  }

  /*
  |--------------------------------------------------------------------------
  | Helpers
  |--------------------------------------------------------------------------
  */

  protected get purchaseNumber(): string {

    const current =
      this.purchase();

    return current
      ? `#${current._id
          .slice(-6)
          .toUpperCase()}`
      : '—';

  }

  protected itemProductName(
    item: Purchase['items'][number]
  ): string {

    if (
      typeof item.product === 'string'
    ) {

      return item.product;

    }

    return item.product.name;

  }

  protected itemProductSku(
    item: Purchase['items'][number]
  ): string {

    if (
      typeof item.product === 'string'
    ) {

      return '';

    }

    return item.product.sku;

  }
protected get warehouseId(): string {

  const warehouse =
    this.purchase()?.warehouse;

  if (!warehouse) {
    return '';
  }

  return typeof warehouse === 'string'
    ? warehouse
    : warehouse._id;

}
}
