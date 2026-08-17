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
  CategoryService
} from '../../services/category';

import {
  CreateCategoryRequest,
  UpdateCategoryRequest
} from '../../models/category.model';

@Component({
  selector: 'app-category-form',

  imports: [
    ReactiveFormsModule,
    PageHeader
  ],

  templateUrl: './category-form.html',

  styleUrl: './category-form.scss'
})
export class CategoryForm
  implements OnInit {

  private readonly fb =
    inject(FormBuilder);

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

  private categoryId = '';

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

      this.categoryId = id;

      this.editing.set(true);

      this.loadCategory();

    }

  }

  private loadCategory(): void {

    this.loading.set(true);

    this.categoryService
      .getCategory(this.categoryId)
      .subscribe({

        next: category => {

          this.form.patchValue({

            name:
              category.name,

            description:
              category.description ?? '',

            isActive:
              category.isActive

          });

          this.loading.set(false);

        },

        error: error => {

          console.error(
            error
          );

          this.error.set(
            error?.error?.message ||
            'Unable to load category.'
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

  this.saving.set(true);

  this.error.set('');

  const value =
    this.form.getRawValue();



  if (!this.editing()) {

    const data:
      CreateCategoryRequest = {

      name:
        value.name,

      description:
        value.description,

      isActive:
        value.isActive

    };

    this.categoryService
      .createCategory(data)
      .subscribe({

        next: category => {

          this.saving.set(false);

          this.router.navigate([
            '/admin/categories',
            category._id
          ]);

        },

        error: error => {

          this.saving.set(false);

          this.error.set(
            error?.error?.message ||
            'Unable to create category.'
          );

        }

      });

    return;

  }



  const data:
    UpdateCategoryRequest = {

    name:
      value.name,

    description:
      value.description

  };

  this.categoryService
    .updateCategory(
      this.categoryId,
      data
    )
    .subscribe({

      next: () => {

        this.handleStatusChange(
          value.isActive
        );

      },

      error: error => {

        this.saving.set(false);

        this.error.set(
          error?.error?.message ||
          'Unable to update category.'
        );

      }

    });

}
private handleStatusChange(
  isActive: boolean
): void {

  if (isActive) {

    this.categoryService
      .restoreCategory(
        this.categoryId
      )
      .subscribe({

        next: () => {

          this.finishSave();

        },

        error: error => {

          this.saving.set(false);

          this.error.set(
            error?.error?.message ||
            'Unable to restore category.'
          );

        }

      });

    return;

  }

  this.categoryService
    .deleteCategory(
      this.categoryId
    )
    .subscribe({

      next: () => {

        this.finishSave();

      },

      error: error => {

        this.saving.set(false);

        this.error.set(
          error?.error?.message ||
          'Unable to delete category.'
        );

      }

    });

}
private finishSave(): void {

  this.saving.set(false);

  this.router.navigate([
    '/admin/categories',
    this.categoryId
  ]);

}
  protected back(): void {

    this.router.navigate([
      '/admin/categories'
    ]);

  }

}
