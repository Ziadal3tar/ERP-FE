import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Auth } from '../../../core/services/auth';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.scss'
})
export class ResetPassword {

  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(Auth);

  loading = false;

  successMessage = '';

  errorMessage = '';

  token:any = this.route.snapshot.paramMap.get('token');

  resetForm:any = this.fb.group({

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
    validators: this.passwordMatchValidator
  });

  get f() {
    return this.resetForm.controls;
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {

    const password = control.get('password')?.value;

    const confirmPassword = control.get('confirmPassword')?.value;

    if (password !== confirmPassword) {

      return {
        passwordMismatch: true
      };

    }

    return null;

  }

submit() {

  if (this.resetForm.invalid) {

    this.resetForm.markAllAsTouched();

    return;

  }

  this.loading = true;

  this.authService
      .resetPassword(
          this.token,
          this.resetForm.value.password
      )
      .subscribe({

          next: (res:any)=>{

              this.loading=false;

              this.successMessage=res.message;

              setTimeout(()=>{

                  this.router.navigate(['/login']);

              },2000);

          },

          error:(err)=>{

              this.loading=false;

              this.errorMessage=err.error.message;

          }

      });

}

}
