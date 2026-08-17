import {
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal
} from '@angular/core';

import {
  DatePipe
} from '@angular/common';

import {
  takeUntilDestroyed
} from '@angular/core/rxjs-interop';

import {
  Notification,
  NotificationType
} from '../../models/notification.model';

import {
  NotificationService
} from '../../services/notification';

import {
  PageHeader
} from '../../../../shared/components/page-header/page-header';

import {
  Pagination
} from '../../../../shared/components/pagination/pagination';


@Component({
  selector: 'app-notification-list',

  standalone: true,

  imports: [
    DatePipe,
    PageHeader,
    Pagination
  ],

  templateUrl:
    './notification-list.html',

  styleUrl:
    './notification-list.scss'
})
export class NotificationList
  implements OnInit {

  private readonly notificationService =
    inject(NotificationService);

  private readonly destroyRef =
    inject(DestroyRef);




  protected readonly notifications =
    signal<Notification[]>([]);




  protected readonly loading =
    signal(false);

  protected readonly error =
    signal('');




  protected readonly filter =
    signal<
      'all' |
      'unread' |
      'read'
    >('all');




  protected readonly page =
    signal(1);

  protected readonly limit =
    signal(20);

  protected readonly total =
    signal(0);

  protected readonly totalPages =
    signal(1);


  ngOnInit(): void {

    this.loadNotifications();

  }




  protected loadNotifications(): void {

    this.loading.set(true);

    this.error.set('');


    let isRead:
      boolean |
      null = null;


    switch (
      this.filter()
    ) {

      case 'unread':
        isRead = false;
        break;

      case 'read':
        isRead = true;
        break;

    }


    this.notificationService

      .getNotifications(
        this.page(),
        this.limit(),
        isRead
      )

      .pipe(
        takeUntilDestroyed(
          this.destroyRef
        )
      )

      .subscribe({

        next: response => {

          this.notifications.set(
            response.data ?? []
          );


          this.total.set(
            response.pagination?.total ??
            0
          );


          this.totalPages.set(
            response.pagination?.totalPages ??
            1
          );


          this.loading.set(false);

        },

        error: error => {

          console.error(
            'Notifications error:',
            error
          );


          this.notifications.set([]);

          this.error.set(
            error?.error?.message ??
            'Unable to load notifications.'
          );


          this.loading.set(false);

        }

      });

  }




  protected setFilter(
    filter:
      'all' |
      'unread' |
      'read'
  ): void {

    if (
      this.filter() ===
      filter
    ) {

      return;

    }


    this.filter.set(
      filter
    );

    this.page.set(1);

    this.loadNotifications();

  }




  protected markAsRead(
    notification: Notification
  ): void {

    if (
      notification.isRead
    ) {

      return;

    }


    this.notificationService

      .markAsRead(
        notification._id
      )

      .pipe(
        takeUntilDestroyed(
          this.destroyRef
        )
      )

      .subscribe({

      next: updated => {

  this.notifications.update(
    items =>
      items.map(
        item =>
          item._id === updated._id
            ? updated
            : item
      )
  );


  this.notificationService
    .refreshUnreadCount();

},

        error: error => {

          console.error(
            'Mark notification as read error:',
            error
          );

        }

      });

  }




  protected markAllAsRead(): void {

    const hasUnread =
      this.notifications()
        .some(
          item =>
            !item.isRead
        );


    if (!hasUnread) {

      return;

    }


    this.notificationService

      .markAllAsRead()

      .pipe(
        takeUntilDestroyed(
          this.destroyRef
        )
      )

      .subscribe({

next: () => {

  this.notifications.update(
    items =>
      items.map(
        item => ({

          ...item,

          isRead: true,

          readAt:
            new Date().toISOString()

        })
      )
  );


  this.notificationService
    .refreshUnreadCount();

},

        error: error => {

          console.error(
            'Mark all notifications error:',
            error
          );

        }

      });

  }




  protected deleteNotification(
    notification: any
  ): void {

    this.notificationService

      .deleteNotification(
        notification._id
      )

      .pipe(
        takeUntilDestroyed(
          this.destroyRef
        )
      )

      .subscribe({

  next: () => {

  this.notifications.update(
    items =>
      items.filter(
        item =>
          item._id !==
          notification._id
      )
  );


  this.notificationService
    .refreshUnreadCount();


  this.total.update(
    value =>
      Math.max(
        value - 1,
        0
      )
  );


  if (
    this.notifications().length === 0 &&
    this.page() > 1
  ) {

    this.page.update(
      value =>
        Math.max(
          value - 1,
          1
        )
    );

    this.loadNotifications();

  }

},

        error: error => {

          console.error(
            'Delete notification error:',
            error
          );

        }

      });

  }




  protected changePage(
    page: number
  ): void {

    if (
      page < 1 ||
      page > this.totalPages() ||
      page === this.page()
    ) {

      return;

    }


    this.page.set(
      page
    );

    this.loadNotifications();

  }




  protected typeIcon(
    type: NotificationType
  ): string {

    switch (type) {

      case 'SUCCESS':
        return 'bi-check-circle-fill';

      case 'WARNING':
        return 'bi-exclamation-triangle-fill';

      case 'ERROR':
        return 'bi-x-circle-fill';

      default:
        return 'bi-info-circle-fill';

    }

  }


  protected typeClass(
    type: NotificationType
  ): string {

    return type.toLowerCase();

  }


  protected hasUnread(): boolean {

    return this.notifications()
      .some(
        item =>
          !item.isRead
      );

  }

}
