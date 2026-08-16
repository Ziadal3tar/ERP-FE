export interface Customer {

  _id: string;

  name: string;

  code: string;

  email: string | null;

  phone: string | null;

  address: string | null;

  taxNumber: string | null;

  creditLimit: number;

  notes: string | null;

  isActive: boolean;

  createdBy?: CustomerUser | null;

  updatedBy?: CustomerUser | null;

  createdAt: string;

  updatedAt: string;

}

export interface CustomerUser {

  _id: string;

  name: string;

  email: string;

}

export interface CustomerApiResponse<T> {

  success: boolean;

  message: string;

  data: T;

}

export interface CustomerListResponse {

  data: Customer[];

  pagination: {

    total: number;

    page: number;

    limit: number;

    totalPages: number;

  };

}

export interface CreateCustomerRequest {

  name: string;

  code: string;

  email?: string;

  phone?: string;

  address?: string;

  taxNumber?: string;

  creditLimit?: number;

  notes?: string;

}

export type UpdateCustomerRequest =
  Partial<CreateCustomerRequest>;
