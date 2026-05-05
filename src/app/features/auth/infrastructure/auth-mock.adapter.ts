import { Injectable } from '@angular/core';
import type { AuthPort, DemoUser } from '../domain/auth.types';

export const SESSION_KEY = 'trimicash:session';
export const USER_NAME_KEY = 'trimicash:userName';
export const DEMO_CREDENTIALS_KEY = 'trimicash:demoCredentials';

export interface DemoCredentials {
  name: string;
  email: string;
  password: string;
}

export function buildDemoEmail(name: string): string {
  const normalized = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');

  return normalized ? `${normalized}@gmail.com` : '';
}

export function readDemoCredentials(): DemoCredentials | null {
  const raw = localStorage.getItem(DEMO_CREDENTIALS_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<DemoCredentials>;
    if (!parsed.name || !parsed.email || !parsed.password) return null;

    return {
      name: parsed.name,
      email: parsed.email,
      password: parsed.password,
    };
  } catch {
    return null;
  }
}

export function saveDemoCredentials(credentials: DemoCredentials): void {
  localStorage.setItem(USER_NAME_KEY, credentials.name);
  localStorage.setItem(DEMO_CREDENTIALS_KEY, JSON.stringify(credentials));
}

function inferDemoName(email: string): string {
  const localPart = email.split('@')[0]?.trim();
  if (!localPart) return localStorage.getItem(USER_NAME_KEY) || 'Empreendedor';

  const words = localPart
    .replace(/[._-]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) return localStorage.getItem(USER_NAME_KEY) || 'Empreendedor';

  return words
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

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

  async login(email: string, password: string): Promise<DemoUser> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const savedCredentials = readDemoCredentials();
    const userName = savedCredentials?.name || localStorage.getItem(USER_NAME_KEY) || inferDemoName(email);

    saveDemoCredentials({
      name: userName,
      email,
      password,
    });

    const user: DemoUser = {
      id: 'demo-user-123',
      name: userName,
      businessName: 'Nome da Minha Empresa',
    };

    sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return user;
  }

  logout(): void {
    sessionStorage.removeItem(SESSION_KEY);
  }
}
