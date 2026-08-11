import { Routes } from '@angular/router';

export const routes: Routes = [

  {
    path:'login',
    loadComponent:()=>import('./features/auth/login/login')
    .then(c=>c.Login)
  },

  {
    path:'forgot-password',
    loadComponent:()=>import('./features/auth/forgot-password/forgot-password')
    .then(c=>c.ForgotPassword)
  },

  {
    path:'reset-password/:token',
    loadComponent:()=>import('./features/auth/reset-password/reset-password')
    .then(c=>c.ResetPassword)
  },

  {
    path:'profile',
    loadComponent:()=>import('./features/profile/profile/profile')
    .then(c=>c.Profile)
  },

  {
    path:'change-password',
    loadComponent:()=>import('./features/profile/change-password/change-password')
    .then(c=>c.ChangePassword)
  },

  {
    path:'',
    redirectTo:'login',
    pathMatch:'full'
  },

  {
    path:'**',
    redirectTo:'login'
  }

];
