import { describe, it, expect, beforeEach } from 'vitest';
import { PayPayableService } from '../../../src/app/features/accounts-payable/domain/services/pay-payable.service';
import { PayableAccount } from '../../../src/app/features/accounts-payable/domain/entities/payable-account.entity';
import { DomainError } from '../../../src/app/features/accounts-payable/domain/errors/domain-error';
import { addWeeks, addMonths, addYears } from 'date-fns';

describe('PayPayableService', () => {
  let service: PayPayableService;
  let baseAccount: PayableAccount;
  const paidAt = new Date('2026-04-28T12:00:00Z');

  beforeEach(() => {
    service = new PayPayableService();
    baseAccount = {
      id: 'acc-1',
      description: 'Internet',
      amount: 150,
      dueDate: new Date('2026-04-28T10:00:00Z'),
      categoryId: 'cat-1',
      status: 'PENDENTE',
      recurrence: 'NONE'
    };
  });

  it('deve pagar a conta corretamente e gerar a movimentação', () => {
    const result = service.pay(baseAccount, paidAt);

    expect(result.updatedPayable.status).toBe('PAGA');
    expect(result.updatedPayable.paidAt).toEqual(paidAt);

    expect(result.generatedMovement.type).toBe('SAIDA');
    expect(result.generatedMovement.amount).toBe(150);
    expect(result.generatedMovement.date).toEqual(paidAt);
    expect(result.generatedMovement.categoryId).toBe('cat-1');
    expect(result.generatedMovement.sourcePayableId).toBe('acc-1');
    expect(result.generatedMovement.description).toContain('Internet');

    expect(result.nextRecurrenceDraft).toBeUndefined();
  });

  it('não deve permitir pagar conta cancelada', () => {
    baseAccount.status = 'CANCELADA';
    expect(() => service.pay(baseAccount, paidAt)).toThrowError(DomainError);
  });

  it('não deve permitir pagar conta já paga', () => {
    baseAccount.status = 'PAGA';
    expect(() => service.pay(baseAccount, paidAt)).toThrowError(DomainError);
  });

  it('deve gerar rascunho de recorrência semanal', () => {
    baseAccount.recurrence = 'WEEKLY';
    baseAccount.recurrenceGroupId = 'group-1';
    
    const result = service.pay(baseAccount, paidAt);
    
    expect(result.nextRecurrenceDraft).toBeDefined();
    expect(result.nextRecurrenceDraft?.recurrence).toBe('WEEKLY');
    expect(result.nextRecurrenceDraft?.recurrenceGroupId).toBe('group-1');
    expect(result.nextRecurrenceDraft?.dueDate).toEqual(addWeeks(baseAccount.dueDate, 1));
  });

  it('deve gerar rascunho de recorrência mensal', () => {
    baseAccount.recurrence = 'MONTHLY';
    baseAccount.recurrenceGroupId = 'group-2';
    
    const result = service.pay(baseAccount, paidAt);
    
    expect(result.nextRecurrenceDraft?.recurrence).toBe('MONTHLY');
    expect(result.nextRecurrenceDraft?.dueDate).toEqual(addMonths(baseAccount.dueDate, 1));
  });

  it('deve gerar rascunho de recorrência anual', () => {
    baseAccount.recurrence = 'YEARLY';
    baseAccount.recurrenceGroupId = 'group-3';
    
    const result = service.pay(baseAccount, paidAt);
    
    expect(result.nextRecurrenceDraft?.recurrence).toBe('YEARLY');
    expect(result.nextRecurrenceDraft?.dueDate).toEqual(addYears(baseAccount.dueDate, 1));
  });
});
