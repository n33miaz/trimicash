/**
 * accounts-receivable.facade.ts — TrimiCash
 * Facade de Application Layer para contas a receber.
 * Espelho do AccountsPayableFacade com signals e computed.
 */

import { Injectable, computed, inject, signal } from '@angular/core';
import type { ReceivableAccount } from '../domain/entities/receivable-account.entity';
import { ReceivableStatusService } from '../domain/services/receivable-status.service';
import { CreateReceivableUseCase } from './create-receivable.usecase';
import { UpdateReceivableUseCase } from './update-receivable.usecase';
import { CancelReceivableUseCase } from './cancel-receivable.usecase';
import { ListReceivablesUseCase } from './list-receivables.usecase';
import { ReceiveReceivableUseCase } from './receive-receivable.usecase';
import type { Period } from '../../../shared/types/period.type';

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

@Injectable({ providedIn: 'root' })
export class AccountsReceivableFacade {
  private readonly createUseCase = inject(CreateReceivableUseCase);
  private readonly updateUseCase = inject(UpdateReceivableUseCase);
  private readonly cancelUseCase = inject(CancelReceivableUseCase);
  private readonly listUseCase = inject(ListReceivablesUseCase);
  private readonly receiveUseCase = inject(ReceiveReceivableUseCase);

  private readonly statusService = new ReceivableStatusService();

  // ─── State ──────────────────────────────────────────────────────────────────
  private readonly _receivables = signal<ReceivableAccount[]>([]);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  // ─── Public API ─────────────────────────────────────────────────────────────
  readonly receivables = computed(() =>
    this._receivables().map(r => ({
      ...r,
      status: this.statusService.resolveStatus(r, new Date()),
    }))
  );

  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  readonly pending = computed(() => this.receivables().filter(r => r.status === 'PENDENTE'));
  readonly overdue = computed(() => this.receivables().filter(r => r.status === 'ATRASADA'));
  readonly received = computed(() => this.receivables().filter(r => r.status === 'RECEBIDA'));

  /** Soma de todas as contas pendentes (para consolidação no Caixa) */
  readonly totalPending = computed(() =>
    [...this.pending(), ...this.overdue()].reduce((acc, r) => acc + r.amount, 0)
  );

  async load(period?: Period): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    try {
      const data = await this.listUseCase.execute({ period });
      this._receivables.set(data);
    } catch (err: unknown) {
      this._error.set(errorMessage(err, 'Erro ao carregar contas a receber'));
    } finally {
      this._loading.set(false);
    }
  }

  async create(input: Omit<ReceivableAccount, 'id'>): Promise<void> {
    const previous = this._receivables();
    this._error.set(null);
    try {
      const created = await this.createUseCase.execute(input);
      this._receivables.update(list => [...list, created]);
    } catch (err: unknown) {
      this._receivables.set(previous);
      this._error.set(errorMessage(err, 'Erro ao criar conta a receber'));
      throw err;
    }
  }

  async createMany(inputs: Omit<ReceivableAccount, 'id'>[]): Promise<void> {
    const previous = this._receivables();
    this._error.set(null);
    try {
      const created = await Promise.all(inputs.map(i => this.createUseCase.execute(i)));
      this._receivables.update(list => [...list, ...created]);
    } catch (err: unknown) {
      this._receivables.set(previous);
      this._error.set(errorMessage(err, 'Erro ao criar contas a receber'));
      throw err;
    }
  }

  async update(id: string, patch: Partial<ReceivableAccount>): Promise<void> {
    this._error.set(null);
    try {
      const updated = await this.updateUseCase.execute(id, patch);
      this._receivables.update(list => list.map(item => item.id === id ? updated : item));
    } catch (err: unknown) {
      this._error.set(errorMessage(err, 'Erro ao atualizar conta a receber'));
      throw err;
    }
  }

  async cancel(id: string): Promise<void> {
    this._error.set(null);
    try {
      await this.cancelUseCase.execute(id);
      this._receivables.update(list =>
        list.map(item => item.id === id ? { ...item, status: 'CANCELADA' as const } : item)
      );
    } catch (err: unknown) {
      this._error.set(errorMessage(err, 'Erro ao cancelar conta a receber'));
      throw err;
    }
  }

  async receive(id: string, receivedAt?: Date): Promise<void> {
    const previous = this._receivables();
    this._error.set(null);
    try {
      const updated = await this.receiveUseCase.execute(id, receivedAt);
      this._receivables.update(list => list.map(item => item.id === id ? updated : item));
      // Recarrega silenciosamente para pegar recorrência gerada
      const freshData = await this.listUseCase.execute();
      this._receivables.set(freshData);
    } catch (err: unknown) {
      this._receivables.set(previous);
      this._error.set(errorMessage(err, 'Erro ao receber conta'));
      throw err;
    }
  }
}
