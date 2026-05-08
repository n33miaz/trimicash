import {
  ChangeDetectionStrategy,
  Component,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AUTH_PORT } from '../../core/tokens/injection-tokens';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { TopbarComponent } from './topbar/topbar.component';
import { SidebarComponent } from './sidebar/sidebar.component';

const INTRO_MODAL_STORAGE_KEY = 'trimicash:intro-modal-seen';

@Component({
  selector: 'tc-main-layout',
  standalone: true,
  imports: [RouterOutlet, TopbarComponent, SidebarComponent, ModalComponent, ButtonComponent],
  template: `
    <tc-topbar (menuToggled)="sidebar.toggle()" (openAlerts)="onOpenAlerts()"></tc-topbar>

    <tc-sidebar #sidebar></tc-sidebar>

    <main class="main-content">
      <router-outlet></router-outlet>
    </main>

    <tc-modal
      [open]="showIntroModal()"
      title="Bem-vindo ao TrimiCash"
      [closeOnBackdrop]="false"
      (close)="dismissIntroModal()"
    >
      <div class="intro-copy">
        <p class="body-md">
          Este sistema organiza <strong>Caixa</strong>, <strong>Contas a Pagar</strong>, <strong>Dashboard</strong>,
          <strong>Alertas</strong> e <strong>Categorias</strong> em um fluxo simples de uso diário.
        </p>

        <div class="intro-list">
          <div class="intro-item">
            <strong>Como funciona</strong>
            <span>Cadastre categorias, registre entradas e saídas e acompanhe vencimentos para alimentar indicadores e alertas.</span>
          </div>
          <div class="intro-item">
            <strong>Limitações desta versão</strong>
            <span>Os dados ficam apenas neste navegador e neste aparelho. Não existe sincronização, multiusuário nem backend real.</span>
          </div>
          <div class="intro-item">
            <strong>Personalização</strong>
            <span>Você pode ajustar parâmetros, categorias e cenários em <strong>Configurações</strong>.</span>
          </div>
        </div>
      </div>

      <tc-button variant="primary" [block]="true" (clicked)="dismissIntroModal()">Entendi</tc-button>
    </tc-modal>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background: var(--color-background);
    }

    .main-content {
      margin-left: 0;
      min-height: 100vh;
      padding: 16px 12px 80px;
      transition: margin-left var(--motion-slow);
    }

    .intro-copy {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }

    .intro-copy p {
      margin: 0;
      color: var(--color-text-primary);
      line-height: 1.6;
    }

    .intro-list {
      display: grid;
      gap: var(--space-3);
      margin-bottom: var(--space-5);
    }

    .intro-item {
      display: grid;
      gap: var(--space-1);
      padding: var(--space-3) var(--space-4);
      border: 1px solid var(--color-border-card);
      border-radius: var(--radius-md);
      background: var(--color-bg-card);
    }

    .intro-item strong {
      color: var(--color-text-primary);
      font-size: var(--font-size-sm);
    }

    .intro-item span {
      color: var(--color-text-secondary);
      font-size: var(--font-size-sm);
      line-height: 1.5;
    }

    @media (min-width: 768px) {
      .main-content {
        margin-left: var(--sidebar-width);
        padding: 28px 36px 48px;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainLayoutComponent {
  private readonly authPort = inject(AUTH_PORT);

  @ViewChild('sidebar') sidebar!: SidebarComponent;
  readonly showIntroModal = signal(false);

  constructor() {
    const currentUser = this.authPort.current();
    const hasSeenIntro = localStorage.getItem(INTRO_MODAL_STORAGE_KEY) === 'true';

    if (currentUser && !hasSeenIntro) {
      this.showIntroModal.set(true);
    }
  }

  onOpenAlerts(): void {
    return;
  }

  dismissIntroModal(): void {
    localStorage.setItem(INTRO_MODAL_STORAGE_KEY, 'true');
    this.showIntroModal.set(false);
  }
}
