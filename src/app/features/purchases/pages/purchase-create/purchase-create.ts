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
  PurchaseService
} from '../../services/purchase';

import {
  CreatePurchaseRequest
} from '../../models/purchase.model';

import {
  PurchaseForm
} from '../../components/purchase-form/purchase-form';
import {
  ActivatedRoute
} from '@angular/router';
@Component({
  selector: 'app-purchase-create',

  standalone: true,

  imports: [
    PageHeader,
    PurchaseForm
  ],

  templateUrl:
    './purchase-create.html',

  styleUrl:
    './purchase-create.scss'
})
export class PurchaseCreate {
  private readonly route =
    inject(ActivatedRoute);
  private readonly purchaseService =
    inject(PurchaseService);

  private readonly router =
    inject(Router);

  private readonly toast =
    inject(ToastService);

  private readonly destroyRef =
    inject(DestroyRef);
  protected readonly initialSupplier =
    signal('');
  protected readonly initialWarehouse =
    signal('');
  protected readonly loading =
    signal(false);

  protected readonly error =
    signal('');

  ngOnInit(): void {

  const supplier =
    this.route.snapshot.queryParamMap.get(
      'supplier'
    );
console.log( this.route.snapshot.queryParamMap.get(
      'supplier'
    ));

  const warehouse =
    this.route.snapshot.queryParamMap.get(
      'warehouse'
    );

  if (supplier) {

    this.initialSupplier.set(
      supplier
    );

  }

  if (warehouse) {

    this.initialWarehouse.set(
      warehouse
    );

  }

}
  protected submit(
    data: CreatePurchaseRequest
  ): void {

    this.loading.set(true);

    this.error.set('');

    this.purchaseService

      .createPurchase(data)

      .pipe(
        takeUntilDestroyed(
          this.destroyRef
        )
      )

      .subscribe({

        next: purchase => {

          this.loading.set(false);

          this.toast.success(
            'Purchase created successfully.'
          );

          this.router.navigate([
            '/admin/purchases',
            purchase._id
          ]);

        },

        error: error => {

          console.error(
            'Create purchase error:',
            error
          );

          this.loading.set(false);

          this.error.set(
            error?.error?.message ??
            'Unable to create purchase.'
          );

        }

      });

  }

  protected cancel(): void {

    this.router.navigate([
      '/admin/purchases'
    ]);

  }

}
