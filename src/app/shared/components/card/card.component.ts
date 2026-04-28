import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'tc-card',
  standalone: true,
  template: `
    <div class="tc-card">
      @if (title() || subtitle()) {
        <div class="tc-card-header">
          @if (title()) { <h3 class="tc-card-title">{{ title() }}</h3> }
          @if (subtitle()) { <p class="tc-card-subtitle">{{ subtitle() }}</p> }
        </div>
      }
      <div class="tc-card-content">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .tc-card {
      background: var(--color-surface);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--color-border);
      overflow: hidden;
    }
    .tc-card-header {
      padding: var(--space-4) var(--space-4) 0;
    }
    .tc-card-title {
      font-family: var(--font-family-display);
      font-size: var(--font-size-lg);
      font-weight: 600;
      color: var(--color-text-primary);
      margin: 0;
    }
    .tc-card-subtitle {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      margin: var(--space-1) 0 0;
    }
    .tc-card-content {
      padding: var(--space-4);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardComponent {
  title = input<string>();
  subtitle = input<string>();
}
