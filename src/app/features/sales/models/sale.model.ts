export type SaleStatus =
  | 'Draft'
  | 'Confirmed'
  | 'Cancelled';

export type SalePaymentMethod =
  | 'Cash'
  | 'Card'
  | 'Bank'
  | 'Credit';

export interface SaleCustomer {

  _id: string;

  name: string;

  code: string;

  email?: string | null;

  phone?: string | null;

  address?: string | null;

  creditLimit: number;

}

export interface SaleWarehouse {

  _id: string;

  name: string;

  code: string;

  location?: string | null;

}

export interface SaleProduct {

  _id: string;

  name: string;

  sku: string;

  barcode?: string;

  unit?: string;

}

export interface SaleUser {

  _id: string;

  name: string;

  email: string;

}

export interface SaleItem {

  product:
    string |
    SaleProduct;

  quantity: number;

  unitPrice: number;

  total: number;

}

export interface Sale {

  _id: string;

  customer:
    string |
    SaleCustomer;

  warehouse:
    string |
    SaleWarehouse;

  items: SaleItem[];

  subtotal: number;

  discount: number;

  tax: number;

  total: number;

  paymentMethod: SalePaymentMethod;

  status: SaleStatus;

  notes: string | null;

  confirmedAt: string | null;

  confirmedBy?:
    SaleUser | null;

  createdBy?:
    SaleUser | null;

  updatedBy?:
    SaleUser | null;

  createdAt: string;

  updatedAt: string;

}

export interface CreateSaleItemRequest {

  product: string;

  quantity: number;

  unitPrice: number;

}

export interface CreateSaleRequest {

  customer: string;

  warehouse: string;

  items: CreateSaleItemRequest[];

  discount?: number;

  tax?: number;

  paymentMethod?: SalePaymentMethod;

  notes?: string;

}

export interface SaleListResponse {

  data: Sale[];

  pagination: {

    total: number;

    page: number;

    limit: number;

    totalPages: number;

  };

}

export interface SaleApiResponse<T> {

  success: boolean;

  message: string;

  data: T;

}
