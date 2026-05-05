import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CashFlowFacade } from '../../../application/cash-flow.facade';
import { CategoriesFacade } from '../../../../categories/application/categories.facade';
import { ToastService } from '../../../../../shared/components/toast/toast.service';
import { Movement, MovementType } from '../../../domain/entities/movement.entity';

import { PageHeaderComponent } from '../../../../../shared/components/page-header/page-header.component';
import { StatCardComponent } from '../../../../../shared/components/stat-card/stat-card.component';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';
import { BadgeComponent } from '../../../../../shared/components/badge/badge.component';
import { ModalComponent } from '../../../../../shared/components/modal/modal.component';
import { SelectComponent } from '../../../../../shared/components/select/select.component';
import { EmptyStateComponent } from '../../../../../shared/components/empty-state/empty-state.component';
import { LoadingStateComponent } from '../../../../../shared/components/loading-state/loading-state.component';
import { BrlCurrencyPipe } from '../../../../../shared/pipes/brl-currency.pipe';
import { MovementFormComponent } from '../../components/movement-form/movement-form.component';

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
        <tc-button variant="primary" (clicked)="openCreateModal()">+ Nova movimentação</tc-button>
      </tc-page-header>

      <!-- KPIs -->
      <div class="kpis-grid">
        <tc-stat-card
          label="Entradas no período"
          [value]="totalEntradas() | brlCurrency"
          tone="success"
          hint="Soma das entradas efetivadas"
        ></tc-stat-card>
        <tc-stat-card
          label="Saídas no período"
          [value]="totalSaidas() | brlCurrency"
          tone="danger"
          hint="Soma das saídas efetivadas"
        ></tc-stat-card>
        <tc-stat-card
          label="Saldo atual"
          [value]="cashFlowFacade.currentBalance() | brlCurrency"
          [tone]="cashFlowFacade.currentBalance() >= 0 ? 'success' : 'danger'"
          hint="Entradas − Saídas"
        ></tc-stat-card>
      </div>

      <!-- Filtros -->
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
          [(ngModel)]="activeCategoryId"
        ></tc-select>
      </div>

      <!-- Lista -->
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
        <!-- Desktop table -->
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

        <!-- Mobile cards -->
        <div class="mobile-cards mobile-only">
          @for (m of filteredMovements(); track m.id) {
            <div class="movement-card">
              <div class="movement-card-header">
                <div>
                  <span class="movement-description">{{ m.description }}</span>
                  <span class="movement-date text-secondary">{{ m.date | date:'dd/MM/yyyy' }}</span>
                </div>
                <span class="movement-amount" [class.amount-entrada]="m.type === 'ENTRADA'" [class.amount-saida]="m.type === 'SAIDA'">
                  {{ m.type === 'ENTRADA' ? '+' : '-' }}{{ m.amount | brlCurrency }}
                </span>
              </div>
              <div class="movement-card-footer">
                <tc-badge tone="neutral">{{ getCategoryName(m.categoryId) }}</tc-badge>
                <tc-badge [tone]="m.type === 'ENTRADA' ? 'success' : 'danger'">
                  {{ m.type === 'ENTRADA' ? 'Entrada' : 'Saída' }}
                </tc-badge>
                <div class="actions-cell">
                  <tc-button variant="secondary" size="sm" (clicked)="openEditModal(m)">Editar</tc-button>
                  <tc-button variant="danger" size="sm" (clicked)="openDeleteModal(m)">Excluir</tc-button>
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>

    <!-- Modal: Criar / Editar -->
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

    <!-- Modal: Confirmar exclusão -->
    <tc-modal
      [open]="isDeleteModalOpen()"
      title="Confirmar exclusão"
      (close)="closeDeleteModal()"
    >
      <p class="body-md" style="margin-bottom: var(--space-5);">
        Tem certeza que deseja excluir a movimentação <strong>{{ movementToDelete()?.description }}</strong>?
      </p>
      <div class="modal-actions">
        <tc-button variant="ghost" (clicked)="closeDeleteModal()">Cancelar</tc-button>
        <tc-button variant="danger" [loading]="cashFlowFacade.loading()" (clicked)="confirmDelete()">Excluir</tc-button>
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
      .kpis-grid { grid-template-columns: 1fr; }
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
    .filter-tab:hover { color: var(--color-accent-500); }
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
    ::ng-deep .filter-select select {
      padding: var(--space-2) var(--space-3) !important;
      border-color: var(--color-border-card) !important;
      background: var(--color-bg-card) !important;
      box-shadow: none !important;
      font-size: var(--font-size-sm) !important;
      height: 38px;
    }

    /* Table */
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
    .tc-table { width: 100%; border-collapse: collapse; text-align: left; min-width: 600px; }
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
    .amount-saida  { color: var(--color-danger-500); }
    .actions-cell { display: flex; gap: var(--space-2); justify-content: center; }
    .truncate-cell {
      max-width: 200px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* Mobile cards */
    .movement-card {
      background: var(--color-bg-card);
      border: 1px solid var(--color-border-card);
      border-radius: var(--radius-lg);
      padding: var(--space-4);
      margin-bottom: var(--space-3);
      box-shadow: var(--shadow-card);
      transition: all 0.25s var(--motion-spring);
    }
    .movement-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-glow-accent); border-color: rgba(47,128,237,0.18); }
    .movement-card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: var(--space-3); }
    .movement-description { display: block; font-weight: 500; font-size: var(--font-size-sm); }
    .movement-date { display: block; font-size: var(--font-size-xs); color: var(--color-text-secondary); margin-top: var(--space-1); }
    .movement-amount { font-weight: 700; font-size: var(--font-size-md); font-family: var(--font-family-display); }
    .movement-card-footer { display: flex; gap: var(--space-2); align-items: center; flex-wrap: wrap; }

    /* Responsive visibility */
    .desktop-only { display: block; }
    .mobile-only { display: none; }
    @media (max-width: 768px) {
      .desktop-only { display: none; }
      .mobile-only { display: block; }
      .filter-select { margin-left: 0; width: 100%; min-width: 100%; }
    }

    .modal-actions { display: flex; justify-content: flex-end; gap: var(--space-3); }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CashFlowPageComponent implements OnInit {
  readonly cashFlowFacade = inject(CashFlowFacade);
  readonly categoriesFacade = inject(CategoriesFacade);
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

  readonly categoryOptions = computed(() => {
    return [
      { label: 'Todas as categorias', value: '' },
      ...this.categoriesFacade.categories().map(c => ({ label: c.name, value: c.id }))
    ];
  });

  readonly filteredMovements = computed(() => {
    return this.cashFlowFacade.movements()
      .filter(m => this.activeType() === 'ALL' || m.type === this.activeType())
      .filter(m => !this.activeCategoryId || m.categoryId === this.activeCategoryId)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  });

  readonly totalEntradas = computed(() =>
    this.cashFlowFacade.movements()
      .filter(m => m.type === 'ENTRADA')
      .reduce((acc, m) => acc + m.amount, 0)
  );

  readonly totalSaidas = computed(() =>
    this.cashFlowFacade.movements()
      .filter(m => m.type === 'SAIDA')
      .reduce((acc, m) => acc + m.amount, 0)
  );

  async ngOnInit() {
    await Promise.all([
      this.cashFlowFacade.load(),
      this.categoriesFacade.load(),
    ]);
  }

  getCategoryName(categoryId: string): string {
    return this.categoriesFacade.categories().find(c => c.id === categoryId)?.name ?? '—';
  }

  openCreateModal() {
    this.movementToEdit.set(null);
    this.isFormModalOpen.set(true);
  }

  openEditModal(movement: Movement) {
    this.movementToEdit.set(movement);
    this.isFormModalOpen.set(true);
  }

  closeFormModal() {
    this.isFormModalOpen.set(false);
    this.movementToEdit.set(null);
  }

  onSaved() {
    this.closeFormModal();
    this.toast.show('Movimentação salva com sucesso!', 'success');
  }

  openDeleteModal(movement: Movement) {
    this.movementToDelete.set(movement);
    this.isDeleteModalOpen.set(true);
  }

  closeDeleteModal() {
    this.isDeleteModalOpen.set(false);
    this.movementToDelete.set(null);
  }

  async confirmDelete() {
    const m = this.movementToDelete();
    if (!m) return;
    try {
      await this.cashFlowFacade.remove(m.id);
      this.toast.show('Movimentação excluída.', 'success');
      this.closeDeleteModal();
    } catch {
      this.toast.show('Erro ao excluir movimentação.', 'error');
    }
  }
}
