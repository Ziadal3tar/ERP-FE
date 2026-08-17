import {
  Component,
  inject,
  OnInit,
  signal
} from '@angular/core';
import {
  ToastService
} from '../../../../core/services/toast';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators
} from '@angular/forms';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  UserService
} from '../../services/user';
import { CreateUserRequest, UpdateUserRequest } from '../../models/user.model';
import {
  PageHeader
} from '../../../../shared/components/page-header/page-header';

import {
  LoadingState
} from '../../../../shared/components/loading-state/loading-state';
@Component({
  selector: 'app-user-form',

  imports: [
    ReactiveFormsModule,
  PageHeader,
  LoadingState
  ],

  templateUrl: './user-form.html',

  styleUrl: './user-form.scss'
})
export class UserForm
  implements OnInit {
private readonly toast =
  inject(ToastService);
  private readonly fb =
    inject(FormBuilder);

  private readonly userService =
    inject(UserService);

  private readonly route =
    inject(ActivatedRoute);

  private readonly router =
    inject(Router);

  protected readonly loading =
    signal(false);

  protected readonly saving =
    signal(false);

  protected readonly error =
    signal('');

  protected readonly isEditMode =
    signal(false);

  private userId:
    string | null = null;

  protected readonly userForm =
    this.fb.nonNullable.group({

      name: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100)
        ]
      ],

      email: [
        '',
        [
          Validators.required,
          Validators.email
        ]
      ],

      password: [
        ''
      ],

      role: [
        'Employee',
        [
          Validators.required
        ]
      ]

    });

  protected readonly roles = [

    'Admin',
    'Manager',
    'HR',
    'Sales',
    'Warehouse',
    'Employee'

  ];

  ngOnInit(): void {

    this.userId =
      this.route.snapshot.paramMap.get('id');

    if (this.userId) {

      this.isEditMode.set(true);

      this.userForm
        .get('password')
        ?.clearValidators();

      this.userForm
        .get('password')
        ?.updateValueAndValidity();

      this.loadUser(
        this.userId
      );

    } else {

      this.userForm
        .get('password')
        ?.setValidators([
          Validators.required,
          Validators.minLength(6)
        ]);

      this.userForm
        .get('password')
        ?.updateValueAndValidity();

    }

  }



  private loadUser(
    id: string
  ): void {

    this.loading.set(true);

    this.userService
      .getUser(id)
      .subscribe({

        next: user => {

          this.userForm.patchValue({

            name:
              user.name,

            email:
              user.email,

            role:
              user.role

          });

          this.loading.set(false);

        },

        error: error => {

          console.error(
            'Load user error:',
            error
          );

          this.error.set(
            'Unable to load user.'
          );

          this.loading.set(false);

        }

      });

  }



  protected submit(): void {

    this.error.set('');

    if (
      this.userForm.invalid
    ) {

      this.userForm.markAllAsTouched();

      return;

    }

    this.saving.set(true);

    const value =
      this.userForm.getRawValue();

    if (
      this.isEditMode() &&
      this.userId
    ) {

      this.updateUser(
        this.userId,
        value
      );

    } else {

      this.createUser(
        value
      );

    }

  }



  private createUser(
  value: CreateUserRequest
):  void {

    this.userService
      .createUser(value)
      .subscribe({

 next: () => {

  this.saving.set(false);

  this.toast.success(
    'User created successfully.'
  );

  this.router.navigate([
    '/admin/users'
  ]);

},

        error: error => {

          console.error(
            'Create user error:',
            error
          );

          this.error.set(
            error?.error?.message ||
            'Unable to create user.'
          );

          this.saving.set(false);

        }

      });

  }



  private updateUser(
  id: string,
  value: UpdateUserRequest
): void {

    this.userService
      .updateUser(
        id,
        {
          name: value.name,
          email: value.email,
          role: value.role
        }
      )
      .subscribe({

next: () => {

  this.saving.set(false);

  this.toast.success(
    'User updated successfully.'
  );

  this.router.navigate([
    '/admin/users',
    id
  ]);

},

        error: error => {

          console.error(
            'Update user error:',
            error
          );

          this.error.set(
            error?.error?.message ||
            'Unable to update user.'
          );

          this.saving.set(false);

        }

      });

  }



  protected goBack(): void {

    this.router.navigate([
      '/admin/users'
    ]);

  }

}
