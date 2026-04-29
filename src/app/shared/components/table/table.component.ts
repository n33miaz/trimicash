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
      background: var(--color-bg-card);
      border-radius: var(--radius-lg);
      border: 1px solid var(--color-border-card);
      box-shadow: var(--shadow-card);
      /* Scrollbar fina e elegante */
      scrollbar-width: thin;
      scrollbar-color: var(--color-border) transparent;
    }

    .tc-table-container::-webkit-scrollbar { height: 4px; }
    .tc-table-container::-webkit-scrollbar-track { background: transparent; }
    .tc-table-container::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: 4px; }

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
      color: var(--color-text-muted);
      text-transform: uppercase;
      letter-spacing: 0.06em;
      border-bottom: 1px solid var(--color-border-card);
      white-space: nowrap;
    }

    /* Estilos das células via projeção — sem ::ng-deep */
    :host ::ng-deep .tc-table td {
      padding: var(--space-4);
      border-bottom: 1px solid var(--color-border-card);
      font-size: var(--font-size-sm);
      color: var(--color-text-primary);
      vertical-align: middle;
    }

    :host ::ng-deep .tc-table tbody tr:last-child td {
      border-bottom: none;
    }

    :host ::ng-deep .tc-table tbody tr {
      background: transparent;
      transition: background var(--motion-fast);
    }

    :host ::ng-deep .tc-table tbody tr:hover {
      background: var(--color-bg-row-hover);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableComponent {
  columns = input.required<string[]>();
}
