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
  takeUntilDestroyed
} from '@angular/core/rxjs-interop';

import {
  RouterLink
} from '@angular/router';

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
  selector: 'app-payment-dashboard',

  standalone: true,

  imports: [
    DecimalPipe,
    RouterLink,
    PageHeader
  ],

  templateUrl:
    './payment-dashboard.html',

  styleUrl:
    './payment-dashboard.scss'
})
export class PaymentDashboard
  implements OnInit {

  private readonly paymentService =
    inject(PaymentService);

  private readonly destroyRef =
    inject(DestroyRef);

  protected readonly loading =
    signal(true);

  protected readonly error =
    signal('');

  protected readonly totalPayments =
    signal(0);

  protected readonly recentPayments =
    signal<Payment[]>([]);



  ngOnInit(): void {

    this.loadDashboard();

  }

  protected loadDashboard(): void {

    this.loading.set(true);

    this.error.set('');

    this.paymentService

      .getPayments(
        1,
        8
      )

      .pipe(
        takeUntilDestroyed(
          this.destroyRef
        )
      )

      .subscribe({

        next: response => {

          this.totalPayments.set(
            response.pagination?.total ?? 0
          );

          this.recentPayments.set(
            response.data ?? []
          );

          this.loading.set(false);

        },

        error: error => {

          console.error(
            'Payment dashboard error:',
            error
          );

          this.error.set(
            error?.error?.message ??
            'Unable to load payment dashboard.'
          );

          this.loading.set(false);

        }

      });

  }

  protected customerName(
    payment: Payment
  ): string {

    if (
      typeof payment.customer === 'string'
    ) {

      return payment.customer;

    }

    return payment.customer.name;

  }

  protected methodClass(
    method: Payment['method']
  ): string {

    return method.toLowerCase();

  }

}
