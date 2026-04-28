import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TitleCasePipe } from '@angular/common';

import { SettingsLocalAdapter } from '../../../features/settings/infrastructure/settings-local.adapter';
import { SeedRunner } from '../../../core/mocks/seed-runner';
import { CategoriesFacade } from '../../categories/application/categories.facade';
import { CashFlowFacade } from '../../cash-flow/application/cash-flow.facade';
import { AccountsPayableFacade } from '../../accounts-payable/application/accounts-payable.facade';
import { ToastService } from '../../../shared/components/toast/toast.service';

import { InputComponent } from '../../../shared/components/input/input.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CardComponent } from '../../../shared/components/card/card.component';
import { TableComponent } from '../../../shared/components/table/table.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { Category } from '../../categories/domain/category.repository';

@Component({
  selector: 'tc-settings-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TitleCasePipe,
    InputComponent,
    ButtonComponent,
    CardComponent,
    TableComponent,
    ModalComponent
  ],
  template: `
    <div class="settings-layout">
      <div class="settings-header">
        <h2 class="display-md">Configurações</h2>
      </div>

      <div class="settings-grid">
        <!-- SEÇÃO: Parâmetros do Sistema -->
        <tc-card title="Parâmetros de Análise" subtitle="Ajuste como o TrimiCash avalia a saúde do seu caixa.">
          <form [formGroup]="settingsForm" (ngSubmit)="saveSettings()">
            <tc-input
              formControlName="reserveSafetyMarginPct"
              label="Margem de Segurança da Reserva (%)"
              type="number"
              hint="Percentual extra sugerido além das contas do mês."
            ></tc-input>
            
            <tc-input
              formControlName="reserveAttentionThresholdPct"
              label="Limite de Atenção da Reserva (%)"
              type="number"
              hint="Quanto a mais da reserva indica que a folga está apertada."
            ></tc-input>

            <tc-input
              formControlName="minSafetyDays"
              label="Mínimo de Dias de Segurança"
              type="number"
              hint="Abaixo disso, um alerta crítico será exibido."
            ></tc-input>

            <div class="form-actions">
              <tc-button type="submit" variant="primary" [disabled]="settingsForm.invalid || !settingsForm.dirty">
                Salvar Parâmetros
              </tc-button>
            </div>
          </form>
        </tc-card>

        <!-- SEÇÃO: Categorias -->
        <tc-card title="Categorias" subtitle="Gerencie como você organiza suas contas e movimentações.">
          <div class="category-add-form">
            <tc-input
              [label]="editingCategory() ? 'Editar Nome' : 'Nova Categoria'"
              [formControl]="categoryNameCtrl"
            ></tc-input>
            
            <div class="color-picker-wrapper">
              <label>Cor</label>
              <input type="color" [formControl]="categoryColorCtrl">
            </div>

            <div class="cat-actions">
              <tc-button variant="primary" (onClick)="saveCategory()" [disabled]="categoryNameCtrl.invalid">
                {{ editingCategory() ? 'Atualizar' : 'Adicionar' }}
              </tc-button>
              @if (editingCategory()) {
                <tc-button variant="ghost" (onClick)="cancelEditCategory()">Cancelar</tc-button>
              }
            </div>
          </div>

          <tc-table [columns]="['Cor', 'Nome', 'Ações']">
            @for (cat of categoriesFacade.categories(); track cat.id) {
              <tr>
                <td>
                  <div class="color-swatch" [style.background]="cat.color"></div>
                </td>
                <td>{{ cat.name }}</td>
                <td>
                  <div class="actions-cell">
                    <tc-button variant="secondary" size="sm" (onClick)="editCategory(cat)">Editar</tc-button>
                    <tc-button variant="danger" size="sm" (onClick)="deleteCategory(cat.id)">Excluir</tc-button>
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

        <!-- SEÇÃO: Reset -->
        <tc-card title="Modo Demonstração" subtitle="Reinicie os dados para testar diferentes cenários.">
          <p class="body-sm text-secondary" style="margin-bottom: var(--space-4);">
            Ao resetar, todas as movimentações e configurações atuais serão perdidas e substituídas por dados fictícios para fins de apresentação.
          </p>
          <div class="reset-actions">
            <tc-button variant="danger" (onClick)="openResetModal('healthy')">
              Carregar Cenário Saudável
            </tc-button>
            <tc-button variant="danger" (onClick)="openResetModal('risk')">
              Carregar Cenário de Risco
            </tc-button>
          </div>
        </tc-card>
      </div>
    </div>

    <!-- MODAL DE RESET -->
    <tc-modal
      [open]="isResetModalOpen()"
      title="Confirmar Reset"
      (close)="closeResetModal()"
    >
      <p class="body-md" style="margin-bottom: var(--space-4);">
        Tem certeza que deseja carregar o cenário <strong>{{ selectedScenario() | titlecase }}</strong>? 
        Esta ação apagará todos os dados atuais da demonstração.
      </p>
      <div style="display: flex; gap: var(--space-3); justify-content: flex-end;">
        <tc-button variant="ghost" (onClick)="closeResetModal()">Cancelar</tc-button>
        <tc-button variant="danger" (onClick)="confirmReset()">Sim, Resetar</tc-button>
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
      gap: var(--space-6);
    }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      margin-top: var(--space-4);
    }
    .category-add-form {
      display: flex;
      align-items: flex-end;
      gap: var(--space-3);
      margin-bottom: var(--space-5);
      flex-wrap: wrap;
    }
    .category-add-form > tc-input { margin-bottom: 0; flex: 1; min-width: 200px; }
    .color-picker-wrapper {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }
    .color-picker-wrapper label { font-size: var(--font-size-sm); font-weight: 500; color: var(--color-text-primary); }
    .color-picker-wrapper input {
      height: 44px; /* Match input height */
      width: 60px;
      padding: 2px;
      cursor: pointer;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
    }
    .cat-actions {
      display: flex;
      gap: var(--space-2);
    }
    .color-swatch {
      width: 24px;
      height: 24px;
      border-radius: var(--radius-sm);
      border: 1px solid rgba(0,0,0,0.1);
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
    .text-secondary { color: var(--color-text-secondary); }
    .text-center { text-align: center; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsPageComponent implements OnInit {
  private fb = inject(FormBuilder);
  private settingsAdapter = inject(SettingsLocalAdapter);
  private seedRunner = inject(SeedRunner);
  private toast = inject(ToastService);
  
  public categoriesFacade = inject(CategoriesFacade);
  private cashFlowFacade = inject(CashFlowFacade);
  private payablesFacade = inject(AccountsPayableFacade);

  // Formulário Settings
  settingsForm = this.fb.group({
    reserveSafetyMarginPct: [0, Validators.required],
    reserveAttentionThresholdPct: [0, Validators.required],
    minSafetyDays: [0, Validators.required],
  });

  // Formulário Categorias
  categoryNameCtrl = this.fb.control('', Validators.required);
  categoryColorCtrl = this.fb.control('#051B61', Validators.required);
  editingCategory = signal<Category | null>(null);

  // Modal Reset
  isResetModalOpen = signal(false);
  selectedScenario = signal<'healthy' | 'risk'>('healthy');

  ngOnInit() {
    const currentSettings = this.settingsAdapter.settings();
    this.settingsForm.patchValue({
      reserveSafetyMarginPct: currentSettings.reserveSafetyMarginPct,
      reserveAttentionThresholdPct: currentSettings.reserveAttentionThresholdPct,
      minSafetyDays: currentSettings.minSafetyDays
    });
  }

  saveSettings() {
    if (this.settingsForm.invalid) return;
    const values = this.settingsForm.value;
    
    this.settingsAdapter.updateSettings({
      reserveSafetyMarginPct: Number(values.reserveSafetyMarginPct),
      reserveAttentionThresholdPct: Number(values.reserveAttentionThresholdPct),
      minSafetyDays: Number(values.minSafetyDays),
    });
    
    this.settingsForm.markAsPristine();
    this.toast.show('Configurações salvas com sucesso!', 'success');
  }

  // Categoria
  async saveCategory() {
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

  editCategory(cat: Category) {
    this.editingCategory.set(cat);
    this.categoryNameCtrl.setValue(cat.name);
    this.categoryColorCtrl.setValue(cat.color);
  }

  cancelEditCategory() {
    this.editingCategory.set(null);
    this.categoryNameCtrl.setValue('');
    this.categoryColorCtrl.setValue('#051B61');
  }

  async deleteCategory(id: string) {
    const isUsedInCashFlow = this.cashFlowFacade.movements().some(m => m.categoryId === id);
    const isUsedInPayables = this.payablesFacade.payables().some(p => p.categoryId === id);

    if (isUsedInCashFlow || isUsedInPayables) {
      this.toast.show('Categoria em uso. Não é possível excluir.', 'error');
      return;
    }

    try {
      await this.categoriesFacade.remove(id);
      this.toast.show('Categoria excluída.', 'success');
    } catch {
      this.toast.show('Erro ao excluir categoria.', 'error');
    }
  }

  // Reset
  openResetModal(scenario: 'healthy' | 'risk') {
    this.selectedScenario.set(scenario);
    this.isResetModalOpen.set(true);
  }

  closeResetModal() {
    this.isResetModalOpen.set(false);
  }

  confirmReset() {
    this.seedRunner.reseed(this.selectedScenario());
    this.closeResetModal();
    this.toast.show('Dados resetados com sucesso. Recarregando...', 'success');
    // Em uma demo local simples, forçar refresh da janela atualiza tudo.
    setTimeout(() => window.location.reload(), 1500);
  }
}
