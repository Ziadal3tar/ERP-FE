import {
  Component,
  inject,
  OnInit,
  signal
} from '@angular/core';

import {
  DatePipe,
  DecimalPipe
} from '@angular/common';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  FormsModule
} from '@angular/forms';

import {
  Employee
} from '../../models/employee.model';

import {
  EmployeeService
} from '../../services/employee';

import {
  PageHeader
} from '../../../../shared/components/page-header/page-header';

import {
  StatusBadge
} from '../../../../shared/components/status-badge/status-badge';

import {
  LoadingState
} from '../../../../shared/components/loading-state/loading-state';

import {
  ConfirmDialog
} from '../../../../shared/components/confirm-dialog/confirm-dialog';

import {
  ToastService
} from '../../../../core/services/toast';

@Component({
  selector: 'app-employee-details',

  imports: [
    DatePipe,
    DecimalPipe,
    FormsModule,
    PageHeader,
    StatusBadge,
    LoadingState,
    ConfirmDialog
  ],

  templateUrl: './employee-details.html',

  styleUrl: './employee-details.scss'
})
export class EmployeeDetails implements OnInit {

  private readonly route =
    inject(ActivatedRoute);

  private readonly router =
    inject(Router);

  private readonly employeeService =
    inject(EmployeeService);

  private readonly toast =
    inject(ToastService);

  protected readonly employee =
    signal<Employee | null>(null);

  protected readonly loading =
    signal(true);

  protected readonly error =
    signal('');

  protected readonly salary =
    signal<number | null>(null);

  protected readonly salaryEditing =
    signal(false);

  protected readonly salarySaving =
    signal(false);

  protected readonly dialogOpen =
    signal(false);

  private employeeId = '';

  ngOnInit(): void {

    this.employeeId =
      this.route.snapshot.paramMap.get('id') ?? '';

    if (!this.employeeId) {

      this.back();

      return;

    }

    this.loadEmployee();

  }

  private loadEmployee(): void {

    this.loading.set(true);

    this.error.set('');

    this.employeeService
      .getEmployee(this.employeeId)
      .subscribe({

        next: employee => {

          this.employee.set(employee);

          this.salary.set(
            employee.salary
          );

          this.loading.set(false);

        },

        error: error => {

          console.error(
            'Employee details error:',
            error
          );

          this.error.set(
            error?.error?.message ||
            'Unable to load employee.'
          );

          this.loading.set(false);

        }

      });

  }

  protected get userName(): string {

    const user =
      this.employee()?.user;

    return typeof user === 'string'
      ? user
      : user?.name ?? '—';

  }

  protected get userEmail(): string {

    const user =
      this.employee()?.user;

    return typeof user === 'string'
      ? '—'
      : user?.email ?? '—';

  }

  protected get departmentName(): string {

    const department =
      this.employee()?.department;

    return typeof department === 'string'
      ? department
      : department?.name ?? '—';

  }

  protected get departmentCode(): string {

    const department =
      this.employee()?.department;

    return typeof department === 'string'
      ? ''
      : department?.code ?? '';

  }

  protected editEmployee(): void {

    this.router.navigate([
      '/admin/employees',
      this.employeeId,
      'edit'
    ]);

  }

  protected openDeleteDialog(): void {

    this.dialogOpen.set(true);

  }

  protected restoreEmployee(): void {

    this.employeeService
      .restoreEmployee(
        this.employeeId
      )
      .subscribe({

        next: employee => {

          this.employee.set(employee);

          this.toast.success(
            'Employee restored successfully.'
          );

        },

        error: error => {

          console.error(
            'Restore employee error:',
            error
          );

          this.toast.error(
            error?.error?.message ||
            'Unable to restore employee.'
          );

        }

      });

  }

  protected confirmDelete(): void {

    this.dialogOpen.set(false);

    this.employeeService
      .deleteEmployee(
        this.employeeId
      )
      .subscribe({

        next: () => {

          this.toast.success(
            'Employee deactivated successfully.'
          );

          this.loadEmployee();

        },

        error: error => {

          console.error(
            'Delete employee error:',
            error
          );

          this.toast.error(
            error?.error?.message ||
            'Unable to delete employee.'
          );

        }

      });

  }

  protected cancelDialog(): void {

    this.dialogOpen.set(false);

  }

  protected startSalaryEdit(): void {

    this.salary.set(
      this.employee()?.salary ?? 0
    );

    this.salaryEditing.set(true);

  }

  protected cancelSalaryEdit(): void {

    this.salary.set(
      this.employee()?.salary ?? 0
    );

    this.salaryEditing.set(false);

  }

  protected saveSalary(): void {

    const amount =
      Number(this.salary());

    if (
      !Number.isFinite(amount) ||
      amount < 0
    ) {

      this.toast.error(
        'Enter a valid salary.'
      );

      return;

    }

    this.salarySaving.set(true);

    this.employeeService
      .changeSalary(
        this.employeeId,
        amount
      )
      .subscribe({

        next: employee => {

          this.employee.set(employee);

          this.salary.set(
            employee.salary
          );

          this.salaryEditing.set(false);

          this.salarySaving.set(false);

          this.toast.success(
            'Employee salary updated successfully.'
          );

        },

        error: error => {

          console.error(
            'Salary update error:',
            error
          );

          this.salarySaving.set(false);

          this.toast.error(
            error?.error?.message ||
            'Unable to update salary.'
          );

        }

      });

  }

  protected back(): void {

    this.router.navigate([
      '/admin/employees'
    ]);

  }

}
