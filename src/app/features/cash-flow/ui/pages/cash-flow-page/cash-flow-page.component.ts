import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import * as XLSX from 'xlsx';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoriesFacade } from '../../../../categories/application/categories.facade';
import { AccountsPayableFacade } from '../../../../accounts-payable/application/accounts-payable.facade';
import { AccountsReceivableFacade } from '../../../../accounts-receivable/application/accounts-receivable.facade';
import { CashFlowFacade } from '../../../application/cash-flow.facade';
import { Movement, MovementType } from '../../../domain/entities/movement.entity';
import { MovementFormComponent } from '../../components/movement-form/movement-form.component';
import { BadgeComponent } from '../../../../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';
import { EmptyStateComponent } from '../../../../../shared/components/empty-state/empty-state.component';
import { LoadingStateComponent } from '../../../../../shared/components/loading-state/loading-state.component';
import { ModalComponent } from '../../../../../shared/components/modal/modal.component';
import { PageHeaderComponent } from '../../../../../shared/components/page-header/page-header.component';
import { SelectComponent } from '../../../../../shared/components/select/select.component';
import { StatCardComponent } from '../../../../../shared/components/stat-card/stat-card.component';
import { ToastService } from '../../../../../shared/components/toast/toast.service';
import { BrlCurrencyPipe } from '../../../../../shared/pipes/brl-currency.pipe';

