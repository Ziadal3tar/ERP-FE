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
  DatePipe
} from '@angular/common';

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
  Leave
} from '../../models/leave.model';

import {
  LeaveService
} from '../../services/leave';

@Component({
  selector: 'app-leaves-list',

  imports: [
    FormsModule,
    DatePipe,
    PageHeader,
    DataTable,
    Pagination
  ],

  templateUrl: './leaves-list.html',

  styleUrl: './leaves-list.scss'
})
export class LeavesList
  implements OnInit {

  private readonly leaveService =
    inject(LeaveService);

  private readonly router =
    inject(Router);

  protected readonly leaves =
    signal<Leave[]>([]);

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
    'Pending',
    'Approved',
    'Rejected',
    'Cancelled'
  ];

  protected readonly columns:
    TableColumn<Leave>[] = [

   {
  key: 'employee.user.name',
  label: 'Employee'
},

  {
  key: 'employee.employeeCode',
  label: 'Employee ID'
},
{
  key: 'employee.jobTitle',
  label: 'Job Title'
},
    {
  key: 'type',
  label: 'Type'
},

    {
      key: 'startDate',
      label: 'Start Date'
    },

    {
      key: 'endDate',
      label: 'End Date'
    },

    {
      key: 'status',
      label: 'Status',
      type: 'status'
    },

    {
      key: 'createdAt',
      label: 'Requested'
    }

  ];

  ngOnInit(): void {

    this.loadLeaves();

  }

  protected loadLeaves(): void {

    this.loading.set(true);

    this.error.set('');

    this.leaveService
      .getLeaves(
        this.page(),
        this.limit(),
        this.search,
        this.selectedStatus
      )
      .subscribe({

        next: response => {

          this.leaves.set(
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
            'Leaves error:',
            error
          );

          this.error.set(
            error?.error?.message ||
            'Unable to load leaves.'
          );

          this.loading.set(false);

        }

      });

  }

  protected applyFilters(): void {

    this.page.set(1);

    this.loadLeaves();

  }

  protected clearFilters(): void {

    this.search = '';

    this.selectedStatus = '';

    this.page.set(1);

    this.loadLeaves();

  }

  protected changePage(
    page: number
  ): void {

    this.page.set(page);

    this.loadLeaves();

  }

  protected createLeave(): void {

    this.router.navigate([
      '/admin/leaves/create'
    ]);

  }

  protected openLeave(
    leave: Leave
  ): void {

    this.router.navigate([
      '/admin/leaves',
      leave._id
    ]);

  }

  protected refresh(): void {

    this.loadLeaves();

  }

}
