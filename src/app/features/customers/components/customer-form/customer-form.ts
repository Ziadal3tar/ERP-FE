import {
  Component,
  effect,
  inject,
  input,
  output
} from '@angular/core';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  Customer,
  CreateCustomerRequest
} from '../../models/customer.model';

@Component({
  selector: 'app-customer-form',

  standalone: true,

  imports: [
    ReactiveFormsModule
  ],

  templateUrl:
    './customer-form.html',

  styleUrl:
    './customer-form.scss'
})
export class CustomerForm {

  private readonly fb =
    inject(FormBuilder);

  /*
  |--------------------------------------------------------------------------
  | Inputs
  |--------------------------------------------------------------------------
  */

  readonly customer =
    input<Customer | null>(null);

  readonly loading =
    input(false);

  /*
  |--------------------------------------------------------------------------
  | Outputs
  |--------------------------------------------------------------------------
  */

  readonly submitted =
    output<CreateCustomerRequest>();

  readonly cancelled =
    output<void>();

  /*
  |--------------------------------------------------------------------------
  | Form
  |--------------------------------------------------------------------------
  */

  protected readonly form =
    this.fb.nonNullable.group({

      name: [
        '',
        [
          Validators.required,
          Validators.maxLength(150)
        ]
      ],

      code: [
        '',
        [
          Validators.required,
          Validators.maxLength(30),
          Validators.pattern(
            /^[a-zA-Z0-9_-]+$/
          )
        ]
      ],

      email: [
        '',
        [
          Validators.email
        ]
      ],

      phone: [
        ''
      ],

      address: [
        '',
        [
          Validators.maxLength(300)
        ]
      ],

      taxNumber: [
        ''
      ],

      creditLimit: [
        0,
        [
          Validators.min(0)
        ]
      ],

      notes: [
        '',
        [
          Validators.maxLength(500)
        ]
      ]

    });

  /*
  |--------------------------------------------------------------------------
  | Constructor
  |--------------------------------------------------------------------------
  */

  constructor() {

    effect(() => {

      const currentCustomer =
        this.customer();

      if (!currentCustomer) {

        return;

      }

      this.form.patchValue({

        name:
          currentCustomer.name ?? '',

        code:
          currentCustomer.code ?? '',

        email:
          currentCustomer.email ?? '',

        phone:
          currentCustomer.phone ?? '',

        address:
          currentCustomer.address ?? '',

        taxNumber:
          currentCustomer.taxNumber ?? '',

        creditLimit:
          currentCustomer.creditLimit ?? 0,

        notes:
          currentCustomer.notes ?? ''

      });

    });

  }

  /*
  |--------------------------------------------------------------------------
  | Mode
  |--------------------------------------------------------------------------
  */

  protected get isEdit(): boolean {

    return !!this.customer();

  }

  /*
  |--------------------------------------------------------------------------
  | Submit
  |--------------------------------------------------------------------------
  */

  protected submit(): void {

    if (
      this.form.invalid
    ) {

      this.form.markAllAsTouched();

      return;

    }

    const value =
      this.form.getRawValue();

    const payload:
      CreateCustomerRequest = {

      name:
        value.name.trim(),

      code:
        value.code.trim().toUpperCase(),

      email:
        value.email.trim() ||
        undefined,

      phone:
        value.phone.trim() ||
        undefined,

      address:
        value.address.trim() ||
        undefined,

      taxNumber:
        value.taxNumber.trim() ||
        undefined,

      creditLimit:
        Number(
          value.creditLimit || 0
        ),

      notes:
        value.notes.trim() ||
        undefined

    };

    this.submitted.emit(
      payload
    );

  }

  /*
  |--------------------------------------------------------------------------
  | Cancel
  |--------------------------------------------------------------------------
  */

  protected cancel(): void {

    this.cancelled.emit();

  }

}
