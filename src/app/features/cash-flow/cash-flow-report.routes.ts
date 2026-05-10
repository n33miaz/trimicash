import { Routes } from '@angular/router';

export const cashFlowReportRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./ui/pages/cash-flow-report-page/cash-flow-report-page.component').then(
        (m) => m.CashFlowReportPageComponent
      ),
  },
];
