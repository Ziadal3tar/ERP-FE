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
  LoadingState
} from '../../../../shared/components/loading-state/loading-state';

import {
  ToastService
} from '../../../../core/services/toast';

import {
  DepartmentService
} from '../../services/department';

import {
  CreateDepartmentRequest,
  UpdateDepartmentRequest
} from '../../models/department.model';

@Component({
  selector: 'app-department-form',

  imports: [
    ReactiveFormsModule,
    PageHeader,
    LoadingState
  ],

  templateUrl:
    './department-form.html',

  styleUrl:
    './department-form.scss'
})
export class DepartmentForm
  implements OnInit {

  private readonly fb =
    inject(FormBuilder);

  private readonly departmentService =
    inject(DepartmentService);

  private readonly route =
    inject(ActivatedRoute);

  private readonly router =
    inject(Router);

  private readonly toast =
    inject(ToastService);

  protected readonly loading =
    signal(false);

  protected readonly saving =
    signal(false);

  protected readonly isEditMode =
    signal(false);

  protected readonly error =
    signal('');

  private departmentId:
    string | null = null;

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

      code: [
        '',
        [
          Validators.required,
          Validators.maxLength(30),
          Validators.pattern(
            /^[a-zA-Z0-9_-]+$/
          )
        ]
      ],

      description: [
        '',
        [
          Validators.maxLength(500)
        ]
      ]

    });

  ngOnInit(): void {

    this.departmentId =
      this.route.snapshot.paramMap.get('id');

    if (this.departmentId) {

      this.isEditMode.set(true);

      this.loadDepartment(
        this.departmentId
      );

    }

  }

  private loadDepartment(
    id: string
  ): void {

    this.loading.set(true);

    this.departmentService
      .getDepartment(id)
      .subscribe({

        next: department => {

          this.form.patchValue({

            name:
              department.name,

            code:
              department.code,

            description:
              department.description ?? ''

          });

          this.loading.set(false);

        },

        error: error => {

          console.error(
            'Department load error:',
            error
          );

          this.error.set(
            error?.error?.message ||
            'Unable to load department.'
          );

          this.loading.set(false);

        }

      });

  }

  protected submit(): void {

    this.error.set('');

    if (this.form.invalid) {

      this.form.markAllAsTouched();

      return;

    }

    this.saving.set(true);

    const value =
      this.form.getRawValue();

    if (
      this.isEditMode() &&
      this.departmentId
    ) {

      this.updateDepartment(
        this.departmentId,
        value
      );

    } else {

      this.createDepartment(
        value
      );

    }

  }

  private createDepartment(
    value: CreateDepartmentRequest
  ): void {

    this.departmentService
      .createDepartment(value)
      .subscribe({

        next: () => {

          this.saving.set(false);

          this.toast.success(
            'Department created successfully.'
          );

          this.router.navigate([
            '/admin/departments'
          ]);

        },

        error: error => {

          console.error(
            'Create department error:',
            error
          );

          this.error.set(
            error?.error?.message ||
            'Unable to create department.'
          );

          this.saving.set(false);

        }

      });

  }

  private updateDepartment(
    id: string,
    value: UpdateDepartmentRequest
  ): void {

    this.departmentService
      .updateDepartment(
        id,
        value
      )
      .subscribe({

        next: () => {

          this.saving.set(false);

          this.toast.success(
            'Department updated successfully.'
          );

          this.router.navigate([
            '/admin/departments'
          ]);

        },

        error: error => {

          console.error(
            'Update department error:',
            error
          );

          this.error.set(
            error?.error?.message ||
            'Unable to update department.'
          );

          this.saving.set(false);

        }

      });

  }

  protected back(): void {

    this.router.navigate([
      '/admin/departments'
    ]);

  }

}
