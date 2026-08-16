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
  CustomerService
} from '../../../customers/services/customer';

import {
  ProductService
} from '../../../products/services/product';

import {
  WarehouseService
} from '../../../warehouses/services/warehouse';

import {
  Customer
} from '../../../customers/models/customer.model';

import {
  Product
} from '../../../products/models/product.model';

import {
  Warehouse
} from '../../../warehouses/models/warehouse.model';

import {
  CreateSaleRequest,
  SalePaymentMethod
} from '../../models/sale.model';

/*
|--------------------------------------------------------------------------
| Typed Sale Item Form
|--------------------------------------------------------------------------
*/

type SaleItemForm = FormGroup<{
  product: FormControl<string>;
  quantity: FormControl<number>;
  unitPrice: FormControl<number>;
}>;

@Component({
  selector: 'app-sale-form',

  standalone: true,

  imports: [
    ReactiveFormsModule,
    CurrencyPipe,
    DecimalPipe
  ],

  templateUrl:
    './sale-form.html',

  styleUrl:
    './sale-form.scss'
})
export class SaleForm
  implements OnInit {

  private readonly fb =
    inject(FormBuilder);

  private readonly customerService =
    inject(CustomerService);

  private readonly productService =
    inject(ProductService);

  private readonly warehouseService =
    inject(WarehouseService);

  private readonly destroyRef =
    inject(DestroyRef);

  /*
  |--------------------------------------------------------------------------
  | Inputs
  |--------------------------------------------------------------------------
  */

  readonly initialCustomer =
    input('');

  readonly initialWarehouse =
    input('');

  readonly loading =
    input(false);

  /*
  |--------------------------------------------------------------------------
  | Outputs
  |--------------------------------------------------------------------------
  */

  readonly submitted =
    output<CreateSaleRequest>();

  readonly cancelled =
    output<void>();

  /*
  |--------------------------------------------------------------------------
  | API Data
  |--------------------------------------------------------------------------
  */

  protected readonly customers =
    signal<Customer[]>([]);

  protected readonly products =
    signal<Product[]>([]);

  protected readonly warehouses =
    signal<Warehouse[]>([]);

  /*
  |--------------------------------------------------------------------------
  | State
  |--------------------------------------------------------------------------
  */

  protected readonly dataLoading =
    signal(true);

  protected readonly dataError =
    signal('');

  /*
  |--------------------------------------------------------------------------
  | Payment Methods
  |--------------------------------------------------------------------------
  */

  protected readonly paymentMethods:
    SalePaymentMethod[] = [

    'Cash',

    'Card',

    'Bank',

    'Credit'

  ];

  /*
  |--------------------------------------------------------------------------
  | Items
  |--------------------------------------------------------------------------
  */

  protected readonly items =
    this.fb.array<SaleItemForm>([

      this.createItem()

    ]);

  /*
  |--------------------------------------------------------------------------
  | Main Form
  |--------------------------------------------------------------------------
  */

  protected readonly form =
    this.fb.nonNullable.group({

      customer:
        this.fb.nonNullable.control(
          '',
          Validators.required
        ),

      warehouse:
        this.fb.nonNullable.control(
          '',
          Validators.required
        ),

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

      paymentMethod:
        this.fb.nonNullable.control<SalePaymentMethod>(
          'Cash',
          Validators.required
        ),

      notes:
        this.fb.nonNullable.control(
          '',
          Validators.maxLength(500)
        )

    });

  /*
  |--------------------------------------------------------------------------
  | Lifecycle
  |--------------------------------------------------------------------------
  */

  ngOnInit(): void {

    this.loadDependencies();

  }

  /*
  |--------------------------------------------------------------------------
  | Create Item Form
  |--------------------------------------------------------------------------
  */

  private createItem(): SaleItemForm {

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

  /*
  |--------------------------------------------------------------------------
  | Item Operations
  |--------------------------------------------------------------------------
  */

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

  /*
  |--------------------------------------------------------------------------
  | Load Dependencies
  |--------------------------------------------------------------------------
  */

  private loadDependencies(): void {

    this.dataLoading.set(true);

    this.dataError.set('');

    forkJoin({

      customers:
        this.customerService.getCustomers(
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

        this.customers.set(
          response.customers.data ?? []
        );

        this.products.set(
          (response.products.data ?? [])
            .filter(
              product =>
                product.isActive
            )
        );

        this.warehouses.set(
          (response.warehouses.data ?? [])
            .filter(
              warehouse =>
                warehouse.isActive
            )
        );

        this.applyInitialValues();

        this.dataLoading.set(
          false
        );

      },

      error: error => {

        console.error(
          'Sale dependencies error:',
          error
        );

        this.dataError.set(
          error?.error?.message ??
          'Unable to load customers, products and warehouses.'
        );

        this.dataLoading.set(
          false
        );

      }

    });

  }

  /*
  |--------------------------------------------------------------------------
  | Initial Query Params
  |--------------------------------------------------------------------------
  */

  private applyInitialValues(): void {

    const customerId =
      this.initialCustomer();

    const warehouseId =
      this.initialWarehouse();

    if (

      customerId &&

      this.customers().some(
        customer =>
          customer._id === customerId
      )

    ) {

      this.form.controls.customer.setValue(
        customerId
      );

    }

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

  }

  /*
  |--------------------------------------------------------------------------
  | Selected Customer
  |--------------------------------------------------------------------------
  */

  protected get selectedCustomer():
    Customer | null {

    const customerId =
      this.form.controls.customer.value;

    return (
      this.customers().find(
        customer =>
          customer._id === customerId
      ) ?? null
    );

  }

  /*
  |--------------------------------------------------------------------------
  | Credit
  |--------------------------------------------------------------------------
  */

  protected get creditAvailable(): boolean {

    return (
      (this.selectedCustomer?.creditLimit ?? 0) > 0
    );

  }

  protected paymentMethodChanged(): void {

    const paymentMethod =
      this.form.controls.paymentMethod.value;

    if (

      paymentMethod === 'Credit' &&

      !this.creditAvailable

    ) {

      this.form.controls.paymentMethod.setValue(
        'Cash'
      );

      this.dataError.set(
        'Credit payment is unavailable because this customer has no credit limit.'
      );

      return;

    }

    this.dataError.set('');

  }

  /*
  |--------------------------------------------------------------------------
  | Duplicate Product Detection
  |--------------------------------------------------------------------------
  */

  protected isProductUsed(
    productId: string,
    currentIndex: number
  ): boolean {

    return this.items.controls.some(
      (
        item,
        index
      ) => {

        if (
          index === currentIndex
        ) {

          return false;

        }
console.log(productId);

        return (
          item.controls.product.value ===
          productId
        );

      }
    );

  }

  /*
  |--------------------------------------------------------------------------
  | Calculations
  |--------------------------------------------------------------------------
  */

  protected itemTotal(
    index: number
  ): number {

    const item =
      this.items.at(
        index
      ).getRawValue();

    return (
      item.quantity *
      item.unitPrice
    );

  }

  protected get subtotal(): number {

    return this.items.controls.reduce(
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

    return (
      this.form.controls.discount.value
      || 0
    );

  }

  protected get taxValue(): number {

    return (
      this.form.controls.tax.value
      || 0
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

    return this.items.controls.reduce(
      (
        total,
        item
      ) => {

        return (
          total +
          item.controls.quantity.value
        );

      },
      0
    );

  }

  /*
  |--------------------------------------------------------------------------
  | Submit
  |--------------------------------------------------------------------------
  */

  protected submit(): void {

    this.dataError.set('');

    /*
    |--------------------------------------------------------------------------
    | Form Validation
    |--------------------------------------------------------------------------
    */

    if (
      this.form.invalid ||
      this.items.invalid
    ) {

      this.form.markAllAsTouched();

      this.items.markAllAsTouched();

      return;

    }

    /*
    |--------------------------------------------------------------------------
    | Total Validation
    |--------------------------------------------------------------------------
    */

    if (
      this.total < 0
    ) {

      this.dataError.set(
        'Sale total cannot be negative.'
      );

      return;

    }

    /*
    |--------------------------------------------------------------------------
    | Credit Validation
    |--------------------------------------------------------------------------
    */

    if (

      this.form.controls.paymentMethod.value ===
      'Credit' &&

      !this.creditAvailable

    ) {

      this.dataError.set(
        'Credit payment is unavailable for this customer.'
      );

      return;

    }

    /*
    |--------------------------------------------------------------------------
    | Product Duplicate Validation
    |--------------------------------------------------------------------------
    */

    const items =
      this.items.getRawValue();

    const productIds =
      items.map(
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
        'A product cannot appear more than once in the sale.'
      );

      return;

    }

    /*
    |--------------------------------------------------------------------------
    | Build Request
    |--------------------------------------------------------------------------
    */

    const payload:
      CreateSaleRequest = {

      customer:
        this.form.controls.customer.value,

      warehouse:
        this.form.controls.warehouse.value,

      items:
        items.map(
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
          this.form.controls.discount.value || 0
        ),

      tax:
        Number(
          this.form.controls.tax.value || 0
        ),

      paymentMethod:
        this.form.controls.paymentMethod.value,

      notes:
        this.form.controls.notes.value.trim()
        || undefined

    };

    this.submitted.emit(
      payload
    );

  }

  /*
  |--------------------------------------------------------------------------
  | Cancel
  |--------------------------------------------------------------------------
  */

  protected cancel(): void {

    this.cancelled.emit();

  }

  /*
  |--------------------------------------------------------------------------
  | Track
  |--------------------------------------------------------------------------
  */

  protected trackItem(
    index: number
  ): number {

    return index;

  }

}
