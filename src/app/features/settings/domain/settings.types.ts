/**
 * settings.types.ts — TrimiCash
 * Configurações globais da aplicação.
 * Consumidas via APP_SETTINGS InjectionToken como Signal<AppSettings>.
 * TypeScript puro — sem imports Angular.
 */

/**
 * AppSettings — parâmetros configuráveis pelo usuário.
 *
 * Defaults:
 * - reserveSafetyMarginPct: 10% (RN-006.2)
 * - reserveAttentionThresholdPct: 20% (RN-007, nota de produto)
 * - minSafetyDays: 7 dias (threshold do alerta ALR-CAIXA-CRIT)
 */
export interface AppSettings {
  /** Percentual de margem adicionado à reserva recomendada. Default: 10 */
  reserveSafetyMarginPct: number;
  /** Percentual acima da reserva que ainda indica "Atenção". Default: 20 */
  reserveAttentionThresholdPct: number;
  /** Mínimo de dias de segurança antes de disparar alerta crítico. Default: 7 */
  minSafetyDays: number;
}

/** Valores padrão de AppSettings, prontos para uso nos adapters */
export const DEFAULT_APP_SETTINGS: AppSettings = {
  reserveSafetyMarginPct: 10,
  reserveAttentionThresholdPct: 20,
  minSafetyDays: 7,
};
