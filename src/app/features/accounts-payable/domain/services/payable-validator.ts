/**
 * payable-validator.ts — TrimiCash
 * Validações de criação/edição para contas a pagar (RN-002, RN-003).
 */
import { DomainError } from '../errors/domain-error';
import { RecurrenceFrequency } from '../entities/payable-account.entity';

export interface PayableInput {
  description: string;
  amount: number;
  dueDate: Date;
  recurrence: RecurrenceFrequency;
}

export function validatePayableInput(input: PayableInput): void {
  if (!input.description || input.description.trim() === '') {
    throw new DomainError('PAYABLE_INVALID_DESCRIPTION', 'A descrição da conta não pode ser vazia.');
  }

  if (input.amount <= 0) {
    throw new DomainError('PAYABLE_INVALID_AMOUNT', 'O valor da conta deve ser maior que zero.');
  }

  if (!(input.dueDate instanceof Date) || isNaN(input.dueDate.getTime())) {
    throw new DomainError('PAYABLE_INVALID_DATE', 'A data de vencimento é inválida.');
  }

  const validRecurrences: RecurrenceFrequency[] = ['NONE', 'WEEKLY', 'MONTHLY', 'YEARLY'];
  if (!validRecurrences.includes(input.recurrence)) {
    throw new DomainError('PAYABLE_INVALID_RECURRENCE', 'A recorrência informada é inválida.');
  }
}
