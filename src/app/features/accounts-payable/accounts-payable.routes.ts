import { Routes } from '@angular/router';

export const accountsPayableRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./ui/pages/accounts-payable-page/accounts-payable-page.component').then(
        (m) => m.AccountsPayablePageComponent
      ),
  },
];
