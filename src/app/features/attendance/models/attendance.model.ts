export type AttendanceStatus =
  | 'Present'
  | 'Absent'
  | 'Late'
  | 'HalfDay';

export interface AttendanceUser {

  _id: string;

  name: string;

  email: string;

}

export interface AttendanceEmployee {

  _id: string;

  user: AttendanceUser;

  employeeCode: string;

  jobTitle: string;

}

export interface AttendanceAdmin {

  _id: string;

  name: string;

  email: string;

}

export interface Attendance {

  _id: string;

  employee: AttendanceEmployee;

  date: string;

  checkIn?: string | null;

  checkOut?: string | null;

  status: AttendanceStatus;

  notes?: string | null;

  createdBy?: AttendanceAdmin | null;

  updatedBy?: AttendanceAdmin | null;

  createdAt: string;

  updatedAt?: string;

}

export interface AttendanceListResponse {

  data: Attendance[];

  pagination: {

    total: number;

    page: number;

    limit: number;

    totalPages: number;

  };

}

export interface CreateAttendanceRequest {

  employee: string;

  date: string;

  checkIn?: string;

  checkOut?: string;

  status: AttendanceStatus;

  notes?: string;

}
