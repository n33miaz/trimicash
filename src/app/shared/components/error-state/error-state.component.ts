import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'tc-error-state',
  standalone: true,
  template: `
    <div class="tc-error-state">
      <div class="icon">
        <svg width="32" height="32" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
      </div>
      <p class="message">{{ message() }}</p>
      <button class="retry-btn" (click)="retry.emit()">Tentar Novamente</button>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .tc-error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--space-6);
      background: var(--color-danger-50);
      border-radius: var(--radius-lg);
      text-align: center;
    }
    .icon { color: var(--color-danger-500); margin-bottom: var(--space-3); }
    .message { color: var(--color-danger-500); font-weight: 500; margin: 0 0 var(--space-4); }
    .retry-btn {
      background: var(--color-surface);
      border: 1px solid var(--color-danger-500);
      color: var(--color-danger-500);
      padding: var(--space-2) var(--space-4);
      border-radius: var(--radius-md);
      font-weight: 500;
      cursor: pointer;
      transition:
        background-color var(--motion-fast),
        color var(--motion-fast),
        border-color var(--motion-fast);
    }
    .retry-btn:hover { background: var(--color-danger-500); color: white; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorStateComponent {
  message = input.required<string>();
  retry = output<void>();
}
