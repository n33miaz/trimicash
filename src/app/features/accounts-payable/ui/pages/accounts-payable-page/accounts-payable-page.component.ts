import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { differenceInDays } from 'date-fns';
import { Router } from '@angular/router';
import { CashFlowFacade } from '../../../../cash-flow/application/cash-flow.facade';
import { CategoriesFacade } from '../../../../categories/application/categories.facade';
import { AccountsPayableFacade } from '../../../application/accounts-payable.facade';
import { PayableAccount, PayableStatus, RecurrenceFrequency } from '../../../domain/entities/payable-account.entity';
import { BadgeComponent } from '../../../../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';
import { DateInputComponent } from '../../../../../shared/components/date-input/date-input.component';
import { EmptyStateComponent } from '../../../../../shared/components/empty-state/empty-state.component';
import { InputComponent } from '../../../../../shared/components/input/input.component';
import { LoadingStateComponent } from '../../../../../shared/components/loading-state/loading-state.component';
import { ModalComponent } from '../../../../../shared/components/modal/modal.component';
import { MoneyInputComponent } from '../../../../../shared/components/money-input/money-input.component';
import { PageHeaderComponent } from '../../../../../shared/components/page-header/page-header.component';
import { SelectComponent } from '../../../../../shared/components/select/select.component';
import { StatCardComponent } from '../../../../../shared/components/stat-card/stat-card.component';
import { ToastService } from '../../../../../shared/components/toast/toast.service';
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
        <div class="page-header-action">
          <tc-button variant="primary" (clicked)="openCreateModal()">+ Nova Conta</tc-button>
        </div>
      </tc-page-header>

      <div class="kpis-grid">
        <tc-stat-card
          label="Total a pagar"
          [value]="totalMes() | brlCurrency"
          tone="warning"
          hint="Último mês"
        ></tc-stat-card>
        <tc-stat-card
          label="Vencendo"
          [value]="vencendo7d() | brlCurrency"
          tone="warning"
          hint="em até 7 dias"
        ></tc-stat-card>
        <tc-stat-card
          label="Atrasadas"
          [value]="totalAtrasadas() | brlCurrency"
          tone="danger"
          hint="Contas com vencimento passado"
        ></tc-stat-card>
      </div>

      <div class="tabs-bar">
        @for (tab of tabs; track tab.value) {
          <button
            class="tab-btn"
            [class.active]="activeTab() === tab.value"
            (click)="activeTab.set(tab.value)"
          >{{ tab.label }}</button>
        }
      </div>

      @if (facade.loading()) {
        <tc-loading-state message="Carregando contas..."></tc-loading-state>
      } @else if (filteredPayables().length === 0) {
        <tc-empty-state
          title="Nenhuma conta encontrada"
          message="Adicione uma conta a pagar para comecar."
        >
          <tc-button variant="primary" (clicked)="openCreateModal()">+ Nova Conta</tc-button>
        </tc-empty-state>
      } @else {
        <div class="table-wrapper desktop-only">
          <table class="tc-table">
            <thead>
              <tr>
                <th>Descricao</th>
                <th class="text-center">Categoria</th>
                <th class="text-center">Vencimento</th>
                <th class="text-center">Recorrencia</th>
                <th class="text-center">Status</th>
                <th class="text-right">Valor</th>
                <th class="text-center">Acoes</th>
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
                      <span class="text-secondary">-</span>
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

        <div class="mobile-cards mobile-only">
          @for (p of filteredPayables(); track p.id) {
            <div class="payable-card" [class.card-overdue]="p.status === 'ATRASADA'">
              <div class="card-row card-title-row">
                <span class="card-description">{{ p.description }}</span>
                <span class="card-amount">{{ p.amount | brlCurrency }}</span>
              </div>

              <div class="card-row card-status-row">
                <tc-badge [tone]="getStatusTone(p.status)">{{ p.status }}</tc-badge>
                <span [class]="getDueDateClass(p)">{{ p.dueDate | date:'dd/MM/yyyy' }}</span>
              </div>

              <div class="card-row card-meta-row">
                <div class="card-meta">
                  <tc-badge tone="neutral">{{ getCategoryName(p.categoryId) }}</tc-badge>
                  @if (p.recurrence !== 'NONE') {
                    <tc-badge tone="info">{{ getRecurrenceLabel(p.recurrence) }}</tc-badge>
                  }
                </div>
                @if (getDuePillText(p)) {
                  <span class="due-pill" [class]="getDuePillClass(p)">{{ getDuePillText(p) }}</span>
                }
              </div>

              <div class="card-actions">
                @if (p.status === 'PENDENTE' || p.status === 'ATRASADA') {
                  <tc-button variant="primary" size="sm" [block]="true" (clicked)="openPayModal(p)">Pagar</tc-button>
                }
                <div class="secondary-actions">
                  <tc-button variant="secondary" size="sm" [block]="true" (clicked)="openEditModal(p)">Editar</tc-button>
                  @if (p.status !== 'CANCELADA' && p.status !== 'PAGA') {
                    <tc-button variant="danger" size="sm" [block]="true" (clicked)="openCancelModal(p)">Cancelar</tc-button>
                  }
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>

    <tc-modal
      [open]="isFormModalOpen()"
      [title]="payableToEdit() ? 'Editar Conta' : 'Nova Conta'"
      (close)="closeFormModal()"
    >
      @if (!hasCategories()) {
        <div class="blocked-form-state">
          <div class="blocked-form-icon" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 7h18"></path>
              <path d="M6 12h12"></path>
              <path d="M9 17h6"></path>
            </svg>
          </div>
          <h3>Cadastre uma categoria primeiro</h3>
          <p>Para criar uma conta a pagar, voce precisa ter pelo menos uma categoria disponivel em Configuracoes.</p>
          <div class="modal-actions blocked-form-actions">
            <tc-button type="button" variant="ghost" [block]="true" (clicked)="closeFormModal()">Cancelar</tc-button>
            <tc-button type="button" variant="primary" [block]="true" (clicked)="goToSettings()">Ir para Configuracoes</tc-button>
          </div>
        </div>
      } @else {
        <form [formGroup]="payableForm" (ngSubmit)="savePayable()">
          <tc-input formControlName="description" label="Descricao" [error]="getFormError('description')"></tc-input>
          <tc-money-input formControlName="amount" label="Valor" [error]="getFormError('amount')"></tc-money-input>
          <tc-date-input formControlName="dueDate" label="Vencimento" [error]="getFormError('dueDate')"></tc-date-input>
          <tc-select
            formControlName="categoryId"
            label="Categoria"
            [options]="categoryOptions()"
            [fullWidth]="true"
            [error]="getFormError('categoryId')"
          ></tc-select>
          <tc-select
            formControlName="recurrence"
            label="Recorrencia"
            [options]="recurrenceOptions"
            [fullWidth]="true"
          ></tc-select>
          <div class="modal-actions" style="margin-top: var(--space-5);">
            <tc-button type="button" variant="ghost" [block]="true" (clicked)="closeFormModal()">Cancelar</tc-button>
            <tc-button type="submit" variant="primary" [block]="true" [loading]="facade.loading()" [disabled]="payableForm.invalid">Salvar</tc-button>
          </div>
        </form>
      }
    </tc-modal>

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
          Uma movimentacao de saida sera criada no Caixa e o saldo sera atualizado.
        </p>
        <div class="modal-actions">
          <tc-button variant="ghost" [block]="true" (clicked)="closePayModal()">Cancelar</tc-button>
          <tc-button variant="primary" [block]="true" [loading]="facade.loading()" (clicked)="confirmPay()">Confirmar pagamento</tc-button>
        </div>
      }
    </tc-modal>

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
          <tc-button variant="ghost" [block]="true" (clicked)="closeCancelModal()">Voltar</tc-button>
          <tc-button variant="danger" [block]="true" [loading]="facade.loading()" (clicked)="confirmCancel()">Sim, cancelar</tc-button>
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

    @media (max-width: 768px) {
      .kpis-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .kpis-grid > *:last-child:nth-child(3) {
        grid-column: 1 / -1;
      }
    }

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
      min-width: 700px;
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
    .row-overdue td:first-child { border-left: 3px solid var(--color-danger-500) !important; }
    .row-overdue { background: rgba(220, 38, 38, 0.02) !important; }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .text-secondary { color: var(--color-text-secondary); font-size: var(--font-size-xs); }
    .amount { font-weight: 700; font-family: var(--font-family-display); }
    .actions-cell { display: flex; gap: var(--space-2); flex-wrap: wrap; justify-content: center; }

    .truncate-cell {
      max-width: 200px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .due-pill {
      display: inline-block;
      margin-left: var(--space-2);
      padding: 3px 8px;
      border-radius: var(--radius-full);
      font-size: var(--font-size-xs);
      font-weight: 600;
    }

    .due-overdue { color: var(--color-danger-500); font-weight: 700; }
    .due-urgent { color: var(--color-warning-500); }
    .due-normal { color: var(--color-text-secondary); }
    .pill-danger { background: var(--color-danger-50); color: var(--color-danger-500); border: 1px solid rgba(220, 38, 38, 0.2); }
    .pill-warning { background: var(--color-warning-50); color: var(--color-warning-500); border: 1px solid rgba(245, 158, 11, 0.2); }
    .pill-neutral { background: var(--color-background); color: var(--color-text-secondary); border: 1px solid var(--color-border-card); }

    .payable-card {
      background: var(--color-bg-card);
      border: 1px solid var(--color-border-card);
      border-radius: var(--radius-lg);
      padding: var(--space-4);
      margin-bottom: var(--space-3);
      box-shadow: var(--shadow-card);
      transition: all 0.25s var(--motion-spring);
    }

    .payable-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-glow-accent);
      border-color: rgba(47, 128, 237, 0.18);
    }

    .card-overdue {
      border-left: 3px solid var(--color-danger-500);
      background: rgba(220, 38, 38, 0.02);
    }

    .card-overdue:hover {
      box-shadow: var(--shadow-glow-danger) !important;
      border-color: rgba(220, 38, 38, 0.3) !important;
    }

    .card-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: var(--space-3);
      margin-bottom: var(--space-3);
    }

    .card-description {
      display: block;
      font-weight: 600;
      font-size: var(--font-size-sm);
      line-height: 1.4;
      color: var(--color-text-primary);
      min-width: 0;
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .card-meta {
      display: flex;
      gap: var(--space-2);
      flex-wrap: wrap;
      min-width: 0;
    }

    .card-amount {
      font-weight: 800;
      font-size: var(--font-size-md);
      font-family: var(--font-family-display);
      text-align: right;
      flex-shrink: 0;
    }

    .card-status-row,
    .card-meta-row {
      align-items: center;
    }

    .card-status-row > :last-child,
    .card-meta-row > :last-child {
      flex-shrink: 0;
      white-space: nowrap;
    }

    .card-actions {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
      margin-top: var(--space-3);
      padding-top: var(--space-3);
      border-top: 1px solid var(--color-border-card);
    }

    .secondary-actions {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: var(--space-2);
    }

    .desktop-only { display: block; }
    .mobile-only { display: none; }

    @media (max-width: 768px) {
      .desktop-only { display: none; }
      .mobile-only { display: block; }
      .page-header-action {
        margin-left: auto;
      }
    }

    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: var(--space-3);
    }

    .blocked-form-state {
      display: grid;
      gap: var(--space-3);
      text-align: center;
    }

    .blocked-form-icon {
      width: 44px;
      height: 44px;
      margin: 0 auto;
      border-radius: 12px;
      display: grid;
      place-items: center;
      background: var(--color-background);
      color: var(--color-accent-500);
    }

    .blocked-form-state h3,
    .blocked-form-state p {
      margin: 0;
    }

    .blocked-form-state h3 {
      font-size: var(--font-size-md);
      color: var(--color-text-primary);
    }

    .blocked-form-state p {
      color: var(--color-text-secondary);
      font-size: var(--font-size-sm);
      line-height: 1.5;
    }

    .blocked-form-actions {
      margin-top: var(--space-2);
    }

    @media (max-width: 767px) {
      .tabs-bar {
        padding-bottom: var(--space-1);
      }

      .tab-btn {
        min-height: 42px;
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
export class AccountsPayablePageComponent implements OnInit {
  readonly facade = inject(AccountsPayableFacade);
  private readonly cashFlowFacade = inject(CashFlowFacade);
  readonly categoriesFacade = inject(CategoriesFacade);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

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
    { label: 'Nao recorrente', value: 'NONE' },
    { label: 'Semanal', value: 'WEEKLY' },
    { label: 'Mensal', value: 'MONTHLY' },
    { label: 'Anual', value: 'YEARLY' },
  ];

  readonly payableForm = this.fb.group({
    description: ['', Validators.required],
    amount: [0, [Validators.required, Validators.min(0.01)]],
    dueDate: [new Date(), Validators.required],
    categoryId: ['', Validators.required],
    recurrence: this.fb.control<RecurrenceFrequency>('NONE'),
  });

  readonly filteredPayables = computed(() =>
    this.facade.payables()
      .filter(payable => this.activeTab() === 'TODAS' || payable.status === this.activeTab())
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
  );

  readonly totalMes = computed(() =>
    this.facade.payables()
      .filter(payable => payable.status === 'PENDENTE' || payable.status === 'ATRASADA')
      .reduce((acc, payable) => acc + payable.amount, 0)
  );

  readonly vencendo7d = computed(() => {
    const now = new Date();
    return this.facade.payables()
      .filter(payable => payable.status === 'PENDENTE' && differenceInDays(payable.dueDate, now) <= 7 && differenceInDays(payable.dueDate, now) >= 0)
      .reduce((acc, payable) => acc + payable.amount, 0);
  });

  readonly totalAtrasadas = computed(() =>
    this.facade.overdue().reduce((acc, payable) => acc + payable.amount, 0)
  );

  readonly categoryOptions = computed(() =>
    this.categoriesFacade.categories().map(category => ({ label: category.name, value: category.id }))
  );

  readonly hasCategories = computed(() => this.categoryOptions().length > 0);

  async ngOnInit(): Promise<void> {
    await Promise.all([
      this.facade.load(),
      this.cashFlowFacade.load(),
      this.categoriesFacade.load(),
    ]);
  }

  getCategoryName(id: string): string {
    return this.categoriesFacade.categories().find(category => category.id === id)?.name ?? '-';
  }

  getStatusTone(status: PayableStatus): 'success' | 'warning' | 'danger' | 'neutral' {
    switch (status) {
      case 'PAGA': return 'success';
      case 'PENDENTE': return 'warning';
      case 'ATRASADA': return 'danger';
      case 'CANCELADA': return 'neutral';
    }
  }

  getRecurrenceLabel(recurrence: RecurrenceFrequency): string {
    switch (recurrence) {
      case 'WEEKLY': return 'Semanal';
      case 'MONTHLY': return 'Mensal';
      case 'YEARLY': return 'Anual';
      default: return '-';
    }
  }

  getDuePillText(payable: PayableAccount): string {
    if (payable.status === 'PAGA' || payable.status === 'CANCELADA') return '';

    const diff = differenceInDays(payable.dueDate, new Date());
    if (diff < 0) return `Atrasada ${Math.abs(diff)}d`;
    if (diff === 0) return 'Vence hoje';
    return `Vence em ${diff}d`;
  }

  getDuePillClass(payable: PayableAccount): string {
    if (payable.status === 'PAGA' || payable.status === 'CANCELADA') return '';

    const diff = differenceInDays(payable.dueDate, new Date());
    if (diff < 0) return 'pill-danger';
    if (diff <= 2) return 'pill-danger';
    if (diff <= 7) return 'pill-warning';
    return 'pill-neutral';
  }

  getDueDateClass(payable: PayableAccount): string {
    if (payable.status === 'ATRASADA') return 'due-overdue';

    const diff = differenceInDays(payable.dueDate, new Date());
    if (diff <= 2) return 'due-urgent';
    return 'due-normal';
  }

  getFormError(field: string): string | undefined {
    const control = this.payableForm.get(field);
    if (control?.touched && control?.invalid) {
      if (control.errors?.['required']) return 'Campo obrigatorio';
      if (control.errors?.['min']) return 'Valor deve ser maior que zero';
    }
    return undefined;
  }

  openCreateModal(): void {
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

  openEditModal(payable: PayableAccount): void {
    this.payableToEdit.set(payable);
    this.payableForm.patchValue({
      description: payable.description,
      amount: payable.amount,
      dueDate: payable.dueDate,
      categoryId: payable.categoryId,
      recurrence: payable.recurrence,
    });
    this.isFormModalOpen.set(true);
  }

  closeFormModal(): void {
    this.isFormModalOpen.set(false);
    this.payableToEdit.set(null);
  }

  async savePayable(): Promise<void> {
    if (!this.hasCategories()) {
      return;
    }

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

  openPayModal(payable: PayableAccount): void {
    this.payableToPay.set(payable);
    this.isPayModalOpen.set(true);
  }

  closePayModal(): void {
    this.isPayModalOpen.set(false);
    this.payableToPay.set(null);
  }

  async confirmPay(): Promise<void> {
    const payable = this.payableToPay();
    if (!payable) return;

    try {
      await this.facade.pay(payable.id);
      this.toast.show('Conta paga. Saldo atualizado.', 'success');
      this.closePayModal();
    } catch {
      this.toast.show('Erro ao pagar conta.', 'error');
    }
  }

  openCancelModal(payable: PayableAccount): void {
    this.payableToCancel.set(payable);
    this.isCancelModalOpen.set(true);
  }

  closeCancelModal(): void {
    this.isCancelModalOpen.set(false);
    this.payableToCancel.set(null);
  }

  async confirmCancel(): Promise<void> {
    const payable = this.payableToCancel();
    if (!payable) return;

    try {
      await this.facade.cancel(payable.id);
      this.toast.show('Conta cancelada.', 'success');
    } catch {
      this.toast.show('Erro ao cancelar conta.', 'error');
    } finally {
      this.closeCancelModal();
    }
  }

  async goToSettings(): Promise<void> {
    this.closeFormModal();
    await this.router.navigate(['/settings']);
  }
}
