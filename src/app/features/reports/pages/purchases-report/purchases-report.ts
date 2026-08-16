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
  PurchasesReport as PurchasesReportData
} from '../../models/report.model';

import {
  SupplierService
} from '../../../suppliers/services/supplier';

import {
  WarehouseService
} from '../../../warehouses/services/warehouse';

import {
  PageHeader
} from '../../../../shared/components/page-header/page-header';


@Component({
  selector: 'app-purchases-report',

  standalone: true,

  imports: [
    ReactiveFormsModule,
    CurrencyPipe,
    DecimalPipe,
    PageHeader
  ],

  templateUrl:
    './purchases-report.html',

  styleUrl:
    './purchases-report.scss'
})
export class PurchasesReport
  implements OnInit {

  private readonly fb =
    inject(FormBuilder);

  private readonly reportService =
    inject(ReportService);

  private readonly supplierService =
    inject(SupplierService);

  private readonly warehouseService =
    inject(WarehouseService);

  private readonly destroyRef =
    inject(DestroyRef);


  protected readonly report =
    signal<PurchasesReportData | null>(null);

  protected readonly suppliers =
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

      supplier: [''],

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

    let suppliersLoaded = false;

    let warehousesLoaded = false;


    this.supplierService

      .getSuppliers(
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

          this.suppliers.set(
            response.data ?? []
          );

          suppliersLoaded = true;

          this.finishFilters(
            suppliersLoaded,
            warehousesLoaded
          );

        },

        error: error => {

          console.error(
            'Purchases report suppliers error:',
            error
          );

          suppliersLoaded = true;

          this.finishFilters(
            suppliersLoaded,
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
            suppliersLoaded,
            warehousesLoaded
          );

        },

        error: error => {

          console.error(
            'Purchases report warehouses error:',
            error
          );

          warehousesLoaded = true;

          this.finishFilters(
            suppliersLoaded,
            warehousesLoaded
          );

        }

      });

  }


  private finishFilters(
    suppliersLoaded: boolean,
    warehousesLoaded: boolean
  ): void {

    if (
      suppliersLoaded &&
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
      supplier,
      warehouse
    } =
      this.filterForm.getRawValue();


    this.reportService

      .getPurchasesReport(
        supplier,
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
            'Purchases report error:',
            error
          );

          this.report.set(
            null
          );

          this.error.set(
            error?.error?.message ??
            'Unable to load purchases report.'
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

      supplier: '',

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


  protected get averagePurchase(): number {

    const data =
      this.report();

    if (
      !data ||
      !data.count
    ) {

      return 0;

    }

    return (
      data.totalPurchases /
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
