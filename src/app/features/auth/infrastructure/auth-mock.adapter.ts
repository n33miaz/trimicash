import { Injectable } from '@angular/core';
import type { AuthPort, DemoUser } from '../domain/auth.types';

const SESSION_KEY = 'trimicash:session';

const MOCK_USER: DemoUser = {
  id: 'demo-user-123',
  name: 'Empreendedor Demo',
  businessName: 'Minha Empresa TrimiCash',
};

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
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(MOCK_USER));
    return MOCK_USER;
  }

  logout(): void {
    sessionStorage.removeItem(SESSION_KEY);
  }
}
