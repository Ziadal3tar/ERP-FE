import {
  Component,
  DestroyRef,
  inject,
  output,
  signal
} from '@angular/core';

import {
  NavigationEnd,
  Router,
  RouterLink
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


@Component({
  selector: 'app-header',

  standalone: true,

  imports: [
    RouterLink
  ],

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


  readonly toggleSidebar =
    output<void>();


  readonly toggleMobileSidebar =
    output<void>();


  protected readonly pageTitle =
    signal('Dashboard');


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

        }
      );

  }


  ngOnInit(): void {

    this.notificationService
      .refreshUnreadCount();

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


    /*
     * Don't expose technical route names
     * as much as possible.
     */

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
        'Employees'

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


  protected onNotificationsClick(): void {

    this.router.navigate([
      '/admin/notifications'
    ]);

  }


  onDesktopToggle(): void {

    this.toggleSidebar.emit();

  }


  onMobileToggle(): void {

    this.toggleMobileSidebar.emit();

  }

}
