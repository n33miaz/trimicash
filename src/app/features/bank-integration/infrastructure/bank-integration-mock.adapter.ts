/**
 * bank-integration-mock.adapter.ts — TrimiCash
 * Implementação mock/local da porta de integração bancária (Open Finance).
 *
 * Simula o fluxo de consentimento e persiste as conexões em localStorage,
 * no mesmo padrão dos demais adapters da Fase 1. A latência artificial e os
 * extratos fictícios servem só para demonstrar a experiência ao usuário.
 */

import { Injectable } from '@angular/core';
import type { BankIntegrationRepository } from '../domain/ports/bank-integration.repository';
import type { Bank } from '../domain/entities/bank.entity';
import type {
  BankConnection,
  BankTransaction,
} from '../domain/entities/bank-transaction.entity';
import { BANK_CATALOG, findBank } from './bank-catalog';
import { buildConnection, buildTransactions } from './bank-statement.factory';

const STORAGE_KEY = 'trimicash:bank-connections';

/** Forma serializada (datas como ISO string). */
interface StoredTransaction extends Omit<BankTransaction, 'date'> {
  date: string;
}
interface StoredConnection
  extends Omit<BankConnection, 'connectedAt' | 'lastSyncAt' | 'transactions'> {
  connectedAt: string;
  lastSyncAt: string;
  transactions: StoredTransaction[];
}

@Injectable({ providedIn: 'root' })
export class BankIntegrationMockAdapter implements BankIntegrationRepository {
  async listAvailableBanks(): Promise<Bank[]> {
    await this.delay(0);
    return [...BANK_CATALOG];
  }

  async listConnections(): Promise<BankConnection[]> {
    await this.delay(0);
    return this.readStorage();
  }

  async connect(bankId: string): Promise<BankConnection> {
    // Latência maior: simula o redirecionamento + consentimento Open Finance.
    await this.delay(450);

    if (!findBank(bankId)) {
      throw new Error(`Instituição desconhecida: ${bankId}`);
    }

    const connections = this.readStorage();
    if (connections.some((c) => c.bankId === bankId)) {
      throw new Error('Esta instituição já está conectada.');
    }

    const connection = buildConnection(crypto.randomUUID(), bankId);
    connections.push(connection);
    this.writeStorage(connections);

    return connection;
  }

  async disconnect(connectionId: string): Promise<void> {
    await this.delay(150);
    const connections = this.readStorage().filter((c) => c.id !== connectionId);
    this.writeStorage(connections);
  }

  async sync(connectionId: string): Promise<BankConnection> {
    await this.delay(350);
    const connections = this.readStorage();
    const index = connections.findIndex((c) => c.id === connectionId);
    if (index === -1) {
      throw new Error(`Conexão não encontrada: ${connectionId}`);
    }

    const now = new Date();
    const refreshed: BankConnection = {
      ...connections[index],
      lastSyncAt: now,
      transactions: buildTransactions(connections[index].bankId, now),
    };
    connections[index] = refreshed;
    this.writeStorage(connections);

    return refreshed;
  }

  // ─── Privados ───────────────────────────────────────────────────────────

  private readStorage(): BankConnection[] {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    try {
      const parsed = JSON.parse(data) as StoredConnection[];
      return parsed.map((c) => ({
        ...c,
        connectedAt: new Date(c.connectedAt),
        lastSyncAt: new Date(c.lastSyncAt),
        transactions: c.transactions.map((t) => ({ ...t, date: new Date(t.date) })),
      }));
    } catch {
      return [];
    }
  }

  private writeStorage(connections: BankConnection[]): void {
    const serialized: StoredConnection[] = connections.map((c) => ({
      ...c,
      connectedAt: c.connectedAt.toISOString(),
      lastSyncAt: c.lastSyncAt.toISOString(),
      transactions: c.transactions.map((t) => ({ ...t, date: t.date.toISOString() })),
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serialized));
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
