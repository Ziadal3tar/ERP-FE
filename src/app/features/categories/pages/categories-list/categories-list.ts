import {
  Component,
  inject,
  OnInit,
  signal
} from '@angular/core';

import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

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
  Category
} from '../../models/category.model';

import {
  CategoryService
} from '../../services/category';

@Component({
  selector: 'app-categories-list',

  imports: [
    FormsModule,
    PageHeader,
    DataTable,
    Pagination
  ],

  templateUrl: './categories-list.html',

  styleUrl: './categories-list.scss'
})
export class CategoriesList
  implements OnInit {

  private readonly categoryService =
    inject(CategoryService);

  private readonly router =
    inject(Router);

  protected readonly categories =
    signal<Category[]>([]);

  protected readonly loading =
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

  protected readonly columns:
    TableColumn<Category>[] = [

    {
      key: 'name',
      label: 'Category'
    },

    {
      key: 'description',
      label: 'Description'
    },

    {
      key: 'isActive',
      label: 'Status',

      type: 'status',

      render: category =>
        category.isActive
          ? 'Active'
          : 'Inactive'
    },

    {
      key: 'createdAt',
      label: 'Created'
    }

  ];

  ngOnInit(): void {
    this.loadCategories();
  }

  protected loadCategories(): void {

    this.loading.set(true);
    this.error.set('');

    this.categoryService
      .getCategories(
        this.page(),
        this.limit(),
        this.search
      )
      .subscribe({

        next: response => {

          this.categories.set(
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
            'Categories error:',
            error
          );

          this.error.set(
            error?.error?.message ||
            'Unable to load categories.'
          );

          this.loading.set(false);

        }

      });

  }

  protected searchCategories(): void {

    this.page.set(1);

    this.loadCategories();

  }

  protected clearSearch(): void {

    this.search = '';

    this.page.set(1);

    this.loadCategories();

  }

  protected changePage(
    page: number
  ): void {

    this.page.set(page);

    this.loadCategories();

  }

  protected createCategory(): void {

    this.router.navigate([
      '/admin/categories/create'
    ]);

  }

  protected openCategory(
    category: Category
  ): void {

    this.router.navigate([
      '/admin/categories',
      category._id
    ]);

  }

  protected refresh(): void {
    this.loadCategories();
  }

}
