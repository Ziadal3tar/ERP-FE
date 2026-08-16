import {
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal
} from '@angular/core';

import {
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
  Customer
} from '../../models/customer.model';

import {
  CustomerService
} from '../../services/customer';

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
  selector: 'app-customer-details',

  standalone: true,

  imports: [
    DatePipe,
    RouterLink,
    PageHeader,
    ConfirmDialog,
DecimalPipe
  ],

  templateUrl:
    './customer-details.html',

  styleUrl:
    './customer-details.scss'
})
export class CustomerDetails
  implements OnInit {

  private readonly route =
    inject(ActivatedRoute);

  private readonly router =
    inject(Router);

  private readonly customerService =
    inject(CustomerService);

  private readonly toast =
    inject(ToastService);

  private readonly destroyRef =
    inject(DestroyRef);

  protected readonly customer =
    signal<Customer | null>(null);

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
      'deactivate' |
      'restore' |
      null
    >(null);

  private readonly customerId =
    this.route.snapshot.paramMap.get(
      'id'
    );

  ngOnInit(): void {

    if (!this.customerId) {

      this.router.navigate([
        '/admin/customers'
      ]);

      return;

    }

    this.loadCustomer();

  }

  protected loadCustomer(): void {

    this.loading.set(true);

    this.error.set('');

    this.customerService

      .getCustomerById(
        this.customerId!
      )

      .pipe(
        takeUntilDestroyed(
          this.destroyRef
        )
      )

      .subscribe({

        next: customer => {

          this.customer.set(
            customer
          );

          this.loading.set(false);

        },

        error: error => {

          console.error(
            'Customer details error:',
            error
          );

          this.error.set(
            error?.error?.message ??
            'Unable to load customer.'
          );

          this.loading.set(false);

        }

      });

  }

  protected back(): void {

    this.router.navigate([
      '/admin/customers'
    ]);

  }

  protected edit(): void {

    this.router.navigate([
      '/admin/customers',
      this.customerId,
      'edit'
    ]);

  }

  protected createSale(): void {

    this.router.navigate(
      ['/admin/sales/create'],
      {
        queryParams: {
          customer:
            this.customerId
        }
      }
    );

  }

  protected askDeactivate(): void {

    this.confirmAction.set(
      'deactivate'
    );

    this.confirmOpen.set(
      true
    );

  }

  protected askRestore(): void {

    this.confirmAction.set(
      'restore'
    );

    this.confirmOpen.set(
      true
    );

  }

  protected cancelConfirmation(): void {

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

    if (!action) {
      return;
    }

    if (
      action === 'deactivate'
    ) {

      this.deactivate();

      return;

    }

    this.restore();

  }

  private deactivate(): void {

    if (!this.customerId) {
      return;
    }

    this.actionLoading.set(
      true
    );

    this.customerService

      .deactivateCustomer(
        this.customerId
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

          this.confirmOpen.set(
            false
          );

          this.confirmAction.set(
            null
          );

          this.toast.success(
            'Customer deactivated successfully.'
          );

          this.loadCustomer();

        },

        error: error => {

          console.error(
            'Deactivate customer error:',
            error
          );

          this.actionLoading.set(
            false
          );

          this.error.set(
            error?.error?.message ??
            'Unable to deactivate customer.'
          );

        }

      });

  }

  private restore(): void {

    if (!this.customerId) {
      return;
    }

    this.actionLoading.set(
      true
    );

    this.customerService

      .restoreCustomer(
        this.customerId
      )

      .pipe(
        takeUntilDestroyed(
          this.destroyRef
        )
      )

      .subscribe({

        next: customer => {

          this.actionLoading.set(
            false
          );

          this.confirmOpen.set(
            false
          );

          this.confirmAction.set(
            null
          );

          this.customer.set(
            customer
          );

          this.toast.success(
            'Customer restored successfully.'
          );

        },

        error: error => {

          console.error(
            'Restore customer error:',
            error
          );

          this.actionLoading.set(
            false
          );

          this.error.set(
            error?.error?.message ??
            'Unable to restore customer.'
          );

        }

      });

  }

  protected get confirmTitle(): string {

    return this.confirmAction() ===
      'deactivate'

      ? 'Deactivate Customer?'

      : 'Restore Customer?';

  }

  protected get confirmMessage(): string {

    const current =
      this.customer();

    if (
      this.confirmAction() ===
      'deactivate'
    ) {

      return `Are you sure you want to deactivate ${
        current?.name ?? 'this customer'
      }? You can restore it later.`;

    }

    return `Restore ${
      current?.name ?? 'this customer'
    } and make it active again?`;

  }

  protected get confirmButtonText(): string {

    return this.confirmAction() ===
      'deactivate'

      ? 'Deactivate'

      : 'Restore';

  }

  protected get confirmVariant():
    'danger' |
    'success' {

    return this.confirmAction() ===
      'deactivate'

      ? 'danger'
      : 'success';

  }

}
