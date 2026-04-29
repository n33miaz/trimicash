import { Routes } from '@angular/router';

export const cashFlowRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./ui/pages/cash-flow-page/cash-flow-page.component').then(
        (m) => m.CashFlowPageComponent
      ),
  },
];
