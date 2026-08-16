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
  Employee
} from '../../models/employee.model';

import {
  EmployeeService
} from '../../services/employee';

@Component({
  selector: 'app-employees-list',

  imports: [
    FormsModule,
    PageHeader,
    DataTable,
    Pagination
  ],

  templateUrl: './employees-list.html',

  styleUrl: './employees-list.scss'
})
export class EmployeesList implements OnInit {

  private readonly employeeService =
    inject(EmployeeService);

  private readonly router =
    inject(Router);

  protected readonly employees =
    signal<Employee[]>([]);

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

  protected readonly columns: TableColumn<Employee>[] = [

    {
      key: 'employeeCode',
      label: 'Employee ID'
    },

    {
      key: 'user.name',
      label: 'Employee'
    },

    {
      key: 'user.email',
      label: 'Email'
    },

    {
      key: 'department.name',
      label: 'Department'
    },

    {
      key: 'jobTitle',
      label: 'Job Title'
    },

    {
      key: 'salary',
      label: 'Salary',
      type: 'number'
    },

    {
      key: 'isActive',
      label: 'Status',
      type: 'status',

      render: employee =>
        employee.isActive
          ? 'Active'
          : 'Inactive'
    }

  ];

  ngOnInit(): void {
    this.loadEmployees();
  }

  protected loadEmployees(): void {

    this.loading.set(true);
    this.error.set('');

    this.employeeService
      .getEmployees(
        this.page(),
        this.limit(),
        this.search
      )
      .subscribe({

        next: response => {

          this.employees.set(
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
            'Employees error:',
            error
          );

          this.error.set(
            error?.error?.message ||
            'Unable to load employees.'
          );

          this.loading.set(false);

        }

      });

  }

  protected searchEmployees(): void {

    this.page.set(1);

    this.loadEmployees();

  }

  protected changePage(page: number): void {

    this.page.set(page);

    this.loadEmployees();

  }

  protected createEmployee(): void {

    this.router.navigate([
      '/admin/employees/create'
    ]);

  }

  protected openEmployee(employee: Employee): void {

    this.router.navigate([
      '/admin/employees',
      employee._id
    ]);

  }

  protected refresh(): void {

    this.loadEmployees();

  }

}
