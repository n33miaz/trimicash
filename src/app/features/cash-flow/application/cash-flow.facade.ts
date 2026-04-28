import { Injectable, computed, inject, signal } from '@angular/core';
import { Movement } from '../domain/entities/movement.entity';
import { BalanceService } from '../domain/services/balance.service';
import { CreateMovementUseCase } from './create-movement.usecase';
import { DeleteMovementUseCase } from './delete-movement.usecase';
import { ListMovementsUseCase } from './list-movements.usecase';
import { UpdateMovementUseCase } from './update-movement.usecase';
import { Period } from '../../../shared/types/period.type';

@Injectable({
  providedIn: 'root'
})
export class CashFlowFacade {
  private createUseCase = inject(CreateMovementUseCase);
  private deleteUseCase = inject(DeleteMovementUseCase);
  private listUseCase = inject(ListMovementsUseCase);
  private updateUseCase = inject(UpdateMovementUseCase);
  
  private balanceService = new BalanceService();

  // State
  private _movements = signal<Movement[]>([]);
  private _loading = signal<boolean>(false);
  private _error = signal<string | null>(null);

  // Public API
  readonly movements = this._movements.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  readonly currentBalance = computed(() => {
    return this.balanceService.computeCurrentBalance(this._movements());
  });

  async load(period?: Period): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    try {
      const data = await this.listUseCase.execute(period);
      this._movements.set(data);
    } catch (err: any) {
      this._error.set(err.message || 'Erro ao carregar movimentações');
    } finally {
      this._loading.set(false);
    }
  }

  async create(input: Omit<Movement, 'id'>): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    try {
      const created = await this.createUseCase.execute(input);
      this._movements.update(m => [...m, created]);
    } catch (err: any) {
      this._error.set(err.message || 'Erro ao criar movimentação');
      throw err;
    } finally {
      this._loading.set(false);
    }
  }

  async update(id: string, patch: Partial<Movement>): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    try {
      const updated = await this.updateUseCase.execute(id, patch);
      this._movements.update(m => m.map(item => item.id === id ? updated : item));
    } catch (err: any) {
      this._error.set(err.message || 'Erro ao atualizar movimentação');
      throw err;
    } finally {
      this._loading.set(false);
    }
  }

  async remove(id: string): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    try {
      await this.deleteUseCase.execute(id);
      this._movements.update(m => m.filter(item => item.id !== id));
    } catch (err: any) {
      this._error.set(err.message || 'Erro ao remover movimentação');
      throw err;
    } finally {
      this._loading.set(false);
    }
  }
}
