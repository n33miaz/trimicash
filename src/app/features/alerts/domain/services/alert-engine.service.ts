/**
 * alert-engine.service.ts — TrimiCash
 * Serviço responsável por gerar alertas (RN-009) baseado no estado financeiro.
 */
import type { PayableAccount } from '../../../accounts-payable/domain/entities/payable-account.entity';
import type { AppAlert } from '../../../shared/types/alert.type';
import { daysBetween, isOverdue } from '../../../../core/utils/date.util';

export class AlertEngineService {
  buildAlerts(input: {
    payables: PayableAccount[];
    currentBalance: number;
    projectedBalance: number;
    recommendedReserve: number;
    safetyDays: { value: number; insufficient: boolean };
    minSafetyDays: number;
    ref: Date;
  }): AppAlert[] {
    const alerts: AppAlert[] = [];

    // 1. Alertas de contas
    for (const p of input.payables) {
      if (p.status === 'PAGA' || p.status === 'CANCELADA') continue;

      if (isOverdue(p.dueDate, input.ref)) {
        alerts.push({
          id: `ALR-ATRASO-${p.id}`,
          code: 'ALR-ATRASO',
          severity: 'CRITICAL',
          title: 'Conta Atrasada',
          message: `A conta "${p.description}" está atrasada.`,
          createdAt: input.ref,
          relatedId: p.id
        });
        continue;
      }

      const days = daysBetween(input.ref, p.dueDate);
      if (days >= 0 && days <= 2) {
        alerts.push({
          id: `ALR-VENC-2D-${p.id}`,
          code: 'ALR-VENC-2D',
          severity: 'CRITICAL',
          title: 'Vencimento Próximo',
          message: `A conta "${p.description}" vence em ${days} dia(s).`,
          createdAt: input.ref,
          relatedId: p.id
        });
      } else if (days > 2 && days <= 7) {
        alerts.push({
          id: `ALR-VENC-7D-${p.id}`,
          code: 'ALR-VENC-7D',
          severity: 'WARNING',
          title: 'Aviso de Vencimento',
          message: `A conta "${p.description}" vence em ${days} dia(s).`,
          createdAt: input.ref,
          relatedId: p.id
        });
      }
    }

    // 2. Alertas de caixa globais
    if (input.currentBalance < input.recommendedReserve) {
      alerts.push({
        id: `ALR-DEFICIT-GLOBAL`,
        code: 'ALR-DEFICIT',
        severity: 'CRITICAL',
        title: 'Déficit na Reserva',
        message: 'Seu saldo atual está abaixo da reserva recomendada.',
        createdAt: input.ref
      });
    }

    if (input.projectedBalance < 0) {
      alerts.push({
        id: `ALR-PROJEC-NEG-GLOBAL`,
        code: 'ALR-PROJEC-NEG',
        severity: 'CRITICAL',
        title: 'Saldo Projetado Negativo',
        message: 'As contas previstas deixarão o caixa negativo.',
        createdAt: input.ref
      });
    }

    if (!input.safetyDays.insufficient && input.safetyDays.value < input.minSafetyDays) {
      alerts.push({
        id: `ALR-CAIXA-CRIT-GLOBAL`,
        code: 'ALR-CAIXA-CRIT',
        severity: 'CRITICAL',
        title: 'Caixa Crítico',
        message: `Dias de segurança (${input.safetyDays.value}) estão abaixo do limite mínimo de ${input.minSafetyDays}.`,
        createdAt: input.ref
      });
    }

    // Ordenação determinística: CRITICAL primeiro, depois WARNING, depois INFO.
    // Desempate por ID alfabético para garantir saída exata 100% das vezes.
    return alerts.sort((a, b) => {
      const sevMap = { 'CRITICAL': 1, 'WARNING': 2, 'INFO': 3 };
      const sevA = sevMap[a.severity];
      const sevB = sevMap[b.severity];
      
      if (sevA !== sevB) {
        return sevA - sevB;
      }
      
      return a.id.localeCompare(b.id);
    });
  }
}
