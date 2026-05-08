/**
 * receivable-account.entity.ts — TrimiCash
 * Entidade de conta a receber.
 * TypeScript puro — sem imports Angular.
 */

/** Status do ciclo de vida de uma conta a receber */
export type ReceivableStatus = 'PENDENTE' | 'RECEBIDA' | 'ATRASADA' | 'CANCELADA';

/** Frequência de recorrência (espelha PayableAccount) */
export type ReceivableRecurrenceFrequency = 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY' | 'INSTALLMENT';

/**
 * ReceivableAccount — valor futuro a ser recebido.
 *
 * Regras de negócio:
 * - Conta PENDENTE com dueDate < hoje → ATRASADA.
 * - Ao marcar como RECEBIDA → gera Movement de ENTRADA no caixa.
 * - Contas recorrentes pertencem a um recurrenceGroupId.
 * - Contas parceladas compartilham installmentGroupId.
 */
export interface ReceivableAccount {
  /** UUID v4 */
  id: string;
  /** Descrição da receita */
  description: string;
  /** Valor em reais, sempre > 0 */
  amount: number;
  /** Data de vencimento/previsão de recebimento */
  dueDate: Date;
  /** Referência à categoria */
  categoryId: string;
  /** Status atual */
  status: ReceivableStatus;
  /** Frequência de recorrência */
  recurrence: ReceivableRecurrenceFrequency;
  /** Agrupa ocorrências de uma receita recorrente */
  recurrenceGroupId?: string;
  /** Data em que foi recebida */
  receivedAt?: Date;
  /** ID da Movement gerada ao receber */
  receivedMovementId?: string;
  /** ID que agrupa todas as parcelas de um mesmo parcelamento */
  installmentGroupId?: string;
  /** Número da parcela (ex: 2) */
  installmentNumber?: number;
  /** Total de parcelas (ex: 6) */
  totalInstallments?: number;
}
