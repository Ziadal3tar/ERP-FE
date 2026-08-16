export interface NavItem {
  label: string;
  icon: string;
  route?: string;
  children?: NavItem[];
}

export const ADMIN_NAVIGATION: NavItem[] = [

  {
    label: 'Dashboard',
    icon: 'bi-grid-1x2-fill',
    route: '/admin/dashboard'
  },

  {
    label: 'Human Resources',
    icon: 'bi-people-fill',

    children: [

      {
        label: 'Users',
        icon: 'bi-person',
        route: '/admin/users'
      },

      {
        label: 'Departments',
        icon: 'bi-diagram-3',
        route: '/admin/departments'
      },

      {
        label: 'Employees',
        icon: 'bi-person-badge',
        route: '/admin/employees'
      },

      {
        label: 'Attendance',
        icon: 'bi-calendar-check',
        route: '/admin/attendance'
      },

      {
        label: 'Leaves',
        icon: 'bi-calendar-x',
        route: '/admin/leaves'
      }

    ]
  },

  {
    label: 'Inventory',
    icon: 'bi-box-seam-fill',

    children: [

      {
        label: 'Categories',
        icon: 'bi-tags',
        route: '/admin/categories'
      },

      {
        label: 'Products',
        icon: 'bi-box',
        route: '/admin/products'
      },

      {
        label: 'Warehouses',
        icon: 'bi-building',
        route: '/admin/warehouses'
      },

      {
        label: 'Stock',
        icon: 'bi-stack',
        route: '/admin/stock'
      },

      {
        label: 'Suppliers',
        icon: 'bi-truck',
        route: '/admin/suppliers'
      }

    ]
  },

  {
    label: 'Purchasing',
    icon: 'bi-cart-plus',

    children: [

      {
        label: 'Purchases',
        icon: 'bi-cart-check',
        route: '/admin/purchases'
      }

    ]
  },

  {
    label: 'Sales',
    icon: 'bi-graph-up-arrow',

    children: [

      {
        label: 'Customers',
        icon: 'bi-person-lines-fill',
        route: '/admin/customers'
      },

      {
        label: 'Sales',
        icon: 'bi-receipt',
        route: '/admin/sales',
         children: [
    {
      label: 'Dashboard',
      icon: 'bi-speedometer2',
      route: '/admin/sales/dashboard'
    },
    {
      label: 'Sales',
      icon: 'bi-list-ul',
      route: '/admin/sales'
    },
    {
      label: 'New Sale',
      icon: 'bi-plus-circle',
      route: '/admin/sales/create'
    }
  ]
      },

      {
        label: 'Invoices',
        icon: 'bi-file-earmark-text',
        route: '/admin/invoices'
      },

      {
        label: 'Payments',
        icon: 'bi-credit-card',
        route: '/admin/payments'
      }

    ]
  },

  {
    label: 'Reports',
    icon: 'bi-bar-chart-fill',
    route: '/admin/reports'
  },

  {
    label: 'Audit Logs',
    icon: 'bi-clock-history',
    route: '/admin/audit-logs'
  }

];
