/**
 * reserve-health.service.ts — TrimiCash
 * Serviço responsável por avaliar a saúde da reserva financeira (RN-007).
 */
import type { ReserveHealth } from '../../../../shared/types/reserve-health.type';

export class ReserveHealthService {
  reserveHealth(input: {
    currentBalance: number;
    recommendedReserve: number;
    attentionThresholdPct?: number;
  }): ReserveHealth {
    const threshold = input.attentionThresholdPct ?? 20;

    if (input.currentBalance < input.recommendedReserve) {
      return 'DEFICIT';
    }

    const attentionLimit = input.recommendedReserve * (1 + threshold / 100);
    
    // Se o saldo for exatamente 0 e a reserva também for 0, e a pessoa tem zero,
    // não seria DEFICIT, mas o limite daria 0. "pouca folga" para 0? É saudavel.
    if (input.currentBalance === 0 && input.recommendedReserve === 0) {
      return 'HEALTHY'; 
    }

    if (input.currentBalance <= attentionLimit) {
      return 'ATTENTION';
    }

    return 'HEALTHY';
  }
}
