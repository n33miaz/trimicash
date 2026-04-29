import { Injectable, computed, inject, signal } from '@angular/core';
import { CashFlowFacade } from '../../cash-flow/application/cash-flow.facade';
import { AccountsPayableFacade } from '../../accounts-payable/application/accounts-payable.facade';
import { ProjectedBalanceService } from '../domain/services/projected-balance.service';
import { RecommendedReserveService } from '../domain/services/recommended-reserve.service';
import { ReserveHealthService } from '../domain/services/reserve-health.service';
import { SafetyDaysService } from '../domain/services/safety-days.service';
import { OutflowStatsService } from '../../cash-flow/domain/services/outflow-stats.service';
import { PeriodKey } from '../../../shared/types/period.type';
import { ReserveHealth } from '../../../shared/types/reserve-health.type';
import { APP_SETTINGS } from '../../../core/tokens/injection-tokens';
import { getPeriod } from '../../../core/utils/date.util';
import { roundCurrency } from '../../../core/utils/money.util';

export interface DashboardReserveHealth {
  status: ReserveHealth;
  deficitAmount: number;
  surplusAmount: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardFacade {
  private readonly cashFlow = inject(CashFlowFacade);
  private readonly payablesFacade = inject(AccountsPayableFacade);
  private readonly settings = inject(APP_SETTINGS);

  private readonly projectedService = new ProjectedBalanceService();
  private readonly reserveService = new RecommendedReserveService();
  private readonly healthService = new ReserveHealthService();
  private readonly safetyService = new SafetyDaysService();
  private readonly outflowStats = new OutflowStatsService();

  // State
  private _period = signal<PeriodKey>('CURRENT_MONTH');
  
  // Public API
  readonly period = this._period.asReadonly();
  readonly currentBalance = this.cashFlow.currentBalance;
  readonly minSafetyDays = computed(() => this.settings().minSafetyDays);

  readonly projectedBalance = computed(() => {
    const ref = new Date();
    return this.projectedService.projectedBalance({
      currentBalance: this.cashFlow.currentBalance(),
      payables: this.payablesFacade.payables(),
      period: getPeriod(this._period(), ref),
      ref
    });
  });

  readonly recommendedReserve = computed(() => {
    const ref = new Date();
    return this.reserveService.recommendedReserve({
      payables: this.payablesFacade.payables(),
      period: getPeriod(this._period(), ref),
      safetyMarginPct: this.settings().reserveSafetyMarginPct,
      ref
    });
  });

  readonly reserveHealth = computed<DashboardReserveHealth>(() => {
    const currentBalance = this.cashFlow.currentBalance();
    const recommendedReserve = this.recommendedReserve();
    const status = this.healthService.reserveHealth({
      currentBalance,
      recommendedReserve,
      attentionThresholdPct: this.settings().reserveAttentionThresholdPct,
    });

    return {
      status,
      deficitAmount: roundCurrency(Math.max(0, recommendedReserve - currentBalance)),
      surplusAmount: roundCurrency(Math.max(0, currentBalance - recommendedReserve)),
    };
  });

  readonly reserveHealthStatus = computed(() => {
    return this.healthService.reserveHealth({
      currentBalance: this.cashFlow.currentBalance(),
      recommendedReserve: this.recommendedReserve(),
      attentionThresholdPct: this.settings().reserveAttentionThresholdPct,
    });
  });

  readonly safetyDays = computed(() => {
    const stats = this.outflowStats.averageDailyOutflow(this.cashFlow.movements());
    const days = this.safetyService.safetyDays({
      currentBalance: this.cashFlow.currentBalance(),
      averageDailyOutflow: stats.value
    });
    return {
      value: days.value,
      insufficient: stats.insufficient
    };
  });

  readonly recentMovements = computed(() => {
    return [...this.cashFlow.movements()]
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 5);
  });

  readonly upcomingPayables = computed(() => {
    return [...this.payablesFacade.payables()]
      .filter(p => p.status !== 'PAGA' && p.status !== 'CANCELADA')
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
      .slice(0, 5);
  });

  setPeriod(period: PeriodKey): void {
    this._period.set(period);
  }

  async loadData(): Promise<void> {
    await Promise.all([
      this.cashFlow.load(),
      this.payablesFacade.load()
    ]);
  }
}
