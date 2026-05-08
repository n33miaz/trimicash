/**
 * payable-account.entity.ts — TrimiCash
 * Entidade de conta a pagar (RN-002, RN-003).
 * TypeScript puro — sem imports Angular.
 */

/** Status do ciclo de vida de uma conta a pagar (RN-002.2) */
export type PayableStatus = 'PENDENTE' | 'PAGA' | 'ATRASADA' | 'CANCELADA';

/**
 * Frequência de recorrência de gastos fixos (RN-003.2).
 * NONE = não recorrente.
 */
export type RecurrenceFrequency = 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY' | 'INSTALLMENT';

/**
 * PayableAccount — compromisso futuro ou pendente que ainda precisa ser pago.
 *
 * Regras de negócio:
 * - Conta PENDENTE com dueDate < hoje → deve ser tratada como ATRASADA (RN-002.3).
 * - Ao marcar como PAGA → gera Movement de SAIDA (RN-002.4).
 * - Contas recorrentes pertencem a um recurrenceGroupId (RN-003).
 */
export interface PayableAccount {
  /** UUID v4 */
  id: string;
  /** Descrição da conta */
  description: string;
  /** Valor em reais, sempre > 0 */
  amount: number;
  /** Data de vencimento */
  dueDate: Date;
  /** Referência à categoria */
  categoryId: string;
  /** Status atual */
  status: PayableStatus;
  /** Frequência de recorrência */
  recurrence: RecurrenceFrequency;
  /**
   * Agrupa ocorrências de um gasto fixo recorrente.
   * Presente apenas quando recurrence ≠ 'NONE'.
   */
  recurrenceGroupId?: string;
  /** Data em que foi paga */
  paidAt?: Date;
  /** ID da Movement gerada ao pagar */
  paidMovementId?: string;
  /** ID que agrupa todas as parcelas de um mesmo parcelamento */
  installmentGroupId?: string;
  /** Número da parcela (ex: 2) */
  installmentNumber?: number;
  /** Total de parcelas (ex: 6) */
  totalInstallments?: number;
}
