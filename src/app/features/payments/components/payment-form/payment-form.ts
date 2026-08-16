import {
  Component,
  inject,
  input,
  OnInit,
  output
} from '@angular/core';

import {
  CurrencyPipe
} from '@angular/common';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  CreatePaymentRequest,
  PaymentMethod
} from '../../../payments/models/payment.model';

@Component({
  selector: 'app-payment-form',

  standalone: true,

  imports: [
    ReactiveFormsModule,
    CurrencyPipe
  ],

  templateUrl:
    './payment-form.html',

  styleUrl:
    './payment-form.scss'
})
export class PaymentForm
  implements OnInit {

  private readonly fb =
    inject(FormBuilder);

  readonly remainingAmount =
    input<number>(0);

  readonly loading =
    input<boolean>(false);

  readonly close =
    output<void>();

  readonly submitted =
    output<CreatePaymentRequest>();

  protected readonly methods:
    PaymentMethod[] = [
      'Cash',
      'Card',
      'Bank'
    ];

  protected form = this.fb.nonNullable.group({

    amount: [
      0,
      [
        Validators.required,
        Validators.min(0.01)
      ]
    ],

    method: [
      'Cash' as PaymentMethod,
      Validators.required
    ],

    reference: [
      '',
      Validators.maxLength(100)
    ],

    notes: [
      '',
      Validators.maxLength(500)
    ]

  });

  ngOnInit(): void {

    this.form.controls.amount.setValue(
      this.remainingAmount()
    );

  }

  protected fillRemaining(): void {

    this.form.controls.amount.setValue(
      this.remainingAmount()
    );

    this.form.controls.amount.updateValueAndValidity();

  }

  protected submit(): void {

    const amountControl =
      this.form.controls.amount;

    amountControl.setErrors(null);

    if (
      this.form.invalid
    ) {

      this.form.markAllAsTouched();

      return;

    }

    const amount =
      Number(
        amountControl.value
      );

    const remaining =
      Number(
        this.remainingAmount()
      );

    if (
      amount > remaining
    ) {

      amountControl.setErrors({
        exceedsRemaining: true
      });

      amountControl.markAsTouched();

      return;

    }

    const value =
      this.form.getRawValue();

    const payload:
      CreatePaymentRequest = {

      amount,

      method:
        value.method,

      reference:
        value.reference.trim() ||
        undefined,

      notes:
        value.notes.trim() ||
        undefined

    };

    this.submitted.emit(
      payload
    );

  }

  protected cancel(): void {

    this.close.emit();

  }

}
