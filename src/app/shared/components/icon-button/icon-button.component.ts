import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'tc-icon-button',
  standalone: true,
  template: `
    <button 
      class="tc-icon-btn"
      [attr.aria-label]="ariaLabel()"
      [disabled]="disabled()"
      (click)="clicked.emit($event)">
      <!-- Render SVG here based on icon input (simplified) -->
      <span class="icon">{{ icon() }}</span>
    </button>
  `,
  styles: [`
    :host { display: inline-block; }
    .tc-icon-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border: none;
      background: transparent;
      border-radius: var(--radius-sm);
      color: var(--color-text-secondary);
      cursor: pointer;
      transition:
        background-color var(--motion-fast),
        color var(--motion-fast),
        opacity var(--motion-fast);
    }
    .tc-icon-btn:hover:not(:disabled) {
      background: var(--color-background);
      color: var(--color-text-primary);
    }
    .tc-icon-btn:focus-visible {
      outline: 2px solid var(--color-primary-500);
      outline-offset: 2px;
    }
    .tc-icon-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconButtonComponent {
  ariaLabel = input.required<string>();
  icon = input.required<string>();
  disabled = input<boolean>(false);
  clicked = output<MouseEvent>();
}
