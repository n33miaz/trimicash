/**
 * auth.types.ts — TrimiCash
 * Tipos e porta de autenticação (RN-011).
 * Fase 1: login simulado sem autenticação real.
 * TypeScript puro — sem imports Angular.
 */

/**
 * DemoUser — usuário simulado para a apresentação da Fase 1.
 * Não representa autenticação real.
 */
export interface DemoUser {
  id: string;
  name: string;
  businessName: string;
}

/**
 * AuthPort — abstração de autenticação.
 * Fase 1: implementada com dados fixos em memória.
 * Fase 2: substituída por adapter HTTP com JWT/OAuth.
 */
export interface AuthPort {
  /** Retorna o usuário autenticado ou null */
  current(): DemoUser | null;
  /** Simula login — Fase 1 aceita qualquer credencial válida */
  login(email: string, password: string): Promise<DemoUser>;
  /** Limpa a sessão */
  logout(): void;
}
