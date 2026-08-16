import { Routes } from '@angular/router';

export const CATEGORIES_ROUTES: Routes = [

  {
    path: '',

    loadComponent: () =>
      import(
        './pages/categories-list/categories-list'
      )
      .then(c => c.CategoriesList)
  },

  {
    path: 'create',

    loadComponent: () =>
      import(
        './pages/category-form/category-form'
      )
      .then(c => c.CategoryForm)
  },

  {
    path: ':id/edit',

    loadComponent: () =>
      import(
        './pages/category-form/category-form'
      )
      .then(c => c.CategoryForm)
  },

  {
    path: ':id',

    loadComponent: () =>
      import(
        './pages/category-details/category-details'
      )
      .then(c => c.CategoryDetails)
  }

];
