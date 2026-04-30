import { Injectable } from '@angular/core';
import type { AuthPort, DemoUser } from '../domain/auth.types';

const SESSION_KEY = 'trimicash:session';
const USER_NAME_KEY = 'trimicash:userName';

@Injectable({
  providedIn: 'root'
})
export class AuthMockAdapter implements AuthPort {
  current(): DemoUser | null {
    const data = sessionStorage.getItem(SESSION_KEY);
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  async login(_email: string, _password: string): Promise<DemoUser> {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulando delay de rede

    const userName = localStorage.getItem(USER_NAME_KEY) || 'Empreendedor';
    const user: DemoUser = {
      id: 'demo-user-123',
      name: userName,
      businessName: 'Minha Empresa TrimiCash',
    };

    sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return user;
  }

  logout(): void {
    sessionStorage.removeItem(SESSION_KEY);
  }
}
