/**
 * installment-generator.util.ts — TrimiCash
 * Utilitário compartilhado para geração de parcelas (Contas a Pagar e a Receber).
 * TypeScript puro — sem imports Angular.
 */

import { addMonths } from 'date-fns';
import type { RecurrenceFrequency } from '../../features/accounts-payable/domain/entities/payable-account.entity';

export interface InstallmentInput {
  description: string;
  totalAmount: number;
  totalInstallments: number;
  firstDueDate: Date;
  categoryId: string;
  recurrence: RecurrenceFrequency;
}

export interface InstallmentDraft {
  description: string;
  amount: number;
  dueDate: Date;
  categoryId: string;
  recurrence: RecurrenceFrequency;
  installmentGroupId: string;
  installmentNumber: number;
  totalInstallments: number;
}

/**
 * Gera N parcelas a partir de um input.
 * - amount base = floor(totalAmount / N), centavos sobram na última parcela
 * - dueDate: incremento mensal a partir de firstDueDate
 * - installmentGroupId: UUID compartilhado por todas as parcelas
 */
export function generateInstallments(input: InstallmentInput): InstallmentDraft[] {
  const { description, totalAmount, totalInstallments, firstDueDate, categoryId, recurrence } = input;

  if (totalInstallments < 2) {
    throw new Error('totalInstallments deve ser >= 2 para gerar parcelamento.');
  }

  const groupId = crypto.randomUUID();
  const baseAmount = Math.floor((totalAmount / totalInstallments) * 100) / 100;
  const lastAmount = Math.round((totalAmount - baseAmount * (totalInstallments - 1)) * 100) / 100;

  return Array.from({ length: totalInstallments }, (_, i) => {
    const isLast = i === totalInstallments - 1;
    return {
      description,
      amount: isLast ? lastAmount : baseAmount,
      dueDate: addMonths(firstDueDate, i),
      categoryId,
      recurrence,
      installmentGroupId: groupId,
      installmentNumber: i + 1,
      totalInstallments,
    };
  });
}
