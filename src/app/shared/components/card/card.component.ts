import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'tc-card',
  standalone: true,
  template: `
    <div class="tc-card" [class]="'tc-card--' + variant()">
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
      background: var(--color-bg-card);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-card);
      border: 1px solid var(--color-border-card);
      overflow: hidden;
      position: relative;
      transition: all 0.35s var(--motion-spring);
    }

    /* Faixa decorativa no topo (aparece no hover) */
    .tc-card::after {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 3px;
      border-radius: 3px 3px 0 0;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .tc-card:hover {
      transform: translateY(-3px);
      border-color: rgba(47, 128, 237, 0.18);
      box-shadow: var(--shadow-glow-accent);
    }

    .tc-card:hover::after { opacity: 1; }

    /* Variantes semânticas */
    .tc-card--default::after  { background: var(--color-accent-500); }
    .tc-card--success::after  { background: var(--color-success-500); }
    .tc-card--success:hover   { box-shadow: var(--shadow-glow-success); border-color: rgba(22, 163, 74, 0.18); }
    .tc-card--danger::after   { background: var(--color-danger-500); }
    .tc-card--danger:hover    { box-shadow: var(--shadow-glow-danger); border-color: rgba(220, 38, 38, 0.18); }
    .tc-card--warning::after  { background: var(--color-warning-500); }
    .tc-card--warning:hover   { box-shadow: var(--shadow-glow-warning); border-color: rgba(245, 158, 11, 0.18); }
    .tc-card--accent::after   { background: var(--color-accent-500); }

    .tc-card-header {
      padding: var(--space-5) var(--space-5) 0;
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
      line-height: 1.5;
    }

    .tc-card-content {
      padding: var(--space-5);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardComponent {
  title    = input<string>();
  subtitle = input<string>();
  variant  = input<'default' | 'success' | 'danger' | 'warning' | 'accent'>('default');
}
