/**
 * Alert types — TrimiCash
 * Códigos, severidade e estrutura de alertas in-app (RN-009).
 */

export type AlertSeverity = 'INFO' | 'WARNING' | 'CRITICAL';

export type AlertCode =
  | 'ALR-VENC-7D'      // Vence em até 7 dias — Aviso
  | 'ALR-VENC-2D'      // Vence em até 2 dias — Crítico
  | 'ALR-ATRASO'       // Passou do vencimento sem pagamento — Crítico
  | 'ALR-DEFICIT'      // Saldo < Reserva recomendada — Crítico
  | 'ALR-PROJEC-NEG'   // Saldo projetado negativo — Crítico
  | 'ALR-CAIXA-CRIT';  // Dias de segurança abaixo do mínimo — Crítico

export interface AppAlert {
  id: string;
  code: AlertCode;
  severity: AlertSeverity;
  title: string;
  message: string;
  createdAt: Date;
  /** ID da entidade relacionada (ex: payableAccountId) */
  relatedId?: string;
}
