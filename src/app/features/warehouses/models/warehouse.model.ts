export interface Manager {
  name: string;
  email: string;
  id: string;
}

export interface Warehouse {
  _id: string;

  name: string;

  code: string;

  location?: string;

  description?: string | null;

  createdBy?: Manager;

  isActive: boolean;

  createdAt: string;

  updatedAt?: string;
}

export interface WarehouseListResponse {

  data: Warehouse[];

  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };

}

export interface CreateWarehouseRequest {

  name: string;

  code: string;

  location?: string;

  description?: string;

  isActive?: boolean;

}

export type UpdateWarehouseRequest =
  Partial<CreateWarehouseRequest>;
