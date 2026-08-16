export type StockTransactionType =
  | 'IN'
  | 'OUT'
  | 'ADJUSTMENT'
  | 'TRANSFER_IN'
  | 'TRANSFER_OUT';

export interface StockProduct {

  _id: string;

  name: string;

  sku: string;

  barcode?: string;

  unit?: string;

  minStock: number;

}

export interface StockWarehouse {

  _id: string;

  name: string;

  code: string;

}

export interface Stock {

  _id: string;

  product: StockProduct;

  warehouse: StockWarehouse;

  quantity: number;

  createdAt: string;

  updatedAt: string;

}

export interface StockTransaction {

  _id: string;

  product: StockProduct;

  warehouse: StockWarehouse;

  type: StockTransactionType;

  quantity: number;

  reference?: string | null;

  notes?: string | null;

  createdBy: {

    _id: string;

    name: string;

    email: string;

  };

  createdAt: string;

  updatedAt: string;

}

export interface Pagination {

  total: number;

  page: number;

  limit: number;

  totalPages: number;

}

export interface StockListResponse {

  data: Stock[];

  pagination: Pagination;

}

export interface StockHistoryResponse {

  data: StockTransaction[];

  pagination: Pagination;

}

export interface StockOperationResponse {

  stock: Stock;

  transaction: StockTransaction;

}

export interface StockInRequest {

  product: string;

  warehouse: string;

  quantity: number;

  reference?: string;

  notes?: string;

}

export interface StockOutRequest {

  product: string;

  warehouse: string;

  quantity: number;

  reference?: string;

  notes?: string;

}

export interface StockTransferRequest {

  product: string;

  fromWarehouse: string;

  toWarehouse: string;

  quantity: number;

  reference?: string;

  notes?: string;

}

export interface WarehouseStockSummary {

  warehouse: StockWarehouse;

  totalQuantity: number;

  productsCount: number;

}
