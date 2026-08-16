import {
  Component,
  inject,
  OnInit,
  signal
} from '@angular/core';

import {
  CurrencyPipe,
  DatePipe,
  DecimalPipe
} from '@angular/common';

import {
  ActivatedRoute,
  Router,
  RouterLink
} from '@angular/router';

import {
  Product
} from '../../models/product.model';

import {
  ProductService
} from '../../services/product';

import {
  PageHeader
} from '../../../../shared/components/page-header/page-header';

@Component({
  selector: 'app-product-details',

imports: [
  CurrencyPipe,
  DatePipe,
  DecimalPipe,
  PageHeader,
  RouterLink
],

  templateUrl:
    './products-details.html',

  styleUrl:
    './products-details.scss'
})
export class ProductDetails
  implements OnInit {

  private readonly route =
    inject(ActivatedRoute);

  private readonly router =
    inject(Router);

  private readonly productService =
    inject(ProductService);

  protected readonly product =
    signal<Product | null>(null);

  protected readonly loading =
    signal(true);

  protected readonly error =
    signal('');
protected readonly actionLoading =
  signal(false);

  private productId = '';

  ngOnInit(): void {

    this.productId =
      this.route.snapshot.paramMap.get('id') ?? '';

    if (!this.productId) {

      this.back();

      return;

    }

    this.loadProduct();

  }

  private loadProduct(): void {

    this.productService
      .getProduct(
        this.productId
      )
      .subscribe({

        next: product => {

          this.product.set(product);

          this.loading.set(false);

        },

        error: error => {

          console.error(
            'Product details error:',
            error
          );

          this.error.set(
            error?.error?.message ||
            'Unable to load product.'
          );

          this.loading.set(false);

        }

      });

  }

  protected get categoryName(): string {

    const category =
      this.product()?.category;

    return typeof category === 'string'
      ? category
      : category?.name ?? '—';

  }

  protected get margin(): number {

    const product =
      this.product();

    if (!product) {
      return 0;
    }

    return (
      product.sellingPrice -
      product.purchasePrice
    );

  }

  protected get marginPercentage(): number {

    const product =
      this.product();

    if (
      !product ||
      product.purchasePrice <= 0
    ) {
      return 0;
    }

    return (
      this.margin /
      product.purchasePrice
    ) * 100;

  }

  protected edit(): void {

    this.router.navigate([
      '/admin/products',
      this.productId,
      'edit'
    ]);

  }

  protected back(): void {

    this.router.navigate([
      '/admin/products'
    ]);

  }

protected deactivate(): void {

  const product =
    this.product();

  if (!product) {
    return;
  }

  this.actionLoading.set(true);

  this.productService
    .deactivateProduct(
      product._id
    )
    .subscribe({

      next: updatedProduct => {

        this.product.set(
          updatedProduct
        );

        this.actionLoading.set(false);

      },

      error: error => {

        console.error(
          'Deactivate product error:',
          error
        );

        this.error.set(
          error?.error?.message ||
          'Unable to deactivate product.'
        );

        this.actionLoading.set(false);

      }

    });

}

protected restore(): void {

  const product =
    this.product();

  if (!product) {
    return;
  }

  this.actionLoading.set(true);

  this.productService
    .restoreProduct(
      product._id
    )
    .subscribe({

      next: updatedProduct => {

        this.product.set(
          updatedProduct
        );

        this.actionLoading.set(false);

      },

      error: error => {

        console.error(
          'Restore product error:',
          error
        );

        this.error.set(
          error?.error?.message ||
          'Unable to restore product.'
        );

        this.actionLoading.set(false);

      }

    });

}
  }
