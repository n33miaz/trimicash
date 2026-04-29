import { Routes } from '@angular/router';

export const alertsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./ui/pages/alerts-center-page/alerts-center-page.component').then(
        (m) => m.AlertsCenterPageComponent
      ),
  },
];
