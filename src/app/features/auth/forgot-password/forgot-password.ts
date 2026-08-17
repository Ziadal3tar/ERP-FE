import {
  Component,
  inject,
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
  AuthService
} from '../../../core/services/auth';


@Component({
  selector: 'app-forgot-password',

  standalone: true,

  imports: [
    ReactiveFormsModule,
    RouterLink
  ],

  templateUrl:
    './forgot-password.html',

  styleUrl:
    './forgot-password.scss'
})
export class ForgotPassword {

  private readonly fb =
    inject(FormBuilder);

  private readonly authService =
    inject(AuthService);


  protected readonly loading =
    signal(false);

  protected readonly successMessage =
    signal('');

  protected readonly errorMessage =
    signal('');


  protected readonly forgotForm =
    this.fb.nonNullable.group({

      email: [
        '',
        [
          Validators.required,
          Validators.email
        ]
      ]

    });


  protected get f() {

    return this.forgotForm.controls;

  }


  protected submit(): void {

    this.successMessage.set('');

    this.errorMessage.set('');


    if (
      this.forgotForm.invalid
    ) {

      this.forgotForm.markAllAsTouched();

      return;

    }


    this.loading.set(true);


    const email =
      this.forgotForm.controls.email.value
        .trim();


    this.authService

      .forgotPassword(email)

      .subscribe({

        next: (response: any) => {

          this.loading.set(false);


          this.successMessage.set(
            response?.message ??
            'If the email exists, a password reset link has been sent.'
          );

        },

        error: error => {

          console.error(
            'Forgot password error:',
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


  protected clearMessages(): void {

    this.successMessage.set('');

    this.errorMessage.set('');

  }


  private getErrorMessage(
    error: any
  ): string {

    if (
      error?.status === 0
    ) {

      return 'Unable to connect to the server. Please check your connection and try again.';

    }


    if (
      typeof error?.error?.message ===
      'string'
    ) {

      return error.error.message;

    }


    if (
      error?.status >= 500
    ) {

      return 'Something went wrong on the server. Please try again later.';

    }


    return 'Unable to send the reset link. Please try again.';

  }

}
