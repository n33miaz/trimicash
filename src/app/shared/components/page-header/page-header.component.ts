import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'tc-page-header',
  standalone: true,
  template: `
    <header class="tc-page-header" [class.stack-mobile]="stackOnMobile()">
      <h1 class="title">{{ title() }}</h1>
      <div class="actions" [class.stack-mobile]="stackOnMobile()">
        <ng-content></ng-content>
      </div>
    </header>
  `,
  styles: [`
    :host {
      display: block;
      margin-bottom: var(--space-6);
    }

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

    .actions {
      display: flex;
      gap: var(--space-2);
    }

    @media (max-width: 767px) {
      .tc-page-header {
        align-items: center;
        flex-wrap: nowrap;
      }

      .title {
        min-width: 0;
        font-size: var(--font-size-2xl);
      }

      .actions {
        flex-shrink: 0;
      }

      .tc-page-header.stack-mobile {
        align-items: stretch;
        flex-wrap: wrap;
      }

      .actions.stack-mobile {
        width: 100%;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageHeaderComponent {
  title = input.required<string>();
  stackOnMobile = input(false);
}
