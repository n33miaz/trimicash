import { Injectable } from '@angular/core';
import type { PayableRepository, PayableFilter } from '../domain/ports/payable.repository';
import type { PayableAccount } from '../domain/entities/payable-account.entity';

const STORAGE_KEY = 'trimicash:payables';

type StoredPayableAccount = Omit<PayableAccount, 'dueDate' | 'paidAt'> & {
  dueDate: string;
  paidAt?: string;
};

@Injectable({
  providedIn: 'root'
})
export class PayableLocalAdapter implements PayableRepository {
  async list(filter?: PayableFilter): Promise<PayableAccount[]> {
    await this.delay();
    let payables = this.readStorage();
    
    if (filter?.status) {
      payables = payables.filter(p => p.status === filter.status);
    }
    
    if (filter?.period) {
      payables = payables.filter(p => p.dueDate >= filter.period!.start && p.dueDate <= filter.period!.end);
    }
    
    return payables;
  }

  async getById(id: string): Promise<PayableAccount | null> {
    await this.delay();
    const payables = this.readStorage();
    return payables.find(p => p.id === id) || null;
  }

  async create(input: Omit<PayableAccount, 'id' | 'status'>): Promise<PayableAccount> {
    await this.delay();
    const payables = this.readStorage();
    
    const newPayable: PayableAccount = {
      ...input,
      id: crypto.randomUUID(),
      status: 'PENDENTE',
    };
    
    payables.push(newPayable);
    this.writeStorage(payables);
    
    return newPayable;
  }

  async update(id: string, patch: Partial<PayableAccount>): Promise<PayableAccount> {
    await this.delay();
    const payables = this.readStorage();
    const index = payables.findIndex(p => p.id === id);
    
    if (index === -1) {
      throw new Error(`PayableAccount with id ${id} not found`);
    }
    
    const updatedPayable = { ...payables[index], ...patch };
    payables[index] = updatedPayable;
    this.writeStorage(payables);
    
    return updatedPayable;
  }

  async remove(id: string): Promise<void> {
    await this.delay();
    let payables = this.readStorage();
    payables = payables.filter(p => p.id !== id);
    this.writeStorage(payables);
  }

  private readStorage(): PayableAccount[] {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    
    try {
      const parsed = JSON.parse(data) as StoredPayableAccount[];
      return parsed.map((item) => ({
        ...item,
        dueDate: new Date(item.dueDate),
        paidAt: item.paidAt ? new Date(item.paidAt) : undefined,
      }));
    } catch {
      return [];
    }
  }

  private writeStorage(payables: PayableAccount[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payables));
  }

  private delay(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 0));
  }
}
