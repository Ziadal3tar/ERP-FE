export interface DashboardSummary {

  products: number;

  customers: number;

  suppliers: number;

  stockQuantity: number;

  sales: {

    total: number;

    count: number;

  };

  purchases: {

    total: number;

    count: number;

  };

}


export interface LowStockProduct {

  _id: string;

  quantity: number;

  product: {

    _id: string;

    name: string;

    sku: string;

    minStock: number;

  };

}


export interface SaleItem {

  product:
    string |
    {
      _id: string;
      name: string;
      sku: string;
    };

  quantity: number;

  unitPrice: number;

  total: number;

}


export interface RecentSale {

  _id: string;

  customer: {

    _id: string;

    name: string;

    code: string;

    phone?: string;

  };

  warehouse: {

    _id: string;

    name: string;

    code: string;

  };

  items: SaleItem[];

  total: number;

  status: string;

  paymentMethod: string;

  createdAt: string;

}


export interface PurchaseItem {

  product:
    string |
    {
      _id: string;
      name: string;
      sku: string;
    };

  quantity: number;

  unitPrice: number;

  total: number;

}


export interface RecentPurchase {

  _id: string;

  supplier: {

    _id: string;

    name: string;

    code: string;

  };

  warehouse: {

    _id: string;

    name: string;

    code: string;

  };

  items: PurchaseItem[];

  total: number;

  status: string;

  createdAt: string;

}
