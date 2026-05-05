import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { differenceInDays } from 'date-fns';

import { AccountsPayableFacade } from '../../../application/accounts-payable.facade';
import { CashFlowFacade } from '../../../../cash-flow/application/cash-flow.facade';
import { CategoriesFacade } from '../../../../categories/application/categories.facade';
import { ToastService } from '../../../../../shared/components/toast/toast.service';
import { PayableAccount, PayableStatus, RecurrenceFrequency } from '../../../domain/entities/payable-account.entity';

import { PageHeaderComponent } from '../../../../../shared/components/page-header/page-header.component';
import { StatCardComponent } from '../../../../../shared/components/stat-card/stat-card.component';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';
import { BadgeComponent } from '../../../../../shared/components/badge/badge.component';
import { ModalComponent } from '../../../../../shared/components/modal/modal.component';
import { InputComponent } from '../../../../../shared/components/input/input.component';
import { SelectComponent } from '../../../../../shared/components/select/select.component';
import { MoneyInputComponent } from '../../../../../shared/components/money-input/money-input.component';
import { DateInputComponent } from '../../../../../shared/components/date-input/date-input.component';
import { EmptyStateComponent } from '../../../../../shared/components/empty-state/empty-state.component';
import { LoadingStateComponent } from '../../../../../shared/components/loading-state/loading-state.component';
import { BrlCurrencyPipe } from '../../../../../shared/pipes/brl-currency.pipe';

type StatusFilter = 'TODAS' | PayableStatus;

