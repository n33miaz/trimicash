import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'tc-loading-state',
  standalone: true,
  template: `
    <div class="tc-loading-state">
      <div class="spinner"></div>
      @if (message()) {
        <p class="message">{{ message() }}</p>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
    .tc-loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--space-8);
      color: var(--color-text-secondary);
    }
    .spinner {
      width: 32px;
      height: 32px;
      border: 3px solid rgba(5, 27, 97, 0.1);
      border-top-color: var(--color-primary-500);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: var(--space-4);
    }
    .message { margin: 0; font-size: var(--font-size-sm); font-weight: 500; }
    @keyframes spin { 100% { transform: rotate(360deg); } }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingStateComponent {
  message = input<string>();
}
