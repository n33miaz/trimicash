import { describe, it, expect } from 'vitest';
import { ProjectedBalanceService } from '../../../src/app/features/dashboard/domain/services/projected-balance.service';
import type { PayableAccount } from '../../../src/app/features/accounts-payable/domain/entities/payable-account.entity';
import type { Period } from '../../../src/app/shared/types/period.type';
import { addDays, subDays, startOfDay } from 'date-fns';

describe('ProjectedBalanceService', () => {
  const service = new ProjectedBalanceService();
  const ref = new Date('2026-04-28T12:00:00Z');
  
  const period: Period = {
    key: 'NEXT_7',
    start: startOfDay(subDays(ref, 1)),
    end: startOfDay(addDays(ref, 7))
  };

  it('deve subtrair contas pendentes ou atrasadas dentro do periodo', () => {
    const payables: Partial<PayableAccount>[] = [
      { amount: 100, status: 'PENDENTE', dueDate: addDays(ref, 2) },
      { amount: 50, status: 'ATRASADA', dueDate: subDays(ref, 1) },
      { amount: 200, status: 'PAGA', dueDate: addDays(ref, 1) }, // Ignorado
      { amount: 300, status: 'PENDENTE', dueDate: addDays(ref, 10) } // Fora do periodo
    ];

    const result = service.projectedBalance({
      currentBalance: 1000,
      payables: payables as PayableAccount[],
      period,
      ref
    });

    expect(result).toBe(850); // 1000 - 150
  });

  it('deve retornar o mesmo saldo se não houver contas no periodo', () => {
    const result = service.projectedBalance({
      currentBalance: 500,
      payables: [],
      period,
      ref
    });

    expect(result).toBe(500);
  });

  it('pode retornar saldo negativo se as dividas excederem o saldo', () => {
    const result = service.projectedBalance({
      currentBalance: 100,
      payables: [{ amount: 150, status: 'PENDENTE', dueDate: ref } as PayableAccount],
      period,
      ref
    });

    expect(result).toBe(-50);
  });
});
