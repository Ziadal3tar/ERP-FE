export interface DashboardSalesSummary {

  total: number;

  count: number;

}


export interface DashboardPurchasesSummary {

  total: number;

  count: number;

}


export interface DashboardSummary {

  products: number;

  customers: number;

  suppliers: number;

  stockQuantity: number;

  sales: DashboardSalesSummary;

  purchases: DashboardPurchasesSummary;

}


export interface SalesReport {

  totalSales: number;

  subtotal: number;

  discount: number;

  tax: number;

  count: number;

}


export interface PurchasesReport {

  totalPurchases: number;

  subtotal: number;

  discount: number;

  tax: number;

  count: number;

}


export interface StockReportItem {

  _id: string;

  quantity: number;

  product: {

    _id: string;

    name: string;

    sku: string;

    minStock: number;

  };

  warehouse: {

    _id: string;

    name: string;

    code: string;

  };

  isLowStock: boolean;

}


export interface LowStockItem {

  _id: string;

  quantity: number;

  product: {

    _id: string;

    name: string;

    sku: string;

    minStock: number;

  };

}


export interface ReportApiResponse<T> {

  success: boolean;

  message?: string;

  data: T;

}