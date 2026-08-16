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
  User
} from '../../models/user.model';

import {
  UserService
} from '../../services/user';

@Component({
  selector: 'app-users-list',

  imports: [
    FormsModule,
    PageHeader,
    DataTable,
    Pagination
  ],

  templateUrl: './users-list.html',

  styleUrl: './users-list.scss'
})
export class UsersList
  implements OnInit {

  private readonly userService =
    inject(UserService);

  private readonly router =
    inject(Router);

  /*
  |--------------------------------------------------------------------------
  | State
  |--------------------------------------------------------------------------
  */

  protected readonly users =
    signal<User[]>([]);

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

  protected search =
    '';

  /*
  |--------------------------------------------------------------------------
  | Columns
  |--------------------------------------------------------------------------
  */

  protected readonly columns:
    TableColumn<User>[] = [

    {
      key: 'name',
      label: 'Name'
    },

    {
      key: 'email',
      label: 'Email'
    },

    {
      key: 'role',
      label: 'Role'
    },

    {
      key: 'isActive',
      label: 'Status',
      type: 'status',

      render: user =>
        user.isActive
          ? 'Active'
          : 'Inactive'
    },

    {
      key: 'createdAt',
      label: 'Created'
    }

  ];

  ngOnInit(): void {

    this.loadUsers();

  }

  /*
  |--------------------------------------------------------------------------
  | Load Users
  |--------------------------------------------------------------------------
  */

  protected loadUsers(): void {

    this.loading.set(true);

    this.error.set('');

    this.userService
      .getUsers(
        this.page(),
        this.limit(),
        this.search
      )
      .subscribe({

        next: response => {

          this.users.set(
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
            'Users error:',
            error
          );

          this.error.set(
            'Unable to load users.'
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

    this.loadUsers();

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

    this.loadUsers();

  }

  /*
  |--------------------------------------------------------------------------
  | Create
  |--------------------------------------------------------------------------
  */

  protected createUser(): void {

    this.router.navigate([
      '/admin/users/create'
    ]);

  }

  /*
  |--------------------------------------------------------------------------
  | Details
  |--------------------------------------------------------------------------
  */

  protected openUser(
    user: User
  ): void {

    this.router.navigate([
      '/admin/users',
      user._id
    ]);

  }

  /*
  |--------------------------------------------------------------------------
  | Refresh
  |--------------------------------------------------------------------------
  */

  protected refresh(): void {

    this.loadUsers();

  }

}
