import {
  Component,
  DestroyRef,
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
  RouterLink
} from '@angular/router';

import {
  takeUntilDestroyed
} from '@angular/core/rxjs-interop';

import {
  AuthService
} from '../../../core/services/auth';

import {
  PageHeader
} from '../../../shared/components/page-header/page-header';


@Component({
  selector: 'app-change-password',

  standalone: true,

  imports: [
    ReactiveFormsModule,
    RouterLink,
    PageHeader
  ],

  templateUrl:
    './change-password.html',

  styleUrl:
    './change-password.scss'
})
export class ChangePassword
  implements OnInit {

  private readonly fb =
    inject(FormBuilder);

  private readonly authService =
    inject(AuthService);

  private readonly destroyRef =
    inject(DestroyRef);


  protected readonly loading =
    signal(false);

  protected readonly error =
    signal('');

  protected readonly success =
    signal('');


  protected readonly showCurrentPassword =
    signal(false);

  protected readonly showNewPassword =
    signal(false);

  protected readonly showConfirmPassword =
    signal(false);


  protected readonly form =
    this.fb.nonNullable.group({

      currentPassword: [
        '',
        [
          Validators.required
        ]
      ],

      newPassword: [
        '',
        [
          Validators.required,
          Validators.minLength(6)
        ]
      ],

      confirmPassword: [
        '',
        [
          Validators.required
        ]
      ]

    });


  ngOnInit(): void {

    this.form.controls.newPassword.valueChanges

      .pipe(
        takeUntilDestroyed(
          this.destroyRef
        )
      )

      .subscribe(() => {

        this.validatePasswordMatch();

      });


    this.form.controls.confirmPassword.valueChanges

      .pipe(
        takeUntilDestroyed(
          this.destroyRef
        )
      )

      .subscribe(() => {

        this.validatePasswordMatch();

      });

  }




  private validatePasswordMatch(): void {

    const newPassword =
      this.form.controls.newPassword.value;


    const confirmPassword =
      this.form.controls.confirmPassword.value;


    const control =
      this.form.controls.confirmPassword;


    if (
      !confirmPassword
    ) {

      if (
        control.hasError(
          'passwordMismatch'
        )
      ) {

        control.setErrors(
          null
        );

      }

      return;

    }


    if (
      newPassword !==
      confirmPassword
    ) {

      control.setErrors({

        ...control.errors,

        passwordMismatch:
          true

      });

      return;

    }


    const errors =
      {
        ...(control.errors ?? {})
      };


    delete errors[
      'passwordMismatch'
    ];


    control.setErrors(
      Object.keys(errors).length
        ? errors
        : null
    );

  }




  protected submit(): void {

    this.error.set('');

    this.success.set('');


    this.validatePasswordMatch();


    if (
      this.form.invalid
    ) {

      this.form.markAllAsTouched();

      return;

    }


    const {
      currentPassword,
      newPassword
    } =
      this.form.getRawValue();


    if (
      currentPassword ===
      newPassword
    ) {

      this.form.controls.newPassword.setErrors({

        sameAsCurrent:
          true

      });

      this.form.controls.newPassword.markAsTouched();

      return;

    }


    this.loading.set(true);


    this.authService

      .changePassword(
        currentPassword,
        newPassword
      )

      .pipe(
        takeUntilDestroyed(
          this.destroyRef
        )
      )

      .subscribe({

        next: response => {

          this.loading.set(false);


          this.success.set(
            response.message ??
            'Password changed successfully.'
          );


          this.form.reset();


          this.showCurrentPassword.set(
            false
          );

          this.showNewPassword.set(
            false
          );

          this.showConfirmPassword.set(
            false
          );

        },

        error: error => {

          console.error(
            'Change password error:',
            error
          );


          this.loading.set(false);


          this.error.set(
            error?.error?.message ??
            'Unable to change password.'
          );

        }

      });

  }




  protected toggleCurrentPassword(): void {

    this.showCurrentPassword.update(
      value =>
        !value
    );

  }


  protected toggleNewPassword(): void {

    this.showNewPassword.update(
      value =>
        !value
    );

  }


  protected toggleConfirmPassword(): void {

    this.showConfirmPassword.update(
      value =>
        !value
    );

  }




  protected clearMessages(): void {

    this.error.set('');

    this.success.set('');

  }

}
