import {
  Component,
  inject,
  OnInit,
  signal
} from '@angular/core';

import {
  ReactiveFormsModule,
  FormBuilder,
  Validators
} from '@angular/forms';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  PageHeader
} from '../../../../shared/components/page-header/page-header';

import {
  LoadingState
} from '../../../../shared/components/loading-state/loading-state';

import {
  ToastService
} from '../../../../core/services/toast';

import {
  EmployeeService
} from '../../services/employee';

import {
  CreateEmployeeRequest,
  UpdateEmployeeRequest
} from '../../models/employee.model';

import {
  User
} from '../../../users/models/user.model';

import {
  UserService
} from '../../../users/services/user';

import {
  Department
} from '../../../departments/models/department.model';

import {
  DepartmentService
} from '../../../departments/services/department';

@Component({
  selector: 'app-employee-form',

  imports: [
    ReactiveFormsModule,
    PageHeader,
    LoadingState
  ],

  templateUrl: './employee-form.html',

  styleUrl: './employee-form.scss'
})
export class EmployeeForm implements OnInit {

  private readonly fb =
    inject(FormBuilder);

  private readonly employeeService =
    inject(EmployeeService);

  private readonly userService =
    inject(UserService);

  private readonly departmentService =
    inject(DepartmentService);

  private readonly route =
    inject(ActivatedRoute);

  private readonly router =
    inject(Router);

  private readonly toast =
    inject(ToastService);

  protected readonly loading =
    signal(false);

  protected readonly dependenciesLoading =
    signal(true);

  protected readonly saving =
    signal(false);

  protected readonly isEditMode =
    signal(false);

  protected readonly error =
    signal('');

  protected readonly users =
    signal<User[]>([]);

  protected readonly departments =
    signal<Department[]>([]);

  private employeeId:
    string | null = null;

  protected readonly form =
    this.fb.nonNullable.group({

      user: [
        '',
        Validators.required
      ],

      employeeCode: [
        '',
        [
          Validators.required,
          Validators.maxLength(30)
        ]
      ],

      department: [
        '',
        Validators.required
      ],

      jobTitle: [
        '',
        Validators.maxLength(100)
      ],

      phone: [
        '',
        Validators.maxLength(30)
      ],

      address: [
        '',
        Validators.maxLength(300)
      ],

      hireDate: [
        ''
      ],

      salary: [
        0,
        [
          Validators.required,
          Validators.min(0)
        ]
      ]

    });

  ngOnInit(): void {

    this.employeeId =
      this.route.snapshot.paramMap.get('id');

    this.loadFormDependencies();

    if (this.employeeId) {

      this.isEditMode.set(true);

      this.form.controls.user.disable();

      this.loadEmployee(
        this.employeeId
      );

    }

  }

  /*
  |--------------------------------------------------------------------------
  | Form Dependencies
  |--------------------------------------------------------------------------
  */

  private loadFormDependencies(): void {

    this.dependenciesLoading.set(true);

    this.userService
      .getUsers(1, 100)
      .subscribe({

        next: response => {

          this.users.set(
            response.data
          );

          this.loadDepartments();

        },

        error: error => {

          console.error(
            'Users loading error:',
            error
          );

          this.error.set(
            error?.error?.message ||
            'Unable to load users.'
          );

          this.dependenciesLoading.set(false);

        }

      });

  }

  private loadDepartments(): void {

    this.departmentService
      .getDepartments(1, 100)
      .subscribe({

        next: response => {

          this.departments.set(
            response.data
          );

          this.dependenciesLoading.set(false);

        },

        error: error => {

          console.error(
            'Departments loading error:',
            error
          );

          this.error.set(
            error?.error?.message ||
            'Unable to load departments.'
          );

          this.dependenciesLoading.set(false);

        }

      });

  }

  /*
  |--------------------------------------------------------------------------
  | Active Dependencies
  |--------------------------------------------------------------------------
  */

  protected activeUsers(): User[] {

    return this.users()
      .filter(
        user => user.isActive
      );

  }

  protected activeDepartments(): Department[] {

    return this.departments()
      .filter(
        department =>
          department.isActive
      );

  }

  /*
  |--------------------------------------------------------------------------
  | Load Employee
  |--------------------------------------------------------------------------
  */

  private loadEmployee(
    id: string
  ): void {

    this.loading.set(true);

    this.employeeService
      .getEmployee(id)
      .subscribe({

        next: employee => {

          const userId =
            typeof employee.user === 'string'
              ? employee.user
              : employee.user._id;

          const departmentId =
            typeof employee.department === 'string'
              ? employee.department
              : employee.department._id;

          this.form.patchValue({

            user:
              userId,

            employeeCode:
              employee.employeeCode,

            department:
              departmentId,

            jobTitle:
              employee.jobTitle ?? '',

            phone:
              employee.phone ?? '',

            address:
              employee.address ?? '',

            hireDate:
              employee.hireDate
                ? employee.hireDate.slice(0, 10)
                : '',

            salary:
              employee.salary

          });

          this.loading.set(false);

        },

        error: error => {

          console.error(
            'Employee load error:',
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

  /*
  |--------------------------------------------------------------------------
  | Submit
  |--------------------------------------------------------------------------
  */

  protected submit(): void {

    this.error.set('');

    if (this.form.invalid) {

      this.form.markAllAsTouched();

      return;

    }

    this.saving.set(true);

    const value =
      this.form.getRawValue();

    if (
      this.isEditMode() &&
      this.employeeId
    ) {

      const data:
        UpdateEmployeeRequest = {

        employeeCode:
          value.employeeCode,

        department:
          value.department,

        jobTitle:
          value.jobTitle,

        phone:
          value.phone,

        address:
          value.address,

        hireDate:
          value.hireDate || undefined

      };

      this.employeeService
        .updateEmployee(
          this.employeeId,
          data
        )
        .subscribe({

          next: () => {

            this.saving.set(false);

            this.toast.success(
              'Employee updated successfully.'
            );

            this.router.navigate([
              '/admin/employees',
              this.employeeId
            ]);

          },

          error: error => {

            console.error(
              'Employee update error:',
              error
            );

            this.error.set(
              error?.error?.message ||
              'Unable to update employee.'
            );

            this.saving.set(false);

          }

        });

      return;

    }

    const data:
      CreateEmployeeRequest = {

      user:
        value.user,

      employeeCode:
        value.employeeCode,

      department:
        value.department,

      jobTitle:
        value.jobTitle,

      phone:
        value.phone,

      address:
        value.address,

      hireDate:
        value.hireDate || undefined,

      salary:
        value.salary

    };

    this.employeeService
      .createEmployee(data)
      .subscribe({

        next: employee => {

          this.saving.set(false);

          this.toast.success(
            'Employee created successfully.'
          );

          this.router.navigate([
            '/admin/employees',
            employee._id
          ]);

        },

        error: error => {

          console.error(
            'Employee creation error:',
            error
          );

          this.error.set(
            error?.error?.message ||
            'Unable to create employee.'
          );

          this.saving.set(false);

        }

      });

  }

  protected back(): void {

    this.router.navigate([
      '/admin/employees'
    ]);

  }

}
