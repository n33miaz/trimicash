import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'tc-stat-card',
  standalone: true,
  template: `
    <div class="tc-stat-card" [class]="'tone-' + tone()">
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
      background: var(--color-surface);
      border-radius: var(--radius-lg);
      padding: var(--space-5);
      border: 1px solid var(--color-border);
      height: 100%;
      box-shadow: var(--shadow-sm);
    }
    .content { display: flex; flex-direction: column; }
    .label { font-size: var(--font-size-sm); color: var(--color-text-secondary); font-weight: 500; margin-bottom: var(--space-2); }
    .value { font-family: var(--font-family-display); font-size: var(--font-size-2xl); font-weight: 700; color: var(--color-text-primary); }
    .hint { font-size: var(--font-size-xs); color: var(--color-text-secondary); margin-top: var(--space-2); }
    
    .tone-success .value { color: var(--color-success-500); }
    .tone-danger .value { color: var(--color-danger-500); }
    .tone-warning .value { color: var(--color-warning-500); }
    .tone-primary .value { color: var(--color-primary-500); }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatCardComponent {
  label = input.required<string>();
  value = input.required<string>();
  tone = input<'neutral' | 'success' | 'danger' | 'warning' | 'primary'>('neutral');
  hint = input<string>();
}
