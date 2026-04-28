/**
 * balance.service.ts — TrimiCash
 * Serviço de domínio para cálculos de saldo e somatórios de entradas/saídas.
 * TypeScript puro — sem imports Angular.
 */

import { Movement } from '../entities/movement.entity';
import { Period } from '../../../../shared/types/period.type';
import { isWithinPeriod } from '../../../../core/utils/date.util';
import { roundCurrency, sum } from '../../../../core/utils/money.util';

export class BalanceService {
  /**
   * RN-004: Saldo Atual = saldo inicial + soma das entradas efetivadas - soma das saídas efetivadas.
   */
  computeCurrentBalance(movements: Movement[], openingBalance = 0): number {
    const inflows = this.computeInflowTotal(movements);
    const outflows = this.computeOutflowTotal(movements);
    return roundCurrency(openingBalance + inflows - outflows);
  }

  /**
   * Soma as entradas, com filtro opcional por período.
   */
  computeInflowTotal(movements: Movement[], period?: Period): number {
    const validMovements = this.filterByPeriod(movements, period);
    const inflows = validMovements
      .filter((m) => m.type === 'ENTRADA')
      .map((m) => m.amount);
    return sum(inflows);
  }

  /**
   * Soma as saídas, com filtro opcional por período.
   */
  computeOutflowTotal(movements: Movement[], period?: Period): number {
    const validMovements = this.filterByPeriod(movements, period);
    const outflows = validMovements
      .filter((m) => m.type === 'SAIDA')
      .map((m) => m.amount);
    return sum(outflows);
  }

  private filterByPeriod(movements: Movement[], period?: Period): Movement[] {
    if (!period) return movements;
    return movements.filter((m) => isWithinPeriod(m.date, period));
  }
}
