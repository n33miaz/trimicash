/**
 * recommended-reserve.service.ts — TrimiCash
 * Serviço responsável por calcular a Reserva Recomendada (RN-006).
 */
import { isWithinPeriod } from '../../../../core/utils/date.util';
import type { Period } from '../../../../shared/types/period.type';
import type { PayableAccount } from '../../../accounts-payable/domain/entities/payable-account.entity';

export class RecommendedReserveService {
  recommendedReserve(input: {
    payables: PayableAccount[];
    period: Period;
    safetyMarginPct: number;
    ref: Date;
  }): number {
    const pendings = input.payables.filter(p => {
      if (p.status === 'PAGA' || p.status === 'CANCELADA') return false;
      return isWithinPeriod(p.dueDate, input.period);
    });

    const sumPayables = pendings.reduce((acc, p) => acc + p.amount, 0);
    const reserve = sumPayables * (1 + input.safetyMarginPct / 100);
    
    return Math.max(0, reserve);
  }
}
