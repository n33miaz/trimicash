/**
 * movement.repository.ts — TrimiCash
 * Porta (interface) do repositório de movimentações.
 * Implementações concretas ficam em infrastructure/ (T04).
 * TypeScript puro — sem imports Angular.
 */

import type { Movement } from '../entities/movement.entity';
import type { Period } from '../../../../../shared/types/period.type';

export interface MovementRepository {
  /** Lista movimentações, opcionalmente filtradas por período */
  list(period?: Period): Promise<Movement[]>;

  /** Busca uma movimentação por ID */
  getById(id: string): Promise<Movement | null>;

  /** Cria uma nova movimentação (ID gerado pelo adapter) */
  create(input: Omit<Movement, 'id'>): Promise<Movement>;

  /** Atualiza campos de uma movimentação existente */
  update(id: string, patch: Partial<Movement>): Promise<Movement>;

  /** Remove uma movimentação */
  remove(id: string): Promise<void>;
}
