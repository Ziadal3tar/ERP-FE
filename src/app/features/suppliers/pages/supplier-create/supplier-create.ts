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
  SupplierForm
} from '../../components/supplier-form/supplier-form';

import {
  CreateSupplierRequest
} from '../../models/supplier.model';

import {
  SupplierService
} from '../../services/supplier';

import {
  ToastService
} from '../../../../core/services/toast';

@Component({
  selector: 'app-supplier-create',

  standalone: true,

  imports: [
    PageHeader,
    SupplierForm
  ],

  templateUrl: './supplier-create.html',

  styleUrl: './supplier-create.scss'
})
export class SupplierCreate {

  private readonly supplierService =
    inject(SupplierService);

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
    data: CreateSupplierRequest
  ): void {

    this.loading.set(true);

    this.error.set('');

    this.supplierService

      .createSupplier(data)

      .pipe(
        takeUntilDestroyed(
          this.destroyRef
        )
      )

      .subscribe({

        next: supplier => {

          this.loading.set(false);

          this.toast.success(
            'Supplier created successfully.'
          );

          this.router.navigate([
            '/admin/suppliers',
            supplier._id
          ]);

        },

        error: error => {

          console.error(
            'Create supplier error:',
            error
          );

          this.loading.set(false);

          this.error.set(
            error?.error?.message ??
            'Unable to create supplier.'
          );

        }

      });

  }

  protected cancel(): void {

    this.router.navigate([
      '/admin/suppliers'
    ]);

  }

}
