/**
 * outflow-stats.service.ts — TrimiCash
 * Serviço para cálculo de médias de saída.
 */

import { Movement } from '../entities/movement.entity';
import { subDays, startOfDay, endOfDay } from 'date-fns';
import { roundCurrency } from '../../../../core/utils/money.util';

export interface OutflowAverageResult {
  value: number;
  insufficient: boolean;
}

export class OutflowStatsService {
  /**
   * RN-008: Média diária de saídas = saídas dos últimos N dias / N.
   * Considera apenas saídas efetivadas.
   * @param windowDays - A janela de dias (padrão 30).
   */
  averageDailyOutflow(
    movements: Movement[],
    refDate: Date = new Date(),
    windowDays = 30
  ): OutflowAverageResult {
    const end = endOfDay(refDate);
    const start = startOfDay(subDays(refDate, windowDays - 1)); // -1 para fechar os dias corretamente incluindo hoje
    
    const outflowsInWindow = movements.filter((m) => {
      const mDate = m.date;
      return (
        m.type === 'SAIDA' &&
        mDate >= start &&
        mDate <= end
      );
    });

    if (outflowsInWindow.length < 3) {
      return { value: 0, insufficient: true };
    }

    const totalOutflow = outflowsInWindow.reduce((acc, m) => acc + m.amount, 0);
    const average = totalOutflow / windowDays;

    return {
      value: roundCurrency(average),
      insufficient: false,
    };
  }
}
