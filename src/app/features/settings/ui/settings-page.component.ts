import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AccountsPayableFacade } from '../../accounts-payable/application/accounts-payable.facade';
import { CategoriesFacade } from '../../categories/application/categories.facade';
import { Category } from '../../categories/domain/category.repository';
import { CashFlowFacade } from '../../cash-flow/application/cash-flow.facade';
import { SeedRunner } from '../../../core/mocks/seed-runner';
import type { SeedScenario } from '../../../core/mocks/seeds';
import { SettingsLocalAdapter } from '../../../features/settings/infrastructure/settings-local.adapter';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CardComponent } from '../../../shared/components/card/card.component';
import { InputComponent } from '../../../shared/components/input/input.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { TableComponent } from '../../../shared/components/table/table.component';
import { ToastService } from '../../../shared/components/toast/toast.service';

@Component({
  selector: 'tc-settings-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputComponent,
    ButtonComponent,
    CardComponent,
    TableComponent,
    ModalComponent,
  ],
  template: `
    <div class="settings-layout">
      <div class="settings-header">
        <h2 class="display-md">Configuracoes</h2>
      </div>

      <div class="settings-grid">
        <tc-card title="Parametros de Analise" subtitle="Ajuste como avaliamos a saude financeira">
          <form [formGroup]="settingsForm" (ngSubmit)="saveSettings()">
            <tc-input
              formControlName="reserveSafetyMarginPct"
              label="Margem de Seguranca da Reserva (%)"
              type="number"
              hint="Percentual extra sugerido alem das contas do mes."
            ></tc-input>

            <tc-input
              formControlName="reserveAttentionThresholdPct"
              label="Limite de Atencao da Reserva (%)"
              type="number"
              hint="Quanto a mais da reserva indica que a folga esta apertada."
            ></tc-input>

            <tc-input
              formControlName="minSafetyDays"
              label="Minimo de Dias de Seguranca"
              type="number"
              hint="Abaixo disso, um alerta critico sera exibido."
            ></tc-input>

            <div class="form-actions">
              <tc-button type="submit" variant="primary" [block]="true" [disabled]="settingsForm.invalid || !settingsForm.dirty">
                Salvar Parametros
              </tc-button>
            </div>
          </form>
        </tc-card>

        <tc-card title="Categorias" subtitle="Gerencie como organiza seus registros.">
          <div class="category-add-form">
            <tc-input
              [label]="editingCategory() ? 'Editar Nome' : 'Nova Categoria'"
              [formControl]="categoryNameCtrl"
            ></tc-input>

            <div class="category-editor-row">
              <div class="color-picker-wrapper">
                <label for="category-color">Cor</label>
                <input id="category-color" type="color" [formControl]="categoryColorCtrl">
              </div>

              <div class="category-editor-actions">
                <tc-button variant="primary" [block]="true" (clicked)="saveCategory()" [disabled]="categoryNameCtrl.invalid">
                  {{ editingCategory() ? 'Atualizar Categoria' : 'Adicionar Categoria' }}
                </tc-button>
                @if (editingCategory()) {
                  <tc-button variant="ghost" (clicked)="cancelEditCategory()">Cancelar</tc-button>
                }
              </div>
            </div>
          </div>

          <tc-table [columns]="['Cor', 'Nome', 'Acoes']">
            @for (cat of categoriesFacade.categories(); track cat.id) {
              <tr class="category-row">
                <td class="col-color">
                  <div class="color-swatch" [style.background]="cat.color"></div>
                </td>
                <td class="col-name">{{ cat.name }}</td>
                <td class="col-actions">
                  <div class="actions-cell">
                    <tc-button variant="secondary" size="sm" (clicked)="editCategory(cat)">Editar</tc-button>
                    <tc-button
                      variant="danger"
                      size="sm"
                      (clicked)="deleteCategory(cat.id)"
                      [disabled]="isCategoryInUse(cat.id)"
                      [attr.title]="isCategoryInUse(cat.id) ? 'Categoria em uso em movimentacoes ou contas.' : null"
                    >Excluir</tc-button>
                  </div>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="3" class="text-center text-secondary">Nenhuma categoria cadastrada.</td>
              </tr>
            }
          </tc-table>
        </tc-card>

        <tc-card title="Modo Demonstração" subtitle="Troque rapidamente o estado atual do sistema.">
          <div class="reset-actions">
            <tc-button variant="success" [block]="true" (clicked)="openResetModal('healthy')">
              Cenário Saudável
            </tc-button>
            <tc-button variant="danger" [block]="true" (clicked)="openResetModal('risk')">
              Cenário de Risco
            </tc-button>
            <tc-button variant="secondary" [block]="true" (clicked)="openResetModal('blank')">
              Cenário em Branco
            </tc-button>
          </div>
        </tc-card>
      </div>
    </div>

    <tc-modal
      [open]="isResetModalOpen()"
      title="Aviso de Substituicao"
      (close)="closeResetModal()"
    >
      <p class="body-md" style="margin-bottom: var(--space-4);">
        Voce vai carregar o cenario <strong>{{ getScenarioLabel(selectedScenario()) }}</strong>.
      </p>
      <p class="body-sm text-secondary" style="margin-bottom: var(--space-5);">
        Todos os dados atuais da demonstracao serao apagados antes da troca.
        @if (selectedScenario() === 'blank') {
          O sistema ficara sem dados ficticios.
        } @else {
          O sistema sera preenchido novamente com dados ficticios desse cenario.
        }
      </p>
      <div class="reset-modal-actions">
        <tc-button variant="ghost" (clicked)="closeResetModal()">Cancelar</tc-button>
        <tc-button [variant]="selectedScenario() === 'blank' ? 'secondary' : 'danger'" (clicked)="confirmReset()">Confirmar troca</tc-button>
      </div>
    </tc-modal>
  `,
  styles: [`
    .settings-layout {
      max-width: 800px;
      margin: 0 auto;
      padding-bottom: var(--space-8);
    }

    .settings-header {
      margin-bottom: var(--space-6);
    }

    .settings-grid {
      display: flex;
      flex-direction: column;
      gap: var(--space-5);
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      margin-top: var(--space-4);
    }

    .category-add-form {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
      margin-bottom: var(--space-5);
    }

    .category-add-form > tc-input {
      margin-bottom: 0;
    }

    .category-editor-row {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: var(--space-3);
      flex-wrap: wrap;
    }

    .category-editor-actions {
      display: flex;
      align-items: flex-end;
      gap: var(--space-2);
      margin-left: auto;
      flex: 1;
    }

    .category-editor-actions > tc-button:first-child {
      min-width: 160px;
      flex: 1;
    }

    .color-picker-wrapper {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
      flex-shrink: 0;
    }

    .color-picker-wrapper label {
      font-size: var(--font-size-sm);
      font-weight: 500;
      color: var(--color-text-primary);
    }

    .color-picker-wrapper input {
      height: 44px;
      width: 60px;
      padding: 3px;
      cursor: pointer;
      border: 1px solid var(--color-border-card);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-sm);
      transition: border-color var(--motion-fast), box-shadow var(--motion-fast);
    }

    .color-picker-wrapper input:focus-visible {
      outline: none;
      border-color: var(--color-accent-500);
      box-shadow: 0 0 0 3px rgba(47, 128, 237, 0.15);
    }

    :host ::ng-deep .tc-table th:first-child,
    :host ::ng-deep .tc-table td.col-color {
      width: 72px;
      text-align: center;
    }

    :host ::ng-deep .tc-table th:last-child,
    :host ::ng-deep .tc-table td.col-actions {
      width: 1%;
      white-space: nowrap;
    }

    :host ::ng-deep .tc-table td.col-name {
      width: 100%;
    }

    :host ::ng-deep .tc-table .category-row td {
      vertical-align: middle;
    }

    .color-swatch {
      width: 32px;
      height: 32px;
      border-radius: var(--radius-sm);
      border: 1px solid rgba(0, 0, 0, 0.1);
      box-shadow: var(--shadow-sm);
    }

    .actions-cell {
      display: flex;
      gap: var(--space-2);
    }

    .reset-actions {
      display: flex;
      gap: var(--space-3);
      flex-wrap: wrap;
    }

    .reset-modal-actions {
      display: flex;
      gap: var(--space-3);
      justify-content: flex-end;
    }

    .text-secondary {
      color: var(--color-text-secondary);
    }

    .text-center {
      text-align: center;
    }

    @media (max-width: 767px) {
      .form-actions {
        width: 100%;
      }

      .category-editor-row {
        align-items: stretch;
      }

      .category-editor-actions,
      .reset-actions {
        display: grid;
        grid-template-columns: 1fr;
        width: 100%;
      }

      .reset-modal-actions {
        flex-direction: column-reverse;
      }

      .reset-modal-actions > * {
        width: 100%;
      }

      .actions-cell {
        flex-wrap: wrap;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly settingsAdapter = inject(SettingsLocalAdapter);
  private readonly seedRunner = inject(SeedRunner);
  private readonly toast = inject(ToastService);

  readonly categoriesFacade = inject(CategoriesFacade);
  private readonly cashFlowFacade = inject(CashFlowFacade);
  private readonly payablesFacade = inject(AccountsPayableFacade);

  readonly settingsForm = this.fb.group({
    reserveSafetyMarginPct: [0, Validators.required],
    reserveAttentionThresholdPct: [0, Validators.required],
    minSafetyDays: [0, Validators.required],
  });

  readonly categoryNameCtrl = this.fb.control('', Validators.required);
  readonly categoryColorCtrl = this.fb.control('#051B61', Validators.required);
  readonly editingCategory = signal<Category | null>(null);

  readonly isResetModalOpen = signal(false);
  readonly selectedScenario = signal<SeedScenario>('healthy');

  ngOnInit(): void {
    const currentSettings = this.settingsAdapter.settings();
    this.settingsForm.patchValue({
      reserveSafetyMarginPct: currentSettings.reserveSafetyMarginPct,
      reserveAttentionThresholdPct: currentSettings.reserveAttentionThresholdPct,
      minSafetyDays: currentSettings.minSafetyDays,
    });

    void Promise.all([
      this.categoriesFacade.load(),
      this.cashFlowFacade.load(),
      this.payablesFacade.load(),
    ]);
  }

  saveSettings(): void {
    if (this.settingsForm.invalid) return;

    const values = this.settingsForm.value;
    this.settingsAdapter.updateSettings({
      reserveSafetyMarginPct: Number(values.reserveSafetyMarginPct),
      reserveAttentionThresholdPct: Number(values.reserveAttentionThresholdPct),
      minSafetyDays: Number(values.minSafetyDays),
    });

    this.settingsForm.markAsPristine();
    this.toast.show('Configuracoes salvas com sucesso!', 'success');
  }

  async saveCategory(): Promise<void> {
    if (this.categoryNameCtrl.invalid || this.categoryColorCtrl.invalid) return;

    const name = this.categoryNameCtrl.value!;
    const color = this.categoryColorCtrl.value!;
    const currentEdit = this.editingCategory();

    try {
      if (currentEdit) {
        await this.categoriesFacade.update(currentEdit.id, { name, color });
        this.toast.show('Categoria atualizada.', 'success');
      } else {
        await this.categoriesFacade.create({ name, color });
        this.toast.show('Categoria criada.', 'success');
      }
      this.cancelEditCategory();
    } catch {
      this.toast.show('Erro ao salvar categoria.', 'error');
    }
  }

  editCategory(category: Category): void {
    this.editingCategory.set(category);
    this.categoryNameCtrl.setValue(category.name);
    this.categoryColorCtrl.setValue(category.color);
  }

  cancelEditCategory(): void {
    this.editingCategory.set(null);
    this.categoryNameCtrl.setValue('');
    this.categoryColorCtrl.setValue('#051B61');
  }

  async deleteCategory(id: string): Promise<void> {
    if (this.isCategoryInUse(id)) {
      this.toast.show('Categoria em uso. Nao e possivel excluir.', 'error');
      return;
    }

    try {
      await this.categoriesFacade.remove(id);
      this.toast.show('Categoria excluida.', 'success');
    } catch {
      this.toast.show('Erro ao excluir categoria.', 'error');
    }
  }

  isCategoryInUse(id: string): boolean {
    const isUsedInCashFlow = this.cashFlowFacade.movements().some(movement => movement.categoryId === id);
    const isUsedInPayables = this.payablesFacade.payables().some(payable => payable.categoryId === id);
    return isUsedInCashFlow || isUsedInPayables;
  }

  openResetModal(scenario: SeedScenario): void {
    this.selectedScenario.set(scenario);
    this.isResetModalOpen.set(true);
  }

  closeResetModal(): void {
    this.isResetModalOpen.set(false);
  }

  confirmReset(): void {
    this.seedRunner.reseed(this.selectedScenario());
    this.closeResetModal();
    this.toast.show('Dados resetados com sucesso. Recarregando...', 'success');
    setTimeout(() => window.location.reload(), 1500);
  }

  getScenarioLabel(scenario: SeedScenario): string {
    switch (scenario) {
      case 'healthy':
        return 'Cenario Saudavel';
      case 'risk':
        return 'Cenario de Risco';
      case 'blank':
        return 'Cenario em Branco';
    }
  }
}
