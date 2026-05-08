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

    :host-context([data-theme="dark"]) .tc-badge-info {
      background: color-mix(in srgb, var(--color-accent-500) 18%, var(--color-surface));
      color: #9dc6ff;
      border-color: color-mix(in srgb, var(--color-accent-500) 34%, transparent);
    }

    .tc-badge-accent {
      background: linear-gradient(135deg, #6366f1 0%, #818cf8 100%);
      color: #fff;
      border: 1px solid rgba(99, 102, 241, 0.3);
      font-weight: 700;
      letter-spacing: 0.04em;
    }

    :host-context([data-theme="dark"]) .tc-badge-accent {
      background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
      border-color: rgba(99, 102, 241, 0.5);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BadgeComponent {
  tone = input<'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'accent'>('neutral');
}
