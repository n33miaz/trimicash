import { Injectable, computed, inject, signal } from '@angular/core';
import { PayableAccount } from '../domain/entities/payable-account.entity';
import { PayableStatusService } from '../domain/services/payable-status.service';
import { CreatePayableUseCase } from './create-payable.usecase';
import { UpdatePayableUseCase } from './update-payable.usecase';
import { CancelPayableUseCase } from './cancel-payable.usecase';
import { ListPayablesUseCase } from './list-payables.usecase';
import { PayPayableUseCase } from './pay-payable.usecase';
import { Period } from '../../../shared/types/period.type';
import { generateInstallments } from '../../../core/utils/installment-generator.util';

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

@Injectable({
  providedIn: 'root'
})
export class AccountsPayableFacade {
  private createUseCase = inject(CreatePayableUseCase);
  private updateUseCase = inject(UpdatePayableUseCase);
  private cancelUseCase = inject(CancelPayableUseCase);
  private listUseCase = inject(ListPayablesUseCase);
  private payUseCase = inject(PayPayableUseCase);
  
  private statusService = new PayableStatusService();

  // State
  private _payables = signal<PayableAccount[]>([]);
  private _loading = signal<boolean>(false);
  private _error = signal<string | null>(null);

  // Public API
  readonly payables = computed(() => {
    // Avalia o status em tempo real ao expor
    return this._payables().map(p => ({ ...p, status: this.statusService.resolveStatus(p, new Date()) }));
  });
  
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  readonly pending = computed(() => this.payables().filter(p => p.status === 'PENDENTE'));
  readonly overdue = computed(() => this.payables().filter(p => p.status === 'ATRASADA'));
  readonly paid = computed(() => this.payables().filter(p => p.status === 'PAGA'));

  async load(period?: Period): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    try {
      const data = await this.listUseCase.execute(period);
      this._payables.set(data);
    } catch (err: unknown) {
      this._error.set(errorMessage(err, 'Erro ao carregar contas'));
    } finally {
      this._loading.set(false);
    }
  }

  async create(input: Omit<PayableAccount, 'id'>): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    try {
      if (input.recurrence === 'INSTALLMENT' && input.totalInstallments && input.totalInstallments > 1) {
        const drafts = generateInstallments({
          description: input.description,
          totalAmount: input.amount,
          totalInstallments: input.totalInstallments,
          firstDueDate: input.dueDate,
          categoryId: input.categoryId,
          recurrence: 'INSTALLMENT'
        });
        
        const createdPromises = drafts.map(draft => this.createUseCase.execute({
          ...draft,
          status: 'PENDENTE'
        } as Omit<PayableAccount, 'id'>));
        
        const created = await Promise.all(createdPromises);
        this._payables.update(p => [...p, ...created]);
      } else {
        const created = await this.createUseCase.execute(input);
        this._payables.update(p => [...p, created]);
      }
    } catch (err: unknown) {
      this._error.set(errorMessage(err, 'Erro ao criar conta'));
      throw err;
    } finally {
      this._loading.set(false);
    }
  }

  async update(id: string, patch: Partial<PayableAccount>): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    try {
      const updated = await this.updateUseCase.execute(id, patch);
      this._payables.update(list => list.map(item => item.id === id ? updated : item));
    } catch (err: unknown) {
      this._error.set(errorMessage(err, 'Erro ao atualizar conta'));
      throw err;
    } finally {
      this._loading.set(false);
    }
  }

  async cancel(id: string): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    try {
      await this.cancelUseCase.execute(id);
      this._payables.update(list => list.map(item => item.id === id ? { ...item, status: 'CANCELADA' } : item));
    } catch (err: unknown) {
      this._error.set(errorMessage(err, 'Erro ao cancelar conta'));
      throw err;
    } finally {
      this._loading.set(false);
    }
  }

  async pay(id: string, paidAt?: Date): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    try {
      const updated = await this.payUseCase.execute(id, paidAt);
      // O payUseCase pode ter gerado novas ocorrências, então o ideal é recarregar
      // Mas para simplificar na UI, podemos atualizar local e confiar que load() será chamado depois
      this._payables.update(list => list.map(item => item.id === id ? updated : item));
      // Idealmente, poderíamos fazer um `await this.load()` aqui para pegar a nova recorrência
      await this.load();
    } catch (err: unknown) {
      this._error.set(errorMessage(err, 'Erro ao pagar conta'));
      throw err;
    } finally {
      this._loading.set(false);
    }
  }
}
