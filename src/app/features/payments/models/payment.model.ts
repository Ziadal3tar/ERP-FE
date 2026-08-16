export type PaymentMethod =
  | 'Cash'
  | 'Card'
  | 'Bank';

export interface PaymentInvoice {

  _id: string;

  invoiceNumber: string;

  total: number;

  status: string;

}

export interface PaymentCustomer {

  _id: string;

  name: string;

  code: string;

  phone?: string | null;

}

export interface PaymentUser {

  _id: string;

  name: string;

  email: string;

}

export interface Payment {

  _id: string;

  invoice:
    string |
    PaymentInvoice;

  customer:
    string |
    PaymentCustomer;

  amount: number;

  method: PaymentMethod;

  reference: string | null;

  notes: string | null;

  paymentDate: string;

  createdBy?:
    PaymentUser | null;

  updatedBy?:
    PaymentUser | null;

  createdAt: string;

  updatedAt: string;

}

export interface CreatePaymentRequest {

  amount: number;

  method: PaymentMethod;

  reference?: string;

  notes?: string;

}

export interface PaymentListResponse {

  data: Payment[];

  pagination: {

    total: number;

    page: number;

    limit: number;

    totalPages: number;

  };

}

export interface PaymentApiResponse<T> {

  success: boolean;

  message: string;

  data: T;

}
