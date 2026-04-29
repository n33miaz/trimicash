import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'tc-badge',
  standalone: true,
  template: `
    <span [class]="'tc-badge tc-badge-' + tone()">
      <ng-content></ng-content>
    </span>
  `,
  styles: [`
    :host { display: inline-flex; }

    .tc-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: var(--font-size-xs);
      font-weight: 600;
      line-height: 1.4;
      white-space: nowrap;
      letter-spacing: 0.01em;
    }

    .tc-badge-neutral {
      background: var(--color-background);
      color: var(--color-text-secondary);
      border: 1px solid var(--color-border);
    }

    .tc-badge-success {
      background: var(--color-success-50);
      color: var(--color-success-500);
      border: 1px solid rgba(22, 163, 74, 0.2);
    }

    .tc-badge-warning {
      background: var(--color-warning-50);
      color: var(--color-warning-500);
      border: 1px solid rgba(245, 158, 11, 0.2);
    }

    .tc-badge-danger {
      background: var(--color-danger-50);
      color: var(--color-danger-500);
      border: 1px solid rgba(220, 38, 38, 0.2);
    }

    .tc-badge-info {
      background: #eff6ff;
      color: #2563eb;
      border: 1px solid rgba(37, 99, 235, 0.2);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BadgeComponent {
  tone = input<'neutral' | 'success' | 'warning' | 'danger' | 'info'>('neutral');
}
