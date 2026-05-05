import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';

import { AlertsFacade } from '../../../application/alerts.facade';
import { AppAlert } from '../../../../../shared/types/alert.type';

import { PageHeaderComponent } from '../../../../../shared/components/page-header/page-header.component';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';
import { BadgeComponent } from '../../../../../shared/components/badge/badge.component';
import { EmptyStateComponent } from '../../../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'tc-alerts-center-page',
  standalone: true,
  imports: [
    DatePipe,
    PageHeaderComponent,
    ButtonComponent,
    EmptyStateComponent,
  ],
  template: `
    <div class="alerts-page">
      <tc-page-header title="Alertas e Avisos">
        @if (hasUnread()) {
          <tc-button variant="secondary" (clicked)="markAllAsRead()">Marcar Como Lidos</tc-button>
        }
      </tc-page-header>

      @if (alertsFacade.alerts().length === 0) {
        <tc-empty-state
          title="Nenhum alerta"
          message="Seu caixa está saudável e não há pendências críticas."
        ></tc-empty-state>
      } @else {
        <div class="alerts-list" aria-live="polite">
          @if (criticalAlerts().length > 0) {
            <div class="alert-group">
              <h3 class="group-title text-danger">Críticos</h3>
              @for (alert of criticalAlerts(); track alert.id) {
                <div class="alert-card card-critical" [class.unread]="!alert.isRead">
                  <div class="alert-icon">
                    <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                  </div>
                  <div class="alert-content">
                    <div class="alert-header">
                      <h4 class="alert-title">{{ alert.title }}</h4>
                      <span class="alert-time">{{ alert.createdAt | date:'short' }}</span>
                    </div>
                    <p class="alert-message">{{ alert.message }}</p>
                    <div class="alert-actions">
                      @if (!alert.isRead) {
                        <tc-button variant="ghost" size="sm" (clicked)="alertsFacade.markAsRead(alert.id)">Marcar como lido</tc-button>
                      }
                      @if (alert.relatedId) {
                        <tc-button variant="secondary" size="sm" (clicked)="handleAction(alert)">Ver detalhes</tc-button>
                      }
                    </div>
                  </div>
                </div>
              }
            </div>
          }

          @if (warningAlerts().length > 0) {
            <div class="alert-group">
              <h3 class="group-title text-warning">Avisos</h3>
              @for (alert of warningAlerts(); track alert.id) {
                <div class="alert-card card-warning" [class.unread]="!alert.isRead">
                  <div class="alert-icon">
                    <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                  </div>
                  <div class="alert-content">
                    <div class="alert-header">
                      <h4 class="alert-title">{{ alert.title }}</h4>
                      <span class="alert-time">{{ alert.createdAt | date:'short' }}</span>
                    </div>
                    <p class="alert-message">{{ alert.message }}</p>
                    <div class="alert-actions">
                      @if (!alert.isRead) {
                        <tc-button variant="ghost" size="sm" (clicked)="alertsFacade.markAsRead(alert.id)">Marcar como lido</tc-button>
                      }
                      @if (alert.relatedId) {
                        <tc-button variant="secondary" size="sm" (clicked)="handleAction(alert)">Ver detalhes</tc-button>
                      }
                    </div>
                  </div>
                </div>
              }
            </div>
          }

          @if (infoAlerts().length > 0) {
            <div class="alert-group">
              <h3 class="group-title text-info">Informativos</h3>
              @for (alert of infoAlerts(); track alert.id) {
                <div class="alert-card card-info" [class.unread]="!alert.isRead">
                  <div class="alert-icon">
                    <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                  </div>
                  <div class="alert-content">
                    <div class="alert-header">
                      <h4 class="alert-title">{{ alert.title }}</h4>
                      <span class="alert-time">{{ alert.createdAt | date:'short' }}</span>
                    </div>
                    <p class="alert-message">{{ alert.message }}</p>
                    <div class="alert-actions">
                      @if (!alert.isRead) {
                        <tc-button variant="ghost" size="sm" (clicked)="alertsFacade.markAsRead(alert.id)">Marcar como lido</tc-button>
                      }
                    </div>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .alerts-page {
      max-width: 800px;
      margin: 0 auto;
      padding-bottom: var(--space-8);
    }

    .alert-group { margin-bottom: var(--space-6); }
    .group-title {
      font-family: var(--font-family-display);
      font-size: var(--font-size-md);
      font-weight: 700;
      margin-bottom: var(--space-3);
      padding-bottom: var(--space-2);
      border-bottom: 1px solid var(--color-border-card);
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }
    .text-danger  { color: var(--color-danger-500); }
    .text-warning { color: var(--color-warning-500); }
    .text-info    { color: var(--color-accent-500); }

    .alert-card {
      display: flex;
      gap: var(--space-4);
      background: var(--color-bg-card);
      border: 1px solid var(--color-border-card);
      border-radius: var(--radius-lg);
      padding: var(--space-4);
      margin-bottom: var(--space-3);
      box-shadow: var(--shadow-card);
      position: relative;
      transition: all 0.25s var(--motion-spring);
    }
    .alert-card:hover { transform: translateY(-2px); }
    .alert-card.unread { border-left: 3px solid transparent; }
    .card-critical.unread { border-left-color: var(--color-danger-500); }
    .card-critical:hover  { box-shadow: var(--shadow-glow-danger); border-color: rgba(220,38,38,0.2); }
    .card-warning.unread  { border-left-color: var(--color-warning-500); }
    .card-warning:hover   { box-shadow: var(--shadow-glow-warning); border-color: rgba(245,158,11,0.2); }
    .card-info.unread     { border-left-color: var(--color-accent-500); }
    .card-info:hover      { box-shadow: var(--shadow-glow-accent); border-color: rgba(47,128,237,0.2); }

    /* Unread dot */
    .alert-card.unread::after {
      content: '';
      position: absolute;
      top: 14px; right: 14px;
      width: 8px; height: 8px;
      border-radius: 50%;
      background: var(--color-danger-500);
      box-shadow: 0 0 0 2px var(--color-bg-card);
      animation: pulseDot 2s ease-in-out infinite;
    }
    .card-warning.unread::after { background: var(--color-warning-500); }
    .card-info.unread::after    { background: var(--color-accent-500); }

    @keyframes pulseDot {
      0%, 100% { transform: scale(1); opacity: 1; }
      50%       { transform: scale(1.3); opacity: 0.7; }
    }

    /* Ícone com fundo circular */
    .alert-icon {
      flex-shrink: 0;
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: grid;
      place-items: center;
    }
    .card-critical .alert-icon { color: var(--color-danger-500);  background: rgba(220,38,38,0.1); }
    .card-warning  .alert-icon { color: var(--color-warning-500); background: rgba(245,158,11,0.1); }
    .card-info     .alert-icon { color: var(--color-accent-500);  background: rgba(47,128,237,0.1); }

    .alert-content { flex: 1; min-width: 0; }
    .alert-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: var(--space-1); gap: var(--space-3); }
    .alert-title { margin: 0; font-weight: 600; font-size: var(--font-size-md); color: var(--color-text-primary); }
    .alert-time { font-size: var(--font-size-xs); color: var(--color-text-muted); white-space: nowrap; }
    .alert-message { margin: 0 0 var(--space-3); font-size: var(--font-size-sm); color: var(--color-text-secondary); line-height: 1.5; }
    .alert-actions { display: flex; gap: var(--space-2); flex-wrap: wrap; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlertsCenterPageComponent {
  readonly alertsFacade = inject(AlertsFacade);
  private readonly router = inject(Router);

  readonly criticalAlerts = computed(() => this.alertsFacade.alerts().filter(a => a.severity === 'CRITICAL'));
  readonly warningAlerts = computed(() => this.alertsFacade.alerts().filter(a => a.severity === 'WARNING'));
  readonly infoAlerts = computed(() => this.alertsFacade.alerts().filter(a => a.severity === 'INFO'));
  
  readonly hasUnread = computed(() => this.alertsFacade.unreadCount() > 0);

  markAllAsRead() {
    this.alertsFacade.markAllAsRead();
  }

  handleAction(alert: AppAlert) {
    this.alertsFacade.markAsRead(alert.id);
    
    // Roteamento contextual dependendo do alerta
    if (alert.code.startsWith('ALR-VENC') || alert.code === 'ALR-ATRASO') {
      // Idealmente passar query params de filtro, mas para demo apenas navegamos
      this.router.navigate(['/accounts-payable']);
    } else {
      this.router.navigate(['/']);
    }
  }
}
