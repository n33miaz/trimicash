/**
 * receivable-local.adapter.ts — TrimiCash
 * Implementação de ReceivableRepository usando localStorage.
 * Espelho do PayableLocalAdapter.
 */

import { Injectable } from '@angular/core';
import type { ReceivableRepository, ReceivableFilter } from '../domain/ports/receivable.repository';
import type { ReceivableAccount } from '../domain/entities/receivable-account.entity';

const STORAGE_KEY = 'trimicash:receivables';

type StoredReceivableAccount = Omit<ReceivableAccount, 'dueDate' | 'receivedAt'> & {
  dueDate: string;
  receivedAt?: string;
};

@Injectable({ providedIn: 'root' })
export class ReceivableLocalAdapter implements ReceivableRepository {
  async list(filter?: ReceivableFilter): Promise<ReceivableAccount[]> {
    await this.delay();
    let receivables = this.readStorage();

    if (filter?.status) {
      receivables = receivables.filter(r => r.status === filter.status);
    }

    if (filter?.period) {
      receivables = receivables.filter(
        r => r.dueDate >= filter.period!.start && r.dueDate <= filter.period!.end
      );
    }

    return receivables;
  }

  async getById(id: string): Promise<ReceivableAccount | null> {
    await this.delay();
    const receivables = this.readStorage();
    return receivables.find(r => r.id === id) ?? null;
  }

  async create(input: Omit<ReceivableAccount, 'id'>): Promise<ReceivableAccount> {
    await this.delay();
    const receivables = this.readStorage();

    const newReceivable: ReceivableAccount = {
      ...input,
      id: crypto.randomUUID(),
      status: input.status ?? 'PENDENTE',
    };

    receivables.push(newReceivable);
    this.writeStorage(receivables);
    return newReceivable;
  }

  async update(id: string, patch: Partial<ReceivableAccount>): Promise<ReceivableAccount> {
    await this.delay();
    const receivables = this.readStorage();
    const index = receivables.findIndex(r => r.id === id);

    if (index === -1) {
      throw new Error(`ReceivableAccount com id ${id} não encontrada.`);
    }

    const updated = { ...receivables[index], ...patch };
    receivables[index] = updated;
    this.writeStorage(receivables);
    return updated;
  }

  async remove(id: string): Promise<void> {
    await this.delay();
    const receivables = this.readStorage().filter(r => r.id !== id);
    this.writeStorage(receivables);
  }

  private readStorage(): ReceivableAccount[] {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];

    try {
      const parsed = JSON.parse(data) as StoredReceivableAccount[];
      return parsed.map(item => ({
        ...item,
        dueDate: new Date(item.dueDate),
        receivedAt: item.receivedAt ? new Date(item.receivedAt) : undefined,
      }));
    } catch {
      return [];
    }
  }

  private writeStorage(receivables: ReceivableAccount[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(receivables));
  }

  private delay(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 0));
  }
}
