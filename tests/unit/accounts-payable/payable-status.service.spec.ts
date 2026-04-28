import { describe, it, expect, beforeEach } from 'vitest';
import { PayableStatusService } from '../../../src/app/features/accounts-payable/domain/services/payable-status.service';
import { PayableAccount } from '../../../src/app/features/accounts-payable/domain/entities/payable-account.entity';
import { addDays, subDays } from 'date-fns';

describe('PayableStatusService', () => {
  let service: PayableStatusService;
  let baseAccount: PayableAccount;
  const refDate = new Date('2026-04-28T12:00:00Z');

  beforeEach(() => {
    service = new PayableStatusService();
    baseAccount = {
      id: '1',
      description: 'Teste',
      amount: 100,
      dueDate: new Date('2026-04-28T10:00:00Z'),
      categoryId: 'cat-1',
      status: 'PENDENTE',
      recurrence: 'NONE'
    };
  });

  it('deve manter PAGA inalterada', () => {
    baseAccount.status = 'PAGA';
    baseAccount.dueDate = subDays(refDate, 10);
    expect(service.resolveStatus(baseAccount, refDate)).toBe('PAGA');
    expect(service.isOverdue(baseAccount, refDate)).toBe(false);
  });

  it('deve manter CANCELADA inalterada', () => {
    baseAccount.status = 'CANCELADA';
    baseAccount.dueDate = subDays(refDate, 10);
    expect(service.resolveStatus(baseAccount, refDate)).toBe('CANCELADA');
    expect(service.isOverdue(baseAccount, refDate)).toBe(false);
  });

  it('deve retornar PENDENTE se a data for igual ou posterior a referência', () => {
    baseAccount.status = 'PENDENTE';
    
    // Mesma data
    baseAccount.dueDate = new Date(refDate);
    expect(service.resolveStatus(baseAccount, refDate)).toBe('PENDENTE');
    expect(service.isOverdue(baseAccount, refDate)).toBe(false);

    // Data futura
    baseAccount.dueDate = addDays(refDate, 1);
    expect(service.resolveStatus(baseAccount, refDate)).toBe('PENDENTE');
    expect(service.isOverdue(baseAccount, refDate)).toBe(false);
  });

  it('deve retornar ATRASADA se a data de vencimento for anterior à referência', () => {
    baseAccount.status = 'PENDENTE';
    baseAccount.dueDate = subDays(refDate, 1);
    
    expect(service.resolveStatus(baseAccount, refDate)).toBe('ATRASADA');
    expect(service.isOverdue(baseAccount, refDate)).toBe(true);
  });

  it('deve retornar a quantidade correta de dias até o vencimento', () => {
    baseAccount.dueDate = addDays(refDate, 5);
    expect(service.daysToDue(baseAccount, refDate)).toBe(5);

    baseAccount.dueDate = subDays(refDate, 3);
    expect(service.daysToDue(baseAccount, refDate)).toBe(-3);
  });
});
