import {
  Component,
  inject,
  OnInit,
  signal
} from '@angular/core';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  Router
} from '@angular/router';

import {
  PageHeader
} from '../../../../shared/components/page-header/page-header';

import {
  LoadingState
} from '../../../../shared/components/loading-state/loading-state';

import {
  Employee
} from '../../../employees/models/employee.model';

import {
  EmployeeService
} from '../../../employees/services/employee';

import {
  LeaveService
} from '../../services/leave';

import {
  ToastService
} from '../../../../core/services/toast';

import {
  CreateLeaveRequest,
  LeaveType
} from '../../models/leave.model';

@Component({
  selector: 'app-leave-form',

  imports: [
    ReactiveFormsModule,
    PageHeader,
    LoadingState
  ],

  templateUrl: './leave-form.html',

  styleUrl: './leave-form.scss'
})
export class LeaveForm
  implements OnInit {

  private readonly fb =
    inject(FormBuilder);

  private readonly leaveService =
    inject(LeaveService);

  private readonly employeeService =
    inject(EmployeeService);

  private readonly router =
    inject(Router);

  private readonly toast =
    inject(ToastService);

  protected readonly employees =
    signal<Employee[]>([]);

  protected readonly loading =
    signal(true);

  protected readonly saving =
    signal(false);

  protected readonly error =
    signal('');

  protected readonly leaveTypes = [
    'Annual',
    'Sick',
    'Emergency',
    'Unpaid',
    'Maternity',
    'Other'
  ];

  protected readonly form =
  this.fb.nonNullable.group({

    employee: [
      '',
      Validators.required
    ],

    type: [
      'Annual' as LeaveType,
      Validators.required
    ],

    startDate: [
      '',
      Validators.required
    ],

    endDate: [
      '',
      Validators.required
    ],

    reason: [
      '',
      Validators.maxLength(500)
    ]

  });

  ngOnInit(): void {

    this.loadEmployees();

  }

  private loadEmployees(): void {

    this.employeeService
      .getEmployees(1, 100)
      .subscribe({

        next: response => {

          this.employees.set(
            response.data
          );

          this.loading.set(false);

        },

        error: error => {

          console.error(
            'Employee loading error:',
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

  protected submit(): void {

    if (
      this.form.invalid
    ) {

      this.form.markAllAsTouched();

      return;

    }

    const value =
      this.form.getRawValue();

    if (
      value.endDate <
      value.startDate
    ) {

      this.error.set(
        'End date cannot be before start date.'
      );

      return;

    }

    this.error.set('');

    this.saving.set(true);

const data: CreateLeaveRequest = {

  employee:
    value.employee,

  type:
    value.type,

  startDate:
    value.startDate,

  endDate:
    value.endDate,

  reason:
    value.reason || undefined

};

   this.leaveService
  .createLeaveByAdmin(data)
  .subscribe({
    next: leave => {

      this.saving.set(false);

      this.toast.success(
        'Leave request created successfully.'
      );

      this.router.navigate([
        '/admin/leaves',
        leave._id
      ]);

    },

    error: error => {

      console.error(
        'Create leave error:',
        error
      );

      this.error.set(
        error?.error?.message ||
        'Unable to create leave request.'
      );

      this.saving.set(false);

    }
  });

  }

  protected back(): void {

    this.router.navigate([
      '/admin/leaves'
    ]);

  }
protected getEmployeeName(
  employee: Employee
): string {

  return typeof employee.user === 'string'
    ? employee.user
    : employee.user.name;

}

}
