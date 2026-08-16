export interface ProductCategory {
  _id: string;
  name: string;
}

export interface Product {

  _id: string;

  name: string;

  sku: string;

  barcode?: string | null;

  description?: string | null;

  category:
    | string
    | ProductCategory;

  purchasePrice: number;

  sellingPrice: number;

  unit?: string;

  minStock: number;

  image?: string | null;

  isActive: boolean;

  createdAt: string;

  updatedAt?: string;

}

/*
|--------------------------------------------------------------------------
| Create
|--------------------------------------------------------------------------
*/

export interface CreateProductRequest {

  name: string;

  sku: string;

  barcode?: string | null;

  description?: string;

  category: string;

  purchasePrice: number;

  sellingPrice: number;

  unit?: string;

  minStock: number;

  image?: string | null;

}

/*
|--------------------------------------------------------------------------
| Update
|--------------------------------------------------------------------------
*/

export interface UpdateProductRequest {

  name?: string;

  sku?: string;

  barcode?: string | null;

  description?: string;

  category?: string;

  purchasePrice?: number;

  sellingPrice?: number;

  unit?: string;

  minStock?: number;

  image?: string | null;

}

/*
|--------------------------------------------------------------------------
| Response
|--------------------------------------------------------------------------
*/

export interface ProductListResponse {

  data: Product[];

  pagination: {

    total: number;

    page: number;

    limit: number;

    totalPages: number;

  };

}
