import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'tc-button',
  standalone: true,
  template: `
    <button 
      [type]="type()"
      [class]="'tc-btn tc-btn-' + variant() + ' tc-btn-' + size()"
      [disabled]="disabled() || loading()"
      (click)="clicked.emit($event)">
      @if (loading()) {
        <span class="spinner"></span>
      }
      <ng-content></ng-content>
    </button>
  `,
  styles: [`
    :host { display: inline-block; }
    .tc-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-2);
      border: none;
      border-radius: var(--radius-md);
      font-family: var(--font-family-body);
      font-weight: 500;
      cursor: pointer;
      transition:
        background-color var(--motion-fast),
        border-color var(--motion-fast),
        color var(--motion-fast),
        opacity var(--motion-fast);
      white-space: nowrap;
    }
    .tc-btn:focus-visible {
      outline: 2px solid var(--color-primary-500);
      outline-offset: 2px;
    }
    .tc-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    
    /* Sizes */
    .tc-btn-sm { padding: var(--space-2) var(--space-3); font-size: var(--font-size-sm); }
    .tc-btn-md { padding: var(--space-3) var(--space-4); font-size: var(--font-size-md); }
    .tc-btn-lg { padding: var(--space-4) var(--space-5); font-size: var(--font-size-lg); }
    
    /* Variants */
    .tc-btn-primary { background: var(--color-accent-500); color: white; }
    .tc-btn-primary:hover:not(:disabled) { background: var(--color-accent-600); }
    
    .tc-btn-secondary { background: var(--color-surface); color: var(--color-text-primary); border: 1px solid var(--color-border); }
    .tc-btn-secondary:hover:not(:disabled) { background: var(--color-background); }
    
    .tc-btn-ghost { background: transparent; color: var(--color-text-primary); }
    .tc-btn-ghost:hover:not(:disabled) { background: var(--color-background); }
    
    .tc-btn-danger { background: var(--color-danger-500); color: white; }
    .tc-btn-danger:hover:not(:disabled) { background: var(--color-danger-600); }
    
    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid currentColor;
      border-right-color: transparent;
      border-radius: 50%;
      animation: spin 0.75s linear infinite;
    }
    @keyframes spin { 100% { transform: rotate(360deg); } }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent {
  variant = input<'primary' | 'secondary' | 'ghost' | 'danger'>('primary');
  size = input<'sm' | 'md' | 'lg'>('md');
  type = input<'button' | 'submit' | 'reset'>('button');
  loading = input<boolean>(false);
  disabled = input<boolean>(false);
  clicked = output<MouseEvent>();
}
