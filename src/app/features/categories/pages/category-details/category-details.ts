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
  Router
} from '@angular/router';

import {
  Category
} from '../../models/category.model';

import {
  CategoryService
} from '../../services/category';

import {
  PageHeader
} from '../../../../shared/components/page-header/page-header';

@Component({
  selector: 'app-category-details',

  imports: [
    DatePipe,
    PageHeader
  ],

  templateUrl:
    './category-details.html',

  styleUrl:
    './category-details.scss'
})
export class CategoryDetails
  implements OnInit {

  private readonly route =
    inject(ActivatedRoute);

  private readonly router =
    inject(Router);

  private readonly categoryService =
    inject(CategoryService);

  protected readonly category =
    signal<Category | null>(null);

  protected readonly loading =
    signal(true);

  protected readonly error =
    signal('');

  private categoryId = '';

  ngOnInit(): void {

    this.categoryId =
      this.route.snapshot.paramMap.get('id') ?? '';

    if (!this.categoryId) {

      this.back();

      return;

    }

    this.loadCategory();

  }

  private loadCategory(): void {

    this.categoryService
      .getCategory(this.categoryId)
      .subscribe({

        next: category => {

          this.category.set(category);

          this.loading.set(false);

        },

        error: error => {

          this.error.set(
            error?.error?.message ||
            'Unable to load category.'
          );

          this.loading.set(false);

        }

      });

  }

  protected edit(): void {

    this.router.navigate([
      '/admin/categories',
      this.categoryId,
      'edit'
    ]);

  }

  protected back(): void {

    this.router.navigate([
      '/admin/categories'
    ]);

  }
protected restore(): void {

  this.categoryService
    .restoreCategory(this.categoryId)
    .subscribe({

      next: category => {

        this.category.set(category);

      },

      error: error => {

        this.error.set(
          error?.error?.message ||
          'Unable to restore category.'
        );

      }

    });

}

protected delete(): void {

  this.categoryService
    .deleteCategory(this.categoryId)
    .subscribe({

      next: () => {

        this.router.navigate([
          '/admin/categories'
        ]);

      },

      error: error => {

        this.error.set(
          error?.error?.message ||
          'Unable to delete category.'
        );

      }

    });

}
}
