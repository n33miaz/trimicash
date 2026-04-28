import { describe, it, expect } from 'vitest';
import { AlertEngineService } from '../../../src/app/features/alerts/domain/services/alert-engine.service';
import type { PayableAccount } from '../../../src/app/features/accounts-payable/domain/entities/payable-account.entity';
import { addDays, subDays } from 'date-fns';

describe('AlertEngineService', () => {
  const service = new AlertEngineService();
  const ref = new Date('2026-04-28T12:00:00Z');

  it('deve retornar vazio se a situacao for saudavel', () => {
    const payables: Partial<PayableAccount>[] = [
      { id: '1', description: 'Paga', status: 'PAGA', dueDate: subDays(ref, 1) },
      { id: '2', description: 'Distante', status: 'PENDENTE', dueDate: addDays(ref, 10) }
    ];

    const alerts = service.buildAlerts({
      payables: payables as PayableAccount[],
      currentBalance: 5000,
      projectedBalance: 4000,
      recommendedReserve: 1000,
      safetyDays: { value: 30, insufficient: false },
      minSafetyDays: 15,
      ref
    });

    expect(alerts.length).toBe(0);
  });

  it('deve disparar todos os alertas criticos num cenario de risco total', () => {
    const payables: Partial<PayableAccount>[] = [
      { id: '1', description: 'Atrasada', status: 'PENDENTE', dueDate: subDays(ref, 2) },
      { id: '2', description: 'Vence Hoje', status: 'PENDENTE', dueDate: ref },
      { id: '3', description: 'Vence Semana Que Vem', status: 'PENDENTE', dueDate: addDays(ref, 5) }
    ];

    const alerts = service.buildAlerts({
      payables: payables as PayableAccount[],
      currentBalance: 500, // Menor que a reserva
      projectedBalance: -100, // Negativo
      recommendedReserve: 1000,
      safetyDays: { value: 2, insufficient: false }, // Menor que minSafetyDays (5)
      minSafetyDays: 5,
      ref
    });

    // 1 de atraso (CRITICAL), 1 de 2 dias (CRITICAL), 1 de 7 dias (WARNING)
    // 1 deficit (CRITICAL), 1 projetado negativo (CRITICAL), 1 caixa critico (CRITICAL)
    // Total = 6 alertas
    expect(alerts.length).toBe(6);

    const criticals = alerts.filter(a => a.severity === 'CRITICAL');
    const warnings = alerts.filter(a => a.severity === 'WARNING');

    expect(criticals.length).toBe(5);
    expect(warnings.length).toBe(1);

    // Deve estar ordenado (CRITICAL primeiro)
    expect(alerts[0].severity).toBe('CRITICAL');
    expect(alerts[alerts.length - 1].severity).toBe('WARNING');
    expect(alerts[alerts.length - 1].code).toBe('ALR-VENC-7D');
  });

  it('deve ser deterministico retornando a mesma lista exatamente na mesma ordem', () => {
    const payables: Partial<PayableAccount>[] = [
      { id: 'B', description: 'Vence Amanha', status: 'PENDENTE', dueDate: addDays(ref, 1) },
      { id: 'A', description: 'Atrasada', status: 'PENDENTE', dueDate: subDays(ref, 1) },
    ];

    const input = {
      payables: payables as PayableAccount[],
      currentBalance: 500,
      projectedBalance: -100,
      recommendedReserve: 1000,
      safetyDays: { value: 2, insufficient: false },
      minSafetyDays: 5,
      ref
    };

    const firstRun = service.buildAlerts(input);
    const secondRun = service.buildAlerts(input);

    expect(firstRun).toEqual(secondRun);
  });
});
