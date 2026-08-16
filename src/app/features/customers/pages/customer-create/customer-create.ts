import {
  Component,
  DestroyRef,
  inject,
  signal
} from '@angular/core';

import {
  Router
} from '@angular/router';

import {
  takeUntilDestroyed
} from '@angular/core/rxjs-interop';

import {
  PageHeader
} from '../../../../shared/components/page-header/page-header';

import {
  ToastService
} from '../../../../core/services/toast';

import {
  CustomerForm
} from '../../components/customer-form/customer-form';

import {
  CreateCustomerRequest
} from '../../models/customer.model';

import {
  CustomerService
} from '../../services/customer';

@Component({
  selector: 'app-customer-create',

  standalone: true,

  imports: [
    PageHeader,
    CustomerForm
  ],

  templateUrl:
    './customer-create.html',

  styleUrl:
    './customer-create.scss'
})
export class CustomerCreate {

  private readonly customerService =
    inject(CustomerService);

  private readonly router =
    inject(Router);

  private readonly toast =
    inject(ToastService);

  private readonly destroyRef =
    inject(DestroyRef);

  protected readonly loading =
    signal(false);

  protected readonly error =
    signal('');

  protected submit(
    data: CreateCustomerRequest
  ): void {

    this.loading.set(true);

    this.error.set('');

    this.customerService

      .createCustomer(data)

      .pipe(
        takeUntilDestroyed(
          this.destroyRef
        )
      )

      .subscribe({

        next: customer => {

          this.loading.set(false);

          this.toast.success(
            'Customer created successfully.'
          );

          this.router.navigate([
            '/admin/customers',
            customer._id
          ]);

        },

        error: error => {

          console.error(
            'Create customer error:',
            error
          );

          this.loading.set(false);

          this.error.set(
            error?.error?.message ??
            'Unable to create customer.'
          );

        }

      });

  }

  protected cancel(): void {

    this.router.navigate([
      '/admin/customers'
    ]);

  }

}
