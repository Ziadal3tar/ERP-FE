import {
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal
} from '@angular/core';

import {
  ActivatedRoute,
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
  Customer,
  UpdateCustomerRequest
} from '../../models/customer.model';

import {
  CustomerService
} from '../../services/customer';

@Component({
  selector: 'app-customer-edit',

  standalone: true,

  imports: [
    PageHeader,
    CustomerForm
  ],

  templateUrl:
    './customer-edit.html',

  styleUrl:
    './customer-edit.scss'
})
export class CustomerEdit
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

  protected readonly saving =
    signal(false);

  protected readonly error =
    signal('');

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

  private loadCustomer(): void {

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
            'Customer loading error:',
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

  protected submit(
    data: UpdateCustomerRequest
  ): void {

    if (!this.customerId) {
      return;
    }

    this.saving.set(true);

    this.error.set('');

    this.customerService

      .updateCustomer(
        this.customerId,
        data
      )

      .pipe(
        takeUntilDestroyed(
          this.destroyRef
        )
      )

      .subscribe({

        next: customer => {

          this.saving.set(false);

          this.toast.success(
            'Customer updated successfully.'
          );

          this.router.navigate([
            '/admin/customers',
            customer._id
          ]);

        },

        error: error => {

          console.error(
            'Update customer error:',
            error
          );

          this.saving.set(false);

          this.error.set(
            error?.error?.message ??
            'Unable to update customer.'
          );

        }

      });

  }

  protected cancel(): void {

    this.router.navigate([
      '/admin/customers',
      this.customerId
    ]);

  }

}
