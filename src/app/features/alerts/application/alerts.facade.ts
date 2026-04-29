import { Injectable, computed, inject, signal } from '@angular/core';
import { CashFlowFacade } from '../../cash-flow/application/cash-flow.facade';
import { AccountsPayableFacade } from '../../accounts-payable/application/accounts-payable.facade';
import { DashboardFacade } from '../../dashboard/application/dashboard.facade';
import { AlertEngineService } from '../domain/services/alert-engine.service';
import { AppAlert } from '../../../shared/types/alert.type';
import { APP_SETTINGS } from '../../../core/tokens/injection-tokens';

const READ_ALERTS_STORAGE_KEY = 'trimicash:read-alerts';

@Injectable({
  providedIn: 'root'
})
export class AlertsFacade {
  private readonly cashFlow = inject(CashFlowFacade);
  private readonly payablesFacade = inject(AccountsPayableFacade);
  private readonly dashboard = inject(DashboardFacade);
  private readonly settings = inject(APP_SETTINGS);

  private readonly alertEngine = new AlertEngineService();

  // Armazena IDs dos alertas lidos (mock)
  private _readAlertIds = signal<Set<string>>(this.readStoredAlertIds());

  // Public API
  readonly alerts = computed<AppAlert[]>(() => {
    return this.alertEngine.buildAlerts({
      payables: this.payablesFacade.payables(),
      currentBalance: this.cashFlow.currentBalance(),
      projectedBalance: this.dashboard.projectedBalance(),
      recommendedReserve: this.dashboard.recommendedReserve(),
      safetyDays: this.dashboard.safetyDays(),
      minSafetyDays: this.settings().minSafetyDays,
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
    this.persistReadAlertIds(newSet);
  }

  markAllAsRead(): void {
    const newSet = new Set(this._readAlertIds());
    this.alerts().forEach(a => newSet.add(a.id));
    this._readAlertIds.set(newSet);
    this.persistReadAlertIds(newSet);
  }

  async loadData(): Promise<void> {
    await Promise.all([
      this.cashFlow.load(),
      this.payablesFacade.load(),
    ]);
  }

  private readStoredAlertIds(): Set<string> {
    try {
      const raw = localStorage.getItem(READ_ALERTS_STORAGE_KEY);
      if (!raw) return new Set();
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) return new Set();
      return new Set(parsed.filter((value): value is string => typeof value === 'string'));
    } catch {
      return new Set();
    }
  }

  private persistReadAlertIds(ids: Set<string>): void {
    localStorage.setItem(READ_ALERTS_STORAGE_KEY, JSON.stringify([...ids]));
  }
}
