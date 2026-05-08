import { Routes } from '@angular/router';
import { authGuard } from './core/auth/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then((m) => m.authRoutes),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layouts/main-layout/main-layout.component').then(
        (m) => m.MainLayoutComponent
      ),
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./features/dashboard/dashboard.routes').then(
            (m) => m.dashboardRoutes
          ),
      },
      {
        path: 'cash-flow',
        loadChildren: () =>
          import('./features/cash-flow/cash-flow.routes').then(
            (m) => m.cashFlowRoutes
          ),
      },
      {
        path: 'accounts-payable',
        loadChildren: () =>
          import('./features/accounts-payable/accounts-payable.routes').then(
            (m) => m.accountsPayableRoutes
          ),
      },
      {
        path: 'accounts-receivable',
        loadChildren: () =>
          import('./features/accounts-receivable/accounts-receivable.routes').then(
            (m) => m.accountsReceivableRoutes
          ),
      },
      {
        path: 'alerts',
        loadChildren: () =>
          import('./features/alerts/alerts.routes').then((m) => m.alertsRoutes),
      },
      {
        path: 'settings',
        loadChildren: () =>
          import('./features/settings/settings.routes').then(
            (m) => m.settingsRoutes
          ),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
