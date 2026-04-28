/**
 * projected-balance.service.ts — TrimiCash
 * Serviço responsável por calcular o Saldo Projetado (RN-005).
 */
import { isWithinPeriod } from '../../../../core/utils/date.util';
import type { Period } from '../../../../shared/types/period.type';
import type { PayableAccount } from '../../../accounts-payable/domain/entities/payable-account.entity';

export class ProjectedBalanceService {
  projectedBalance(input: {
    currentBalance: number;
    payables: PayableAccount[];
    period: Period;
    ref: Date;
  }): number {
    const pendings = input.payables.filter(p => {
      if (p.status === 'PAGA' || p.status === 'CANCELADA') return false;
      return isWithinPeriod(p.dueDate, input.period);
    });

    const sumPayables = pendings.reduce((acc, p) => acc + p.amount, 0);
    return input.currentBalance - sumPayables;
  }
}
