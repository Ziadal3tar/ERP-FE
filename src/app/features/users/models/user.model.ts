export interface User {

  _id: string;

  name: string;

  email: string;

  role: string;

  isActive: boolean;

  avatar?: string | null;

  createdAt: string;

  updatedAt?: string;

}

export interface UserListResponse {

  data: User[];

  pagination: {

    total: number;

    page: number;

    limit: number;

    totalPages: number;

  };

}

export interface CreateUserRequest {

  name: string;

  email: string;

  password: string;

  role: string;

}

export interface UpdateUserRequest {

  name?: string;

  email?: string;

  role?: string;

}

export interface ChangeStatusRequest {

  isActive: boolean;

}

export interface ChangeRoleRequest {

  role: string;

}

export interface ResetPasswordRequest {

  password: string;

}
