export interface ApiResponse<T> {

  success: boolean;

  message: string;

  data: T;

}
export interface Supplier {

  _id: string;

  name: string;

  code: string;

  email: string | null;

  phone: string | null;

  address: string | null;

  taxNumber: string | null;

  notes: string | null;

  isActive: boolean;

  createdBy?: SupplierUser | null;

  updatedBy?: SupplierUser | null;

  createdAt: string;

  updatedAt: string;

}

export interface SupplierUser {

  _id: string;

  name: string;

  email: string;

}

export interface ApiResponse<T> {

  success: boolean;

  message: string;

  data: T;

}

export interface SupplierListResponse {

  success: boolean;

  data: Supplier[];

  pagination: {

    total: number;

    page: number;

    limit: number;

    totalPages: number;

  };

  message?: string;

}

export interface CreateSupplierRequest {

  name: string;

  code: string;

  email?: string;

  phone?: string;

  address?: string;

  taxNumber?: string;

  notes?: string;

}

export type UpdateSupplierRequest =
  Partial<CreateSupplierRequest>;
