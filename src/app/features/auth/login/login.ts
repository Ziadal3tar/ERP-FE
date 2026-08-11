import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Auth } from '../../../core/services/auth';
import { RouterLink } from '@angular/router';

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
loading = false;

private authService = inject(Auth);
  private fb = inject(FormBuilder);

loginForm = this.fb.group({

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

  rememberMe: [false]

});




get f() {
  return this.loginForm.controls;
}
submit() {
console.log(this.loginForm.getRawValue());
  if (this.loginForm.invalid) {
    this.loginForm.markAllAsTouched();
    return;
  }

  this.loading = true;

  this.authService.login(this.loginForm.getRawValue()).subscribe({

    next: (res: any) => {
console.log(res);
      this.loading = false;

      this.authService.saveToken(res.token);


    },

    error: (err) => {
console.log(err);
      this.loading = false;



    }

  });

}
}
