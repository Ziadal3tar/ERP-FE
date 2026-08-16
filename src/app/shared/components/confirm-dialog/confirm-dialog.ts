import {
  Component,
  input,
  output
} from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',

  standalone: true,

  imports: [],

  templateUrl: './confirm-dialog.html',

  styleUrl: './confirm-dialog.scss'
})
export class ConfirmDialog {

  /*
  |--------------------------------------------------------------------------
  | Visibility
  |--------------------------------------------------------------------------
  */

  readonly open =
    input(false);

  /*
  |--------------------------------------------------------------------------
  | Content
  |--------------------------------------------------------------------------
  */

  readonly title =
    input('Confirm Action');

  readonly message =
    input(
      'Are you sure you want to continue?'
    );

  readonly confirmText =
    input('Confirm');

  readonly cancelText =
    input('Cancel');

  /*
  |--------------------------------------------------------------------------
  | Appearance
  |--------------------------------------------------------------------------
  |
  | Backward compatible:
  | danger() still works exactly as before.
  |
  */

  readonly danger =
    input(false);

  readonly variant =
    input<
      | 'danger'
      | 'warning'
      | 'primary'
      | 'success'
    >('primary');

  /*
  |--------------------------------------------------------------------------
  | State
  |--------------------------------------------------------------------------
  */

  readonly loading =
    input(false);

  /*
  |--------------------------------------------------------------------------
  | Events
  |--------------------------------------------------------------------------
  */

  readonly confirmed =
    output<void>();

  readonly cancelled =
    output<void>();

  /*
  |--------------------------------------------------------------------------
  | Actions
  |--------------------------------------------------------------------------
  */

  confirm(): void {

    if (
      this.loading()
    ) {

      return;

    }

    this.confirmed.emit();

  }

  cancel(): void {

    if (
      this.loading()
    ) {

      return;

    }

    this.cancelled.emit();

  }

  /*
  |--------------------------------------------------------------------------
  | Styling
  |--------------------------------------------------------------------------
  */

  get effectiveVariant():
    'danger'
    | 'warning'
    | 'primary'
    | 'success' {

    /*
    |--------------------------------------------------------------------------
    | Backward compatibility
    |--------------------------------------------------------------------------
    |
    | Existing usage:
    |
    | [danger]="true"
    |
    | will automatically behave as danger.
    |
    */

    if (
      this.danger()
    ) {

      return 'danger';

    }

    return this.variant();

  }

  get iconClass(): string {

    switch (
      this.effectiveVariant
    ) {

      case 'danger':

        return 'bi-exclamation-triangle';

      case 'warning':

        return 'bi-exclamation-circle';

      case 'success':

        return 'bi-check-circle';

      default:

        return 'bi-question-lg';

    }

  }

}
