/**
 * receive-account.service.ts — TrimiCash
 * Serviço de domínio para receber uma conta a receber.
 * Análogo ao PayPayableService — gera Movement de ENTRADA.
 */

import { addWeeks, addMonths, addYears } from 'date-fns';
import type { ReceivableAccount } from '../entities/receivable-account.entity';
import type { Movement } from '../../../cash-flow/domain/entities/movement.entity';
import { DomainError } from '../../../accounts-payable/domain/errors/domain-error';

export interface ReceiveResult {
  updatedReceivable: ReceivableAccount;
  generatedMovement: Omit<Movement, 'id'>;
  nextRecurrenceDraft?: Omit<ReceivableAccount, 'id' | 'status'>;
}

export class ReceiveAccountService {
  receive(receivable: ReceivableAccount, receivedAt: Date): ReceiveResult {
    if (receivable.status === 'CANCELADA') {
      throw new DomainError('RECEIVABLE_CANCELLED', 'Não é possível receber uma conta cancelada.');
    }
    if (receivable.status === 'RECEBIDA') {
      throw new DomainError('RECEIVABLE_ALREADY_RECEIVED', 'A conta já foi recebida.');
    }

    const updatedReceivable: ReceivableAccount = {
      ...receivable,
      status: 'RECEBIDA',
      receivedAt,
    };

    const generatedMovement: Omit<Movement, 'id'> = {
      type: 'ENTRADA',
      amount: receivable.amount,
      date: receivedAt,
      categoryId: receivable.categoryId,
      description: `Recebimento: ${receivable.description}`,
    };

    let nextRecurrenceDraft: Omit<ReceivableAccount, 'id' | 'status'> | undefined;

    if (receivable.recurrence !== 'NONE') {
      let nextDueDate = receivable.dueDate;

      switch (receivable.recurrence) {
        case 'WEEKLY':  nextDueDate = addWeeks(receivable.dueDate, 1);  break;
        case 'MONTHLY': nextDueDate = addMonths(receivable.dueDate, 1); break;
        case 'YEARLY':  nextDueDate = addYears(receivable.dueDate, 1);  break;
      }

      nextRecurrenceDraft = {
        description: receivable.description,
        amount: receivable.amount,
        dueDate: nextDueDate,
        categoryId: receivable.categoryId,
        recurrence: receivable.recurrence,
        recurrenceGroupId: receivable.recurrenceGroupId,
      };
    }

    return { updatedReceivable, generatedMovement, nextRecurrenceDraft };
  }
}
