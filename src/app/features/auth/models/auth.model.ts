export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthUser {

  _id: string;

  name: string;

  email: string;

  phone?: string;

  avatar?: string | null;

  role: 'Admin' | 'Manager' | 'Employee';

  status?: 'Active' | 'Inactive' | 'Suspended';

  isActive?: boolean;

  isVerified?: boolean;

  lastLogin?: string | null;

  createdAt?: string;

}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}
