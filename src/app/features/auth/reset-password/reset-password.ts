import {
  Component,
  inject,
  signal
} from '@angular/core';

import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';

import {
  ActivatedRoute,
  Router,
  RouterLink
} from '@angular/router';

import {
  AuthService
} from '../../../core/services/auth';


@Component({
  selector: 'app-reset-password',

  standalone: true,

  imports: [
    ReactiveFormsModule,
    RouterLink
  ],

  templateUrl:
    './reset-password.html',

  styleUrl:
    './reset-password.scss'
})
export class ResetPassword {

  private readonly fb =
    inject(FormBuilder);

  private readonly route =
    inject(ActivatedRoute);

  private readonly router =
    inject(Router);

  private readonly authService =
    inject(AuthService);


  protected readonly loading =
    signal(false);


  protected readonly successMessage =
    signal('');


  protected readonly errorMessage =
    signal('');


  protected readonly showPassword =
    signal(false);


  protected readonly showConfirmPassword =
    signal(false);


  protected readonly token:
    string | null =
      this.route.snapshot.paramMap.get(
        'token'
      );


  protected readonly resetForm =
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
          Validators.required
        ]
      ]

    }, {

      validators:
        this.passwordMatchValidator

    });


  protected get f() {

    return this.resetForm.controls;

  }


  private passwordMatchValidator(
    control: AbstractControl
  ): ValidationErrors | null {

    const password =
      control.get(
        'password'
      )?.value;


    const confirmPassword =
      control.get(
        'confirmPassword'
      )?.value;


    if (
      !password ||
      !confirmPassword
    ) {

      return null;

    }


    if (
      password !==
      confirmPassword
    ) {

      return {
        passwordMismatch: true
      };

    }


    return null;

  }


  protected submit(): void {

    this.successMessage.set('');

    this.errorMessage.set('');


    if (!this.token) {

      this.errorMessage.set(
        'This password reset link is invalid or incomplete.'
      );

      return;

    }


    if (
      this.resetForm.invalid
    ) {

      this.resetForm.markAllAsTouched();

      return;

    }


    this.loading.set(true);


    const password =
      this.f.password.value;


    this.authService

      .resetPassword(
        this.token,
        password
      )

      .subscribe({

        next: (response: any) => {

          this.loading.set(false);


          this.successMessage.set(
            response?.message ??
            'Password updated successfully.'
          );


          this.resetForm.reset();


          setTimeout(() => {

            this.router.navigate([
              '/login'
            ]);

          }, 2000);

        },


        error: error => {

          console.error(
            'Reset password error:',
            error
          );


          this.loading.set(false);


          this.errorMessage.set(
            this.getErrorMessage(
              error
            )
          );

        }

      });

  }


  protected togglePassword(): void {

    this.showPassword.update(
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

    this.errorMessage.set('');

    this.successMessage.set('');

  }


  private getErrorMessage(
    error: any
  ): string {

    if (
      error?.status === 0
    ) {

      return 'Unable to connect to the server. Please try again.';

    }


    if (
      typeof error?.error?.message ===
      'string'
    ) {

      return error.error.message;

    }


    if (
      error?.status === 400 ||
      error?.status === 401 ||
      error?.status === 404
    ) {

      return 'This reset link is invalid or has expired. Please request a new one.';

    }


    if (
      error?.status >= 500
    ) {

      return 'Something went wrong on the server. Please try again later.';

    }


    return 'Unable to reset your password. Please try again.';

  }

}
