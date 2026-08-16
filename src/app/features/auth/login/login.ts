import {
  Component,
  inject
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

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
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],

  templateUrl: './login.html',

  styleUrl: './login.scss'
})
export class Login {

  private readonly AuthService =
    inject(AuthService);

  private readonly fb =
    inject(FormBuilder);

  private readonly router =
    inject(Router);

  loading = false;

  errorMessage = '';

  loginForm = this.fb.nonNullable.group({

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

  get f() {

    return this.loginForm.controls;

  }

submit(): void {

  this.errorMessage = '';

  if (this.loginForm.invalid) {

    this.loginForm.markAllAsTouched();

    return;

  }

  this.loading = true;

  const {
    email,
    password
  } = this.loginForm.getRawValue();

  this.AuthService
    .login({
      email,
      password
    })
    .subscribe({

      next: (response) => {

        this.loading = false;

        this.router.navigate([
          '/admin/dashboard'
        ]);

      },

      error: (err) => {

        console.error(
          'Login Error:',
          err
        );

        this.errorMessage =
          err?.error?.message ||
          'Invalid email or password';

        this.loading = false;

      }

    });

}

}
