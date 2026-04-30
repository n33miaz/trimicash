import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

import { DashboardFacade } from '../../../application/dashboard.facade';
import { AlertsFacade } from '../../../../alerts/application/alerts.facade';
import { CategoriesFacade } from '../../../../categories/application/categories.facade';
import { AUTH_PORT } from '../../../../../core/tokens/injection-tokens';
import { PeriodKey } from '../../../../../shared/types/period.type';
import { AppAlert } from '../../../../../shared/types/alert.type';

import { PageHeaderComponent } from '../../../../../shared/components/page-header/page-header.component';
import { StatCardComponent } from '../../../../../shared/components/stat-card/stat-card.component';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';
import { BadgeComponent } from '../../../../../shared/components/badge/badge.component';
import { BrlCurrencyPipe } from '../../../../../shared/pipes/brl-currency.pipe';
import { SelectComponent } from '../../../../../shared/components/select/select.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'tc-dashboard-page',
  standalone: true,
  imports: [
    DatePipe,
    RouterLink,
    PageHeaderComponent,
    StatCardComponent,
    ButtonComponent,
    BadgeComponent,
    BrlCurrencyPipe,
    SelectComponent,
    FormsModule,
  ],
  template: `
    <div class="dashboard-page">
      <tc-page-header [title]="greeting()">
        <div class="period-selector">
          <tc-select 
            [options]="periodOptions" 
            [ngModel]="dashboard.period()" 
            (ngModelChange)="onPeriodChange($event)"
          ></tc-select>
        </div>
      </tc-page-header>

      <!-- Linha 1: KPIs -->
      <div class="kpi-grid">
        <tc-stat-card
          label="Saldo atual"
          [value]="dashboard.currentBalance() | brlCurrency"
          [tone]="dashboard.currentBalance() >= 0 ? 'success' : 'danger'"
          hint="Entradas − Saídas efetivadas"
        ></tc-stat-card>
        
        <tc-stat-card
          label="Saldo projetado"
          [value]="dashboard.projectedBalance() | brlCurrency"
          [tone]="dashboard.projectedBalance() >= 0 ? 'primary' : 'danger'"
          hint="Após pagar contas pendentes do período"
        ></tc-stat-card>
        
        <tc-stat-card
          label="Reserva recomendada"
          [value]="dashboard.recommendedReserve() | brlCurrency"
          tone="neutral"
          hint="Mínimo para honrar compromissos do período"
        ></tc-stat-card>
        
        <tc-stat-card
          label="Dias de segurança"
          [value]="dashboard.safetyDays().insufficient ? 'N/A' : dashboard.safetyDays().value.toString()"
          [tone]="dashboard.safetyDays().insufficient ? 'neutral' : (dashboard.safetyDays().value < dashboard.minSafetyDays() ? 'danger' : 'success')"
          [hint]="dashboard.safetyDays().insufficient ? 'Histórico insuficiente' : 'Dias'"
        ></tc-stat-card>
      </div>

      <!-- Linha 2: Saúde da Reserva -->
      <div class="health-panel">
        <div class="health-header">
          <h3 class="health-title">Saúde da Reserva</h3>
          <tc-badge [tone]="getHealthTone(dashboard.reserveHealth().status)">
            {{ getHealthLabel(dashboard.reserveHealth().status) }}
          </tc-badge>
        </div>
        
        <div class="progress-bar-container">
          <div 
            class="progress-bar-fill" 
            [class]="getHealthProgressClass(dashboard.reserveHealth().status)"
            [style.width.%]="getHealthPercentage()"
          ></div>
        </div>
        
        <p class="health-message text-secondary">
          @if (dashboard.reserveHealth().status === 'DEFICIT') {
            Falta {{ dashboard.reserveHealth().deficitAmount | brlCurrency }} para cobrir os compromissos.
          } @else if (dashboard.reserveHealth().status === 'ATTENTION') {
            Caixa apertado. Você tem caixa suficiente, mas a folga é pequena ({{ dashboard.reserveHealth().surplusAmount | brlCurrency }}).
          } @else {
            Você tem caixa suficiente para os próximos compromissos, com uma folga de {{ dashboard.reserveHealth().surplusAmount | brlCurrency }}.
          }
        </p>
      </div>

      <!-- Linha 3: Próximos vencimentos e Últimas movimentações -->
      <div class="lists-grid">
        <!-- Contas a Pagar -->
        <div class="list-panel">
          <div class="panel-header">
            <h3 class="panel-title">Próximos Vencimentos</h3>
            <tc-button variant="ghost" size="sm" routerLink="/accounts-payable">Ver todas</tc-button>
          </div>
          
          <div class="panel-content">
            @if (dashboard.upcomingPayables().length === 0) {
              <div class="empty-list">Nenhuma conta pendente próxima.</div>
            } @else {
              <ul class="item-list">
                @for (p of dashboard.upcomingPayables(); track p.id) {
                  <li class="list-item">
                    <div class="item-main">
                      <span class="item-desc">{{ p.description }}</span>
                      <span class="item-date" [class.text-danger]="p.status === 'ATRASADA'">
                        {{ p.dueDate | date:'dd/MM' }}
                        @if (p.status === 'ATRASADA') {
                          <span class="overdue-tag">Atrasada</span>
                        }
                      </span>
                    </div>
                    <div class="item-right">
                      <span class="item-amount">{{ p.amount | brlCurrency }}</span>
                    </div>
                  </li>
                }
              </ul>
            }
          </div>
        </div>

        <!-- Movimentações -->
        <div class="list-panel">
          <div class="panel-header">
            <h3 class="panel-title">Últimas Movimentações</h3>
            <tc-button variant="ghost" size="sm" routerLink="/cash-flow">Ver todas</tc-button>
          </div>
          
          <div class="panel-content">
            @if (dashboard.recentMovements().length === 0) {
              <div class="empty-list">Nenhuma movimentação registrada.</div>
            } @else {
              <ul class="item-list">
                @for (m of dashboard.recentMovements(); track m.id) {
                  <li class="list-item">
                    <div class="item-main">
                      <span class="item-desc">{{ m.description }}</span>
                      <span class="item-date text-secondary">{{ m.date | date:'dd/MM' }} • {{ getCategoryName(m.categoryId) }}</span>
                    </div>
                    <div class="item-right">
                      <span class="item-amount" [class.text-success]="m.type === 'ENTRADA'" [class.text-danger]="m.type === 'SAIDA'">
                        {{ m.type === 'ENTRADA' ? '+' : '-' }}{{ m.amount | brlCurrency }}
                      </span>
                    </div>
                  </li>
                }
              </ul>
            }
          </div>
        </div>
      </div>

      <!-- Linha 4: Alertas -->
      @if (criticalAlerts().length > 0) {
        <div class="alerts-summary">
          <div class="panel-header">
            <h3 class="panel-title">Alertas Críticos</h3>
            <tc-button variant="ghost" size="sm" routerLink="/alerts">Ver todos ({{ unreadAlertsCount() }})</tc-button>
          </div>
          <div class="alerts-grid">
            @for (alert of criticalAlerts(); track alert.id) {
              <div class="alert-mini-card">
                <div class="alert-icon">
                  <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                </div>
                <div class="alert-content">
                  <strong>{{ alert.title }}</strong>
                  <p>{{ alert.message }}</p>
                </div>
                <tc-button variant="secondary" size="sm" (clicked)="goToAlert(alert)">Resolver</tc-button>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .dashboard-page {
      max-width: 1100px;
      margin: 0 auto;
      padding-bottom: var(--space-8);
    }

    .period-selector tc-select {
      margin-bottom: 0;
    }
    
    ::ng-deep .period-selector select {
      padding: var(--space-2) var(--space-6) var(--space-2) var(--space-3) !important;
      font-size: var(--font-size-sm) !important;
      border-color: var(--color-border-card) !important;
      box-shadow: none !important;
    }

    /* ─── KPIs ──────────────────────────────────────────── */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: var(--space-4);
      margin-bottom: var(--space-5);
    }
    @media (max-width: 1024px) { .kpi-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 480px)  { .kpi-grid { grid-template-columns: 1fr; } }

    /* ─── Health Panel ───────────────────────────────────── */
    .health-panel {
      background: var(--color-bg-card);
      border: 1px solid var(--color-border-card);
      border-radius: var(--radius-lg);
      padding: var(--space-5);
      margin-bottom: var(--space-5);
      box-shadow: var(--shadow-card);
      transition: border-color var(--motion-normal);
    }
    .health-panel:hover { border-color: rgba(47,128,237,0.18); }
    .health-header { display: flex; align-items: center; gap: var(--space-3); margin-bottom: var(--space-4); }
    .health-title { margin: 0; font-family: var(--font-family-display); font-size: var(--font-size-lg); font-weight: 600; color: var(--color-text-primary); }
    .progress-bar-container { height: 10px; background: var(--color-background); border-radius: var(--radius-full); overflow: hidden; margin-bottom: var(--space-3); }
    .progress-bar-fill { height: 100%; border-radius: var(--radius-full); transition: width 0.8s var(--motion-spring); }
    .bg-success { background-color: var(--color-success-500); }
    .bg-warning { background-color: var(--color-warning-500); }
    .bg-danger  { background-color: var(--color-danger-500); }
    .health-message { margin: 0; font-size: var(--font-size-sm); }
    .text-secondary { color: var(--color-text-secondary); }

    /* ─── Lists Grid ─────────────────────────────────────── */
    .lists-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-5); margin-bottom: var(--space-5); }
    @media (max-width: 768px) { .lists-grid { grid-template-columns: 1fr; } }

    .list-panel {
      background: var(--color-bg-card);
      border: 1px solid var(--color-border-card);
      border-radius: var(--radius-lg);
      padding: var(--space-4) var(--space-5);
      box-shadow: var(--shadow-card);
      display: flex; flex-direction: column;
      transition: border-color var(--motion-normal);
    }
    .list-panel:hover { border-color: rgba(47,128,237,0.18); }
    .panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-4); padding-bottom: var(--space-3); border-bottom: 1px solid var(--color-border-card); }
    .panel-title { margin: 0; font-family: var(--font-family-display); font-size: var(--font-size-md); font-weight: 600; color: var(--color-text-primary); }
    .panel-content { flex: 1; }
    .empty-list { color: var(--color-text-secondary); font-size: var(--font-size-sm); text-align: center; padding: var(--space-5) 0; }
    .item-list { list-style: none; padding: 0; margin: 0; }
    .list-item {
      display: flex; justify-content: space-between; align-items: center;
      padding: var(--space-3) var(--space-2);
      border-bottom: 1px solid var(--color-border-card);
      border-radius: var(--radius-sm);
      transition: background var(--motion-fast), padding-left var(--motion-fast);
    }
    .list-item:last-child { border-bottom: none; }
    .list-item:hover { background: var(--color-bg-row-hover); padding-left: var(--space-3); }
    .item-main { display: flex; flex-direction: column; gap: 2px; }
    .item-desc { font-weight: 500; font-size: var(--font-size-sm); color: var(--color-text-primary); }
    .item-date { font-size: var(--font-size-xs); color: var(--color-text-secondary); display: flex; align-items: center; gap: var(--space-2); }
    .overdue-tag { font-weight: 700; background: var(--color-danger-50); color: var(--color-danger-500); padding: 1px 6px; border-radius: 4px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.04em; }
    .item-right { text-align: right; }
    .item-amount { font-family: var(--font-family-display); font-weight: 700; font-size: var(--font-size-sm); }
    .text-success { color: var(--color-success-500); }
    .text-danger  { color: var(--color-danger-500); }

    /* ─── Alerts Mini-cards ───────────────────────────────── */
    .alerts-summary { margin-top: var(--space-2); }
    .alerts-grid { display: grid; gap: var(--space-3); }
    .alert-mini-card {
      display: flex; align-items: center; gap: var(--space-4);
      padding: var(--space-4);
      background: var(--color-danger-50);
      border: 1px solid rgba(220,38,38,0.15);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      transition: all 0.25s var(--motion-spring);
    }
    .alert-mini-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-glow-danger); border-color: rgba(220,38,38,0.3); }
    .alert-icon { width: 40px; height: 40px; border-radius: 10px; background: rgba(220,38,38,0.12); color: var(--color-danger-500); display: grid; place-items: center; flex-shrink: 0; }
    .alert-content { flex: 1; min-width: 0; }
    .alert-content strong { display: block; font-size: var(--font-size-sm); font-weight: 600; color: var(--color-text-primary); }
    .alert-content p { margin: 2px 0 0; font-size: var(--font-size-xs); color: var(--color-text-secondary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    @media (max-width: 640px) { .alert-mini-card { flex-direction: column; align-items: flex-start; } }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPageComponent implements OnInit {
  readonly dashboard = inject(DashboardFacade);
  readonly alertsFacade = inject(AlertsFacade);
  readonly categoriesFacade = inject(CategoriesFacade);
  private readonly authPort = inject(AUTH_PORT);
  private readonly router = inject(Router);

  readonly greeting = computed(() => {
    const user = this.authPort.current();
    if (!user) return 'Olá.';
    return `Olá, ${user.name}.`;
  });

  readonly criticalAlerts = computed(() => {
    return this.alertsFacade.alerts()
      .filter(a => a.severity === 'CRITICAL' && !a.isRead)
      .slice(0, 3);
  });
  
  readonly unreadAlertsCount = computed(() => this.alertsFacade.unreadCount());

  readonly periodOptions = [
    { value: 'CURRENT_MONTH', label: 'Este Mês' },
    { value: 'NEXT_7', label: 'Próximos 7 Dias' },
    { value: 'NEXT_15', label: 'Próximos 15 Dias' },
    { value: 'NEXT_30', label: 'Próximos 30 Dias' },
    { value: 'END_OF_MONTH', label: 'Até o Fim do Mês' },
  ];

  async ngOnInit() {
    await Promise.all([
      this.dashboard.loadData(),
      this.categoriesFacade.load(),
    ]);
  }

  onPeriodChange(val: string) {
    this.dashboard.setPeriod(val as PeriodKey);
  }

  getCategoryName(id: string): string {
    return this.categoriesFacade.categories().find(c => c.id === id)?.name ?? '—';
  }

  getHealthLabel(status: 'HEALTHY' | 'ATTENTION' | 'DEFICIT'): string {
    switch (status) {
      case 'HEALTHY': return 'Saudável';
      case 'ATTENTION': return 'Atenção';
      case 'DEFICIT': return 'Déficit';
    }
  }

  getHealthTone(status: 'HEALTHY' | 'ATTENTION' | 'DEFICIT'): 'success' | 'warning' | 'danger' {
    switch (status) {
      case 'HEALTHY': return 'success';
      case 'ATTENTION': return 'warning';
      case 'DEFICIT': return 'danger';
    }
  }

  getHealthProgressClass(status: 'HEALTHY' | 'ATTENTION' | 'DEFICIT'): string {
    switch (status) {
      case 'HEALTHY': return 'bg-success';
      case 'ATTENTION': return 'bg-warning';
      case 'DEFICIT': return 'bg-danger';
    }
  }

  getHealthPercentage(): number {
    const current = this.dashboard.currentBalance();
    const recommended = this.dashboard.recommendedReserve();
    
    if (recommended <= 0) return 100;
    if (current <= 0) return 0;
    
    const pct = (current / recommended) * 100;
    return Math.min(100, Math.max(0, pct));
  }

  goToAlert(alert: AppAlert) {
    this.alertsFacade.markAsRead(alert.id);
    this.router.navigate(['/alerts']);
  }
}
