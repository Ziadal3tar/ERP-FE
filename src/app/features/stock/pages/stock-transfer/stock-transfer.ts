import {
  Component,
  DestroyRef,
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
  forkJoin
} from 'rxjs';

import {
  takeUntilDestroyed
} from '@angular/core/rxjs-interop';

import {
  StockService
} from '../../services/stock';

import {
  ProductService
} from '../../../products/services/product';

import {
  WarehouseService
} from '../../../warehouses/services/warehouse';

import {
  Product
} from '../../../products/models/product.model';

import {
  Warehouse
} from '../../../warehouses/models/warehouse.model';

import {
  PageHeader
} from '../../../../shared/components/page-header/page-header';

import {
  ToastService
} from '../../../../core/services/toast';

@Component({
  selector: 'app-stock-transfer',

  standalone: true,

  imports: [
    ReactiveFormsModule,
    PageHeader
  ],

  templateUrl: './stock-transfer.html',

  styleUrl: './stock-transfer.scss'
})
export class StockTransfer
  implements OnInit {

  private readonly fb =
    inject(FormBuilder);

  private readonly stockService =
    inject(StockService);

  private readonly productService =
    inject(ProductService);

  private readonly warehouseService =
    inject(WarehouseService);

  private readonly route =
    inject(ActivatedRoute);

  private readonly router =
    inject(Router);

  private readonly toast =
    inject(ToastService);

  private readonly destroyRef =
    inject(DestroyRef);



  protected readonly products =
    signal<Product[]>([]);

  protected readonly warehouses =
    signal<Warehouse[]>([]);



  protected readonly loading =
    signal(true);

  protected readonly saving =
    signal(false);

  protected readonly error =
    signal('');



  protected readonly form =
    this.fb.nonNullable.group({

      product: [
        '',
        Validators.required
      ],

      fromWarehouse: [
        '',
        Validators.required
      ],

      toWarehouse: [
        '',
        Validators.required
      ],

      quantity: [
        1,
        [
          Validators.required,
          Validators.min(0.01)
        ]
      ],

      reference: [
        '',
        Validators.maxLength(100)
      ],

      notes: [
        '',
        Validators.maxLength(500)
      ]

    });

  ngOnInit(): void {

    this.loadDependencies();

  }



  private loadDependencies(): void {

    this.loading.set(true);

    const productId =
      this.route.snapshot.queryParamMap.get(
        'product'
      );

    const warehouseId =
      this.route.snapshot.queryParamMap.get(
        'warehouse'
      );

    forkJoin({

      products:
        this.productService.getProducts(
          1,
          100
        ),

      warehouses:
        this.warehouseService.getWarehouses(
          1,
          100
        )

    })

    .pipe(
      takeUntilDestroyed(
        this.destroyRef
      )
    )

    .subscribe({

      next: response => {

        this.products.set(
          response.products.data.filter(
            product =>
              product.isActive
          )
        );

        this.warehouses.set(
          response.warehouses.data.filter(
            warehouse =>
              warehouse.isActive
          )
        );

        this.form.patchValue({

          product:
            productId &&
            this.products().some(
              product =>
                product._id === productId
            )
              ? productId
              : '',

          fromWarehouse:
            warehouseId &&
            this.warehouses().some(
              warehouse =>
                warehouse._id === warehouseId
            )
              ? warehouseId
              : ''

        });

        this.loading.set(false);

      },

      error: error => {

        console.error(
          'Stock Transfer dependencies error:',
          error
        );

        this.error.set(
          error?.error?.message ??
          'Unable to load products and warehouses.'
        );

        this.loading.set(false);

      }

    });

  }



  protected get destinationWarehouses():
    Warehouse[] {

    const source =
      this.form.controls.fromWarehouse.value;

    return this.warehouses()
      .filter(
        warehouse =>
          warehouse._id !== source
      );

  }



  protected submit(): void {

    if (
      this.form.invalid
    ) {

      this.form.markAllAsTouched();

      return;

    }

    const value =
      this.form.getRawValue();

    if (
      value.fromWarehouse ===
      value.toWarehouse
    ) {

      this.error.set(
        'Source and destination warehouses must be different.'
      );

      return;

    }

    this.error.set('');

    this.saving.set(true);

    this.stockService

      .transferStock({

        product:
          value.product,

        fromWarehouse:
          value.fromWarehouse,

        toWarehouse:
          value.toWarehouse,

        quantity:
          value.quantity,

        reference:
          value.reference.trim() ||
          undefined,

        notes:
          value.notes.trim() ||
          undefined

      })

      .pipe(
        takeUntilDestroyed(
          this.destroyRef
        )
      )

      .subscribe({

        next: () => {

          this.saving.set(false);

          this.toast.success(
            'Stock transferred successfully.'
          );

          this.router.navigate([
            '/admin/stock'
          ]);

        },

        error: error => {

          console.error(
            'Stock Transfer error:',
            error
          );

          this.saving.set(false);

          this.error.set(
            error?.error?.message ??
            'Unable to transfer stock.'
          );

        }

      });

  }



  protected back(): void {

    this.router.navigate([
      '/admin/stock'
    ]);

  }



  protected get selectedProduct():
    Product | null {

    const id =
      this.form.controls.product.value;

    return (
      this.products()
        .find(
          product =>
            product._id === id
        )
      ?? null
    );

  }



  protected get selectedSourceWarehouse():
    Warehouse | null {

    const id =
      this.form.controls.fromWarehouse.value;

    return (
      this.warehouses()
        .find(
          warehouse =>
            warehouse._id === id
        )
      ?? null
    );

  }



  protected get selectedDestinationWarehouse():
    Warehouse | null {

    const id =
      this.form.controls.toWarehouse.value;

    return (
      this.warehouses()
        .find(
          warehouse =>
            warehouse._id === id
        )
      ?? null
    );

  }

}
