import { describe, it, expect } from 'vitest';
import { ReserveHealthService } from '../../../src/app/features/dashboard/domain/services/reserve-health.service';

describe('ReserveHealthService', () => {
  const service = new ReserveHealthService();

  it('deve retornar DEFICIT se saldo < reserva', () => {
    expect(service.reserveHealth({
      currentBalance: 900,
      recommendedReserve: 1000
    })).toBe('DEFICIT');
  });

  it('deve retornar ATTENTION se saldo cobre a reserva mas esta abaixo ou no limite de atencao', () => {
    // default threshold: 20%. Limite para 1000 = 1200
    expect(service.reserveHealth({
      currentBalance: 1100,
      recommendedReserve: 1000
    })).toBe('ATTENTION');

    expect(service.reserveHealth({
      currentBalance: 1200, // No limite exato
      recommendedReserve: 1000
    })).toBe('ATTENTION');
  });

  it('deve retornar HEALTHY se saldo for bem maior que a reserva', () => {
    expect(service.reserveHealth({
      currentBalance: 1500,
      recommendedReserve: 1000
    })).toBe('HEALTHY');
  });

  it('deve retornar HEALTHY para zerados', () => {
    expect(service.reserveHealth({
      currentBalance: 0,
      recommendedReserve: 0
    })).toBe('HEALTHY');
  });
});
