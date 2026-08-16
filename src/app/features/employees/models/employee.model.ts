export interface Employee {

  _id: string;

  user:
    | string
    | {
        _id: string;
        name: string;
        email: string;
        role: string;
      };

  employeeCode: string;

  department:
    | string
    | {
        _id: string;
        name: string;
        code: string;
      };

  jobTitle?: string;

  phone?: string;

  address?: string;

  hireDate?: string;

  salary: number;

  status: string;

  isActive: boolean;

  createdAt: string;

  updatedAt?: string;

}

export interface EmployeeListResponse {

  data: Employee[];

  pagination: {

    total: number;

    page: number;

    limit: number;

    totalPages: number;

  };

}

export interface CreateEmployeeRequest {

  user: string;

  employeeCode: string;

  department: string;

  jobTitle?: string;

  phone?: string;

  address?: string;

  hireDate?: string;

  salary: number;

}

export interface UpdateEmployeeRequest {

  employeeCode?: string;

  department?: string;

  jobTitle?: string;

  phone?: string;

  address?: string;

  hireDate?: string;

}

export interface ChangeDepartmentRequest {

  department: string;

}

export interface ChangeSalaryRequest {

  salary: number;

}
