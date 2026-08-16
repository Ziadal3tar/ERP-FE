export type LeaveStatus =
  | 'Pending'
  | 'Approved'
  | 'Rejected'
  | 'Cancelled';

export type LeaveType =
  | 'Annual'
  | 'Sick'
  | 'Emergency'
  | 'Unpaid'
  | 'Maternity'
  | 'Other';

export interface LeaveUser {

  _id: string;

  name: string;

  email: string;

}

export interface LeaveEmployee {

  _id: string;

  user: LeaveUser;

  employeeCode: string;

  jobTitle: string;

}

export interface LeaveAdmin {

  _id: string;

  name: string;

  email: string;

}

export interface Leave {

  _id: string;

  employee: LeaveEmployee;

  type: LeaveType;

  startDate: string;

  endDate: string;

  reason?: string | null;

  status: LeaveStatus;

  createdBy?: LeaveAdmin | null;

  reviewedBy?: LeaveAdmin | null;

  reviewedAt?: string | null;

  rejectionReason?: string | null;

  updatedBy?: LeaveAdmin | null;

  createdAt: string;

  updatedAt: string;

}

export interface LeaveListResponse {

  data: Leave[];

  pagination: {

    total: number;

    page: number;

    limit: number;

    totalPages: number;

  };

}

export interface CreateLeaveRequest {

  employee: string;

  type: LeaveType;

  startDate: string;

  endDate: string;

  reason?: string;

}

export interface RejectLeaveRequest {

  reason: string;

}
