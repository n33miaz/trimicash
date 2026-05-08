/**
 * receivable.repository.ts — TrimiCash
 * Porta (interface) do repositório de contas a receber.
 * TypeScript puro — sem imports Angular.
 */

import type { ReceivableAccount, ReceivableStatus } from '../entities/receivable-account.entity';
import type { Period } from '../../../../shared/types/period.type';

export interface ReceivableFilter {
  status?: ReceivableStatus;
  period?: Period;
}

export interface ReceivableRepository {
  /** Lista contas a receber com filtros opcionais */
  list(filter?: ReceivableFilter): Promise<ReceivableAccount[]>;

  /** Busca uma conta por ID */
  getById(id: string): Promise<ReceivableAccount | null>;

  /**
   * Cria uma nova conta a receber.
   * ID e status são gerados pelo adapter.
   */
  create(input: Omit<ReceivableAccount, 'id'>): Promise<ReceivableAccount>;

  /** Atualiza campos de uma conta existente */
  update(id: string, patch: Partial<ReceivableAccount>): Promise<ReceivableAccount>;

  /** Remove uma conta */
  remove(id: string): Promise<void>;
}
