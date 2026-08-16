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
  Router,
  RouterLink
} from '@angular/router';

import {
  User
} from '../../models/user.model';

import {
  UserService
} from '../../services/user';

import {
  PageHeader
} from '../../../../shared/components/page-header/page-header';

import {
  StatusBadge
} from '../../../../shared/components/status-badge/status-badge';

import {
  LoadingState
} from '../../../../shared/components/loading-state/loading-state';

import {
  ConfirmDialog
} from '../../../../shared/components/confirm-dialog/confirm-dialog';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators
} from '@angular/forms';

import {
  ToastService
} from '../../../../core/services/toast';
@Component({
  selector: 'app-user-details',

imports: [
  RouterLink,
  DatePipe,
  PageHeader,
  StatusBadge,
  LoadingState,
  ConfirmDialog,
  ReactiveFormsModule,
],

  templateUrl: './user-details.html',

  styleUrl: './user-details.scss'
})
export class UserDetails implements OnInit {

  private readonly route =
    inject(ActivatedRoute);

  private readonly router =
    inject(Router);

  private readonly userService =
    inject(UserService);

  protected readonly user =
    signal<User | null>(null);

  protected readonly loading =
    signal(true);

  protected readonly error =
    signal('');

  protected readonly actionLoading =
    signal(false);

  protected readonly dialogOpen =
    signal(false);

  protected readonly dialogType =
    signal<'delete' | 'restore' | null>(null);

  protected readonly selectedRole =
    signal('');

  protected readonly statusChanging =
    signal(false);

  protected readonly roleChanging =
    signal(false);

  private userId = '';

  protected readonly roles = [
    'Admin',
    'Manager',
    'HR',
    'Sales',
    'Warehouse',
    'Employee'
  ];
private readonly fb =
  inject(FormBuilder);

private readonly toast =
  inject(ToastService);

protected readonly resetPasswordOpen =
  signal(false);

protected readonly resetPasswordLoading =
  signal(false);

protected readonly resetPasswordForm =
  this.fb.nonNullable.group({

    password: [
      '',
      [
        Validators.required,
        Validators.minLength(6)
      ]
    ],

    confirmPassword: [
      '',
      [
        Validators.required,
        Validators.minLength(6)
      ]
    ]

  });
  ngOnInit(): void {

    this.userId =
      this.route.snapshot.paramMap.get('id') ?? '';

    if (!this.userId) {

      this.router.navigate([
        '/admin/users'
      ]);

      return;

    }

    this.loadUser();

  }

  private loadUser(): void {

    this.loading.set(true);

    this.userService
      .getUser(this.userId)
      .subscribe({

        next: user => {

          this.user.set(user);

          this.selectedRole.set(
            user.role
          );

          this.loading.set(false);

        },

        error: error => {

          console.error(
            'User details error:',
            error
          );

          this.error.set(
            error?.error?.message ||
            'Unable to load user.'
          );

          this.loading.set(false);

        }

      });

  }
protected toggleResetPassword(): void {

  this.resetPasswordOpen.update(
    value => !value
  );

  this.resetPasswordForm.reset();

}
  protected editUser(): void {

    this.router.navigate([
      '/admin/users',
      this.userId,
      'edit'
    ]);

  }

  protected openDeleteDialog(): void {

    this.dialogType.set('delete');

    this.dialogOpen.set(true);

  }

  protected openRestoreDialog(): void {

    this.dialogType.set('restore');

    this.dialogOpen.set(true);

  }

  protected closeDialog(): void {

    this.dialogOpen.set(false);

    this.dialogType.set(null);

  }

  protected confirmDialog(): void {

    const type =
      this.dialogType();

    if (type === 'delete') {

      this.deleteUser();

      return;

    }

    if (type === 'restore') {

      this.restoreUser();

    }

  }

  private deleteUser(): void {

    this.actionLoading.set(true);

    this.closeDialog();

    this.userService
      .deleteUser(this.userId)
      .subscribe({

        next: () => {

  this.actionLoading.set(false);

  this.toast.success(
    'User has been deactivated successfully.'
  );

  this.loadUser();

},

        error: error => {

          console.error(
            'Delete user error:',
            error
          );

          this.error.set(
            error?.error?.message ||
            'Unable to delete user.'
          );

          this.actionLoading.set(false);

        }

      });

  }

  private restoreUser(): void {

    this.actionLoading.set(true);

    this.closeDialog();

    this.userService
      .restoreUser(this.userId)
      .subscribe({

        next: user => {

  this.user.set(user);

  this.selectedRole.set(
    user.role
  );

  this.actionLoading.set(false);

  this.toast.success(
    'User has been restored successfully.'
  );

},

        error: error => {

          console.error(
            'Restore user error:',
            error
          );

          this.error.set(
            error?.error?.message ||
            'Unable to restore user.'
          );

          this.actionLoading.set(false);

        }

      });

  }

  protected changeStatus(): void {

    const currentUser =
      this.user();

    if (!currentUser) {
      return;
    }

    this.statusChanging.set(true);

    this.userService
      .changeStatus(
        this.userId,
        !currentUser.isActive
      )
      .subscribe({

        next: user => {

  this.user.set(user);

  this.statusChanging.set(false);

  this.toast.success(
    `User is now ${
      user.isActive
        ? 'active'
        : 'inactive'
    }.`
  );

},

        error: error => {

          console.error(
            'Change status error:',
            error
          );

          this.error.set(
            error?.error?.message ||
            'Unable to change user status.'
          );

          this.statusChanging.set(false);

        }

      });

  }

  protected changeRole(): void {

    const role =
      this.selectedRole();

    if (
      !role ||
      role === this.user()?.role
    ) {

      return;

    }

    this.roleChanging.set(true);

    this.userService
      .changeRole(
        this.userId,
        role
      )
      .subscribe({

        next: user => {

  this.user.set(user);

  this.selectedRole.set(
    user.role
  );

  this.roleChanging.set(false);

  this.toast.success(
    `User role changed to ${user.role}.`
  );

},

        error: error => {

          console.error(
            'Change role error:',
            error
          );

          this.error.set(
            error?.error?.message ||
            'Unable to change user role.'
          );

          this.selectedRole.set(
            this.user()?.role ?? ''
          );

          this.roleChanging.set(false);

        }

      });

  }

  protected back(): void {

    this.router.navigate([
      '/admin/users'
    ]);

  }
protected resetPassword(): void {

  if (
    this.resetPasswordForm.invalid
  ) {

    this.resetPasswordForm.markAllAsTouched();

    return;

  }

  const {
    password,
    confirmPassword
  } =
    this.resetPasswordForm.getRawValue();

  if (
    password !== confirmPassword
  ) {

    this.toast.error(
      'Passwords do not match.'
    );

    return;

  }

  this.resetPasswordLoading.set(true);

  this.userService
    .resetPassword(
      this.userId,
      password
    )
    .subscribe({

      next: () => {

        this.resetPasswordLoading.set(false);

        this.resetPasswordOpen.set(false);

        this.resetPasswordForm.reset();

        this.toast.success(
          'The user password has been reset successfully.'
        );

      },

      error: error => {

        console.error(
          'Reset password error:',
          error
        );

        this.resetPasswordLoading.set(false);

        this.toast.error(
          error?.error?.message ||
          'Unable to reset password.'
        );

      }

    });

}
}
