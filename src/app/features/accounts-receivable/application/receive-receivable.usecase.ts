/**
 * receive-receivable.usecase.ts — TrimiCash
 * Orquestra o recebimento de uma conta a receber:
 * 1. Busca a conta
 * 2. Executa serviço de domínio (gera movimento + draft recorrência)
 * 3. Persiste no repositório de receivables
 * 4. Cria movimentação de ENTRADA no CashFlow
 */
import { Injectable, inject } from '@angular/core';
import { RECEIVABLE_REPOSITORY, MOVEMENT_REPOSITORY } from '../../../core/tokens/injection-tokens';
import { ReceiveAccountService } from '../domain/services/receive-account.service';
import type { ReceivableAccount } from '../domain/entities/receivable-account.entity';

@Injectable({ providedIn: 'root' })
export class ReceiveReceivableUseCase {
  private readonly receivableRepo = inject(RECEIVABLE_REPOSITORY);
  private readonly movementRepo = inject(MOVEMENT_REPOSITORY);
  private readonly receiveService = new ReceiveAccountService();

  async execute(id: string, receivedAt?: Date): Promise<ReceivableAccount> {
    const receivable = await this.receivableRepo.getById(id);
    if (!receivable) {
      throw new Error(`ReceivableAccount com id ${id} não encontrada.`);
    }

    const { updatedReceivable, generatedMovement, nextRecurrenceDraft } =
      this.receiveService.receive(receivable, receivedAt ?? new Date());

    // Persiste o recebimento
    const savedReceivable = await this.receivableRepo.update(id, updatedReceivable);

    // Cria a movimentação de entrada no caixa
    await this.movementRepo.create(generatedMovement);

    // Gera próxima recorrência se aplicável
    if (nextRecurrenceDraft) {
      await this.receivableRepo.create({ ...nextRecurrenceDraft, status: 'PENDENTE' });
    }

    return savedReceivable;
  }
}
