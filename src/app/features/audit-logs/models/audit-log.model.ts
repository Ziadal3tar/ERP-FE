export type AuditAction =
  | 'LOGIN'
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'RESTORE'
  | 'CONFIRM'
  | 'CANCEL'
  | 'RECEIVE'
  | 'PAYMENT';


export type AuditModule =
  | 'Auth'
  | 'User'
  | 'Department'
  | 'Employee'
  | 'Attendance'
  | 'Leave'
  | 'Category'
  | 'Product'
  | 'Warehouse'
  | 'Stock'
  | 'Supplier'
  | 'Purchase'
  | 'Customer'
  | 'Sale'
  | 'Invoice'
  | 'Payment';


export interface AuditUser {

  _id: string;

  name: string;

  email: string;

  role: string;

}


export interface AuditLog {

  _id: string;

  user:
    string |
    AuditUser |
    null;

  action: AuditAction;

  module: AuditModule;

  resourceId:
    string |
    null;

  description:
    string |
    null;

  ipAddress:
    string |
    null;

  userAgent:
    string |
    null;

  metadata:
    Record<string, unknown> |
    null;

  createdAt: string;

  updatedAt: string;

}


export interface AuditLogListResponse {

  data: AuditLog[];

  pagination: {

    total: number;

    page: number;

    limit: number;

    totalPages: number;

  };

}


export interface AuditLogApiResponse<T> {

  success: boolean;

  message?: string;

  data: T;

}
