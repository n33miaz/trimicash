/**
 * payable-status.service.ts — TrimiCash
 * Serviço para resolução de status de contas a pagar (RN-002.3).
 */
import { differenceInCalendarDays, startOfDay } from 'date-fns';
import { PayableAccount, PayableStatus } from '../entities/payable-account.entity';

export class PayableStatusService {
  /** Reavalia o status considerando a data de referência. */
  resolveStatus(p: PayableAccount, ref: Date): PayableStatus {
    if (p.status === 'PAGA' || p.status === 'CANCELADA') {
      return p.status;
    }
    return this.isOverdue(p, ref) ? 'ATRASADA' : 'PENDENTE';
  }

  /**
   * Retorna verdadeiro se a conta está atrasada (vencimento anterior à data de referência).
   * Considera o início do dia para evitar falsos positivos com horas.
   */
  isOverdue(p: PayableAccount, ref: Date): boolean {
    if (p.status === 'PAGA' || p.status === 'CANCELADA') return false;
    return differenceInCalendarDays(startOfDay(ref), startOfDay(p.dueDate)) > 0;
  }

  /**
   * Retorna os dias restantes até o vencimento.
   * Se for negativo, a conta está atrasada.
   */
  daysToDue(p: PayableAccount, ref: Date): number {
    return differenceInCalendarDays(startOfDay(p.dueDate), startOfDay(ref));
  }
}
