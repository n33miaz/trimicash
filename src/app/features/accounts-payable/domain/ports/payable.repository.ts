/**
 * payable.repository.ts — TrimiCash
 * Porta (interface) do repositório de contas a pagar.
 * Implementações concretas ficam em infrastructure/ (T04).
 * TypeScript puro — sem imports Angular.
 */

import type { PayableAccount, PayableStatus } from '../entities/payable-account.entity';
import type { Period } from '../../../../../shared/types/period.type';

export interface PayableFilter {
  status?: PayableStatus;
  period?: Period;
}

export interface PayableRepository {
  /** Lista contas a pagar, com filtros opcionais */
  list(filter?: PayableFilter): Promise<PayableAccount[]>;

  /** Busca uma conta por ID */
  getById(id: string): Promise<PayableAccount | null>;

  /**
   * Cria uma nova conta a pagar.
   * ID e status são gerados pelo adapter.
   */
  create(
    input: Omit<PayableAccount, 'id' | 'status'>
  ): Promise<PayableAccount>;

  /** Atualiza campos de uma conta existente */
  update(id: string, patch: Partial<PayableAccount>): Promise<PayableAccount>;

  /** Remove uma conta */
  remove(id: string): Promise<void>;
}
