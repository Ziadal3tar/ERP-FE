import {
  Component,
  inject,
  OnInit,
  signal
} from '@angular/core';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  PageHeader
} from '../../../../shared/components/page-header/page-header';

import {
  WarehouseService
} from '../../services/warehouse';

import {
  CreateWarehouseRequest,
  UpdateWarehouseRequest
} from '../../models/warehouse.model';

@Component({
  selector: 'app-warehouse-form',

  imports: [
    ReactiveFormsModule,
    PageHeader
  ],

  templateUrl:
    './warehouses-form.html',

  styleUrl:
    './warehouses-form.scss'
})
export class WarehouseForm
  implements OnInit {

  private readonly fb =
    inject(FormBuilder);

  private readonly warehouseService =
    inject(WarehouseService);

  private readonly route =
    inject(ActivatedRoute);

  private readonly router =
    inject(Router);

  protected readonly editing =
    signal(false);

  protected readonly loading =
    signal(false);

  protected readonly saving =
    signal(false);

  protected readonly error =
    signal('');

  private warehouseId = '';

  protected readonly form =
    this.fb.nonNullable.group({

      name: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100)
        ]
      ],

      code: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(30)
        ]
      ],

      location: [
        '',
        Validators.maxLength(200)
      ],

      manager: [
        '',
        Validators.maxLength(100)
      ],

      description: [
        '',
        Validators.maxLength(500)
      ],

      isActive: [
        true
      ]

    });

  ngOnInit(): void {

    const id =
      this.route.snapshot.paramMap.get('id');

    if (id) {

      this.warehouseId = id;

      this.editing.set(true);

      this.loadWarehouse();

    }

  }

  private loadWarehouse(): void {

    this.loading.set(true);

    this.warehouseService
      .getWarehouse(
        this.warehouseId
      )
      .subscribe({

        next: response => {

          const warehouse =
            response.data;

          this.form.patchValue({

            name:
              warehouse.name,

            code:
              warehouse.code,

            location:
              warehouse.location ?? '',

            manager:
              warehouse.createdBy?.name ?? '',

            description:
              warehouse.description ?? '',

            isActive:
              warehouse.isActive

          });

          this.loading.set(false);

        },

        error: error => {

          console.error(
            'Warehouse error:',
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

  protected submit(): void {

    if (this.form.invalid) {

      this.form.markAllAsTouched();

      return;

    }

    this.error.set('');

    this.saving.set(true);

    const value =
      this.form.getRawValue();

    if (this.editing()) {

      const data:
      UpdateWarehouseRequest = value;

      this.warehouseService
        .updateWarehouse(
          this.warehouseId,
          data
        )
        .subscribe({

          next: () => {

            this.saving.set(false);

            this.router.navigate([
              '/admin/warehouses',
              this.warehouseId
            ]);

          },

          error: error => {

            this.saving.set(false);

            this.error.set(
              error?.error?.message ||
              'Unable to update warehouse.'
            );

          }

        });

      return;

    }

    const data:
      CreateWarehouseRequest = value;

    this.warehouseService
      .createWarehouse(data)
      .subscribe({

        next: warehouse => {

          this.saving.set(false);

          this.router.navigate([
            '/admin/warehouses',
            warehouse.data._id
          ]);

        },

        error: error => {

          this.saving.set(false);

          this.error.set(
            error?.error?.message ||
            'Unable to create warehouse.'
          );

        }

      });

  }

  protected back(): void {

    this.router.navigate([
      '/admin/warehouses'
    ]);

  }

}
