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
  TableAction,
  TableColumn
} from '../../../../shared/components/data-table/data-table';

import {
  Pagination
} from '../../../../shared/components/pagination/pagination';

import {
  ConfirmDialog
} from '../../../../shared/components/confirm-dialog/confirm-dialog';

import {
  ToastService
} from '../../../../core/services/toast';

import {
  Department
} from '../../models/department.model';

import {
  DepartmentService
} from '../../services/department';

@Component({
  selector: 'app-departments-list',

  imports: [
    FormsModule,
    PageHeader,
    DataTable,
    Pagination,
    ConfirmDialog
  ],

  templateUrl:
    './departments-list.html',

  styleUrl:
    './departments-list.scss'
})
export class DepartmentsList
  implements OnInit {

  private readonly departmentService =
    inject(DepartmentService);

  private readonly router =
    inject(Router);

  private readonly toast =
    inject(ToastService);

  /*
  |--------------------------------------------------------------------------
  | State
  |--------------------------------------------------------------------------
  */

  protected readonly departments =
    signal<Department[]>([]);

  protected readonly loading =
    signal(true);

  protected readonly error =
    signal('');

  /*
  |--------------------------------------------------------------------------
  | Pagination
  |--------------------------------------------------------------------------
  */

  protected readonly page =
    signal(1);

  protected readonly limit =
    signal(10);

  protected readonly total =
    signal(0);

  protected readonly totalPages =
    signal(0);

  /*
  |--------------------------------------------------------------------------
  | Search
  |--------------------------------------------------------------------------
  */

  protected search = '';

  /*
  |--------------------------------------------------------------------------
  | Dialog
  |--------------------------------------------------------------------------
  */

  protected readonly dialogOpen =
    signal(false);

  protected readonly selectedDepartment =
    signal<Department | null>(null);

  protected readonly actionType =
    signal<'delete' | 'restore' | null>(null);

  /*
  |--------------------------------------------------------------------------
  | Columns
  |--------------------------------------------------------------------------
  */

  protected readonly columns:
    TableColumn<Department>[] = [

    {
      key: 'name',
      label: 'Department'
    },

    {
      key: 'code',
      label: 'Code'
    },

    {
      key: 'description',
      label: 'Description'
    },

    {
      key: 'employeeCount',
      label: 'Employees',
      type: 'number'
    },

    {
      key: 'isActive',
      label: 'Status',
      type: 'status',

      render: department =>
        department.isActive
          ? 'Active'
          : 'Inactive'
    },

    {
      key: 'createdAt',
      label: 'Created',
      type: 'date'
    }

  ];

  /*
  |--------------------------------------------------------------------------
  | Actions
  |--------------------------------------------------------------------------
  */

  protected readonly actions:
    TableAction<Department>[] = [

    {
      key: 'edit',

      label: 'Edit Department',

      icon: 'bi-pencil',

      variant: 'primary'
    },

    {
      key: 'delete',

      label: 'Delete Department',

      icon: 'bi-trash',

      variant: 'danger',

      show: department =>
        department.isActive
    },

    {
      key: 'restore',

      label: 'Restore Department',

      icon:
        'bi-arrow-counterclockwise',

      variant: 'success',

      show: department =>
        !department.isActive
    }

  ];

  /*
  |--------------------------------------------------------------------------
  | Lifecycle
  |--------------------------------------------------------------------------
  */

  ngOnInit(): void {

    this.loadDepartments();

  }

  /*
  |--------------------------------------------------------------------------
  | Load
  |--------------------------------------------------------------------------
  */

  protected loadDepartments(): void {

    this.loading.set(true);

    this.error.set('');

    this.departmentService
      .getDepartments(
        this.page(),
        this.limit(),
        this.search
      )
      .subscribe({

        next: response => {

          this.departments.set(
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
            'Departments error:',
            error
          );

          this.error.set(
            error?.error?.message ||
            'Unable to load departments.'
          );

          this.loading.set(false);

        }

      });

  }

  /*
  |--------------------------------------------------------------------------
  | Search
  |--------------------------------------------------------------------------
  */

  protected applySearch(): void {

    this.page.set(1);

    this.loadDepartments();

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

    this.loadDepartments();

  }

  /*
  |--------------------------------------------------------------------------
  | Create
  |--------------------------------------------------------------------------
  */

  protected createDepartment(): void {

    this.router.navigate([
      '/admin/departments/create'
    ]);

  }

  /*
  |--------------------------------------------------------------------------
  | Edit
  |--------------------------------------------------------------------------
  */

  protected editDepartment(
    department: Department
  ): void {

    this.router.navigate([
      '/admin/departments',
      department._id,
      'edit'
    ]);

  }

  /*
  |--------------------------------------------------------------------------
  | Table Actions
  |--------------------------------------------------------------------------
  */

  protected handleAction(
    event: {
      action: TableAction<Department>;
      row: Department;
    }
  ): void {

    switch (event.action.key) {

      case 'edit':

        this.editDepartment(
          event.row
        );

        break;

      case 'delete':

        this.openDeleteDialog(
          event.row
        );

        break;

      case 'restore':

        this.openRestoreDialog(
          event.row
        );

        break;

    }

  }

  /*
  |--------------------------------------------------------------------------
  | Delete Dialog
  |--------------------------------------------------------------------------
  */

  protected openDeleteDialog(
    department: Department
  ): void {

    this.selectedDepartment.set(
      department
    );

    this.actionType.set(
      'delete'
    );

    this.dialogOpen.set(true);

  }

  /*
  |--------------------------------------------------------------------------
  | Restore Dialog
  |--------------------------------------------------------------------------
  */

  protected openRestoreDialog(
    department: Department
  ): void {

    this.selectedDepartment.set(
      department
    );

    this.actionType.set(
      'restore'
    );

    this.dialogOpen.set(true);

  }

  /*
  |--------------------------------------------------------------------------
  | Close Dialog
  |--------------------------------------------------------------------------
  */

  protected closeDialog(): void {

    this.dialogOpen.set(false);

    this.selectedDepartment.set(null);

    this.actionType.set(null);

  }

  /*
  |--------------------------------------------------------------------------
  | Confirm Action
  |--------------------------------------------------------------------------
  */

  protected confirmAction(): void {

    const department =
      this.selectedDepartment();

    const action =
      this.actionType();

    if (
      !department ||
      !action
    ) {

      return;

    }

    this.closeDialog();

    if (
      action === 'delete'
    ) {

      this.deleteDepartment(
        department._id
      );

      return;

    }

    this.restoreDepartment(
      department._id
    );

  }

  /*
  |--------------------------------------------------------------------------
  | Delete
  |--------------------------------------------------------------------------
  */

  private deleteDepartment(
    id: string
  ): void {

    this.departmentService
      .deleteDepartment(id)
      .subscribe({

        next: () => {

          this.toast.success(
            'Department deactivated successfully.'
          );

          this.loadDepartments();

        },

        error: error => {

          console.error(
            'Delete department error:',
            error
          );

          this.toast.error(
            error?.error?.message ||
            'Unable to delete department.'
          );

        }

      });

  }

  /*
  |--------------------------------------------------------------------------
  | Restore
  |--------------------------------------------------------------------------
  */

  private restoreDepartment(
    id: string
  ): void {

    this.departmentService
      .restoreDepartment(id)
      .subscribe({

        next: () => {

          this.toast.success(
            'Department restored successfully.'
          );

          this.loadDepartments();

        },

        error: error => {

          console.error(
            'Restore department error:',
            error
          );

          this.toast.error(
            error?.error?.message ||
            'Unable to restore department.'
          );

        }

      });

  }

}
