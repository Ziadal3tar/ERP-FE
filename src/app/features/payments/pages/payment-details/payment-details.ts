import {
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal
} from '@angular/core';

import {
  CurrencyPipe,
  DatePipe
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
  Payment
} from '../../models/payment.model';

import {
  PaymentService
} from '../../services/payment';

import {
  PageHeader
} from '../../../../shared/components/page-header/page-header';

@Component({
  selector: 'app-payment-details',

  standalone: true,

  imports: [
    CurrencyPipe,
    DatePipe,
    RouterLink,
    PageHeader
  ],

  templateUrl:
    './payment-details.html',

  styleUrl:
    './payment-details.scss'
})
export class PaymentDetails
  implements OnInit {

  private readonly route =
    inject(ActivatedRoute);

  private readonly router =
    inject(Router);

  private readonly paymentService =
    inject(PaymentService);

  private readonly destroyRef =
    inject(DestroyRef);

  protected readonly payment =
    signal<Payment | null>(null);

  protected readonly loading =
    signal(true);

  protected readonly error =
    signal('');

  private readonly paymentId =
    this.route.snapshot.paramMap.get(
      'id'
    );

  ngOnInit(): void {

    if (!this.paymentId) {

      this.router.navigate([
        '/admin/payments'
      ]);

      return;

    }

    this.loadPayment();

  }

  protected loadPayment(): void {

    this.loading.set(true);

    this.error.set('');

    this.paymentService

      .getPaymentById(
        this.paymentId!
      )

      .pipe(
        takeUntilDestroyed(
          this.destroyRef
        )
      )

      .subscribe({

        next: payment => {

          this.payment.set(
            payment
          );

          this.loading.set(false);

        },

        error: error => {

          console.error(
            'Payment details error:',
            error
          );

          this.error.set(
            error?.error?.message ??
            'Unable to load payment.'
          );

          this.loading.set(false);

        }

      });

  }

  protected back(): void {

    this.router.navigate([
      '/admin/payments'
    ]);

  }

  protected invoiceNumber(): string {

    const current =
      this.payment();

    if (!current) {
      return '—';
    }

    if (
      typeof current.invoice === 'string'
    ) {

      return `#${current.invoice
        .slice(-6)
        .toUpperCase()}`;

    }

    return current.invoice.invoiceNumber;

  }

  protected customerName(): string {

    const current =
      this.payment();

    if (!current) {
      return '—';
    }

    if (
      typeof current.customer === 'string'
    ) {

      return current.customer;

    }

    return current.customer.name;

  }

  protected methodIcon(
    method: Payment['method']
  ): string {

    switch (method) {

      case 'Card':
        return 'bi-credit-card';

      case 'Bank':
        return 'bi-bank';

      default:
        return 'bi-cash-stack';

    }

  }

}
