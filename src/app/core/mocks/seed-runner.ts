/**
 * seed-runner.ts — TrimiCash
 * Inicializa o localStorage com dados de demonstração.
 * Executado via provideAppInitializer no app.config.ts.
 * Suporta query param ?seed=healthy|risk|blank para troca de cenário.
 * TypeScript puro (lógica) — usa serviços Angular apenas para inject.
 */

import { Injectable } from '@angular/core';
import { SEEDS, type SeedScenario } from './seeds';

const STORAGE_KEYS = {
  movements:  'trimicash:movements',
  payables:   'trimicash:payables',
  receivables:'trimicash:receivables',
  categories: 'trimicash:categories',
  session:    'trimicash:session',
  seeded:     'trimicash:seeded',
} as const;

/**
 * Chaves adicionais do app que não fazem parte dos seeds,
 * mas precisam ser limpas para garantir um reset completo.
 */
const AUXILIARY_KEYS = [
  'trimicash:session',           // sessionStorage — auth
  'trimicash:userName',          // localStorage — nome do usuário
  'trimicash:demoCredentials',   // localStorage — credenciais de demo
  'trimicash:settings',          // localStorage — preferências
  'trimicash:theme',             // localStorage — tema light/dark
  'trimicash:intro-modal-seen',  // localStorage — flag intro modal
  'trimicash:read-alerts',       // localStorage — alertas lidos
] as const;

@Injectable({ providedIn: 'root' })
export class SeedRunner {
  /**
   * Executa a inicialização dos seeds.
   * - Se o localStorage estiver vazio, popula com o cenário padrão ('healthy').
   * - Se ?seed=<scenario> estiver na URL, reseta e recarrega com o cenário indicado.
   */
  run(): void {
    const scenario = this.resolveScenario();

    if (scenario) {
      // Parâmetro de URL presente → força reset completo + cenário indicado
      this.reseed(scenario);
      // Remove o parâmetro da URL sem recarregar a página
      this.cleanUrlParam();
      return;
    }

    // Primeira execução (localStorage vazio)
    if (!localStorage.getItem(STORAGE_KEYS.seeded)) {
      this.reseed('healthy');
    }
  }

  /**
   * Zera TODOS os dados do app e popula com o cenário especificado.
   * Limpa localStorage (seeds + auxiliares) e sessionStorage (auth).
   * Pode ser chamado pela tela de Settings/dev para resetar a demo.
   */
  reseed(scenario: SeedScenario): void {
    // ── 1. Limpeza completa de todo estado anterior ──
    this.clearAll();

    // ── 2. Popular com o novo cenário ──
    const data = SEEDS[scenario];

    localStorage.setItem(
      STORAGE_KEYS.movements,
      JSON.stringify(data.movements.map(m => ({
        ...m,
        date: m.date.toISOString(),
      })))
    );

    localStorage.setItem(
      STORAGE_KEYS.payables,
      JSON.stringify(data.payables.map(p => ({
        ...p,
        dueDate: p.dueDate.toISOString(),
        paidAt:  p.paidAt ? p.paidAt.toISOString() : undefined,
      })))
    );

    localStorage.setItem(
      STORAGE_KEYS.receivables,
      JSON.stringify(data.receivables.map(r => ({
        ...r,
        dueDate: r.dueDate.toISOString(),
        receivedAt: r.receivedAt ? r.receivedAt.toISOString() : undefined,
      })))
    );

    localStorage.setItem(
      STORAGE_KEYS.categories,
      JSON.stringify(data.categories)
    );

    localStorage.setItem(STORAGE_KEYS.seeded, scenario);
  }

  // ─── Privados ─────────────────────────────────────────────────────────────

  /**
   * Remove TODAS as chaves do app tanto do localStorage quanto do sessionStorage.
   * Garante que um cenário via QR code comece 100% limpo.
   */
  private clearAll(): void {
    // Limpa chaves de seed
    for (const key of Object.values(STORAGE_KEYS)) {
      localStorage.removeItem(key);
    }

    // Limpa chaves auxiliares (auth, settings, theme, intro, alerts)
    for (const key of AUXILIARY_KEYS) {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    }
  }

  private resolveScenario(): SeedScenario | null {
    try {
      const params = new URLSearchParams(window.location.search);
      const raw = params.get('seed');
      if (raw === 'healthy' || raw === 'risk' || raw === 'blank') return raw;
    } catch {
      // Ambiente SSR ou sem window — ignorar
    }
    return null;
  }

  private cleanUrlParam(): void {
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('seed');
      window.history.replaceState({}, '', url.toString());
    } catch {
      // Ignorar em ambientes sem history API
    }
  }
}

/**
 * Factory function usada no provideAppInitializer.
 * Retorna uma função () => void que o Angular chama antes do bootstrap.
 */
export function seedRunnerFactory(runner: SeedRunner): () => void {
  return () => runner.run();
}
