const fs = require('fs');
const path = require('path');

const features = [
  { path: 'dashboard', name: 'Dashboard', routeFile: 'dashboard.routes.ts', routeExport: 'dashboardRoutes' },
  { path: 'cash-flow', name: 'CashFlow', routeFile: 'cash-flow.routes.ts', routeExport: 'cashFlowRoutes', title: 'Caixa' },
  { path: 'accounts-payable', name: 'AccountsPayable', routeFile: 'accounts-payable.routes.ts', routeExport: 'accountsPayableRoutes', title: 'Contas a Pagar' },
  { path: 'alerts', name: 'Alerts', routeFile: 'alerts.routes.ts', routeExport: 'alertsRoutes', title: 'Alertas' },
  { path: 'settings', name: 'Settings', routeFile: 'settings.routes.ts', routeExport: 'settingsRoutes', title: 'Configurações' },
  { path: 'auth', name: 'Auth', routeFile: 'auth.routes.ts', routeExport: 'authRoutes', title: 'Login Placeholder', noComponent: true }
];

features.forEach(feat => {
  if (feat.noComponent) return;

  const title = feat.title || feat.name;
  const compName = feat.name + 'PlaceholderComponent';
  const compPath = path.join(__dirname, 'src', 'app', 'features', feat.path, 'ui', 'placeholder.component.ts');
  
  const compContent = `import { Component } from '@angular/core';

@Component({
  standalone: true,
  template: \`<div style="padding: 2rem;"><h1>\${title}</h1><p>Em construção...</p></div>\`
})
export class \${compName} {}
`;

  fs.mkdirSync(path.dirname(compPath), { recursive: true });
  fs.writeFileSync(compPath, compContent);
  console.log('Created', compPath);

  const routePath = path.join(__dirname, 'src', 'app', 'features', feat.path, feat.routeFile);
  const routeContent = `import { Routes } from '@angular/router';
import { \${compName} } from './ui/placeholder.component';

export const \${feat.routeExport}: Routes = [
  { path: '', component: \${compName} }
];
`;
  
  fs.writeFileSync(routePath, routeContent);
  console.log('Updated', routePath);
});
