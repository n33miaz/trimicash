import { Injectable, computed, inject, signal } from '@angular/core';
import { CashFlowFacade } from '../../cash-flow/application/cash-flow.facade';
import { AccountsPayableFacade } from '../../accounts-payable/application/accounts-payable.facade';
import { DashboardFacade } from '../../dashboard/application/dashboard.facade';
import { AlertEngineService } from '../domain/services/alert-engine.service';
import { AppAlert } from '../../../shared/types/alert.type';

@Injectable({
  providedIn: 'root'
})
export class AlertsFacade {
  private readonly cashFlow = inject(CashFlowFacade);
  private readonly payablesFacade = inject(AccountsPayableFacade);
  private readonly dashboard = inject(DashboardFacade);

  private readonly alertEngine = new AlertEngineService();

  // Armazena IDs dos alertas lidos (mock)
  private _readAlertIds = signal<Set<string>>(new Set());

  // Public API
  readonly alerts = computed<AppAlert[]>(() => {
    return this.alertEngine.buildAlerts({
      payables: this.payablesFacade.payables(),
      currentBalance: this.cashFlow.currentBalance(),
      projectedBalance: this.dashboard.projectedBalance(),
      recommendedReserve: this.dashboard.recommendedReserve(),
      safetyDays: this.dashboard.safetyDays(),
      minSafetyDays: 30, // Default mockado
      ref: new Date()
    }).map(alert => ({
      ...alert,
      isRead: this._readAlertIds().has(alert.id)
    }));
  });

  readonly unreadCount = computed(() => {
    return this.alerts().filter(a => !a.isRead).length;
  });

  markAsRead(id: string): void {
    const newSet = new Set(this._readAlertIds());
    newSet.add(id);
    this._readAlertIds.set(newSet);
  }

  markAllAsRead(): void {
    const newSet = new Set(this._readAlertIds());
    this.alerts().forEach(a => newSet.add(a.id));
    this._readAlertIds.set(newSet);
  }
}
