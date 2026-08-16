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
  SaleService
} from '../../services/sale';

import {
  CreateSaleRequest
} from '../../models/sale.model';

import {
  SaleForm
} from '../../components/sale-form/sale-form';

@Component({
  selector: 'app-sale-create',

  standalone: true,

  imports: [
    PageHeader,
    SaleForm
  ],

  templateUrl:
    './sale-create.html',

  styleUrl:
    './sale-create.scss'
})
export class SaleCreate
  implements OnInit {

  private readonly saleService =
    inject(SaleService);

  private readonly router =
    inject(Router);

  private readonly route =
    inject(ActivatedRoute);

  private readonly toast =
    inject(ToastService);

  private readonly destroyRef =
    inject(DestroyRef);

  protected readonly loading =
    signal(false);

  protected readonly error =
    signal('');

  protected readonly initialCustomer =
    signal('');

  protected readonly initialWarehouse =
    signal('');

  ngOnInit(): void {

    const customer =
      this.route.snapshot.queryParamMap.get(
        'customer'
      );

    const warehouse =
      this.route.snapshot.queryParamMap.get(
        'warehouse'
      );

    if (customer) {

      this.initialCustomer.set(
        customer
      );

    }

    if (warehouse) {

      this.initialWarehouse.set(
        warehouse
      );

    }

  }

  protected submit(
    data: CreateSaleRequest
  ): void {

    this.loading.set(true);

    this.error.set('');

    this.saleService

      .createSale(data)

      .pipe(
        takeUntilDestroyed(
          this.destroyRef
        )
      )

      .subscribe({

        next: sale => {

          this.loading.set(false);

          this.toast.success(
            'Sale created successfully.'
          );

          this.router.navigate([
            '/admin/sales',
            sale._id
          ]);

        },

        error: error => {

          console.error(
            'Create sale error:',
            error
          );

          this.loading.set(false);

          this.error.set(
            error?.error?.message ??
            'Unable to create sale.'
          );

        }

      });

  }

  protected cancel(): void {

    this.router.navigate([
      '/admin/sales'
    ]);

  }

}