@Component({
  selector: 'tc-accounts-payable-page',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    ReactiveFormsModule,
    PageHeaderComponent,
    StatCardComponent,
    ButtonComponent,
    BadgeComponent,
    ModalComponent,
    InputComponent,
    SelectComponent,
    MoneyInputComponent,
    DateInputComponent,
    EmptyStateComponent,
    LoadingStateComponent,
    BrlCurrencyPipe,
  ],
  template: `
    <div class="ap-page">
      <tc-page-header title="Contas a Pagar">
        <tc-button variant="primary" (clicked)="openCreateModal()">+ Nova Conta</tc-button>
      </tc-page-header>

      <!-- KPIs -->
      <div class="kpis-grid">
        <tc-stat-card
          label="Total a pagar no mês"
          [value]="totalMes() | brlCurrency"
          tone="warning"
          hint="Contas pendentes e atrasadas"
        ></tc-stat-card>
        <tc-stat-card
          label="Vencendo em 7 dias"
          [value]="vencendo7d() | brlCurrency"
          tone="warning"
          hint="Pendentes com vencimento em até 7 dias"
        ></tc-stat-card>
        <tc-stat-card
          label="Atrasadas"
          [value]="totalAtrasadas() | brlCurrency"
          tone="danger"
          hint="Contas com vencimento passado"
        ></tc-stat-card>
      </div>


      <!-- Tabs de status -->
      <div class="tabs-bar">
        @for (tab of tabs; track tab.value) {
          <button
            class="tab-btn"
            [class.active]="activeTab() === tab.value"
            (click)="activeTab.set(tab.value)"
          >{{ tab.label }}</button>
        }
      </div>

      <!-- Lista -->
      @if (facade.loading()) {
        <tc-loading-state message="Carregando contas..."></tc-loading-state>
      } @else if (filteredPayables().length === 0) {
        <tc-empty-state
          title="Nenhuma conta encontrada"
          message="Adicione uma conta a pagar para começar."
        >
          <tc-button variant="primary" (clicked)="openCreateModal()">+ Nova Conta</tc-button>
        </tc-empty-state>
      } @else {
        <!-- Desktop table -->
        <div class="table-wrapper desktop-only">
          <table class="tc-table">
            <thead>
              <tr>
                <th>Descrição</th>
                <th class="text-center">Categoria</th>
                <th class="text-center">Vencimento</th>
                <th class="text-center">Recorrência</th>
                <th class="text-center">Status</th>
                <th class="text-right">Valor</th>
                <th class="text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              @for (p of filteredPayables(); track p.id) {
                <tr [class.row-overdue]="p.status === 'ATRASADA'">
                  <td class="truncate-cell" [title]="p.description">{{ p.description }}</td>
                  <td class="text-center"><tc-badge tone="neutral">{{ getCategoryName(p.categoryId) }}</tc-badge></td>
                  <td class="text-center">
                    <span [class]="getDueDateClass(p)">{{ p.dueDate | date:'dd/MM/yyyy' }}</span>
                    <span class="due-pill" [class]="getDuePillClass(p)">{{ getDuePillText(p) }}</span>
                  </td>
                  <td class="text-center">
                    @if (p.recurrence !== 'NONE') {
                      <tc-badge tone="info">{{ getRecurrenceLabel(p.recurrence) }}</tc-badge>
                    } @else {
                      <span class="text-secondary">—</span>
                    }
                  </td>
                  <td class="text-center"><tc-badge [tone]="getStatusTone(p.status)">{{ p.status }}</tc-badge></td>
                  <td class="text-right amount">{{ p.amount | brlCurrency }}</td>
                  <td class="text-center">
                    <div class="actions-cell">
                      @if (p.status === 'PENDENTE' || p.status === 'ATRASADA') {
                        <tc-button variant="primary" size="sm" (clicked)="openPayModal(p)">Pagar</tc-button>
                      }
                      <tc-button variant="secondary" size="sm" (clicked)="openEditModal(p)">Editar</tc-button>
                      @if (p.status !== 'CANCELADA' && p.status !== 'PAGA') {
                        <tc-button variant="danger" size="sm" (clicked)="openCancelModal(p)">Cancelar</tc-button>
                      }
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Mobile cards -->
        <div class="mobile-cards mobile-only">
          @for (p of filteredPayables(); track p.id) {
            <div class="payable-card" [class.card-overdue]="p.status === 'ATRASADA'">
              <div class="card-row">
                <div>
                  <span class="card-description">{{ p.description }}</span>
                  <div class="card-meta">
                    <tc-badge tone="neutral">{{ getCategoryName(p.categoryId) }}</tc-badge>
                    @if (p.recurrence !== 'NONE') {
                      <tc-badge tone="info">{{ getRecurrenceLabel(p.recurrence) }}</tc-badge>
                    }
                  </div>
                </div>
                <span class="card-amount">{{ p.amount | brlCurrency }}</span>
              </div>
              <div class="card-row card-footer">
                <div class="card-due">
                  <span [class]="getDueDateClass(p)">{{ p.dueDate | date:'dd/MM/yyyy' }}</span>
                  <span class="due-pill" [class]="getDuePillClass(p)">{{ getDuePillText(p) }}</span>
                </div>
                <tc-badge [tone]="getStatusTone(p.status)">{{ p.status }}</tc-badge>
              </div>
              <div class="card-actions">
                @if (p.status === 'PENDENTE' || p.status === 'ATRASADA') {
                  <tc-button variant="primary" size="sm" (clicked)="openPayModal(p)">Pagar</tc-button>
                }
                <tc-button variant="secondary" size="sm" (clicked)="openEditModal(p)">Editar</tc-button>
                @if (p.status !== 'CANCELADA' && p.status !== 'PAGA') {
                  <tc-button variant="danger" size="sm" (clicked)="openCancelModal(p)">Cancelar</tc-button>
                }
              </div>
            </div>
          }
        </div>
      }


    </div>

    <!-- Modal: Criar / Editar conta -->
    <tc-modal
      [open]="isFormModalOpen()"
      [title]="payableToEdit() ? 'Editar Conta' : 'Nova Conta'"
      (close)="closeFormModal()"
    >
      <form [formGroup]="payableForm" (ngSubmit)="savePayable()">
        <tc-input formControlName="description" label="Descrição" [error]="getFormError('description')"></tc-input>
        <tc-money-input formControlName="amount" label="Valor" [error]="getFormError('amount')"></tc-money-input>
        <tc-date-input formControlName="dueDate" label="Vencimento" [error]="getFormError('dueDate')"></tc-date-input>
        <tc-select
          formControlName="categoryId"
          label="Categoria"
          [options]="categoryOptions()"
          [error]="getFormError('categoryId')"
        ></tc-select>
        <tc-select
          formControlName="recurrence"
          label="Recorrência"
          [options]="recurrenceOptions"
        ></tc-select>
        <div class="modal-actions" style="margin-top: var(--space-5);">
          <tc-button type="button" variant="ghost" (clicked)="closeFormModal()">Cancelar</tc-button>
          <tc-button type="submit" variant="primary" [loading]="facade.loading()" [disabled]="payableForm.invalid">Salvar</tc-button>
        </div>
      </form>
    </tc-modal>

    <!-- Modal: Pagar conta -->
    <tc-modal
      [open]="isPayModalOpen()"
      title="Confirmar pagamento"
      (close)="closePayModal()"
    >
      @if (payableToPay()) {
        <p class="body-md">
          Confirmar pagamento de <strong>{{ payableToPay()!.description }}</strong>
          no valor de <strong>{{ payableToPay()!.amount | brlCurrency }}</strong>?
        </p>
        <p class="body-sm text-secondary" style="margin-top: var(--space-2); margin-bottom: var(--space-5);">
          Uma movimentação de saída será criada no Caixa e o saldo será atualizado.
        </p>
        <div class="modal-actions">
          <tc-button variant="ghost" (clicked)="closePayModal()">Cancelar</tc-button>
          <tc-button variant="primary" [loading]="facade.loading()" (clicked)="confirmPay()">Confirmar pagamento</tc-button>
        </div>
      }
    </tc-modal>

    <!-- Modal: Cancelar conta -->
    <tc-modal
      [open]="isCancelModalOpen()"
      title="Cancelar conta"
      (close)="closeCancelModal()"
    >
      @if (payableToCancel()) {
        <p class="body-md" style="margin-bottom: var(--space-5);">
          Tem certeza que deseja cancelar a conta <strong>{{ payableToCancel()!.description }}</strong>?
        </p>
        <div class="modal-actions">
          <tc-button variant="ghost" (clicked)="closeCancelModal()">Voltar</tc-button>
          <tc-button variant="danger" [loading]="facade.loading()" (clicked)="confirmCancel()">Sim, cancelar</tc-button>
        </div>
      }
    </tc-modal>
  `,
  styles: [`
    .ap-page {
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
    @media (max-width: 768px) { .kpis-grid { grid-template-columns: 1fr; } }

    .tabs-bar {
      display: flex;
      gap: var(--space-1);
      margin-bottom: var(--space-4);
      border-bottom: 2px solid var(--color-border-card);
      overflow-x: auto;
      scrollbar-width: none;
      -ms-overflow-style: none;
    }
    .tabs-bar::-webkit-scrollbar { display: none; }
    .tab-btn {
      padding: var(--space-3) var(--space-4);
      border: none;
      background: transparent;
      cursor: pointer;
      font-size: var(--font-size-sm);
      font-weight: 500;
      color: var(--color-text-secondary);
      border-bottom: 2px solid transparent;
      margin-bottom: -2px;
      white-space: nowrap;
      transition: color var(--motion-fast), border-color var(--motion-fast);
    }
    .tab-btn:hover { color: var(--color-accent-500); }
    .tab-btn.active {
      color: var(--color-accent-500);
      border-bottom-color: var(--color-accent-500);
      font-weight: 600;
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
    .tc-table { width: 100%; border-collapse: collapse; text-align: left; min-width: 700px; }
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
    .row-overdue td:first-child { border-left: 3px solid var(--color-danger-500) !important; }
    .row-overdue { background: rgba(220,38,38,0.02) !important; }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .text-secondary { color: var(--color-text-secondary); font-size: var(--font-size-xs); }
    .amount { font-weight: 700; font-family: var(--font-family-display); }
    .actions-cell { display: flex; gap: var(--space-2); flex-wrap: wrap; justify-content: center; }
    /* Truncamento com tooltip nativo */
    .truncate-cell {
      max-width: 200px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* Due date pills */
    .due-pill {
      display: inline-block;
      margin-left: var(--space-2);
      padding: 3px 8px;
      border-radius: var(--radius-full);
      font-size: var(--font-size-xs);
      font-weight: 600;
    }
    .due-overdue { color: var(--color-danger-500); font-weight: 700; }
    .due-urgent  { color: var(--color-warning-500); }
    .due-normal  { color: var(--color-text-secondary); }
    .pill-danger  { background: var(--color-danger-50);  color: var(--color-danger-500);  border: 1px solid rgba(220,38,38,0.2); }
    .pill-warning { background: var(--color-warning-50); color: var(--color-warning-500); border: 1px solid rgba(245,158,11,0.2); }
    .pill-neutral { background: var(--color-background); color: var(--color-text-secondary); border: 1px solid var(--color-border-card); }

    /* Mobile cards */
    .payable-card {
      background: var(--color-bg-card);
      border: 1px solid var(--color-border-card);
      border-radius: var(--radius-lg);
      padding: var(--space-4);
      margin-bottom: var(--space-3);
      box-shadow: var(--shadow-card);
      transition: all 0.25s var(--motion-spring);
    }
    .payable-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-glow-accent); border-color: rgba(47,128,237,0.18); }
    .card-overdue { border-left: 3px solid var(--color-danger-500); background: rgba(220,38,38,0.02); }
    .card-overdue:hover { box-shadow: var(--shadow-glow-danger) !important; border-color: rgba(220,38,38,0.3) !important; }
    .card-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: var(--space-3); }
    .card-footer { align-items: center; }
    .card-description { display: block; font-weight: 500; font-size: var(--font-size-sm); margin-bottom: var(--space-2); }
    .card-meta { display: flex; gap: var(--space-2); flex-wrap: wrap; }
    .card-amount { font-weight: 700; font-size: var(--font-size-md); font-family: var(--font-family-display); }
    .card-due { display: flex; align-items: center; gap: var(--space-2); font-size: var(--font-size-xs); }
    .card-actions { display: flex; gap: var(--space-2); flex-wrap: wrap; margin-top: var(--space-3); }

    /* Responsive */
    .desktop-only { display: block; }
    .mobile-only { display: none; }
    @media (max-width: 768px) {
      .desktop-only { display: none; }
      .mobile-only { display: block; }
    }

    .modal-actions { display: flex; justify-content: flex-end; gap: var(--space-3); }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountsPayablePageComponent implements OnInit {
  readonly facade = inject(AccountsPayableFacade);
  private readonly cashFlowFacade = inject(CashFlowFacade);
  readonly categoriesFacade = inject(CategoriesFacade);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  readonly activeTab = signal<StatusFilter>('TODAS');

  readonly isFormModalOpen = signal(false);
  readonly isPayModalOpen = signal(false);
  readonly isCancelModalOpen = signal(false);
  readonly payableToEdit = signal<PayableAccount | null>(null);
  readonly payableToPay = signal<PayableAccount | null>(null);
  readonly payableToCancel = signal<PayableAccount | null>(null);

  readonly tabs: { label: string; value: StatusFilter }[] = [
    { label: 'Todas', value: 'TODAS' },
    { label: 'Pendentes', value: 'PENDENTE' },
    { label: 'Atrasadas', value: 'ATRASADA' },
    { label: 'Pagas', value: 'PAGA' },
    { label: 'Canceladas', value: 'CANCELADA' },
  ];

  readonly recurrenceOptions: { label: string; value: RecurrenceFrequency }[] = [
    { label: 'Não recorrente', value: 'NONE' },
    { label: 'Semanal', value: 'WEEKLY' },
    { label: 'Mensal', value: 'MONTHLY' },
    { label: 'Anual', value: 'YEARLY' },
  ];

  payableForm = this.fb.group({
    description: ['', Validators.required],
    amount: [0, [Validators.required, Validators.min(0.01)]],
    dueDate: [new Date(), Validators.required],
    categoryId: ['', Validators.required],
    recurrence: this.fb.control<RecurrenceFrequency>('NONE'),
  });

  readonly filteredPayables = computed(() =>
    this.facade.payables()
      .filter(p => this.activeTab() === 'TODAS' || p.status === this.activeTab())
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
  );

  readonly totalMes = computed(() =>
    this.facade.payables()
      .filter(p => p.status === 'PENDENTE' || p.status === 'ATRASADA')
      .reduce((acc, p) => acc + p.amount, 0)
  );

  readonly vencendo7d = computed(() => {
    const now = new Date();
    return this.facade.payables()
      .filter(p => p.status === 'PENDENTE' && differenceInDays(p.dueDate, now) <= 7 && differenceInDays(p.dueDate, now) >= 0)
      .reduce((acc, p) => acc + p.amount, 0);
  });

  readonly totalAtrasadas = computed(() =>
    this.facade.overdue().reduce((acc, p) => acc + p.amount, 0)
  );

  readonly categoryOptions = computed(() =>
    this.categoriesFacade.categories().map(c => ({ label: c.name, value: c.id }))
  );

  async ngOnInit() {
    await Promise.all([
      this.facade.load(),
      this.cashFlowFacade.load(),
      this.categoriesFacade.load(),
    ]);
  }

  getCategoryName(id: string): string {
    return this.categoriesFacade.categories().find(c => c.id === id)?.name ?? '—';
  }

  getStatusTone(status: PayableStatus): 'success' | 'warning' | 'danger' | 'neutral' {
    switch (status) {
      case 'PAGA': return 'success';
      case 'PENDENTE': return 'warning';
      case 'ATRASADA': return 'danger';
      case 'CANCELADA': return 'neutral';
    }
  }

  getRecurrenceLabel(r: RecurrenceFrequency): string {
    switch (r) {
      case 'WEEKLY': return 'Semanal';
      case 'MONTHLY': return 'Mensal';
      case 'YEARLY': return 'Anual';
      default: return '—';
    }
  }

  getDuePillText(p: PayableAccount): string {
    if (p.status === 'PAGA' || p.status === 'CANCELADA') return '';
    const diff = differenceInDays(p.dueDate, new Date());
    if (diff < 0) return `Atrasada ${Math.abs(diff)}d`;
    if (diff === 0) return 'Vence hoje';
    return `Vence em ${diff}d`;
  }

  getDuePillClass(p: PayableAccount): string {
    if (p.status === 'PAGA' || p.status === 'CANCELADA') return '';
    const diff = differenceInDays(p.dueDate, new Date());
    if (diff < 0) return 'pill-danger';
    if (diff <= 2) return 'pill-danger';
    if (diff <= 7) return 'pill-warning';
    return 'pill-neutral';
  }

  getDueDateClass(p: PayableAccount): string {
    if (p.status === 'ATRASADA') return 'due-overdue';
    const diff = differenceInDays(p.dueDate, new Date());
    if (diff <= 2) return 'due-urgent';
    return 'due-normal';
  }

  getFormError(field: string): string | undefined {
    const control = this.payableForm.get(field);
    if (control?.touched && control?.invalid) {
      if (control.errors?.['required']) return 'Campo obrigatório';
      if (control.errors?.['min']) return 'Valor deve ser maior que zero';
    }
    return undefined;
  }

  openCreateModal() {
    this.payableToEdit.set(null);
    this.payableForm.reset({
      description: '',
      amount: 0,
      dueDate: new Date(),
      categoryId: '',
      recurrence: 'NONE',
    });
    this.isFormModalOpen.set(true);
  }

  openEditModal(p: PayableAccount) {
    this.payableToEdit.set(p);
    this.payableForm.patchValue({
      description: p.description,
      amount: p.amount,
      dueDate: p.dueDate,
      categoryId: p.categoryId,
      recurrence: p.recurrence,
    });
    this.isFormModalOpen.set(true);
  }

  closeFormModal() {
    this.isFormModalOpen.set(false);
    this.payableToEdit.set(null);
  }

  async savePayable() {
    if (this.payableForm.invalid) {
      this.payableForm.markAllAsTouched();
      return;
    }
    const val = this.payableForm.value;
    const data = {
      description: val.description as string,
      amount: val.amount as number,
      dueDate: val.dueDate as Date,
      categoryId: val.categoryId as string,
      recurrence: (val.recurrence ?? 'NONE') as RecurrenceFrequency,
      status: 'PENDENTE' as const,
    };

    try {
      const editItem = this.payableToEdit();
      if (editItem) {
        await this.facade.update(editItem.id, data);
        this.toast.show('Conta atualizada.', 'success');
      } else {
        await this.facade.create(data);
        this.toast.show('Conta criada.', 'success');
      }
      this.closeFormModal();
    } catch {
      this.toast.show('Erro ao salvar conta.', 'error');
    }
  }

  openPayModal(p: PayableAccount) {
    this.payableToPay.set(p);
    this.isPayModalOpen.set(true);
  }

  closePayModal() {
    this.isPayModalOpen.set(false);
    this.payableToPay.set(null);
  }

  async confirmPay() {
    const p = this.payableToPay();
    if (!p) return;
    try {
      await this.facade.pay(p.id);
      this.toast.show('Conta paga. Saldo atualizado.', 'success');
      this.closePayModal();
    } catch {
      this.toast.show('Erro ao pagar conta.', 'error');
    }
  }

  openCancelModal(p: PayableAccount) {
    this.payableToCancel.set(p);
    this.isCancelModalOpen.set(true);
  }

  closeCancelModal() {
    this.isCancelModalOpen.set(false);
    this.payableToCancel.set(null);
  }

  async confirmCancel() {
    const p = this.payableToCancel();
    if (!p) return;
    try {
      await this.facade.cancel(p.id);
      this.toast.show('Conta cancelada.', 'success');
      this.closeCancelModal();
    } catch {
      this.toast.show('Erro ao cancelar conta.', 'error');
    }
  }
}
