import { describe, it, expect } from 'vitest';
import { SafetyDaysService } from '../../../src/app/features/dashboard/domain/services/safety-days.service';

describe('SafetyDaysService', () => {
  const service = new SafetyDaysService();

  it('deve retornar insuficiente e valor 0 se media diaria for <= 0', () => {
    const result = service.safetyDays({
      currentBalance: 1000,
      averageDailyOutflow: 0
    });
    
    expect(result).toEqual({ value: 0, insufficient: true });
  });

  it('deve calcular corretamente os dias de seguranca truncados para baixo', () => {
    const result = service.safetyDays({
      currentBalance: 1050,
      averageDailyOutflow: 100
    });
    
    expect(result).toEqual({ value: 10, insufficient: false });
  });

  it('nao deve retornar valor negativo para dias de seguranca', () => {
    const result = service.safetyDays({
      currentBalance: -500,
      averageDailyOutflow: 100
    });
    
    expect(result).toEqual({ value: 0, insufficient: false });
  });
});
