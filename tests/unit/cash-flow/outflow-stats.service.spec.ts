import { describe, it, expect } from 'vitest';
import { OutflowStatsService } from '../../../src/app/features/cash-flow/domain/services/outflow-stats.service';
import { Movement } from '../../../src/app/features/cash-flow/domain/entities/movement.entity';
import { subDays } from 'date-fns';

describe('OutflowStatsService', () => {
  const service = new OutflowStatsService();

  it('deve reportar insuficiente se houver menos de 3 saídas na janela', () => {
    const today = new Date();
    const movements: Movement[] = [
      { id: '1', type: 'SAIDA', amount: 100, date: subDays(today, 5), categoryId: 'c', description: 'd' },
      { id: '2', type: 'SAIDA', amount: 200, date: subDays(today, 10), categoryId: 'c', description: 'd' }
    ];
    
    const result = service.averageDailyOutflow(movements, today, 30);
    expect(result.insufficient).toBe(true);
    expect(result.value).toBe(0);
  });

  it('deve calcular a média diária se houver 3 ou mais saídas', () => {
    const today = new Date();
    const movements: Movement[] = [
      { id: '1', type: 'SAIDA', amount: 100, date: subDays(today, 5), categoryId: 'c', description: 'd' },
      { id: '2', type: 'SAIDA', amount: 200, date: subDays(today, 10), categoryId: 'c', description: 'd' },
      { id: '3', type: 'SAIDA', amount: 300, date: subDays(today, 15), categoryId: 'c', description: 'd' }
    ];
    
    const result = service.averageDailyOutflow(movements, today, 30);
    expect(result.insufficient).toBe(false);
    // (100 + 200 + 300) / 30 = 600 / 30 = 20
    expect(result.value).toBe(20);
  });
});
