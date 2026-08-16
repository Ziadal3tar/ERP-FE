import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  AuthService
} from '../../../core/services/auth';
@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss'
})
export class ForgotPassword {

  private fb = inject(FormBuilder);
  private AuthService = inject(AuthService);

  loading = false;

  successMessage = '';

  errorMessage = '';

  forgotForm:any = this.fb.group({

    email: [
      '',
      [
        Validators.required,
        Validators.email
      ]
    ]

  });

  get f() {
    return this.forgotForm.controls;
  }

submit() {

  if (this.forgotForm.invalid) {
    this.forgotForm.markAllAsTouched();
    return;
  }

  this.loading = true;

  this.AuthService
    .forgotPassword(this.forgotForm.value.email)
    .subscribe({

      next: (res: any) => {

        this.loading = false;

        this.successMessage = res.message;

      },

      error: (err) => {

        this.loading = false;

        this.errorMessage =
          err.error?.message || "Something went wrong.";

      }

    });

}

}
