import { Injectable, inject } from '@angular/core';
import { MOVEMENT_REPOSITORY, PAYABLE_REPOSITORY } from '../../../core/tokens/injection-tokens';
import { PayableAccount } from '../domain/entities/payable-account.entity';
import { PayPayableService } from '../domain/services/pay-payable.service';

@Injectable({
  providedIn: 'root'
})
export class PayPayableUseCase {
  private readonly payableRepo = inject(PAYABLE_REPOSITORY);
  private readonly movementRepo = inject(MOVEMENT_REPOSITORY);
  private readonly payService = new PayPayableService();

  async execute(id: string, paidAt: Date = new Date()): Promise<PayableAccount> {
    const payable = await this.payableRepo.getById(id);
    if (!payable) {
      throw new Error('Conta não encontrada');
    }

    const result = this.payService.pay(payable, paidAt);

    await this.movementRepo.create(result.generatedMovement);
    const updated = await this.payableRepo.update(id, {
      status: result.updatedPayable.status,
      paidAt: result.updatedPayable.paidAt
    });

    if (result.nextRecurrenceDraft) {
      await this.payableRepo.create(result.nextRecurrenceDraft);
    }

    return updated;
  }
}
