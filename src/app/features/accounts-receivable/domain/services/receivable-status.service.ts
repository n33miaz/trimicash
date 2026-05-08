/**
 * receivable-status.service.ts — TrimiCash
 * Serviço puro de resolução de status em tempo real.
 * PENDENTE com dueDate < hoje → ATRASADA (lógica idêntica ao PayableStatusService).
 */

import type { ReceivableAccount, ReceivableStatus } from '../entities/receivable-account.entity';

export class ReceivableStatusService {
  /**
   * Retorna o status "real" da conta considerando a data atual.
   * Não muta o objeto original — retorna o status calculado.
   */
  resolveStatus(account: ReceivableAccount, now: Date): ReceivableStatus {
    if (account.status !== 'PENDENTE') {
      return account.status;
    }
    const due = new Date(account.dueDate);
    due.setHours(0, 0, 0, 0);
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    return due < today ? 'ATRASADA' : 'PENDENTE';
  }
}
