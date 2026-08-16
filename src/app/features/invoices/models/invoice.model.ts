export type InvoiceStatus =
  | 'Unpaid'
  | 'PartiallyPaid'
  | 'Paid'
  | 'Cancelled';

export interface InvoiceCustomer {

  _id: string;

  name: string;

  code: string;

  email?: string | null;

  phone?: string | null;

  address?: string | null;

}

export interface InvoiceSale {

  _id: string;

  warehouse?: string;

  paymentMethod?: string;

  status?: string;

}

export interface InvoiceProduct {

  _id: string;

  name: string;

  sku: string;

  barcode?: string;

  unit?: string;

}

export interface InvoiceUser {

  _id: string;

  name: string;

  email: string;

}

export interface InvoiceItem {

  product:
    string |
    InvoiceProduct;

  quantity: number;

  unitPrice: number;

  total: number;

}

export interface Invoice {

  _id: string;

  invoiceNumber: string;

  sale:
    string |
    InvoiceSale;

  customer:
    string |
    InvoiceCustomer;

  items: InvoiceItem[];

  subtotal: number;

  discount: number;

  tax: number;

  total: number;

  paidAmount: number;

  remainingAmount: number;

  status: InvoiceStatus;

  issueDate: string;

  dueDate: string | null;

  notes: string | null;

  createdBy?:
    InvoiceUser | null;

  updatedBy?:
    InvoiceUser | null;

  createdAt: string;

  updatedAt: string;

}

export interface InvoiceListResponse {

  data: Invoice[];

  pagination: {

    total: number;

    page: number;

    limit: number;

    totalPages: number;

  };

}

export interface InvoiceApiResponse<T> {

  success: boolean;

  message: string;

  data: T;

}
