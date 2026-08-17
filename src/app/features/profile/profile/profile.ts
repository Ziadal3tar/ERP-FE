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
  DatePipe
} from '@angular/common';

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

import {
  AuthUser
} from '../../auth/models/auth.model';
@Component({
  selector: 'app-profile',

  standalone: true,

  imports: [
    ReactiveFormsModule,
    DatePipe,
    RouterLink,
    PageHeader
  ],

  templateUrl:
    './profile.html',

  styleUrl:
    './profile.scss'
})
export class Profile
  implements OnInit {

  private readonly fb =
    inject(FormBuilder);

  private readonly authService =
    inject(AuthService);

  private readonly destroyRef =
    inject(DestroyRef);


protected readonly user =
  signal<AuthUser | null>(null);

  protected readonly loading =
    signal(true);

  protected readonly saving =
    signal(false);

  protected readonly error =
    signal('');

  protected readonly success =
    signal('');


  protected readonly form =
    this.fb.nonNullable.group({

      name: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(100)
        ]
      ],

      phone: [
        '',
        [
          Validators.pattern(
            /^01[0125][0-9]{8}$/
          )
        ]
      ]

    });


  ngOnInit(): void {

    this.loadProfile();

  }


  protected loadProfile(): void {

    this.loading.set(true);

    this.error.set('');

    this.success.set('');


    this.authService

      .getProfile()

      .pipe(
        takeUntilDestroyed(
          this.destroyRef
        )
      )

      .subscribe({

        next: response => {

          const user =
            response.user;


          this.user.set(
            user
          );


          this.form.patchValue({

            name:
              user.name ?? '',

            phone:
              user.phone ?? ''

          });


          this.loading.set(false);

        },

        error: error => {

          console.error(
            'Profile loading error:',
            error
          );


          this.error.set(
            error?.error?.message ??
            'Unable to load profile.'
          );


          this.loading.set(false);

        }

      });

  }


  protected saveProfile(): void {

    if (
      this.form.invalid
    ) {

      this.form.markAllAsTouched();

      return;

    }


    this.saving.set(true);

    this.error.set('');

    this.success.set('');


    const data =
      this.form.getRawValue();


    this.authService

      .updateProfile(data)

      .pipe(
        takeUntilDestroyed(
          this.destroyRef
        )
      )

      .subscribe({

        next: response => {

          const updatedUser =
            response.data ??
            response.user;


          if (updatedUser) {

            this.user.set(
              updatedUser
            );

          }


          this.saving.set(
            false
          );


          this.success.set(
            response.message ??
            'Profile updated successfully.'
          );

        },

        error: error => {

          console.error(
            'Profile update error:',
            error
          );


          this.error.set(
            error?.error?.message ??
            'Unable to update profile.'
          );


          this.saving.set(
            false
          );

        }

      });

  }


  protected get initials(): string {

    const name =
      this.user()?.name?.trim() ??
      '';


    if (!name) {

      return 'U';

    }


    const parts =
      name.split(/\s+/);


    if (
      parts.length === 1
    ) {

      return parts[0]
        .charAt(0)
        .toUpperCase();

    }


    return (
      parts[0].charAt(0) +
      parts[parts.length - 1].charAt(0)
    ).toUpperCase();

  }


  protected clearMessages(): void {

    this.error.set('');

    this.success.set('');

  }

}
