import {
  Component,
  input,
  output
} from '@angular/core';

import {
  DatePipe
} from '@angular/common';

export interface TableColumn<T = any> {

  key: keyof T | string;

  label: string;

  type?:
    | 'text'
    | 'status'
    | 'date'
    | 'number';

  render?: (
    row: T
  ) => string;

}

export interface TableAction<T = any> {

  key: string;

  label: string;

  icon: string;

  variant?:
    | 'default'
    | 'primary'
    | 'danger'
    | 'success'
    | 'warning';

  show?: (
    row: T
  ) => boolean;

  disabled?: (
    row: T
  ) => boolean;

}

@Component({
  selector: 'app-data-table',

  imports: [
    DatePipe
  ],

  templateUrl:
    './data-table.html',

  styleUrl:
    './data-table.scss'
})
export class DataTable<T = any> {



  readonly columns =
    input.required<
      TableColumn<T>[]
    >();

  readonly data =
    input.required<T[]>();

  readonly actions =
    input<
      TableAction<T>[]
    >([]);

  readonly loading =
    input(false);

  readonly emptyTitle =
    input(
      'No data found'
    );

  readonly emptyMessage =
    input(
      'There are no records to display.'
    );

  readonly rowClickable =
    input(false);



  readonly rowClick =
    output<T>();

  readonly actionClick =
    output<{
      action: TableAction<T>;
      row: T;
    }>();



  onRowClick(
    row: T
  ): void {

    if (
      !this.rowClickable()
    ) {

      return;

    }

    this.rowClick.emit(
      row
    );

  }



  getValue(
    row: T,
    key: string
  ): unknown {

    return key
      .split('.')
      .reduce(
        (
          value: any,
          part: string
        ) => value?.[part],

        row
      );

  }



  getDisplayValue(
    row: T,
    column: TableColumn<T>
  ): string {



    if (
      column.render
    ) {

      return column.render(
        row
      );

    }

    const value =
      this.getValue(
        row,
        String(column.key)
      );

    if (
      value === null ||
      value === undefined ||
      value === ''
    ) {

      return '—';

    }



    if (
      column.type === 'date'
    ) {

      if (
        typeof value === 'string' ||
        typeof value === 'number' ||
        value instanceof Date
      ) {

        return (
          new DatePipe('en-US')
            .transform(
              value,
              'mediumDate'
            ) ?? '—'
        );

      }

      return '—';

    }



    if (
      column.type === 'number'
    ) {

      if (
        typeof value === 'number'
      ) {

        return value
          .toLocaleString(
            'en-US'
          );

      }

      const numberValue =
        Number(value);

      if (
        !Number.isNaN(
          numberValue
        )
      ) {

        return numberValue
          .toLocaleString(
            'en-US'
          );

      }

    }



    return String(
      value
    );

  }



  getStatusClass(
    value: string
  ): string {

    const normalized =
      value
        .toLowerCase()
        .replace(
          /\s|-/g,
          ''
        );

    switch (
      normalized
    ) {



      case 'active':

      case 'approved':

      case 'paid':

      case 'received':

      case 'confirmed':

      case 'healthy':

        return 'success';



      case 'pending':

      case 'partiallypaid':

      case 'draft':

      case 'low':

      case 'lowstock':

        return 'warning';



      case 'inactive':

      case 'rejected':

      case 'cancelled':

      case 'unpaid':

      case 'out':

      case 'outofstock':

        return 'danger';


case 'stockin':
case 'transferin':
case 'healthy':

  return 'success';

case 'low':
case 'lowstock':
case 'adjustment':

  return 'warning';

case 'stockout':
case 'transferout':
case 'out':
case 'outofstock':

  return 'danger';
      default:

        return 'neutral';

    }

  }



  isActionVisible(
    action: TableAction<T>,
    row: T
  ): boolean {

    return action.show
      ? action.show(row)
      : true;

  }

  isActionDisabled(
    action: TableAction<T>,
    row: T
  ): boolean {

    return action.disabled
      ? action.disabled(row)
      : false;

  }

  onActionClick(
    event: MouseEvent,
    action: TableAction<T>,
    row: T
  ): void {

    event.stopPropagation();
 this.actionClick.emit({

      action,

      row

    });

  }

}
