import {
  Component,
  effect,
  inject,
  input,
  output,
  signal
} from '@angular/core';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  Router
} from '@angular/router';

import {
  Supplier,
  CreateSupplierRequest
} from '../../models/supplier.model';

@Component({
  selector: 'app-supplier-form',

  standalone: true,

  imports: [
    ReactiveFormsModule
  ],

  templateUrl: './supplier-form.html',

  styleUrl: './supplier-form.scss'
})
export class SupplierForm {

  private readonly fb =
    inject(FormBuilder);

  private readonly router =
    inject(Router);

  readonly supplier =
    input<Supplier | null>(null);

  readonly loading =
    input(false);

  readonly submitted =
    output<CreateSupplierRequest>();

  readonly cancelled =
    output<void>();

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

      notes: [
        '',
        [
          Validators.maxLength(500)
        ]
      ]

    });

constructor() {

  effect(() => {

    const currentSupplier =
      this.supplier();

    if (!currentSupplier) {
      return;
    }

    this.form.patchValue({

      name:
        currentSupplier.name ?? '',

      code:
        currentSupplier.code ?? '',

      email:
        currentSupplier.email ?? '',

      phone:
        currentSupplier.phone ?? '',

      address:
        currentSupplier.address ?? '',

      taxNumber:
        currentSupplier.taxNumber ?? '',

      notes:
        currentSupplier.notes ?? ''

    });

  });

}

  protected get isEdit(): boolean {

    return !!this.supplier();

  }

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
      CreateSupplierRequest = {

      name:
        value.name.trim(),

      code:
        value.code.trim().toUpperCase(),

      email:
        value.email.trim() || undefined,

      phone:
        value.phone.trim() || undefined,

      address:
        value.address.trim() || undefined,

      taxNumber:
        value.taxNumber.trim() || undefined,

      notes:
        value.notes.trim() || undefined

    };

    this.submitted.emit(
      payload
    );

  }

  protected cancel(): void {

    this.cancelled.emit();

  }

}
