import {
  Component,
  inject,
  output,
  signal
} from '@angular/core';

import {
  FormsModule
} from '@angular/forms';

import {
  Product
} from '../../../products/models/product.model';

import {
  Warehouse
} from '../../../warehouses/models/warehouse.model';

import {
  ProductService
} from '../../../products/services/product';

import {
  WarehouseService
} from '../../../warehouses/services/warehouse';

import {
  StockService
} from '../../services/stock';

import {
  ToastService
} from '../../../../core/services/toast';

type OperationType =
  | 'IN'
  | 'OUT'
  | 'TRANSFER';

@Component({
  selector: 'app-stock-operation-modal',

  imports: [
    FormsModule
  ],

  templateUrl:
    './stock-operation-modal.html',

  styleUrl:
    './stock-operation-modal.scss'
})
export class StockOperationModal {

  private readonly productService =
    inject(ProductService);

  private readonly warehouseService =
    inject(WarehouseService);

  private readonly stockService =
    inject(StockService);

  private readonly toast =
    inject(ToastService);

  readonly closed =
    output<void>();

  readonly completed =
    output<void>();

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

  protected operation:
    OperationType = 'IN';

  protected productId = '';

  protected warehouseId = '';

  protected fromWarehouseId = '';

  protected toWarehouseId = '';

  protected quantity: number | null = null;

  protected reference = '';

  protected notes = '';

  constructor() {

    this.loadDependencies();

  }

  private loadDependencies(): void {

    this.loading.set(true);

    let productsLoaded = false;

    let warehousesLoaded = false;

    this.productService
      .getProducts(1, 100)
      .subscribe({

        next: response => {

          this.products.set(
            response.data.filter(
              product =>
                product.isActive
            )
          );

          productsLoaded = true;

          this.finishLoading(
            productsLoaded,
            warehousesLoaded
          );

        },

        error: error => {

          console.error(
            'Products loading error:',
            error
          );

          this.error.set(
            'Unable to load products.'
          );

          productsLoaded = true;

          this.finishLoading(
            productsLoaded,
            warehousesLoaded
          );

        }

      });

    this.warehouseService
      .getWarehouses(1, 100)
      .subscribe({

        next: response => {

          this.warehouses.set(
            response.data.filter(
              warehouse =>
                warehouse.isActive
            )
          );

          warehousesLoaded = true;

          this.finishLoading(
            productsLoaded,
            warehousesLoaded
          );

        },

        error: error => {

          console.error(
            'Warehouses loading error:',
            error
          );

          this.error.set(
            'Unable to load warehouses.'
          );

          warehousesLoaded = true;

          this.finishLoading(
            productsLoaded,
            warehousesLoaded
          );

        }

      });

  }

  private finishLoading(
    productsLoaded: boolean,
    warehousesLoaded: boolean
  ): void {

    if (
      productsLoaded &&
      warehousesLoaded
    ) {

      this.loading.set(false);

    }

  }

  protected changeOperation(
    operation: OperationType
  ): void {

    this.operation = operation;

    this.error.set('');

    this.reference = '';

    this.notes = '';

    this.quantity = null;

  }

  protected submit(): void {

    this.error.set('');

    if (!this.productId) {

      this.error.set(
        'Please select a product.'
      );

      return;

    }

    if (
      this.quantity === null ||
      !Number.isFinite(this.quantity) ||
      this.quantity <= 0
    ) {

      this.error.set(
        'Quantity must be greater than zero.'
      );

      return;

    }

    if (this.operation === 'IN') {

      this.submitStockIn();

      return;

    }

    if (this.operation === 'OUT') {

      this.submitStockOut();

      return;

    }

    this.submitTransfer();

  }

  private submitStockIn(): void {

    if (!this.warehouseId) {

      this.error.set(
        'Please select a warehouse.'
      );

      return;

    }

    this.saving.set(true);

    this.stockService
      .stockIn({

        product:
          this.productId,

        warehouse:
          this.warehouseId,

        quantity:
          this.quantity!,

        reference:
          this.reference.trim() || undefined,

        notes:
          this.notes.trim() || undefined

      })
      .subscribe({

        next: () => {

          this.saving.set(false);

          this.toast.success(
            'Stock added successfully.'
          );

          this.completed.emit();

          this.closed.emit();

        },

        error: error => {

          console.error(
            'Stock in error:',
            error
          );

          this.saving.set(false);

          this.error.set(
            error?.error?.message ||
            'Unable to add stock.'
          );

        }

      });

  }

  private submitStockOut(): void {

    if (!this.warehouseId) {

      this.error.set(
        'Please select a warehouse.'
      );

      return;

    }

    this.saving.set(true);

    this.stockService
      .stockOut({

        product:
          this.productId,

        warehouse:
          this.warehouseId,

        quantity:
          this.quantity!,

        reference:
          this.reference.trim() || undefined,

        notes:
          this.notes.trim() || undefined

      })
      .subscribe({

        next: () => {

          this.saving.set(false);

          this.toast.success(
            'Stock removed successfully.'
          );

          this.completed.emit();

          this.closed.emit();

        },

        error: error => {

          console.error(
            'Stock out error:',
            error
          );

          this.saving.set(false);

          this.error.set(
            error?.error?.message ||
            'Unable to remove stock.'
          );

        }

      });

  }

  private submitTransfer(): void {

    if (!this.fromWarehouseId) {

      this.error.set(
        'Please select the source warehouse.'
      );

      return;

    }

    if (!this.toWarehouseId) {

      this.error.set(
        'Please select the destination warehouse.'
      );

      return;

    }

    if (
      this.fromWarehouseId ===
      this.toWarehouseId
    ) {

      this.error.set(
        'Source and destination warehouses must be different.'
      );

      return;

    }

    this.saving.set(true);

    this.stockService
      .transferStock({

        product:
          this.productId,

        fromWarehouse:
          this.fromWarehouseId,

        toWarehouse:
          this.toWarehouseId,

        quantity:
          this.quantity!,

        reference:
          this.reference.trim() || undefined,

        notes:
          this.notes.trim() || undefined

      })
      .subscribe({

        next: () => {

          this.saving.set(false);

          this.toast.success(
            'Stock transferred successfully.'
          );

          this.completed.emit();

          this.closed.emit();

        },

        error: error => {

          console.error(
            'Stock transfer error:',
            error
          );

          this.saving.set(false);

          this.error.set(
            error?.error?.message ||
            'Unable to transfer stock.'
          );

        }

      });

  }

  protected close(): void {

    if (this.saving()) {
      return;
    }

    this.closed.emit();

  }

  protected get availableDestinationWarehouses(): Warehouse[] {

    return this.warehouses()
      .filter(
        warehouse =>
          warehouse._id !==
          this.fromWarehouseId
      );

  }

}
