export type PurchaseStatus =
  | 'Draft'
  | 'Confirmed'
  | 'Received'
  | 'Cancelled';

export interface PurchaseProduct {

  _id: string;

  name: string;

  sku: string;

  barcode?: string;

  unit?: string;

}

export interface PurchaseSupplier {

  _id: string;

  name: string;

  code: string;

  email?: string | null;

  phone?: string | null;

}

export interface PurchaseWarehouse {

  _id: string;

  name: string;

  code: string;

  location?: string | null;

}

export interface PurchaseUser {

  _id: string;

  name: string;

  email: string;

}

export interface PurchaseItem {

  product:
    string |
    PurchaseProduct;

  quantity: number;

  unitPrice: number;

  total: number;

}

export interface Purchase {

  _id: string;

  supplier:
    string |
    PurchaseSupplier;

  warehouse:
    string |
    PurchaseWarehouse;

  items: PurchaseItem[];

  subtotal: number;

  discount: number;

  tax: number;

  total: number;

  status: PurchaseStatus;

  receivedAt: string | null;

  receivedBy?:
    PurchaseUser | null;

  notes: string | null;

  createdBy?:
    PurchaseUser | null;

  updatedBy?:
    PurchaseUser | null;

  createdAt: string;

  updatedAt: string;

}

export interface CreatePurchaseItemRequest {

  product: string;

  quantity: number;

  unitPrice: number;

}

export interface CreatePurchaseRequest {

  supplier: string;

  warehouse: string;

  items: CreatePurchaseItemRequest[];

  discount?: number;

  tax?: number;

  notes?: string;

}

export interface PurchaseListResponse {

  data: Purchase[];

  pagination: {

    total: number;

    page: number;

    limit: number;

    totalPages: number;

  };

}

export interface ApiResponse<T> {

  success: boolean;

  message: string;

  data: T;

}
