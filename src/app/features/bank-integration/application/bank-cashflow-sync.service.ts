/**
 * bank-cashflow-sync.service.ts — TrimiCash
 * Reflete as transações das contas conectadas (Open Finance) como
 * movimentações reais do Caixa.
 *
 * Como as transações viram `Movement` persistidas, elas passam a contar
 * automaticamente no Caixa, no Fluxo e no Dashboard. Cada movimentação é
 * marcada com `sourceBankConnectionId`, então ao desconectar o banco todas
 * as suas movimentações são removidas (somem de todas as telas).
 */

import { Injectable, inject } from '@angular/core';
import {
  MOVEMENT_REPOSITORY,
  CATEGORY_REPOSITORY,
} from '../../../core/tokens/injection-tokens';
import type { Movement } from '../../cash-flow/domain/entities/movement.entity';
import type { BankConnection } from '../domain/entities/bank-transaction.entity';

/** Categoria dedicada às movimentações vindas do Open Finance. */
const BANK_CATEGORY_NAME = 'Open Finance';
const BANK_CATEGORY_COLOR = '#2F80ED';

@Injectable({ providedIn: 'root' })
export class BankCashflowSyncService {
  private readonly movements = inject(MOVEMENT_REPOSITORY);
  private readonly categories = inject(CATEGORY_REPOSITORY);

  /** Importa as transações de uma conexão como movimentações de caixa. */
  async importConnection(connection: BankConnection): Promise<void> {
    const categoryId = await this.ensureCategory();
    for (const tx of connection.transactions) {
      const movement: Omit<Movement, 'id'> = {
        type: tx.type === 'CREDITO' ? 'ENTRADA' : 'SAIDA',
        amount: tx.amount,
        date: tx.date,
        categoryId,
        description: tx.description,
        sourceBankConnectionId: connection.id,
        sourceBankId: connection.bankId,
      };
      await this.movements.create(movement);
    }
  }

  /** Remove do caixa todas as movimentações de uma conexão. */
  async removeConnection(connectionId: string): Promise<void> {
    const all = await this.movements.list();
    const toRemove = all.filter((m) => m.sourceBankConnectionId === connectionId);
    for (const m of toRemove) {
      await this.movements.remove(m.id);
    }
  }

  /**
   * Reconcilia o caixa com as conexões atuais (idempotente):
   * - remove movimentações órfãs (conexão já revogada);
   * - importa as conexões que ainda não têm movimentações.
   */
  async reconcileAll(connections: BankConnection[]): Promise<void> {
    const all = await this.movements.list();
    const validIds = new Set(connections.map((c) => c.id));

    const orphans = all.filter(
      (m) => m.sourceBankConnectionId && !validIds.has(m.sourceBankConnectionId)
    );
    for (const m of orphans) {
      await this.movements.remove(m.id);
    }

    const alreadyImported = new Set(
      all
        .map((m) => m.sourceBankConnectionId)
        .filter((id): id is string => !!id)
    );
    for (const connection of connections) {
      if (!alreadyImported.has(connection.id)) {
        await this.importConnection(connection);
      }
    }
  }

  /** Garante a categoria dedicada e devolve seu id. */
  private async ensureCategory(): Promise<string> {
    const existing = await this.categories.list();
    const found = existing.find((c) => c.name === BANK_CATEGORY_NAME);
    if (found) return found.id;

    const created = await this.categories.create({
      name: BANK_CATEGORY_NAME,
      color: BANK_CATEGORY_COLOR,
    });
    return created.id;
  }
}
