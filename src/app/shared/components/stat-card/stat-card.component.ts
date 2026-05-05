import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'tc-stat-card',
  standalone: true,
  template: `
    <div class="tc-stat-card" [class]="'tone-' + tone()">
      <div class="card-header">
        @if (icon()) {
          <div class="card-icon-wrapper" aria-hidden="true">
            <!-- Ícones semânticos por nome -->
            @if (icon() === 'balance') {
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="6" width="20" height="12" rx="2"/>
                <line x1="2" y1="10" x2="22" y2="10"/>
              </svg>
            }
            @if (icon() === 'income') {
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                <polyline points="17 6 23 6 23 12"/>
              </svg>
            }
            @if (icon() === 'expense') {
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/>
                <polyline points="17 18 23 18 23 12"/>
              </svg>
            }
            @if (icon() === 'safety') {
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
                <path d="M12 6v6l4 2"/>
              </svg>
            }
            @if (icon() === 'calendar') {
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            }
            @if (icon() === 'alert') {
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            }
          </div>
        }

        @if (trend()) {
          <span class="trend-badge" [class]="'trend-' + (trendDirection() || 'up')">
            {{ trendDirection() === 'down' ? '▼' : '▲' }} {{ trend() }}
          </span>
        }
      </div>

      <div class="content">
        <span class="label">{{ label() }}</span>
        <span class="value">{{ value() }}</span>
        @if (hint()) {
          <span class="hint">{{ hint() }}</span>
        }
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; }

    .tc-stat-card {
      background: var(--color-bg-card);
      border-radius: var(--radius-lg);
      padding: 22px 24px;
      border: 1px solid var(--color-border-card);
      height: 100%;
      box-shadow: var(--shadow-card);
      position: relative;
      overflow: hidden;
      transition: all 0.35s var(--motion-spring);
    }

    /* Faixa decorativa no topo */
    .tc-stat-card::after {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 3px;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .tc-stat-card:hover {
      transform: translateY(-3px);
      box-shadow: var(--shadow-glow-accent);
      border-color: rgba(47, 128, 237, 0.18);
    }

    .tc-stat-card:hover::after { opacity: 1; }

    /* Glow semântico por tone */
    .tone-success:hover  { box-shadow: var(--shadow-glow-success); border-color: rgba(22, 163, 74, 0.18); }
    .tone-danger:hover   { box-shadow: var(--shadow-glow-danger);  border-color: rgba(220, 38, 38, 0.18); }
    .tone-warning:hover  { box-shadow: var(--shadow-glow-warning); border-color: rgba(245, 158, 11, 0.18); }

    /* Faixa colorida */
    .tone-success::after { background: var(--color-success-500); }
    .tone-danger::after  { background: var(--color-danger-500); }
    .tone-warning::after { background: var(--color-warning-500); }
    .tone-primary::after,
    .tone-neutral::after { background: var(--color-accent-500); }

    /* ─── Header (ícone + trend) ──────────────────────────── */
    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
    }

    .card-icon-wrapper {
      width: 42px;
      height: 42px;
      border-radius: 12px;
      display: grid;
      place-items: center;
      background: rgba(47, 128, 237, 0.08);
      color: var(--color-accent-500);
    }

    .tone-success .card-icon-wrapper { background: rgba(22, 163, 74, 0.08);  color: var(--color-success-500); }
    .tone-danger  .card-icon-wrapper { background: rgba(220, 38, 38, 0.08);  color: var(--color-danger-500); }
    .tone-warning .card-icon-wrapper { background: rgba(245, 158, 11, 0.08); color: var(--color-warning-500); }

    /* Trend badge */
    .trend-badge {
      font-size: 0.7rem;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 6px;
    }

    .trend-up   { background: rgba(22, 163, 74, 0.1);  color: var(--color-success-500); }
    .trend-down { background: rgba(220, 38, 38, 0.1);  color: var(--color-danger-500); }

    /* ─── Conteúdo ────────────────────────────────────────── */
    .content { display: flex; flex-direction: column; }

    .label {
      font-size: 0.78rem;
      color: var(--color-text-secondary);
      font-weight: 500;
      margin-bottom: 6px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .value {
      font-family: var(--font-family-display);
      font-size: var(--font-size-2xl);
      font-weight: 800;
      letter-spacing: -0.03em;
      line-height: 1.1;
      color: var(--color-text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .hint {
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
      margin-top: var(--space-2);
    }

    /* Cores semânticas do value */
    .tone-success .value { color: var(--color-success-500); }
    .tone-danger  .value { color: var(--color-danger-500); }
    .tone-warning .value { color: var(--color-warning-500); }
    .tone-primary .value { color: var(--color-accent-500); }

    @media (max-width: 767px) {
      .tc-stat-card {
        padding: 18px;
      }

      .card-header {
        margin-bottom: 12px;
      }

      .card-icon-wrapper {
        width: 36px;
        height: 36px;
        border-radius: 10px;
      }

      .label {
        white-space: normal;
        line-height: 1.35;
      }

      .value {
        font-size: clamp(1.15rem, 4.6vw, 1.55rem);
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatCardComponent {
  label          = input.required<string>();
  value          = input.required<string>();
  tone           = input<'neutral' | 'success' | 'danger' | 'warning' | 'primary'>('neutral');
  hint           = input<string>();
  icon           = input<string>();         // 'balance' | 'income' | 'expense' | 'safety' | 'calendar' | 'alert'
  trend          = input<string>();         // ex: '+12.5%'
  trendDirection = input<'up' | 'down'>(); // 'up' | 'down'
}
