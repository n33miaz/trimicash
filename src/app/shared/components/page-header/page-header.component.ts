import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'tc-page-header',
  standalone: true,
  template: `
    <header class="tc-page-header">
      <h1 class="title">{{ title() }}</h1>
      <div class="actions">
        <ng-content></ng-content>
      </div>
    </header>
  `,
  styles: [`
    :host { display: block; margin-bottom: var(--space-6); }
    .tc-page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: var(--space-4);
    }
    .title {
      margin: 0;
      font-family: var(--font-family-display);
      font-size: var(--font-size-3xl);
      font-weight: 700;
      color: var(--color-text-primary);
    }
    .actions { display: flex; gap: var(--space-2); }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageHeaderComponent {
  title = input.required<string>();
}
