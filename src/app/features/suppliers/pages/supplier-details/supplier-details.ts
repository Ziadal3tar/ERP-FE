import {
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal
} from '@angular/core';

import {
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
  Supplier
} from '../../models/supplier.model';

import {
  SupplierService
} from '../../services/supplier';

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
  selector: 'app-supplier-details',

  standalone: true,

  imports: [
    DatePipe,
    RouterLink,
    PageHeader,
    ConfirmDialog
  ],

  templateUrl: './supplier-details.html',

  styleUrl: './supplier-details.scss'
})
export class SupplierDetails
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

  protected loadSupplier(): void {

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

          this.supplier.set(
            supplier
          );
console.log(supplier);

          this.loading.set(false);

        },

        error: error => {

          console.error(
            'Supplier details error:',
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

  protected edit(): void {

    this.router.navigate([
      '/admin/suppliers',
      this.supplierId,
      'edit'
    ]);

  }

  protected back(): void {

    this.router.navigate([
      '/admin/suppliers'
    ]);

  }

  protected askDeactivate(): void {

    this.confirmAction.set(
      'deactivate'
    );

    this.confirmOpen.set(true);

  }

  protected askRestore(): void {

    this.confirmAction.set(
      'restore'
    );

    this.confirmOpen.set(true);

  }

  protected cancelConfirmation(): void {

    if (
      this.actionLoading()
    ) {
      return;
    }

    this.confirmOpen.set(false);

    this.confirmAction.set(null);

  }

  protected confirmActionHandler(): void {

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

    if (!this.supplierId) {
      return;
    }

    this.actionLoading.set(true);

    this.supplierService

      .deactivateSupplier(
        this.supplierId
      )

      .pipe(
        takeUntilDestroyed(
          this.destroyRef
        )
      )

      .subscribe({

        next: () => {

          this.actionLoading.set(false);

          this.confirmOpen.set(false);

          this.confirmAction.set(null);

          this.toast.success(
            'Supplier deactivated successfully.'
          );

          this.loadSupplier();

        },

        error: error => {

          console.error(
            'Deactivate supplier error:',
            error
          );

          this.actionLoading.set(false);

          this.error.set(
            error?.error?.message ??
            'Unable to deactivate supplier.'
          );

        }

      });

  }

  private restore(): void {

    if (!this.supplierId) {
      return;
    }

    this.actionLoading.set(true);

    this.supplierService

      .restoreSupplier(
        this.supplierId
      )

      .pipe(
        takeUntilDestroyed(
          this.destroyRef
        )
      )

      .subscribe({

        next: supplier => {

          this.actionLoading.set(false);

          this.confirmOpen.set(false);

          this.confirmAction.set(null);

          this.supplier.set(
            supplier
          );

          this.toast.success(
            'Supplier restored successfully.'
          );

        },

        error: error => {

          console.error(
            'Restore supplier error:',
            error
          );

          this.actionLoading.set(false);

          this.error.set(
            error?.error?.message ??
            'Unable to restore supplier.'
          );

        }

      });

  }

  protected get confirmTitle(): string {

    return this.confirmAction() ===
      'deactivate'

      ? 'Deactivate Supplier?'

      : 'Restore Supplier?';

  }

  protected get confirmMessage(): string {

    const supplier =
      this.supplier();

    if (
      this.confirmAction() ===
      'deactivate'
    ) {

      return `Are you sure you want to deactivate ${
        supplier?.name ?? 'this supplier'
      }? You can restore it later.`;

    }

    return `Restore ${
      supplier?.name ?? 'this supplier'
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
