import { Routes } from '@angular/router';

export const accountsReceivableRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./ui/pages/accounts-receivable-page/accounts-receivable-page.component').then(
        m => m.AccountsReceivablePageComponent
      ),
  },
];
