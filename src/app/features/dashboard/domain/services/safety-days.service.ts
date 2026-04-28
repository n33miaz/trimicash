/**
 * safety-days.service.ts — TrimiCash
 * Serviço responsável por calcular os dias de segurança (RN-008).
 */

export class SafetyDaysService {
  safetyDays(input: {
    currentBalance: number;
    averageDailyOutflow: number;
  }): { value: number; insufficient: boolean } {
    if (input.averageDailyOutflow <= 0) {
      return { value: 0, insufficient: true };
    }
    
    const value = Math.floor(input.currentBalance / input.averageDailyOutflow);
    return { 
      value: Math.max(0, value), 
      insufficient: false 
    };
  }
}
