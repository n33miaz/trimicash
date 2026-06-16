import { Routes } from '@angular/router';

export const bankIntegrationRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./ui/pages/open-finance-page/open-finance-page.component').then(
        (m) => m.OpenFinancePageComponent
      ),
  },
];
