import { Routes } from '@angular/router';
import { AuthLayoutComponent } from './layout/auth-layout/auth-layout';
import { MainLayoutComponent } from './layout/main-layout/main-layout';

export const routes: Routes = [
  // Default redirect
  { path: '', redirectTo: '/auth/login', pathMatch: 'full' },

  // Auth layout routes
  {
    path: 'auth',
    component: AuthLayoutComponent,
    children: [
      {
        path: 'login',
        loadComponent: () => import('./auth/login/login').then((m) => m.Login),
      },
      {
        path: 'signup',
        loadComponent: () =>
          import('./auth/signup/signup').then((m) => m.Signup),
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },

  // Main layout routes
  {
    path: 'app',
    component: MainLayoutComponent,
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/dashboard').then((m) => m.Dashboard),
      },
    ],
  },

  // Fallback
  { path: '**', redirectTo: '/auth/login' },
];
