import {
  Component,
  inject,
  OnInit,
  signal
} from '@angular/core';

import {
  FormsModule
} from '@angular/forms';

import {
  Router
} from '@angular/router';

import {
  PageHeader
} from '../../../../shared/components/page-header/page-header';

import {
  DataTable,
  TableColumn
} from '../../../../shared/components/data-table/data-table';

import {
  Pagination
} from '../../../../shared/components/pagination/pagination';

import {
  Warehouse
} from '../../models/warehouse.model';

import {
  WarehouseService
} from '../../services/warehouse';

@Component({
  selector: 'app-warehouses-list',

  imports: [
    FormsModule,
    PageHeader,
    DataTable,
    Pagination
  ],

  templateUrl:
    './warehouses-list.html',

  styleUrl:
    './warehouses-list.scss'
})
export class WarehousesList
  implements OnInit {

  private readonly warehouseService =
    inject(WarehouseService);

  private readonly router =
    inject(Router);

  protected readonly warehouses =
    signal<Warehouse[]>([]);

  protected readonly loading =
    signal(true);

  protected readonly error =
    signal('');

  protected readonly page =
    signal(1);

  protected readonly limit =
    signal(10);

  protected readonly total =
    signal(0);

  protected readonly totalPages =
    signal(0);

  protected search = '';

  protected selectedStatus = '';

  protected readonly statuses = [
    {
      value: 'true',
      label: 'Active'
    },
    {
      value: 'false',
      label: 'Inactive'
    }
  ];

  protected readonly columns:
    TableColumn<Warehouse>[] = [

    {
      key: 'name',
      label: 'Warehouse'
    },

    {
      key: 'code',
      label: 'Code'
    },

    {
      key: 'location',
      label: 'Location'
    },

    {
      key: 'createdBy.name',
      label: 'createdBy'
    },

    {
      key: 'isActive',
      label: 'Status',

      type: 'status',

      render: warehouse =>
        warehouse.isActive
          ? 'Active'
          : 'Inactive'
    },

    {
      key: 'createdAt',
      label: 'Created'
    }

  ];

  ngOnInit(): void {

    this.loadWarehouses();

  }

  protected loadWarehouses(): void {

    this.loading.set(true);

    this.error.set('');

    this.warehouseService
      .getWarehouses(
        this.page(),
        this.limit(),
        this.search,
        this.selectedStatus
      )
      .subscribe({

        next: response => {

          this.warehouses.set(
            response.data
          );

          this.total.set(
            response.pagination.total
          );

          this.totalPages.set(
            response.pagination.totalPages
          );

          this.loading.set(false);

        },

        error: error => {

          console.error(
            'Warehouses error:',
            error
          );

          this.error.set(
            error?.error?.message ||
            'Unable to load warehouses.'
          );

          this.loading.set(false);

        }

      });

  }

  protected applyFilters(): void {

    this.page.set(1);

    this.loadWarehouses();

  }

  protected clearFilters(): void {

    this.search = '';

    this.selectedStatus = '';

    this.page.set(1);

    this.loadWarehouses();

  }

  protected changePage(
    page: number
  ): void {

    this.page.set(page);

    this.loadWarehouses();

  }

  protected createWarehouse(): void {

    this.router.navigate([
      '/admin/warehouses/create'
    ]);

  }

  protected openWarehouse(
    warehouse: Warehouse
  ): void {

    this.router.navigate([
      '/admin/warehouses',
      warehouse._id
    ]);

  }

  protected refresh(): void {

    this.loadWarehouses();

  }

}
