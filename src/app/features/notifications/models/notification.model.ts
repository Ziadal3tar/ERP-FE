export type NotificationType =
  | 'INFO'
  | 'SUCCESS'
  | 'WARNING'
  | 'ERROR';


export interface Notification {

  _id: string;

  recipient: string;

  title: string;

  message: string;

  type: NotificationType;

  module: string | null;

  resourceId: string | null;

  isRead: boolean;

  readAt: string | null;

  createdAt: string;

  updatedAt: string;

}


export interface NotificationListResponse {

  data: Notification[];

  pagination: {

    total: number;

    page: number;

    limit: number;

    totalPages: number;

  };

}


export interface NotificationApiResponse<T> {

  success: boolean;

  message?: string;

  data: T;

}


export interface UnreadCountResponse {

  count: number;

}
