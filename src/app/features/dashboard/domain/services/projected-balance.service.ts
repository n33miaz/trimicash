/**
 * projected-balance.service.ts — TrimiCash
 * Serviço responsável por calcular o Saldo Projetado (RN-005).
 */
import { isWithinPeriod } from '../../../../core/utils/date.util';
import type { Period } from '../../../../shared/types/period.type';
import type { PayableAccount } from '../../../accounts-payable/domain/entities/payable-account.entity';
import type { ReceivableAccount } from '../../../accounts-receivable/domain/entities/receivable-account.entity';

export class ProjectedBalanceService {
  projectedBalance(input: {
    currentBalance: number;
    payables: PayableAccount[];
    receivables?: ReceivableAccount[];
    period: Period;
    ref: Date;
  }): number {
    const pendingPayables = input.payables.filter(p => {
      if (p.status === 'PAGA' || p.status === 'CANCELADA') return false;
      return isWithinPeriod(p.dueDate, input.period);
    });

    const pendingReceivables = (input.receivables || []).filter(r => {
      if (r.status === 'RECEBIDA' || r.status === 'CANCELADA') return false;
      return isWithinPeriod(r.dueDate, input.period);
    });

    const sumPayables = pendingPayables.reduce((acc, p) => acc + p.amount, 0);
    const sumReceivables = pendingReceivables.reduce((acc, r) => acc + r.amount, 0);

    return input.currentBalance + sumReceivables - sumPayables;
  }
}
