import { describe, it, expect } from 'vitest';
import { RecommendedReserveService } from '../../../src/app/features/dashboard/domain/services/recommended-reserve.service';
import type { PayableAccount } from '../../../src/app/features/accounts-payable/domain/entities/payable-account.entity';
import type { Period } from '../../../src/app/shared/types/period.type';
import { addDays, startOfDay } from 'date-fns';

describe('RecommendedReserveService', () => {
  const service = new RecommendedReserveService();
  const ref = new Date('2026-04-28T12:00:00Z');
  
  const period: Period = {
    key: 'NEXT_30',
    start: startOfDay(ref),
    end: startOfDay(addDays(ref, 30))
  };

  it('deve calcular a reserva baseada nas contas pendentes do periodo + margem de seguranca', () => {
    const payables: Partial<PayableAccount>[] = [
      { amount: 1000, status: 'PENDENTE', dueDate: addDays(ref, 5) },
      { amount: 500, status: 'PENDENTE', dueDate: addDays(ref, 10) }
    ];

    const result = service.recommendedReserve({
      payables: payables as PayableAccount[],
      period,
      safetyMarginPct: 10,
      ref
    });

    // Total: 1500. Margem 10%: 150. Reserva: 1650.
    expect(result).toBeCloseTo(1650, 2);
  });

  it('deve retornar zero se não houver contas', () => {
    const result = service.recommendedReserve({
      payables: [],
      period,
      safetyMarginPct: 10,
      ref
    });

    expect(result).toBe(0);
  });
});
