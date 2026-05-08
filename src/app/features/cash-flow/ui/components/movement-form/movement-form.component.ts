import { ChangeDetectionStrategy, Component, OnInit, computed, inject, input, output } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CashFlowFacade } from '../../../application/cash-flow.facade';
import { Movement, MovementType } from '../../../domain/entities/movement.entity';
import { CategoriesFacade } from '../../../../categories/application/categories.facade';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';
import { DateInputComponent } from '../../../../../shared/components/date-input/date-input.component';
import { InputComponent } from '../../../../../shared/components/input/input.component';
import { MoneyInputComponent } from '../../../../../shared/components/money-input/money-input.component';
import { SelectComponent } from '../../../../../shared/components/select/select.component';

@Component({
  selector: 'tc-movement-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputComponent,
    SelectComponent,
    MoneyInputComponent,
    DateInputComponent,
    ButtonComponent
  ],
  template: `
    @if (!hasCategories()) {
      <div class="blocked-state">
        <div class="blocked-icon" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 7h18"></path>
            <path d="M6 12h12"></path>
            <path d="M9 17h6"></path>
          </svg>
        </div>
        <h3>Cadastre uma categoria primeiro</h3>
        <p>Para registrar uma movimentação, você precisa ter pelo menos uma categoria disponível em Configurações.</p>
        <div class="actions actions-blocked">
          <tc-button type="button" variant="secondary" (clicked)="cancelled.emit()">Cancelar</tc-button>
          <tc-button type="button" variant="primary" (clicked)="goToSettings()">Ir para Configurações</tc-button>
        </div>
      </div>
    } @else {
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="form-row type-selector">
          <button
            type="button"
            class="type-btn"
            [class.active-entrada]="form.get('type')?.value === 'ENTRADA'"
            (click)="form.get('type')?.setValue('ENTRADA')">
            Entrada
          </button>
          <button
            type="button"
            class="type-btn"
            [class.active-saida]="form.get('type')?.value === 'SAIDA'"
            (click)="form.get('type')?.setValue('SAIDA')">
            Saída
          </button>
        </div>

        <tc-money-input
          formControlName="amount"
          label="Valor"
          [hint]="form.get('type')?.value === 'ENTRADA' ? 'Informe o valor que entrou no caixa.' : 'Informe o valor que saiu do caixa.'"
          [error]="getError('amount')">
        </tc-money-input>

        <tc-date-input formControlName="date" label="Data" [error]="getError('date')"></tc-date-input>

        <tc-select
          formControlName="categoryId"
          label="Categoria"
          [options]="categoryOptions()"
          [error]="getError('categoryId')">
        </tc-select>

        <tc-input formControlName="description" label="Descrição" [error]="getError('description')"></tc-input>

        <div class="actions">
          <tc-button type="button" variant="secondary" (clicked)="cancelled.emit()">Cancelar</tc-button>
          <tc-button type="submit" variant="primary" [loading]="cashFlowFacade.loading()">Salvar</tc-button>
        </div>
      </form>
    }
  `,
  styles: [`
    .blocked-state {
      display: grid;
      gap: var(--space-3);
      padding: var(--space-3) 0;
      text-align: center;
    }

    .blocked-icon {
      width: 44px;
      height: 44px;
      margin: 0 auto;
      border-radius: 12px;
      display: grid;
      place-items: center;
      background: var(--color-background);
      color: var(--color-accent-500);
    }

    .blocked-state h3,
    .blocked-state p {
      margin: 0;
    }

    .blocked-state h3 {
      font-size: var(--font-size-md);
      color: var(--color-text-primary);
    }

    .blocked-state p {
      color: var(--color-text-secondary);
      font-size: var(--font-size-sm);
      line-height: 1.5;
    }

    .type-selector {
      display: flex;
      gap: var(--space-2);
      margin-bottom: var(--space-4);
    }

    .type-btn {
      flex: 1;
      padding: var(--space-2) var(--space-4);
      border: 1px solid var(--color-border);
      background: var(--color-surface);
      color: var(--color-text-primary);
      border-radius: var(--radius-md);
      cursor: pointer;
      font-weight: 500;
      transition:
        background-color var(--motion-fast),
        border-color var(--motion-fast),
        color var(--motion-fast);
    }

    .type-btn.active-entrada {
      background: var(--color-success-50);
      border-color: var(--color-success-500);
      color: var(--color-success-600);
      font-weight: 600;
    }

    .type-btn.active-saida {
      background: var(--color-danger-50);
      border-color: var(--color-danger-500);
      color: var(--color-danger-600);
      font-weight: 600;
    }

    .actions {
      display: flex;
      justify-content: flex-end;
      gap: var(--space-3);
      margin-top: var(--space-6);
    }

    .actions-blocked {
      margin-top: var(--space-2);
    }

    @media (max-width: 767px) {
      .actions {
        flex-direction: column-reverse;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovementFormComponent implements OnInit {
  movementToEdit = input<Movement | null>(null);

  cancelled = output<void>();
  saved = output<void>();

  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  readonly cashFlowFacade = inject(CashFlowFacade);
  private readonly categoriesFacade = inject(CategoriesFacade);

  readonly form = this.fb.group({
    type: this.fb.control<MovementType>('SAIDA', Validators.required),
    amount: this.fb.control<number>(0, [Validators.required, Validators.min(0.01)]),
    date: this.fb.control<Date>(new Date(), Validators.required),
    categoryId: this.fb.control<string>('', Validators.required),
    description: this.fb.control<string>('', Validators.required)
  });

  readonly categoryOptions = computed(() => {
    return this.categoriesFacade.categories().map(category => ({
      label: category.name,
      value: category.id
    }));
  });

  readonly hasCategories = computed(() => this.categoryOptions().length > 0);

  ngOnInit(): void {
    if (this.categoriesFacade.categories().length === 0) {
      void this.categoriesFacade.load();
    }

    const editItem = this.movementToEdit();
    if (editItem) {
      this.form.patchValue({
        type: editItem.type,
        amount: editItem.amount,
        date: editItem.date,
        categoryId: editItem.categoryId,
        description: editItem.description
      });
    }
  }

  getError(controlName: string): string | undefined {
    const control = this.form.get(controlName);
    if (control?.touched && control?.invalid) {
      if (control.errors?.['required']) return 'Campo obrigatório';
      if (control.errors?.['min']) return 'Valor deve ser maior que zero';
      return 'Campo inválido';
    }
    return undefined;
  }

  async onSubmit(): Promise<void> {
    if (!this.hasCategories()) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const val = this.form.value;
    const movementData = {
      type: val.type as MovementType,
      amount: val.amount as number,
      date: val.date as Date,
      categoryId: val.categoryId as string,
      description: val.description as string
    };

    try {
      const editItem = this.movementToEdit();
      if (editItem) {
        await this.cashFlowFacade.update(editItem.id, movementData);
      } else {
        await this.cashFlowFacade.create(movementData);
      }
      this.saved.emit();
    } catch {
      // Facade already handles errors.
    }
  }

  async goToSettings(): Promise<void> {
    this.cancelled.emit();
    await this.router.navigate(['/settings']);
  }
}
