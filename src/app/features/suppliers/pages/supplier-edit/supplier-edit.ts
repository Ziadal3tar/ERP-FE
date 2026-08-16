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
  SupplierForm
} from '../../components/supplier-form/supplier-form';

import {
  Supplier,
  UpdateSupplierRequest
} from '../../models/supplier.model';

import {
  SupplierService
} from '../../services/supplier';

import {
  ToastService
} from '../../../../core/services/toast';

@Component({
  selector: 'app-supplier-edit',

  standalone: true,

  imports: [
    PageHeader,
    SupplierForm
  ],

  templateUrl: './supplier-edit.html',

  styleUrl: './supplier-edit.scss'
})
export class SupplierEdit
  implements OnInit {

  private readonly route =
    inject(ActivatedRoute);

  private readonly router =
    inject(Router);

  private readonly supplierService =
    inject(SupplierService);

  private readonly toast =
    inject(ToastService);

  private readonly destroyRef =
    inject(DestroyRef);

  protected readonly supplier =
    signal<Supplier | null>(null);

  protected readonly loading =
    signal(true);

  protected readonly saving =
    signal(false);

  protected readonly error =
    signal('');

  private readonly supplierId =
    this.route.snapshot.paramMap.get(
      'id'
    );

  ngOnInit(): void {

    if (!this.supplierId) {

      this.router.navigate([
        '/admin/suppliers'
      ]);

      return;

    }

    this.loadSupplier();

  }

private loadSupplier(): void {

  this.loading.set(true);

  this.error.set('');

  this.supplierService
    .getSupplierById(
      this.supplierId!
    )
    .pipe(
      takeUntilDestroyed(
        this.destroyRef
      )
    )
    .subscribe({

      next: supplier => {

        console.log(
          'Supplier:',
          supplier
        );

        this.supplier.set(
          supplier
        );

        this.loading.set(false);

      },

      error: error => {

        console.error(
          'Supplier loading error:',
          error
        );

        this.error.set(
          error?.error?.message ??
          'Unable to load supplier.'
        );

        this.loading.set(false);

      }

    });

}

  protected submit(
    data: UpdateSupplierRequest
  ): void {

    if (!this.supplierId) {
      return;
    }

    this.saving.set(true);

    this.error.set('');

    this.supplierService

      .updateSupplier(
        this.supplierId,
        data
      )

      .pipe(
        takeUntilDestroyed(
          this.destroyRef
        )
      )

      .subscribe({

        next: supplier => {

          this.saving.set(false);

          this.toast.success(
            'Supplier updated successfully.'
          );

          this.router.navigate([
            '/admin/suppliers',
            supplier._id
          ]);

        },

        error: error => {

          console.error(
            'Update supplier error:',
            error
          );

          this.saving.set(false);

          this.error.set(
            error?.error?.message ??
            'Unable to update supplier.'
          );

        }

      });

  }

  protected cancel(): void {

    this.router.navigate([
      '/admin/suppliers',
      this.supplierId
    ]);

  }

}
