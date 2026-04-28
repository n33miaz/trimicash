import { Routes } from '@angular/router';
import { AuthLayoutComponent } from '../../layouts/auth-layout/auth-layout.component';
import { LoginPlaceholderComponent } from './ui/login-placeholder.component';

export const authRoutes: Routes = [
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      { path: 'login', component: LoginPlaceholderComponent },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  }
];
