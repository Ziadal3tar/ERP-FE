import {
  Component,
  DestroyRef,
  inject,
  input,
  OnInit,
  output,
  signal
} from '@angular/core';

import {
  CurrencyPipe,
  DecimalPipe
} from '@angular/common';

import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  forkJoin
} from 'rxjs';

import {
  takeUntilDestroyed
} from '@angular/core/rxjs-interop';

import {
  SupplierService
} from '../../../suppliers/services/supplier';

import {
  ProductService
} from '../../../products/services/product';

import {
  WarehouseService
} from '../../../warehouses/services/warehouse';

import {
  Supplier
} from '../../../suppliers/models/supplier.model';

import {
  Product
} from '../../../products/models/product.model';

import {
  Warehouse
} from '../../../warehouses/models/warehouse.model';

import {
  CreatePurchaseRequest
} from '../../models/purchase.model';



type PurchaseItemControls = {

  product:
    FormControl<string>;

  quantity:
    FormControl<number>;

  unitPrice:
    FormControl<number>;

};

type PurchaseItemForm =
  FormGroup<PurchaseItemControls>;

@Component({
  selector: 'app-purchase-form',

  standalone: true,

  imports: [
    ReactiveFormsModule,
    CurrencyPipe,
    DecimalPipe
  ],

  templateUrl:
    './purchase-form.html',

  styleUrl:
    './purchase-form.scss'
})
export class PurchaseForm
  implements OnInit {



  private readonly fb =
    inject(FormBuilder);

  private readonly supplierService =
    inject(SupplierService);

  private readonly productService =
    inject(ProductService);

  private readonly warehouseService =
    inject(WarehouseService);

  private readonly destroyRef =
    inject(DestroyRef);



  readonly loading =
    input(false);

  readonly initialSupplier =
    input('');

  readonly initialWarehouse =
    input('');



  readonly submitted =
    output<CreatePurchaseRequest>();

  readonly cancelled =
    output<void>();



  protected readonly suppliers =
    signal<Supplier[]>([]);

  protected readonly products =
    signal<Product[]>([]);

  protected readonly warehouses =
    signal<Warehouse[]>([]);



  protected readonly dataLoading =
    signal(true);

  protected readonly dataError =
    signal('');



  protected readonly form:
    FormGroup<{

      supplier:
        FormControl<string>;

      warehouse:
        FormControl<string>;

      items:
        FormArray<PurchaseItemForm>;

      discount:
        FormControl<number>;

      tax:
        FormControl<number>;

      notes:
        FormControl<string>;

    }> = this.fb.group({

      supplier:
        this.fb.nonNullable.control(
          '',
          Validators.required
        ),

      warehouse:
        this.fb.nonNullable.control(
          '',
          Validators.required
        ),

      items:
        this.fb.array<PurchaseItemForm>([
          this.createItem()
        ]),

      discount:
        this.fb.nonNullable.control(
          0,
          Validators.min(0)
        ),

      tax:
        this.fb.nonNullable.control(
          0,
          Validators.min(0)
        ),

      notes:
        this.fb.nonNullable.control(
          '',
          Validators.maxLength(500)
        )

    });



  ngOnInit(): void {

    this.loadDependencies();

  }



  private createItem():
    PurchaseItemForm {

    return this.fb.group({

      product:
        this.fb.nonNullable.control(
          '',
          Validators.required
        ),

      quantity:
        this.fb.nonNullable.control(
          1,
          [
            Validators.required,
            Validators.min(0.01)
          ]
        ),

      unitPrice:
        this.fb.nonNullable.control(
          0,
          [
            Validators.required,
            Validators.min(0)
          ]
        )

    });

  }

  protected get items():
    FormArray<PurchaseItemForm> {

    return this.form.controls.items;

  }

  protected get itemControls():
    PurchaseItemForm[] {

    return this.items.controls;

  }

  protected addItem(): void {

    this.items.push(
      this.createItem()
    );

  }

  protected removeItem(
    index: number
  ): void {

    if (
      this.items.length === 1
    ) {

      return;

    }

    this.items.removeAt(
      index
    );

  }



  private loadDependencies(): void {

    this.dataLoading.set(true);

    this.dataError.set('');

    forkJoin({

      suppliers:
        this.supplierService.getSuppliers(
          1,
          100,
          '',
          true
        ),

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



        this.suppliers.set(
          response.suppliers.data ?? []
        );



        this.products.set(

          (
            response.products.data ?? []
          )
          .filter(
            product =>
              product.isActive
          )

        );



        this.warehouses.set(

          (
            response.warehouses.data ?? []
          )
          .filter(
            warehouse =>
              warehouse.isActive
          )

        );



        const supplierId =
          this.initialSupplier();

        if (
          supplierId &&
          this.suppliers().some(
            supplier =>
              supplier._id === supplierId
          )
        ) {

          this.form.controls.supplier.setValue(
            supplierId
          );

        }



        const warehouseId =
          this.initialWarehouse();

        if (
          warehouseId &&
          this.warehouses().some(
            warehouse =>
              warehouse._id === warehouseId
          )
        ) {

          this.form.controls.warehouse.setValue(
            warehouseId
          );

        }

        this.dataLoading.set(
          false
        );

      },

      error: error => {

        console.error(
          'Purchase dependencies error:',
          error
        );

        this.dataError.set(
          error?.error?.message ??
          'Unable to load purchase dependencies.'
        );

        this.dataLoading.set(
          false
        );

      }

    });

  }



  protected isProductUsed(
    productId: string,
    currentIndex: number
  ): boolean {

    return this.itemControls.some(
      (
        item,
        index
      ) => {

        if (
          index === currentIndex
        ) {

          return false;

        }

        return (
          item.controls.product.value ===
          productId
        );

      }
    );

  }



  protected itemTotal(
    index: number
  ): number {

    const item =
      this.itemControls[index].getRawValue();

    return (
      Number(item.quantity) *
      Number(item.unitPrice)
    );

  }

  protected get subtotal(): number {

    return this.itemControls.reduce(
      (
        total,
        _,
        index
      ) => {

        return (
          total +
          this.itemTotal(index)
        );

      },
      0
    );

  }

  protected get discountValue(): number {

    return Number(
      this.form.controls.discount.value
    );

  }

  protected get taxValue(): number {

    return Number(
      this.form.controls.tax.value
    );

  }

  protected get total(): number {

    return (
      this.subtotal -
      this.discountValue +
      this.taxValue
    );

  }

  protected get totalItems(): number {

    return this.itemControls.reduce(
      (
        total,
        item
      ) => {

        return (
          total +
          Number(
            item.controls.quantity.value
          )
        );

      },
      0
    );

  }



  protected submit(): void {

    this.dataError.set('');

    if (
      this.form.invalid
    ) {

      this.form.markAllAsTouched();

      return;

    }

    if (
      this.total < 0
    ) {

      this.dataError.set(
        'Purchase total cannot be negative.'
      );

      return;

    }

    const value =
      this.form.getRawValue();



    const productIds =
      value.items.map(
        item =>
          item.product
      );

    const duplicated =
      productIds.some(
        (
          productId,
          index
        ) =>
          productIds.indexOf(
            productId
          ) !== index
      );

    if (
      duplicated
    ) {

      this.dataError.set(
        'A product cannot appear more than once in the purchase.'
      );

      return;

    }



    const payload:
      CreatePurchaseRequest = {

      supplier:
        value.supplier,

      warehouse:
        value.warehouse,

      items:
        value.items.map(
          item => ({

            product:
              item.product,

            quantity:
              Number(
                item.quantity
              ),

            unitPrice:
              Number(
                item.unitPrice
              )

          })
        ),

      discount:
        Number(
          value.discount
        ),

      tax:
        Number(
          value.tax
        ),

      notes:
        value.notes.trim() ||
        undefined

    };

    this.submitted.emit(
      payload
    );

  }



  protected cancel(): void {

    this.cancelled.emit();

  }

}
