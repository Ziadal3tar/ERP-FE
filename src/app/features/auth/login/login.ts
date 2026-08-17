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
  Router,
  RouterLink
} from '@angular/router';

import {
  AuthService
} from '../../../core/services/auth';


@Component({
  selector: 'app-login',

  standalone: true,

  imports: [
    ReactiveFormsModule,
    RouterLink
  ],

  templateUrl:
    './login.html',

  styleUrl:
    './login.scss'
})
export class Login {

  private readonly authService =
    inject(AuthService);


  private readonly fb =
    inject(FormBuilder);


  private readonly router =
    inject(Router);


  protected readonly loading =
    signal(false);


  protected readonly errorMessage =
    signal('');


  protected readonly showPassword =
    signal(false);


  protected readonly loginForm =
    this.fb.nonNullable.group({

      email: [
        '',
        [
          Validators.required,
          Validators.email
        ]
      ],

      password: [
        '',
        [
          Validators.required,
          Validators.minLength(6)
        ]
      ],

      rememberMe: [
        false
      ]

    });


  protected get f() {

    return this.loginForm.controls;

  }


  protected submit(): void {

    this.errorMessage.set('');


    if (
      this.loginForm.invalid
    ) {

      this.loginForm.markAllAsTouched();

      return;

    }


    this.loading.set(true);


    const {
      email,
      password
    } =
      this.loginForm.getRawValue();


    this.authService

      .login({

        email:
          email.trim(),

        password

      })

      .subscribe({

        next: () => {

          this.loading.set(false);


          this.router.navigate([
            '/admin/dashboard'
          ]);

        },


        error: error => {

          console.error(
            'Login Error:',
            error
          );


          this.errorMessage.set(
            this.getErrorMessage(
              error
            )
          );


          this.loading.set(false);

        }

      });

  }


  protected togglePassword(): void {

    this.showPassword.update(
      value =>
        !value
    );

  }


  protected clearError(): void {

    if (
      this.errorMessage()
    ) {

      this.errorMessage.set('');

    }

  }


  private getErrorMessage(
    error: any
  ): string {

    const message =
      error?.error?.message;


    if (
      typeof message === 'string' &&
      message.trim()
    ) {

      return message;

    }


    if (
      error?.status === 0
    ) {

      return 'Unable to connect to the server. Please check your internet connection and try again.';

    }


    if (
      error?.status === 401
    ) {

      return 'Invalid email or password.';

    }


    if (
      error?.status === 403
    ) {

      return 'You do not have permission to access this account.';

    }


    if (
      error?.status >= 500
    ) {

      return 'Something went wrong on the server. Please try again later.';

    }


    return 'Unable to sign in. Please try again.';

  }
protected fillDemoEmail(): void {

  const email =
    'admin@erp.com';


  this.loginForm.controls.email.setValue(
    email
  );


  this.copyToClipboard(
    email
  );

}


protected fillDemoPassword(): void {

  const password =
    'Password123!';


  this.loginForm.controls.password.setValue(
    password
  );


  this.copyToClipboard(
    password
  );

}


protected async copyToClipboard(
  value: string
): Promise<void> {

  try {

    await navigator.clipboard.writeText(
      value
    );

  } catch (error) {

    console.error(
      'Copy failed:',
      error
    );

    /*
     * Fallback for browsers/environments
     * where Clipboard API is unavailable.
     */

    const textarea =
      document.createElement(
        'textarea'
      );


    textarea.value =
      value;

    textarea.style.position =
      'fixed';

    textarea.style.opacity =
      '0';

    document.body.appendChild(
      textarea
    );


    textarea.select();


    try {

      document.execCommand(
        'copy'
      );

    } catch (fallbackError) {

      console.error(
        'Clipboard fallback failed:',
        fallbackError
      );

    }


    document.body.removeChild(
      textarea
    );

  }

}
}
