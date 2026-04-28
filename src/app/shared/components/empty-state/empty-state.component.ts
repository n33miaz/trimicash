import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'tc-empty-state',
  standalone: true,
  template: `
    <div class="tc-empty-state">
      <div class="icon-circle">
        <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="9" x2="15" y2="15"></line><line x1="15" y1="9" x2="9" y2="15"></line></svg>
      </div>
      <h3 class="title">{{ title() }}</h3>
      <p class="message">{{ message() }}</p>
      <div class="actions">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .tc-empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: var(--space-8) var(--space-4);
      background: var(--color-surface);
      border-radius: var(--radius-lg);
      border: 1px dashed var(--color-border);
    }
    .icon-circle {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: var(--color-background);
      color: var(--color-text-secondary);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: var(--space-4);
    }
    .title {
      margin: 0 0 var(--space-2);
      font-family: var(--font-family-display);
      font-size: var(--font-size-lg);
      font-weight: 600;
      color: var(--color-text-primary);
    }
    .message {
      margin: 0 0 var(--space-5);
      color: var(--color-text-secondary);
      font-size: var(--font-size-sm);
      max-width: 400px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyStateComponent {
  title = input.required<string>();
  message = input.required<string>();
}
