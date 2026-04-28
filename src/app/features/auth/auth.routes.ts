import { Routes } from '@angular/router';
import { AuthLayoutComponent } from '../../layouts/auth-layout/auth-layout.component';
import { LoginPageComponent } from './ui/login-page.component';

export const authRoutes: Routes = [
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      { path: 'login', component: LoginPageComponent },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  }
];
