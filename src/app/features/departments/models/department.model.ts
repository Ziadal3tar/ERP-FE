export interface Department {
  _id: string;

  name: string;

  code: string;

  description?: string | null;

  isActive: boolean;

  employeeCount?: number;

  createdAt: string;

  updatedAt?: string;
}


export interface DepartmentListResponse {

  data: Department[];

  pagination: {

    total: number;

    page: number;

    limit: number;

    totalPages: number;

  };

}


export interface CreateDepartmentRequest {

  name: string;

  code: string;

  description?: string;

}


export interface UpdateDepartmentRequest {

  name?: string;

  code?: string;

  description?: string;

}export interface Department {
  _id: string;

  name: string;

  code: string;

  description?: string | null;

  isActive: boolean;

  employeeCount?: number;

  createdAt: string;

  updatedAt?: string;
}


export interface DepartmentListResponse {

  data: Department[];

  pagination: {

    total: number;

    page: number;

    limit: number;

    totalPages: number;

  };

}


export interface CreateDepartmentRequest {

  name: string;

  code: string;

  description?: string;

}


export interface UpdateDepartmentRequest {

  name?: string;

  code?: string;

  description?: string;

}
