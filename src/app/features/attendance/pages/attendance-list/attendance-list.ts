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
  DatePipe
} from '@angular/common';

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
  Attendance
} from '../../models/attendance.model';

import {
  AttendanceService
} from '../../services/attendance';

@Component({
  selector: 'app-attendance-list',

  imports: [
    FormsModule,
    DatePipe,
    PageHeader,
    DataTable,
    Pagination
  ],

  templateUrl:
    './attendance-list.html',

  styleUrl:
    './attendance-list.scss'
})
export class AttendanceList
  implements OnInit {

  private readonly attendanceService =
    inject(AttendanceService);

  private readonly router =
    inject(Router);

  protected readonly records =
    signal<Attendance[]>([]);

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

  protected selectedDate = '';

  protected readonly columns:
    TableColumn<Attendance>[] = [

    {
      key: 'employee.user.name',
      label: 'Employee'
    },

    {
      key: 'employee.employeeCode',
      label: 'Employee ID'
    },

    {
      key: 'date',
      label: 'Date'
    },

    {
      key: 'checkIn',
      label: 'Check In',

      render: attendance =>
        attendance.checkIn || '—'
    },

    {
      key: 'checkOut',
      label: 'Check Out',

      render: attendance =>
        attendance.checkOut || '—'
    },

    {
      key: 'status',
      label: 'Status',

      type: 'status',

      render: attendance =>
        attendance.status
    }

  ];

  ngOnInit(): void {

    this.loadAttendance();

  }

  /*
  |--------------------------------------------------------------------------
  | Load
  |--------------------------------------------------------------------------
  */

  protected loadAttendance(): void {

    this.loading.set(true);

    this.error.set('');

    this.attendanceService
      .getAttendance(
        this.page(),
        this.limit(),
        this.search,
        this.selectedDate
      )
      .subscribe({

        next: response => {
          this.records.set(
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
            'Attendance error:',
            error
          );

          this.error.set(
            error?.error?.message ||
            'Unable to load attendance.'
          );

          this.loading.set(false);

        }

      });

  }

  /*
  |--------------------------------------------------------------------------
  | Filters
  |--------------------------------------------------------------------------
  */

  protected applyFilters(): void {

    this.page.set(1);

    this.loadAttendance();

  }

  protected clearFilters(): void {

    this.search = '';

    this.selectedDate = '';

    this.page.set(1);

    this.loadAttendance();

  }

  /*
  |--------------------------------------------------------------------------
  | Pagination
  |--------------------------------------------------------------------------
  */

  protected changePage(
    page: number
  ): void {

    this.page.set(page);

    this.loadAttendance();

  }

  /*
  |--------------------------------------------------------------------------
  | Create
  |--------------------------------------------------------------------------
  */

  protected createAttendance(): void {

    this.router.navigate([
      '/admin/attendance/create'
    ]);

  }

  /*
  |--------------------------------------------------------------------------
  | Open
  |--------------------------------------------------------------------------
  */

  protected openAttendance(
    record: Attendance
  ): void {

    this.router.navigate([
      '/admin/attendance',
      record._id
    ]);

  }

  /*
  |--------------------------------------------------------------------------
  | Refresh
  |--------------------------------------------------------------------------
  */

  protected refresh(): void {

    this.loadAttendance();

  }

}
