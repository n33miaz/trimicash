/**
 * movement.entity.ts — TrimiCash
 * Entidade de movimentação do fluxo de caixa (RN-001).
 * TypeScript puro — sem imports Angular.
 */

/** Tipo da movimentação: entrada ou saída efetivada */
export type MovementType = 'ENTRADA' | 'SAIDA';

/**
 * Movement — representa uma movimentação já efetivada no caixa.
 * Movimentações são fatos passados (data ≤ hoje).
 * Lançamentos futuros são tratados como PayableAccount.
 */
export interface Movement {
  /** UUID v4 */
  id: string;
  /** Tipo da movimentação */
  type: MovementType;
  /** Valor em reais, sempre > 0 */
  amount: number;
  /** Data em que a movimentação ocorreu (≤ hoje) */
  date: Date;
  /** Referência à categoria */
  categoryId: string;
  /** Descrição livre */
  description: string;
  /**
   * Se esta movimentação foi gerada ao pagar uma conta,
   * referencia o ID da PayableAccount de origem.
   */
  sourcePayableId?: string;
}
