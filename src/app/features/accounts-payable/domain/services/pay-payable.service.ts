/**
 * pay-payable.service.ts — TrimiCash
 * Serviço responsável por efetuar o pagamento de uma conta (RN-002.4 e RN-003.4).
 */
import { addWeeks, addMonths, addYears } from 'date-fns';
import { PayableAccount } from '../entities/payable-account.entity';
import type { Movement } from '../../../cash-flow/domain/entities/movement.entity';
import { DomainError } from '../errors/domain-error';

export interface PaymentResult {
  updatedPayable: PayableAccount;
  generatedMovement: Omit<Movement, 'id'>;
  nextRecurrenceDraft?: Omit<PayableAccount, 'id' | 'status'>;
}

export class PayPayableService {
  pay(payable: PayableAccount, paidAt: Date): PaymentResult {
    if (payable.status === 'CANCELADA') {
      throw new DomainError('PAYABLE_CANCELLED', 'Não é possível pagar uma conta cancelada.');
    }
    if (payable.status === 'PAGA') {
      throw new DomainError('PAYABLE_ALREADY_PAID', 'A conta já está paga.');
    }

    const updatedPayable: PayableAccount = {
      ...payable,
      status: 'PAGA',
      paidAt
    };

    const generatedMovement: Omit<Movement, 'id'> = {
      type: 'SAIDA',
      amount: payable.amount,
      date: paidAt,
      categoryId: payable.categoryId,
      description: `Pagamento: ${payable.description}`,
      sourcePayableId: payable.id
    };

    let nextRecurrenceDraft: Omit<PayableAccount, 'id' | 'status'> | undefined;

    if (payable.recurrence !== 'NONE') {
      let nextDueDate = payable.dueDate;
      
      switch (payable.recurrence) {
        case 'WEEKLY':
          nextDueDate = addWeeks(payable.dueDate, 1);
          break;
        case 'MONTHLY':
          nextDueDate = addMonths(payable.dueDate, 1);
          break;
        case 'YEARLY':
          nextDueDate = addYears(payable.dueDate, 1);
          break;
      }

      nextRecurrenceDraft = {
        description: payable.description,
        amount: payable.amount,
        dueDate: nextDueDate,
        categoryId: payable.categoryId,
        recurrence: payable.recurrence,
        recurrenceGroupId: payable.recurrenceGroupId
      };
    }

    return {
      updatedPayable,
      generatedMovement,
      nextRecurrenceDraft
    };
  }
}
