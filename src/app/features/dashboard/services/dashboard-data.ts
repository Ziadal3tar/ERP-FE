import {
  Injectable,
  inject
} from '@angular/core';

import {
  forkJoin,
  map,
  Observable
} from 'rxjs';

import {
  ProductService
} from '../../products/services/product';

import {
  CustomerService
} from '../../customers/services/customer';

import {
  WarehouseService
} from '../../warehouses/services/warehouse';

import {
  SupplierService
} from '../../suppliers/services/supplier';

import {
  StockService
} from '../../stock/services/stock';

import {
  InvoiceService
} from '../../invoices/services/invoice';

import {
  PaymentService
} from '../../payments/services/payment';

import {
  SaleService
} from '../../sales/services/sale';

import {
  PurchaseService
} from '../../purchases/services/purchase';


@Injectable({
  providedIn: 'root'
})
export class DashboardDataService {

  private readonly productService =
    inject(ProductService);

  private readonly customerService =
    inject(CustomerService);

  private readonly warehouseService =
    inject(WarehouseService);

  private readonly supplierService =
    inject(SupplierService);

  private readonly stockService =
    inject(StockService);

  private readonly invoiceService =
    inject(InvoiceService);

  private readonly paymentService =
    inject(PaymentService);

  private readonly saleService =
    inject(SaleService);

  private readonly purchaseService =
    inject(PurchaseService);


  getSummary() {

    return forkJoin({

      products:
        this.productService.getProducts(
          1,
          1
        ),

      customers:
        this.customerService.getCustomers(
          1,
          1
        ),

      warehouses:
        this.warehouseService.getWarehouses(
          1,
          1
        ),

      suppliers:
        this.supplierService.getSuppliers(
          1,
          1
        ),

      stock:
        this.stockService.getStock(
          1,
          1
        ),

      invoices:
        this.invoiceService.getInvoices(
          1,
          1
        ),

      payments:
        this.paymentService.getPayments(
          1,
          1
        ),

      sales:
        this.saleService.getSales(
          1,
          1,
          '',
          '',
          'Confirmed'
        ),

      purchases:
        this.purchaseService.getPurchases(
          1,
          1,
          '',
          '',
          'Received'
        )

    }).pipe(

      map(response => ({

        sales: {
          total:
            response.sales.data.reduce(
              (
                sum,
                sale
              ) =>
                sum + sale.total,
              0
            ),

          count:
            response.sales.pagination.total

        },

        purchases: {
          total:
            response.purchases.data.reduce(
              (
                sum,
                purchase
              ) =>
                sum + purchase.total,
              0
            ),

          count:
            response.purchases.pagination.total

        },

        customers:
          response.customers
            .pagination.total,

        products:
          response.products
            .pagination.total,

        warehouses:
          response.warehouses
            .pagination.total,

        suppliers:
          response.suppliers
            .pagination.total,

        invoices:
          response.invoices
            .pagination.total,

        payments:
          response.payments
            .pagination.total,

        stockQuantity:
          0

      }))

    );

  }

}
