
import {
  Component,
  inject,
  OnInit,
  signal
} from '@angular/core';

import {
  FormsModule
} from '@angular/forms';

import {
  Router
} from '@angular/router';

import {
  PageHeader
} from '../../../../shared/components/page-header/page-header';

import {
  DataTable,
  TableColumn
} from '../../../../shared/components/data-table/data-table';

import {
  Pagination
} from '../../../../shared/components/pagination/pagination';

import {
  Product
} from '../../models/product.model';

import {
  ProductService
} from '../../services/product';

import {
  Category
} from '../../../categories/models/category.model';

import {
  CategoryService
} from '../../../categories/services/category';

@Component({
  selector: 'app-products-list',

  imports: [
    FormsModule,
    PageHeader,
    DataTable,
    Pagination
  ],

  templateUrl:
    './products-list.html',

  styleUrl:
    './products-list.scss'
})
export class ProductsList
  implements OnInit {

  private readonly productService =
    inject(ProductService);

  private readonly categoryService =
    inject(CategoryService);

  private readonly router =
    inject(Router);

  protected readonly products =
    signal<Product[]>([]);

  protected readonly categories =
    signal<Category[]>([]);

  protected readonly loading =
    signal(true);

  protected readonly categoriesLoading =
    signal(true);

  protected readonly error =
    signal('');

  protected readonly page =
    signal(1);

  protected readonly limit =
    signal(10);

  protected readonly total =
    signal(0);

  protected readonly totalPages =
    signal(0);

  protected search = '';

  protected selectedCategory = '';

  protected selectedStatus = '';

  protected readonly columns:
    TableColumn<Product>[] = [

    {
      key: 'name',
      label: 'Product'
    },

    {
      key: 'sku',
      label: 'SKU'
    },

    {
      key: 'category.name',
      label: 'Category'
    },

    {
      key: 'purchasePrice',
      label: 'Purchase Price'
    },

    {
      key: 'sellingPrice',
      label: 'Selling Price'
    },

    {
      key: 'isActive',
      label: 'Status',

      type: 'status',

      render: product =>
        product.isActive
          ? 'Active'
          : 'Inactive'
    }

  ];

  ngOnInit(): void {

    this.loadCategories();

    this.loadProducts();

  }

  protected loadCategories(): void {

    this.categoriesLoading.set(true);

    this.categoryService
      .getCategories(1, 100)
      .subscribe({

        next: response => {

          this.categories.set(
            response.data
          );

          this.categoriesLoading.set(false);

        },

        error: error => {

          console.error(
            'Categories error:',
            error
          );

          this.categoriesLoading.set(false);

        }

      });

  }

  protected loadProducts(): void {

    this.loading.set(true);

    this.error.set('');

    this.productService
      .getProducts(
        this.page(),
        this.limit(),
        this.search,
        this.selectedCategory,
        this.selectedStatus
      )
      .subscribe({

        next: response => {

          this.products.set(
            response.data
          );

          this.total.set(
            response.pagination.total
          );

          this.totalPages.set(
            response.pagination.totalPages
          );

          this.loading.set(false);

        },

        error: error => {

          console.error(
            'Products error:',
            error
          );

          this.error.set(
            error?.error?.message ||
            'Unable to load products.'
          );

          this.loading.set(false);

        }

      });

  }

  protected applyFilters(): void {

    this.page.set(1);

    this.loadProducts();

  }

  protected clearFilters(): void {

    this.search = '';

    this.selectedCategory = '';

    this.selectedStatus = '';

    this.page.set(1);

    this.loadProducts();

  }

  protected changePage(
    page: number
  ): void {

    this.page.set(page);

    this.loadProducts();

  }

  protected createProduct(): void {

    this.router.navigate([
      '/admin/products/create'
    ]);

  }

  protected openProduct(
    product: Product
  ): void {

    this.router.navigate([
      '/admin/products',
      product._id
    ]);

  }

  protected refresh(): void {

    this.loadCategories();

    this.loadProducts();

  }

}
