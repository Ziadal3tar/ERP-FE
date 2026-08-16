import {
  Component,
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
  PageHeader
} from '../../../../shared/components/page-header/page-header';

import {
  Warehouse
} from '../../models/warehouse.model';

import {
  WarehouseService
} from '../../services/warehouse';

@Component({
  selector: 'app-warehouse-details',

  imports: [
    DatePipe,
    PageHeader,
    RouterLink
  ],

  templateUrl:
    './warehouses-details.html',

  styleUrl:
    './warehouses-details.scss'
})
export class WarehouseDetails
  implements OnInit {

  private readonly route =
    inject(ActivatedRoute);

  private readonly router =
    inject(Router);

  private readonly warehouseService =
    inject(WarehouseService);

  protected readonly warehouse =
    signal<Warehouse | null>(null);

  protected readonly loading =
    signal(true);

  protected readonly error =
    signal('');
protected readonly actionLoading =
  signal(false);
  private warehouseId = '';

  ngOnInit(): void {

    this.warehouseId =
      this.route.snapshot.paramMap.get('id') ?? '';

    if (!this.warehouseId) {

      this.back();

      return;

    }

    this.loadWarehouse();

  }

  private loadWarehouse(): void {

    this.warehouseService
      .getWarehouse(
        this.warehouseId
      )
      .subscribe({

        next: response => {

          this.warehouse.set(
            response.data
          );

          this.loading.set(false);

        },

        error: error => {

          console.error(
            'Warehouse details error:',
            error
          );

          this.error.set(
            error?.error?.message ||
            'Unable to load warehouse.'
          );

          this.loading.set(false);

        }

      });

  }

  protected edit(): void {

    this.router.navigate([
      '/admin/warehouses',
      this.warehouseId,
      'edit'
    ]);

  }

  protected back(): void {

    this.router.navigate([
      '/admin/warehouses'
    ]);

  }
protected deactivate(): void {

  if (!this.warehouseId) {
    return;
  }

  this.actionLoading.set(true);

  this.warehouseService
    .deleteWarehouse(
      this.warehouseId
    )
    .subscribe({

      next: () => {

        const current =
          this.warehouse();

        if (current) {

          this.warehouse.set({
            ...current,
            isActive: false
          });

        }

        this.actionLoading.set(false);

      },

      error: (error: { error: { message: any; }; }) => {

        console.error(
          'Deactivate warehouse error:',
          error
        );

        this.error.set(
          error?.error?.message ||
          'Unable to deactivate warehouse.'
        );

        this.actionLoading.set(false);

      }

    });

}
protected restore(): void {

  if (!this.warehouseId) {
    return;
  }

  this.actionLoading.set(true);

  this.warehouseService
    .restoreWarehouse(
      this.warehouseId
    )
    .subscribe({

      next: warehouse => {

        this.warehouse.set(
          warehouse
        );

        this.actionLoading.set(false);

      },

      error: error => {

        console.error(
          'Restore warehouse error:',
          error
        );

        this.error.set(
          error?.error?.message ||
          'Unable to restore warehouse.'
        );

        this.actionLoading.set(false);

      }

    });

}
}
