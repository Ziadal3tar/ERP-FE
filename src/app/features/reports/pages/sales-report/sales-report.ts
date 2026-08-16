import {
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal
} from '@angular/core';

import {
  CurrencyPipe,
  DecimalPipe
} from '@angular/common';

import {
  FormBuilder,
  ReactiveFormsModule
} from '@angular/forms';

import {
  takeUntilDestroyed
} from '@angular/core/rxjs-interop';

import {
  ReportService
} from '../../services/report';

import {
  SalesReport as SalesReportData
} from '../../models/report.model';

import {
  CustomerService
} from '../../../customers/services/customer';

import {
  WarehouseService
} from '../../../warehouses/services/warehouse';

import {
  PageHeader
} from '../../../../shared/components/page-header/page-header';


@Component({
  selector: 'app-sales-report',

  standalone: true,

  imports: [
    ReactiveFormsModule,
    CurrencyPipe,
    DecimalPipe,
    PageHeader
  ],

  templateUrl:
    './sales-report.html',

  styleUrl:
    './sales-report.scss'
})
export class SalesReport
  implements OnInit {

  private readonly fb =
    inject(FormBuilder);

  private readonly reportService =
    inject(ReportService);

  private readonly customerService =
    inject(CustomerService);

  private readonly warehouseService =
    inject(WarehouseService);

  private readonly destroyRef =
    inject(DestroyRef);


  protected readonly report =
    signal<SalesReportData | null>(null);

  protected readonly customers =
    signal<any[]>([]);

  protected readonly warehouses =
    signal<any[]>([]);


  protected readonly loading =
    signal(true);

  protected readonly filtersLoading =
    signal(true);

  protected readonly error =
    signal('');


  protected readonly filterForm =
    this.fb.nonNullable.group({

      customer: [''],

      warehouse: ['']

    });
Math: any;


  ngOnInit(): void {

    this.loadFilters();

    this.loadReport();

  }


  /*
  |--------------------------------------------------------------------------
  | Filters
  |--------------------------------------------------------------------------
  */

  private loadFilters(): void {

    let customersLoaded = false;

    let warehousesLoaded = false;


    this.customerService

      .getCustomers(
        1,
        100,
        '',
        true
      )

      .pipe(
        takeUntilDestroyed(
          this.destroyRef
        )
      )

      .subscribe({

        next: response => {

          this.customers.set(
            response.data ?? []
          );

          customersLoaded = true;

          this.finishFilters(
            customersLoaded,
            warehousesLoaded
          );

        },

        error: error => {

          console.error(
            'Sales report customers error:',
            error
          );

          customersLoaded = true;

          this.finishFilters(
            customersLoaded,
            warehousesLoaded
          );

        }

      });


    this.warehouseService

      .getWarehouses(
        1,
        100
      )

      .pipe(
        takeUntilDestroyed(
          this.destroyRef
        )
      )

      .subscribe({

        next: response => {

          this.warehouses.set(
            response.data ?? []
          );

          warehousesLoaded = true;

          this.finishFilters(
            customersLoaded,
            warehousesLoaded
          );

        },

        error: error => {

          console.error(
            'Sales report warehouses error:',
            error
          );

          warehousesLoaded = true;

          this.finishFilters(
            customersLoaded,
            warehousesLoaded
          );

        }

      });

  }


  private finishFilters(
    customersLoaded: boolean,
    warehousesLoaded: boolean
  ): void {

    if (
      customersLoaded &&
      warehousesLoaded
    ) {

      this.filtersLoading.set(
        false
      );

    }

  }


  /*
  |--------------------------------------------------------------------------
  | Report
  |--------------------------------------------------------------------------
  */

  protected loadReport(): void {

    this.loading.set(true);

    this.error.set('');


const {
  customer,
  warehouse
} =
  this.filterForm.getRawValue();


console.log(
  'Selected Customer:',
  customer
);

console.log(
  'Selected Warehouse:',
  warehouse
);

    this.reportService

      .getSalesReport(
        customer,
        warehouse
      )

      .pipe(
        takeUntilDestroyed(
          this.destroyRef
        )
      )

      .subscribe({

        next: data => {

          this.report.set(
            data
          );

          this.loading.set(false);

        },

        error: error => {

          console.error(
            'Sales report error:',
            error
          );

          this.report.set(
            null
          );

          this.error.set(
            error?.error?.message ??
            'Unable to load sales report.'
          );

          this.loading.set(false);

        }

      });

  }


  protected applyFilters(): void {

    this.loadReport();

  }


  protected resetFilters(): void {

    this.filterForm.reset({

      customer: '',

      warehouse: ''

    });

    this.loadReport();

  }


  /*
  |--------------------------------------------------------------------------
  | Calculations
  |--------------------------------------------------------------------------
  */

  protected get netBeforeTax(): number {

    const data =
      this.report();

    if (!data) {
      return 0;
    }

    return (
      data.subtotal -
      data.discount
    );

  }


  protected get averageSale(): number {

    const data =
      this.report();

    if (
      !data ||
      !data.count
    ) {

      return 0;

    }

    return (
      data.totalSales /
      data.count
    );

  }

protected get discountRate(): number {

  const data =
    this.report();

  if (
    !data ||
    !data.subtotal
  ) {

    return 0;

  }

  return (
    data.discount /
    data.subtotal
  ) * 100;

}


protected get taxRate(): number {

  const data =
    this.report();

  if (
    !data ||
    !data.subtotal
  ) {

    return 0;

  }

  return (
    data.tax /
    data.subtotal
  ) * 100;

}


protected get discountProgress(): number {

  return Math.min(
    Math.max(
      this.discountRate,
      0
    ),
    100
  );

}


protected get taxProgress(): number {

  return Math.min(
    Math.max(
      this.taxRate,
      0
    ),
    100
  );

}

}
