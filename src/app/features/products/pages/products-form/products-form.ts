import {
  Component,
  inject,
  OnInit,
  signal} from '@angular/core';

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
  ProductService
} from '../../services/product';

import {
  CreateProductRequest,
  UpdateProductRequest
} from '../../models/product.model';

import {
  Category
} from '../../../categories/models/category.model';

import {
  CategoryService
} from '../../../categories/services/category';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-product-form',

  imports: [
    ReactiveFormsModule,
    PageHeader,
    DecimalPipe
  ],

  templateUrl: './products-form.html',

  styleUrl: './products-form.scss'
})
export class ProductForm
  implements OnInit {

  private readonly fb =
    inject(FormBuilder);

  private readonly productService =
    inject(ProductService);

  private readonly categoryService =
    inject(CategoryService);

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

  protected readonly categories =
    signal<Category[]>([]);

  private productId = '';

  protected readonly form =
    this.fb.nonNullable.group({

      name: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(150)
        ]
      ],

      sku: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50)
        ]
      ],

      category: [
        '',
        Validators.required
      ],

      purchasePrice: [
        0,
        [
          Validators.required,
          Validators.min(0)
        ]
      ],

      sellingPrice: [
        0,
        [
          Validators.required,
          Validators.min(0)
        ]
      ],

      minimumStock: [
        0,
        [
          Validators.required,
          Validators.min(0)
        ]
      ],

      description: [
        '',
        Validators.maxLength(1000)
      ],

      isActive: [
        true
      ]

    });

  ngOnInit(): void {

    this.loadCategories();

    const id =
      this.route.snapshot.paramMap.get('id');

    if (id) {

      this.productId = id;

      this.editing.set(true);

      this.loadProduct();

    }

  }

  private loadCategories(): void {

    this.categoryService
      .getCategories(1, 100)
      .subscribe({

        next: response => {

          this.categories.set(
            response.data
          );

        },

        error: error => {

          console.error(
            'Categories error:',
            error
          );

          this.error.set(
            error?.error?.message ||
            'Unable to load categories.'
          );

        }

      });

  }

  private loadProduct(): void {

    this.loading.set(true);

    this.productService
      .getProduct(
        this.productId
      )
      .subscribe({

        next: product => {

          const categoryId =
            typeof product.category === 'string'
              ? product.category
              : product.category._id;

          this.form.patchValue({

            name:
              product.name,

            sku:
              product.sku,

            category:
              categoryId,

            purchasePrice:
              product.purchasePrice,

            sellingPrice:
              product.sellingPrice,

            minimumStock:
              product.minStock,

            description:
              product.description ?? '',

            isActive:
              product.isActive

          });

          this.loading.set(false);

        },

        error: error => {

          console.error(
            'Product error:',
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

protected submit(): void {

  if (this.form.invalid) {

    this.form.markAllAsTouched();

    return;

  }

  const value =
    this.form.getRawValue();

  if (
    value.sellingPrice <
    value.purchasePrice
  ) {

    this.error.set(
      'Selling price should not be lower than purchase price.'
    );

    return;

  }

  this.error.set('');

  this.saving.set(true);

  /*
  |--------------------------------------------------------------------------
  | Update
  |--------------------------------------------------------------------------
  */

  if (this.editing()) {

    const data:
      UpdateProductRequest = {

      name:
        value.name,

      sku:
        value.sku,

      category:
        value.category,

      purchasePrice:
        value.purchasePrice,

      sellingPrice:
        value.sellingPrice,

      minStock:
        value.minimumStock,

      description:
        value.description

    };

    this.productService
      .updateProduct(
        this.productId,
        data
      )
      .subscribe({

        next: () => {

          this.saving.set(false);

          this.router.navigate([
            '/admin/products',
            this.productId
          ]);

        },

        error: error => {

          console.error(
            'Update product error:',
            error
          );

          this.error.set(
            error?.error?.message ||
            'Unable to update product.'
          );

          this.saving.set(false);

        }

      });

    return;

  }

  /*
  |--------------------------------------------------------------------------
  | Create
  |--------------------------------------------------------------------------
  */

  const data:
    CreateProductRequest = {

    name:
      value.name,

    sku:
      value.sku,

    category:
      value.category,

    purchasePrice:
      value.purchasePrice,

    sellingPrice:
      value.sellingPrice,

    minStock:
      value.minimumStock,

    description:
      value.description

  };

  this.productService
    .createProduct(data)
    .subscribe({

      next: product => {

        this.saving.set(false);

        this.router.navigate([
          '/admin/products',
          product._id
        ]);

      },

      error: error => {

        console.error(
          'Create product error:',
          error
        );

        this.error.set(
          error?.error?.message ||
          'Unable to create product.'
        );

        this.saving.set(false);

      }

    });

}

  protected back(): void {

    this.router.navigate([
      '/admin/products'
    ]);

  }

}
