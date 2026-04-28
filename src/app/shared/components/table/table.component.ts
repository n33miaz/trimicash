import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'tc-table',
  standalone: true,
  template: `
    <div class="tc-table-container">
      <table class="tc-table">
        <thead>
          <tr>
            @for (col of columns(); track col) {
              <th>{{ col }}</th>
            }
          </tr>
        </thead>
        <tbody>
          <ng-content></ng-content>
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .tc-table-container {
      width: 100%;
      overflow-x: auto;
      background: var(--color-surface);
      border-radius: var(--radius-lg);
      border: 1px solid var(--color-border);
    }
    .tc-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }
    .tc-table th {
      padding: var(--space-3) var(--space-4);
      background: var(--color-background);
      font-size: var(--font-size-xs);
      font-weight: 600;
      color: var(--color-text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom: 1px solid var(--color-border);
    }
    ::ng-deep .tc-table td {
      padding: var(--space-4);
      border-bottom: 1px solid var(--color-border);
      font-size: var(--font-size-sm);
      color: var(--color-text-primary);
    }
    ::ng-deep .tc-table tr:last-child td {
      border-bottom: none;
    }
    ::ng-deep .tc-table tbody tr:hover {
      background: var(--color-background);
    }
    
    /* Mobile styles applied to the slotted content usually, handled in component */
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableComponent {
  columns = input.required<string[]>();
}