@Component({
  selector: 'tc-cash-flow-page',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    PageHeaderComponent,
    StatCardComponent,
    ButtonComponent,
    BadgeComponent,
    ModalComponent,
    EmptyStateComponent,
    LoadingStateComponent,
    BrlCurrencyPipe,
    MovementFormComponent,
    SelectComponent,
  ],
  template: `
    <div class="cash-flow-page">
      <tc-page-header title="Caixa">
        <div class="page-header-action">
          <tc-button variant="secondary" (clicked)="openExportModal()" title="Exportar Excel">
            <span class="btn-text">Exportar Excel</span>
            <svg class="btn-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
          </tc-button>
          <tc-button variant="primary" (clicked)="openCreateModal()">+ Nova Movimentação</tc-button>
        </div>
      </tc-page-header>

      <div class="kpis-grid">
        <tc-stat-card
          label="Entradas"
          [value]="totalEntradas() | brlCurrency"
          tone="success"
          hint=" "
        ></tc-stat-card>
        <tc-stat-card
          label="Saídas"
          [value]="totalSaidas() | brlCurrency"
          tone="danger"
          hint=" "
        ></tc-stat-card>
        <tc-stat-card
          label="Saldo atual"
          [value]="cashFlowFacade.currentBalance() | brlCurrency"
          [tone]="cashFlowFacade.currentBalance() >= 0 ? 'success' : 'danger'"
          hint="Entradas - Saídas"
        ></tc-stat-card>
      </div>

      <div class="filters-bar">
        <div class="filter-tabs">
          @for (opt of typeOptions; track opt.value) {
            <button
              class="filter-tab"
              [class.active]="activeType() === opt.value"
              (click)="activeType.set(opt.value)"
            >{{ opt.label }}</button>
          }
        </div>

        <tc-select
          class="filter-select"
          [options]="categoryOptions()"
          size="sm"
          [fullWidth]="true"
          [(ngModel)]="activeCategoryId"
        ></tc-select>
      </div>

      @if (cashFlowFacade.loading()) {
        <tc-loading-state message="Carregando movimentações..."></tc-loading-state>
      } @else if (filteredMovements().length === 0) {
        <tc-empty-state
          title="Nenhuma movimentação"
          message="Adicione sua primeira movimentação de caixa."
        >
          <tc-button variant="primary" (clicked)="openCreateModal()">+ Adicionar movimentação</tc-button>
        </tc-empty-state>
      } @else {
        <div class="table-wrapper desktop-only">
          <table class="tc-table">
            <thead>
              <tr>
                <th class="text-center">Data</th>
                <th>Descrição</th>
                <th class="text-center">Categoria</th>
                <th class="text-center">Tipo</th>
                <th class="text-right">Valor</th>
                <th class="text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              @for (m of filteredMovements(); track m.id) {
                <tr>
                  <td class="text-center text-secondary">{{ m.date | date:'dd/MM/yyyy' }}</td>
                  <td class="truncate-cell" [title]="m.description">{{ m.description }}</td>
                  <td class="text-center">
                    <tc-badge tone="neutral">{{ getCategoryName(m.categoryId) }}</tc-badge>
                  </td>
                  <td class="text-center">
                    <tc-badge [tone]="m.type === 'ENTRADA' ? 'success' : 'danger'">
                      {{ m.type === 'ENTRADA' ? 'Entrada' : 'Saída' }}
                    </tc-badge>
                  </td>
                  <td class="text-right amount" [class.amount-entrada]="m.type === 'ENTRADA'" [class.amount-saida]="m.type === 'SAIDA'">
                    {{ m.type === 'ENTRADA' ? '+' : '-' }}{{ m.amount | brlCurrency }}
                  </td>
                  <td class="text-center">
                    <div class="actions-cell">
                      <tc-button variant="secondary" size="sm" (clicked)="openEditModal(m)">Editar</tc-button>
                      <tc-button variant="danger" size="sm" (clicked)="openDeleteModal(m)">Excluir</tc-button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <div class="mobile-cards mobile-only">
          @for (m of filteredMovements(); track m.id) {
            <div class="movement-card">
              <div class="movement-card-header" [class.is-entrada]="m.type === 'ENTRADA'" [class.is-saida]="m.type === 'SAIDA'">
                <div class="movement-card-row movement-card-row-top">
                  <div class="movement-main">
                    <span class="movement-description">{{ m.description }}</span>
                  </div>
                  <span class="movement-amount" [class.amount-entrada]="m.type === 'ENTRADA'" [class.amount-saida]="m.type === 'SAIDA'">
                    {{ m.type === 'ENTRADA' ? '+' : '-' }}{{ m.amount | brlCurrency }}
                  </span>
                </div>

                <div class="movement-card-row movement-card-row-meta">
                  <div class="movement-meta">
                    <tc-badge [tone]="m.type === 'ENTRADA' ? 'success' : 'danger'">
                      {{ m.type === 'ENTRADA' ? 'Entrada' : 'Saída' }}
                    </tc-badge>
                    <tc-badge tone="neutral">{{ getCategoryName(m.categoryId) }}</tc-badge>
                  </div>
                  <span class="movement-date text-secondary">{{ m.date | date:'dd/MM/yyyy' }}</span>
                </div>
              </div>
 
              <div class="movement-card-footer">
                <div class="actions-cell">
                  <tc-button variant="secondary" size="sm" [block]="true" (clicked)="openEditModal(m)">Editar</tc-button>
                  <tc-button variant="danger" size="sm" [block]="true" (clicked)="openDeleteModal(m)">Excluir</tc-button>
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>

    <tc-modal
      [open]="isFormModalOpen()"
      [title]="movementToEdit() ? 'Editar Movimentação' : 'Nova Movimentação'"
      (close)="closeFormModal()"
    >
      <tc-movement-form
        [movementToEdit]="movementToEdit()"
        (cancelled)="closeFormModal()"
        (saved)="onSaved()"
      ></tc-movement-form>
    </tc-modal>

    <tc-modal
      [open]="isDeleteModalOpen()"
      title="Confirmar exclusão"
      (close)="closeDeleteModal()"
    >
      <p class="body-md" style="margin-bottom: var(--space-5);">
        Tem certeza de que deseja excluir a movimentação <strong>{{ movementToDelete()?.description }}</strong>?
      </p>
      <div class="modal-actions">
        <tc-button variant="ghost" [block]="true" (clicked)="closeDeleteModal()">Cancelar</tc-button>
        <tc-button variant="danger" [block]="true" [loading]="cashFlowFacade.loading()" (clicked)="confirmDelete()">Excluir</tc-button>
      </div>
    </tc-modal>

    <tc-modal
      [open]="isExportModalOpen()"
      title="Exportar Fluxo de Caixa"
      (close)="closeExportModal()"
    >
      <div class="export-month-selector" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-5); background: var(--color-bg-card); padding: var(--space-3); border-radius: var(--radius-md); border: 1px solid var(--color-border-card);">
        <tc-button variant="ghost" size="sm" (clicked)="previousMonth()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </tc-button>
        <span style="font-weight: 600; font-family: var(--font-family-display); font-size: var(--font-size-md);">
          {{ exportMonthLabel() }}
        </span>
        <tc-button variant="ghost" size="sm" (clicked)="nextMonth()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </tc-button>
      </div>
      <div class="modal-actions">
        <tc-button variant="ghost" [block]="true" (clicked)="closeExportModal()">Cancelar</tc-button>
        <tc-button variant="primary" [block]="true" (clicked)="exportExcel()">Gerar Excel</tc-button>
      </div>
    </tc-modal>
  `,
  styles: [`
    .cash-flow-page {
      max-width: 1100px;
      margin: 0 auto;
      padding-bottom: var(--space-8);
    }

    .kpis-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: var(--space-4);
      margin-bottom: var(--space-5);
      max-width: 100%;
      overflow: hidden;
    }

    @media (max-width: 768px) {
      .kpis-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .kpis-grid > *:last-child:nth-child(3) {
        grid-column: 1 / -1;
      }
    }

    .filters-bar {
      display: flex;
      align-items: center;
      gap: var(--space-4);
      margin-bottom: var(--space-5);
      flex-wrap: wrap;
    }

    .filter-tabs {
      display: flex;
      gap: var(--space-2);
      background: var(--color-bg-card);
      border: 1px solid var(--color-border-card);
      border-radius: var(--radius-md);
      padding: var(--space-1);
      box-shadow: var(--shadow-sm);
    }

    .filter-tab {
      flex: 1 1 0;
      padding: var(--space-2) var(--space-4);
      border: none;
      background: transparent;
      border-radius: var(--radius-sm);
      cursor: pointer;
      font-size: var(--font-size-sm);
      font-weight: 500;
      color: var(--color-text-secondary);
      transition: background-color var(--motion-fast), color var(--motion-fast), box-shadow var(--motion-fast);
    }

    .filter-tab:hover {
      color: var(--color-accent-500);
    }

    .filter-tab.active {
      background: var(--color-accent-500);
      color: #fff;
      box-shadow: var(--shadow-glow-accent);
    }

    .filter-select {
      margin-left: auto;
      margin-bottom: 0;
      min-width: 200px;
    }

    .table-wrapper {
      background: var(--color-bg-card);
      border-radius: var(--radius-lg);
      border: 1px solid var(--color-border-card);
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      box-shadow: var(--shadow-card);
      scrollbar-width: thin;
      scrollbar-color: var(--color-border) transparent;
    }

    .table-wrapper::-webkit-scrollbar { height: 4px; }
    .table-wrapper::-webkit-scrollbar-track { background: transparent; }
    .table-wrapper::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: 4px; }

    .tc-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      min-width: 600px;
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
    }

    .tc-table td {
      padding: var(--space-4);
      border-bottom: 1px solid var(--color-border-card);
      font-size: var(--font-size-sm);
      color: var(--color-text-primary);
    }

    .tc-table tr:last-child td { border-bottom: none; }
    .tc-table tbody tr { transition: background var(--motion-fast); }
    .tc-table tbody tr:hover { background: var(--color-bg-row-hover); }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .text-secondary { color: var(--color-text-secondary); }
    .amount { font-weight: 700; font-family: var(--font-family-display); }
    .amount-entrada { color: var(--color-success-500); }
    .amount-saida { color: var(--color-danger-500); }
    .actions-cell { display: flex; gap: var(--space-2); justify-content: center; }

    .truncate-cell {
      max-width: 200px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .movement-card {
      background: var(--color-bg-card);
      border: 1px solid var(--color-border-card);
      border-radius: var(--radius-lg);
      padding: var(--space-4);
      margin-bottom: var(--space-3);
      box-shadow: var(--shadow-card);
      transition: all 0.25s var(--motion-spring);
      overflow: hidden;
    }

    .movement-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-glow-accent);
      border-color: rgba(47, 128, 237, 0.18);
    }

    .movement-card-header {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
      margin-bottom: var(--space-3);
      position: relative;
    }

    .movement-card-header::before {
      content: '';
      position: absolute;
      inset: -16px auto -16px -16px;
      width: 4px;
      border-radius: 999px;
      background: var(--color-border-card);
    }

    .movement-card-header.is-entrada::before {
      background: var(--color-success-500);
    }

    .movement-card-header.is-saida::before {
      background: var(--color-danger-500);
    }

    .movement-card-row {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: var(--space-3);
    }

    .movement-main {
      min-width: 0;
      flex: 1;
    }

    .movement-description {
      display: block;
      font-weight: 600;
      font-size: var(--font-size-sm);
      line-height: 1.4;
      color: var(--color-text-primary);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .movement-meta {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2);
      align-items: center;
      min-width: 0;
    }

    .movement-date {
      display: inline-flex;
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
      white-space: nowrap;
      flex-shrink: 0;
    }

    .movement-amount {
      font-weight: 800;
      font-size: var(--font-size-md);
      font-family: var(--font-family-display);
      text-align: right;
      flex-shrink: 0;
      white-space: nowrap;
    }

    .movement-card-footer {
      padding-top: var(--space-3);
      border-top: 1px solid var(--color-border-card);
    }

    .movement-card-footer .actions-cell {
      display: grid;
      width: 100%;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: var(--space-2);
    }

    .page-header-action {
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }

    .btn-icon { display: none; }

    .desktop-only { display: block !important; }
    .mobile-only { display: none !important; }

    @media (max-width: 768px) {
      .desktop-only { display: none !important; }
      .mobile-only { display: block !important; }

      .filters-bar {
        flex-direction: column;
        align-items: stretch;
      }

      .filter-tabs {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        width: 100%;
      }

      .filter-tab {
        min-height: 42px;
        padding-inline: var(--space-2);
      }

      .filter-select {
        margin-left: 0;
        width: 100%;
        min-width: 100%;
      }

      .page-header-action {
        width: 100%;
        gap: var(--space-2);
      }

      .page-header-action tc-button:first-child {
        width: 44px;
        min-width: 44px;
        padding: 0;
      }

      .page-header-action tc-button:first-child .btn-text {
        display: none;
      }

      .page-header-action tc-button:first-child .btn-icon {
        display: block;
      }

      .page-header-action tc-button:last-child {
        flex: 1;
      }

      .page-header-action tc-button:last-child ::ng-deep .tc-btn {
        width: 100%;
      }
    }
    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: var(--space-3);
    }

    @media (max-width: 767px) {
      .movement-card-row-meta {
        align-items: center;
      }

      .modal-actions {
        flex-direction: column-reverse;
      }

      .modal-actions > * {
        width: 100%;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CashFlowPageComponent implements OnInit {
  readonly cashFlowFacade = inject(CashFlowFacade);
  readonly categoriesFacade = inject(CategoriesFacade);
  readonly payablesFacade = inject(AccountsPayableFacade);
  readonly receivablesFacade = inject(AccountsReceivableFacade);
  private readonly toast = inject(ToastService);

  readonly activeType = signal<'ALL' | MovementType>('ALL');
  activeCategoryId = '';

  readonly isFormModalOpen = signal(false);
  readonly isDeleteModalOpen = signal(false);
  readonly movementToEdit = signal<Movement | null>(null);
  readonly movementToDelete = signal<Movement | null>(null);

  readonly typeOptions = [
    { label: 'Todos', value: 'ALL' as const },
    { label: 'Entradas', value: 'ENTRADA' as const },
    { label: 'Saídas', value: 'SAIDA' as const },
  ];

  readonly isExportModalOpen = signal(false);
  
  // Controle de mês para o modal de exportação
  readonly exportMonth = signal(new Date().getMonth());
  readonly exportYear = signal(new Date().getFullYear());
  
  readonly exportMonthLabel = computed(() => {
    const date = new Date(this.exportYear(), this.exportMonth(), 1);
    const formatter = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' });
    const formatted = formatter.format(date).toUpperCase();
    return formatted.replace(' DE ', ' / ');
  });

  readonly categoryOptions = computed(() => {
    return [
      { label: 'Todas as categorias', value: '' },
      ...this.categoriesFacade.categories().map(category => ({ label: category.name, value: category.id }))
    ];
  });

  readonly filteredMovements = computed(() => {
    return this.cashFlowFacade.movements()
      .filter(movement => this.activeType() === 'ALL' || movement.type === this.activeType())
      .filter(movement => !this.activeCategoryId || movement.categoryId === this.activeCategoryId)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  });

  readonly totalEntradas = computed(() =>
    this.cashFlowFacade.movements()
      .filter(movement => movement.type === 'ENTRADA')
      .reduce((acc, movement) => acc + movement.amount, 0)
  );

  readonly totalSaidas = computed(() =>
    this.cashFlowFacade.movements()
      .filter(movement => movement.type === 'SAIDA')
      .reduce((acc, movement) => acc + movement.amount, 0)
  );

  async ngOnInit(): Promise<void> {
    await Promise.all([
      this.cashFlowFacade.load(),
      this.categoriesFacade.load(),
      this.payablesFacade.load(),
      this.receivablesFacade.load(),
    ]);
  }

  getCategoryName(categoryId: string): string {
    return this.categoriesFacade.categories().find(category => category.id === categoryId)?.name ?? '-';
  }

  openCreateModal(): void {
    this.movementToEdit.set(null);
    this.isFormModalOpen.set(true);
  }

  openEditModal(movement: Movement): void {
    this.movementToEdit.set(movement);
    this.isFormModalOpen.set(true);
  }

  closeFormModal(): void {
    this.isFormModalOpen.set(false);
    this.movementToEdit.set(null);
  }

  onSaved(): void {
    this.closeFormModal();
    this.toast.show('Movimenta??o salva com sucesso!', 'success');
  }

  openDeleteModal(movement: Movement): void {
    this.movementToDelete.set(movement);
    this.isDeleteModalOpen.set(true);
  }

  closeDeleteModal(): void {
    this.isDeleteModalOpen.set(false);
    this.movementToDelete.set(null);
  }

  async confirmDelete(): Promise<void> {
    const movement = this.movementToDelete();
    if (!movement) return;

    try {
      await this.cashFlowFacade.remove(movement.id);
      this.toast.show('Movimentação excluída.', 'success');
      this.closeDeleteModal();
    } catch {
      this.toast.show('Erro ao excluir movimentação.', 'error');
    }
  }

  openExportModal(): void {
    const now = new Date();
    this.exportMonth.set(now.getMonth());
    this.exportYear.set(now.getFullYear());
    this.isExportModalOpen.set(true);
  }

  closeExportModal(): void {
    this.isExportModalOpen.set(false);
  }

  previousMonth(): void {
    const currentM = this.exportMonth();
    if (currentM === 0) {
      this.exportMonth.set(11);
      this.exportYear.update(y => y - 1);
    } else {
      this.exportMonth.update(m => m - 1);
    }
  }

  nextMonth(): void {
    const currentM = this.exportMonth();
    if (currentM === 11) {
      this.exportMonth.set(0);
      this.exportYear.update(y => y + 1);
    } else {
      this.exportMonth.update(m => m + 1);
    }
  }

  exportExcel(): void {
    const year = this.exportYear();
    const month = this.exportMonth();
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0, 23, 59, 59);

    const daysInMonth = endDate.getDate();
    const days: Date[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      days.push(new Date(year, month, d));
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const movements = this.cashFlowFacade.movements();
    const payables = this.payablesFacade.payables();
    const receivables = this.receivablesFacade.receivables();
    const categories = this.categoriesFacade.categories();
    const catName = (id: string) => categories.find(c => c.id === id)?.name || 'Sem Categoria';

    // ── Dados agrupados por dia e categoria ──────────────────────────────
    const dailyIn = new Map<number, { realized: Map<string, number>; predicted: Map<string, number> }>();
    const dailyOut = new Map<number, { realized: Map<string, number>; predicted: Map<string, number> }>();
    const overdueIn = new Map<string, number>();
    const overdueOut = new Map<string, number>();

    for (let d = 1; d <= daysInMonth; d++) {
      dailyIn.set(d, { realized: new Map(), predicted: new Map() });
      dailyOut.set(d, { realized: new Map(), predicted: new Map() });
    }

    // Realizados
    movements.filter(m => m.date >= startDate && m.date <= endDate).forEach(m => {
      const day = m.date.getDate();
      const target = m.type === 'ENTRADA' ? dailyIn.get(day)!.realized : dailyOut.get(day)!.realized;
      target.set(m.categoryId, (target.get(m.categoryId) || 0) + m.amount);
    });

    // Previstos — contas a receber
    receivables.filter(r => r.status === 'PENDENTE' || r.status === 'ATRASADA').forEach(r => {
      if (r.dueDate < startDate) {
        if (r.status === 'ATRASADA') overdueIn.set(r.categoryId, (overdueIn.get(r.categoryId) || 0) + r.amount);
      } else if (r.dueDate <= endDate) {
        const map = dailyIn.get(r.dueDate.getDate())!.predicted;
        map.set(r.categoryId, (map.get(r.categoryId) || 0) + r.amount);
      }
    });

    // Previstos — contas a pagar
    payables.filter(p => p.status === 'PENDENTE' || p.status === 'ATRASADA').forEach(p => {
      if (p.dueDate < startDate) {
        if (p.status === 'ATRASADA') overdueOut.set(p.categoryId, (overdueOut.get(p.categoryId) || 0) + p.amount);
      } else if (p.dueDate <= endDate) {
        const map = dailyOut.get(p.dueDate.getDate())!.predicted;
        map.set(p.categoryId, (map.get(p.categoryId) || 0) + p.amount);
      }
    });

    // Categorias usadas
    const inflowCats = new Set<string>();
    const outflowCats = new Set<string>();
    overdueIn.forEach((_, c) => inflowCats.add(c));
    overdueOut.forEach((_, c) => outflowCats.add(c));
    dailyIn.forEach(v => { v.realized.forEach((_, c) => inflowCats.add(c)); v.predicted.forEach((_, c) => inflowCats.add(c)); });
    dailyOut.forEach(v => { v.realized.forEach((_, c) => outflowCats.add(c)); v.predicted.forEach((_, c) => outflowCats.add(c)); });

    // ── Helpers ──────────────────────────────────────────────────────────
    const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const pad = (n: number) => String(n).padStart(2, '0');
    const totalCols = daysInMonth + 2; // col 0 = Categoria, col 1 = Atrasados, cols 2..N+1 = dias

    const sumMap = (m: Map<string, number>) => { let s = 0; m.forEach(v => s += v); return s; };

    const dayTotal = (day: number, source: Map<number, { realized: Map<string, number>; predicted: Map<string, number> }>) => {
      const d = source.get(day)!;
      return sumMap(d.realized) + sumMap(d.predicted);
    };

    const dayCatTotal = (day: number, catId: string, source: Map<number, { realized: Map<string, number>; predicted: Map<string, number> }>) => {
      const d = source.get(day)!;
      return (d.realized.get(catId) || 0) + (d.predicted.get(catId) || 0);
    };

    // Saldo de abertura (movimentações anteriores ao mês)
    const pastMovements = movements.filter(m => m.date < startDate);
    const openingBalance = pastMovements.reduce((acc, m) => acc + (m.type === 'ENTRADA' ? m.amount : -m.amount), 0);

    // ── Construir AOA (array of arrays) ─────────────────────────────────
    const aoa: (string | number)[][] = [];

    // ── Linha 0: Título ──
    const titleRow: (string | number)[] = [`FLUXO DE CAIXA - ${this.exportMonthLabel()}`];
    for (let i = 1; i < totalCols; i++) titleRow.push('');
    aoa.push(titleRow);

    // ── Linha 1: Cabeçalho de datas  (ex: "Sáb, 18/10") ──
    const dateHeaderRow: (string | number)[] = ['', ''];
    days.forEach(d => dateHeaderRow.push(`${weekdays[d.getDay()]}, ${pad(d.getDate())}/${pad(d.getMonth() + 1)}`));
    aoa.push(dateHeaderRow);

    // ── Linha 2: Sub-cabeçalho (Categoria | Atrasados Hoje | Realizado/Previsto...) ──
    const subHeaderRow: (string | number)[] = ['Categoria', 'Atrasados Hoje'];
    days.forEach(d => subHeaderRow.push(d <= today ? 'Realizado' : 'Previsto'));
    aoa.push(subHeaderRow);

    // ── Helper genérico para adicionar uma linha de dados ──
    const addDataRow = (label: string, overdueVal: number, dailyValues: number[]) => {
      const row: (string | number)[] = [label, overdueVal];
      dailyValues.forEach(v => row.push(v));
      aoa.push(row);
    };

    // ── SALDO INICIAL ──
    let runningBalance = openingBalance;
    const dailyOpenBalances: number[] = [];
    const saldoValues: number[] = [];

    days.forEach(d => {
      const day = d.getDate();
      saldoValues.push(runningBalance);
      dailyOpenBalances[day] = runningBalance;
      runningBalance += dayTotal(day, dailyIn) - dayTotal(day, dailyOut);
    });
    addDataRow('SALDO INICIAL', 0, saldoValues);

    // ── RECEITAS ──
    const overdueInTotal = sumMap(overdueIn);
    const receitasDailyTotals = days.map(d => dayTotal(d.getDate(), dailyIn));
    addDataRow('RECEITAS', overdueInTotal, receitasDailyTotals);

    inflowCats.forEach(catId => {
      const dailyVals = days.map(d => dayCatTotal(d.getDate(), catId, dailyIn));
      addDataRow(`  ${catName(catId)}`, overdueIn.get(catId) || 0, dailyVals);
    });

    // ── DESPESAS (valores negativos) ──
    const overdueOutTotal = sumMap(overdueOut);
    const despesasDailyTotals = days.map(d => -dayTotal(d.getDate(), dailyOut));
    addDataRow('DESPESAS', -overdueOutTotal, despesasDailyTotals);

    outflowCats.forEach(catId => {
      const dailyVals = days.map(d => -dayCatTotal(d.getDate(), catId, dailyOut));
      addDataRow(`  ${catName(catId)}`, -(overdueOut.get(catId) || 0), dailyVals);
    });

    // ── RESULTADO ──
    const resultadoOverdue = overdueInTotal - overdueOutTotal;
    const resultadoDailyVals = days.map(d => {
      const day = d.getDate();
      return dayTotal(day, dailyIn) - dayTotal(day, dailyOut);
    });
    addDataRow('RESULTADO', resultadoOverdue, resultadoDailyVals);

    // ── RESULTADO ACUMULADO ──
    const acumuladoDailyVals = days.map(d => {
      const day = d.getDate();
      return dailyOpenBalances[day] + dayTotal(day, dailyIn) - dayTotal(day, dailyOut);
    });
    addDataRow('RESULTADO ACUMULADO', 0, acumuladoDailyVals);

    // ── LIMITE DISPONÍVEL ──
    addDataRow('LIMITE DISPONÍVEL', 0, acumuladoDailyVals);

    // ── Gerar worksheet via AOA ─────────────────────────────────────────
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(aoa);

    // Merge do título (linha 0, colunas 0..totalCols-1)
    ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: totalCols - 1 } }];

    // Largura das colunas
    const colWidths: { wch: number }[] = [{ wch: 30 }, { wch: 16 }];
    for (let i = 0; i < daysInMonth; i++) colWidths.push({ wch: 14 });
    ws['!cols'] = colWidths;

    // Formatar números como moeda BR (2 decimais) nas células de dados (linhas 3+)
    const numFmt = '#.##0,00;-#.##0,00;0,00';
    for (let r = 3; r < aoa.length; r++) {
      for (let c = 1; c < totalCols; c++) {
        const cellRef = XLSX.utils.encode_cell({ r, c });
        if (ws[cellRef] && typeof ws[cellRef].v === 'number') {
          ws[cellRef].z = numFmt;
        }
      }
    }

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Fluxo_de_Caixa');

    XLSX.writeFile(wb, `Fluxo_de_Caixa_${year}_${pad(month + 1)}.xlsx`);
    this.closeExportModal();
    this.toast.show('Exportação concluída.', 'success');
  }
}
