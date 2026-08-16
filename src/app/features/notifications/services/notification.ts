import {
  HttpClient,
  HttpParams
} from '@angular/common/http';

import {
  Injectable,
  inject
} from '@angular/core';

import {
  map,
  Observable
} from 'rxjs';
import {
  signal
} from '@angular/core';
import {
  environment
} from '../../../../environments/environment';

import {
  Notification,
  NotificationApiResponse,
  NotificationListResponse,
  UnreadCountResponse
} from '../models/notification.model';


@Injectable({
  providedIn: 'root'
})
export class NotificationService {
private readonly unreadCountState =
  signal(0);


readonly unreadCount =
  this.unreadCountState.asReadonly();
  private readonly http =
    inject(HttpClient);


  private readonly api =
    `${environment.apiUrl}/notifications`;


  /*
  |--------------------------------------------------------------------------
  | My Notifications
  |--------------------------------------------------------------------------
  */

  getNotifications(
    page = 1,
    limit = 20,
    isRead: boolean | null = null
  ): Observable<NotificationListResponse> {

    let params =
      new HttpParams()
        .set('page', page)
        .set('limit', limit);


    if (isRead !== null) {

      params =
        params.set(
          'isRead',
          isRead
        );

    }


    return this.http.get<NotificationListResponse>(
      this.api,
      {
        params
      }
    );

  }


  /*
  |--------------------------------------------------------------------------
  | Unread Count
  |--------------------------------------------------------------------------
  */

  getUnreadCount():
    Observable<UnreadCountResponse> {

    return this.http

      .get<
        NotificationApiResponse<
          UnreadCountResponse
        >
      >(
        `${this.api}/unread-count`
      )

      .pipe(
        map(
          response =>
            response.data
        )
      );

  }


  /*
  |--------------------------------------------------------------------------
  | Mark One As Read
  |--------------------------------------------------------------------------
  */

 markAsRead(
  id: string
): Observable<Notification> {

  return this.http

    .patch<
      NotificationApiResponse<Notification>
    >(
      `${this.api}/${id}/read`,
      {}
    )

    .pipe(

      map(
        response => {

          this.unreadCountState.update(
            count =>
              Math.max(
                count - 1,
                0
              )
          );

          return response.data;

        }
      )

    );

}


  /*
  |--------------------------------------------------------------------------
  | Mark All As Read
  |--------------------------------------------------------------------------
  */

markAllAsRead():
  Observable<{
    message: string;
  }> {

  return this.http

    .patch<
      NotificationApiResponse<{
        message: string;
      }>
    >(
      `${this.api}/read-all`,
      {}
    )

    .pipe(

      map(
        response => {

          this.unreadCountState.set(0);

          return response.data;

        }
      )

    );

}


  /*
  |--------------------------------------------------------------------------
  | Delete
  |--------------------------------------------------------------------------
  */

deleteNotification(
  notification: Notification
): Observable<void> {

  return this.http

    .delete<
      NotificationApiResponse<null>
    >(
      `${this.api}/${notification._id}`
    )

    .pipe(

      map(
        () => {

          if (
            !notification.isRead
          ) {

            this.unreadCountState.update(
              count =>
                Math.max(
                  count - 1,
                  0
                )
            );

          }

        }

      )

    );

}


refreshUnreadCount(): void {

  this.getUnreadCount()

    .subscribe({

      next: response => {

        this.unreadCountState.set(
          response.count
        );

      },

      error: error => {

        console.error(
          'Unread notifications error:',
          error
        );

      }

    });

}
}
