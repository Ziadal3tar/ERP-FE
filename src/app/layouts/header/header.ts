import {
  Component,
  DestroyRef,
  inject,
  output,
  signal
} from '@angular/core';

import {
  NavigationEnd,
  Router
} from '@angular/router';

import {
  filter
} from 'rxjs';

import {
  takeUntilDestroyed
} from '@angular/core/rxjs-interop';

import {
  NotificationService
} from './../../features/notifications/services/notification';

import {
  AuthService
} from '../../core/services/auth';


@Component({
  selector: 'app-header',

  standalone: true,

  imports: [],

  templateUrl:
    './header.html',

  styleUrl:
    './header.scss'
})
export class Header {

  private readonly router =
    inject(Router);


  private readonly destroyRef =
    inject(DestroyRef);


  protected readonly notificationService =
    inject(NotificationService);


  protected readonly authService =
    inject(AuthService);


  protected readonly user =
    this.authService.user;


  readonly toggleSidebar =
    output<void>();


  readonly toggleMobileSidebar =
    output<void>();


  protected readonly pageTitle =
    signal('Dashboard');


  protected readonly userMenuOpen =
    signal(false);


  constructor() {

    this.router.events

      .pipe(

        filter(
          event =>
            event instanceof NavigationEnd
        ),

        takeUntilDestroyed(
          this.destroyRef
        )

      )

      .subscribe(

        (
          event: NavigationEnd
        ) => {

          this.updatePageTitle(
            event.urlAfterRedirects
          );


          this.userMenuOpen.set(
            false
          );

        }

      );

  }


ngOnInit(): void {

  this.notificationService
    .refreshUnreadCount();


  if (
    this.authService.isAuthenticated()
  ) {

    this.authService
      .refreshUser()
      .subscribe({

        error: error => {

          console.error(
            'Unable to refresh current user:',
            error
          );

        }

      });

  }

}




  protected toggleUserMenu(): void {

    this.userMenuOpen.update(
      value =>
        !value
    );

  }


  protected closeUserMenu(): void {

    this.userMenuOpen.set(
      false
    );

  }




protected openProfile(): void {

  this.closeUserMenu();

  this.router.navigate([
    '/admin/profile'
  ]);

}




  protected onNotificationsClick(): void {

    this.closeUserMenu();


    this.router.navigate([
      '/admin/notifications'
    ]);

  }




protected changePassword(): void {

  this.closeUserMenu();

  this.router.navigate([
    '/admin/profile/change-password'
  ]);

}




  protected logout(): void {

    this.closeUserMenu();

    this.authService.logout();

  }




  protected get userName(): string {

    return (
      this.user()?.name ||
      'User'
    );

  }


  protected get userEmail(): string {

    return (
      this.user()?.email ||
      ''
    );

  }


  protected get userRole(): string {

    return (
      this.user()?.role ||
      'User'
    );

  }


  protected get userInitials(): string {

    const name =
      this.userName.trim();


    if (!name) {

      return 'U';

    }


    const parts =
      name.split(/\s+/);


    if (
      parts.length === 1
    ) {

      return parts[0]
        .charAt(0)
        .toUpperCase();

    }


    return (
      parts[0].charAt(0) +
      parts[parts.length - 1].charAt(0)
    ).toUpperCase();

  }




  private updatePageTitle(
    url: string
  ): void {

    const segments =
      url
        .split('/')
        .filter(Boolean);


    const lastSegment =
      segments.at(-1);


    if (!lastSegment) {

      this.pageTitle.set(
        'Dashboard'
      );

      return;

    }


    const titleMap:
      Record<string, string> = {

      dashboard:
        'Dashboard',

      products:
        'Products',

      warehouses:
        'Warehouses',

      stock:
        'Stock',

      suppliers:
        'Suppliers',

      purchases:
        'Purchases',

      customers:
        'Customers',

      sales:
        'Sales',

      invoices:
        'Invoices',

      payments:
        'Payments',

      reports:
        'Reports',

      notifications:
        'Notifications',

      'audit-logs':
        'Audit Logs',

      users:
        'Users',

      departments:
        'Departments',

      employees:
        'Employees',

      profile:
        'My Profile',

      'change-password':
        'Change Password'

    };


    const title =
      titleMap[lastSegment] ??
      lastSegment
        .replace(
          /-/g,
          ' '
        )
        .replace(
          /\b\w/g,
          char =>
            char.toUpperCase()
        );


    this.pageTitle.set(
      title
    );

  }




  onDesktopToggle(): void {

    this.toggleSidebar.emit();

  }


  onMobileToggle(): void {

    this.toggleMobileSidebar.emit();

  }

}
