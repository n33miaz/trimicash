import { describe, it, expect } from 'vitest';
import { BalanceService } from '../../../src/app/features/cash-flow/domain/services/balance.service';
import { Movement } from '../../../src/app/features/cash-flow/domain/entities/movement.entity';

describe('BalanceService', () => {
  const service = new BalanceService();

  it('deve retornar o saldo inicial quando a lista de movimentações for vazia', () => {
    expect(service.computeCurrentBalance([], 100)).toBe(100);
    expect(service.computeCurrentBalance([])).toBe(0);
  });

  it('deve somar corretamente entradas e saídas', () => {
    const movements: Movement[] = [
      { id: '1', type: 'ENTRADA', amount: 150, date: new Date(), categoryId: 'c1', description: 'Venda' },
      { id: '2', type: 'SAIDA', amount: 50, date: new Date(), categoryId: 'c2', description: 'Material' },
      { id: '3', type: 'ENTRADA', amount: 200, date: new Date(), categoryId: 'c1', description: 'Serviço' }
    ];
    // opening: 0 + 150 - 50 + 200 = 300
    expect(service.computeCurrentBalance(movements)).toBe(300);
    expect(service.computeInflowTotal(movements)).toBe(350);
    expect(service.computeOutflowTotal(movements)).toBe(50);
  });

  it('deve lidar corretamente com problemas de arredondamento', () => {
    const movements: Movement[] = [
      { id: '1', type: 'ENTRADA', amount: 0.1, date: new Date(), categoryId: 'c1', description: 'A' },
      { id: '2', type: 'ENTRADA', amount: 0.2, date: new Date(), categoryId: 'c1', description: 'B' }
    ];
    // 0.1 + 0.2 na matemática JS clássica pode ser 0.30000000000000004
    expect(service.computeCurrentBalance(movements)).toBe(0.3);
  });
});
