import {
  ChangeDetectionStrategy,
  Component,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'tc-welcome-modal',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="wm-overlay" role="dialog" aria-modal="true" aria-labelledby="wm-title">
      <div class="wm-card">
        <!-- Logo icon -->
        <!-- <div class="wm-logo">
          <img
            src="assets/icons/logo.png"
            alt="TrimiCash Logo"
            class="logo-img"
          />
        </div> -->

        <h1 id="wm-title" class="wm-title">Bem-vindo ao TrimiCash!</h1>
        <p class="wm-subtitle">Gerencie seu fluxo de caixa de forma simples e visual.</p>

        <div class="wm-field">
          <label class="wm-label" for="wm-name">Como podemos te chamar?</label>
          <input
            id="wm-name"
            class="wm-input"
            type="text"
            placeholder="Seu nome"
            autocomplete="given-name"
            [(ngModel)]="userName"
            (ngModelChange)="nameChanged.emit($event)"
            (keyup.enter)="confirm()"
            maxlength="50"
          />
        </div>

        <button
          class="wm-btn"
          [disabled]="!userName().trim()"
          (click)="confirm()"
        >
          Começar
        </button>
      </div>
    </div>
  `,
  styles: [`
    .wm-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.55);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      display: grid;
      place-items: center;
      z-index: 9999;
      padding: var(--space-4);
      animation: fadeIn 0.3s ease both;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }

    .wm-card {
      width: 100%;
      max-width: 440px;
      background: var(--color-bg-card);
      border-radius: var(--radius-xl);
      border: 1px solid var(--color-border-card);
      padding: var(--space-7) var(--space-6);
      box-shadow: var(--shadow-lg);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-4);
      animation: fadeUp 0.4s var(--motion-slow) both;
    }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(24px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    /* Logo */
    /*.wm-logo {
      display: flex;
      justify-content: center;
      margin-bottom: var(--space-2);
    }

    .logo-img {
      width: 160px;
      height: 160px;
      object-fit: contain;
      border-radius: 12px;
      filter: drop-shadow(0 4px 12px rgba(47, 128, 237, 0.2));
    }*/

    /* Textos */
    .wm-title {
      font-family: var(--font-family-display);
      font-size: var(--font-size-2xl);
      font-weight: 800;
      letter-spacing: -0.03em;
      color: var(--color-text-primary);
      text-align: center;
      margin: 0;
    }

    .wm-subtitle {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      text-align: center;
      margin: 0;
      line-height: 1.6;
    }

    /* Campo de nome */
    .wm-field {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
      margin-top: var(--space-2);
    }

    .wm-label {
      font-size: var(--font-size-sm);
      font-weight: 600;
      color: var(--color-text-primary);
    }

    .wm-input {
      width: 100%;
      padding: 12px 16px;
      border-radius: var(--radius-md);
      border: 1.5px solid var(--color-border);
      background: var(--color-bg-input);
      color: var(--color-text-primary);
      font-size: var(--font-size-md);
      font-family: var(--font-family-body);
      transition: border-color var(--motion-fast), box-shadow var(--motion-fast);
      outline: none;
    }

    .wm-input::placeholder { color: var(--color-text-muted); }

    .wm-input:focus {
      border-color: var(--color-accent-500);
      box-shadow: 0 0 0 3px rgba(47, 128, 237, 0.15);
    }

    /* Botão */
    .wm-btn {
      width: 100%;
      padding: 14px;
      border-radius: var(--radius-md);
      background: var(--gradient-primary);
      color: #fff;
      font-size: var(--font-size-md);
      font-weight: 700;
      font-family: var(--font-family-display);
      border: none;
      cursor: pointer;
      transition: opacity var(--motion-fast), transform var(--motion-fast), box-shadow var(--motion-normal);
      box-shadow: 0 4px 16px rgba(47, 128, 237, 0.3);
      margin-top: var(--space-2);
    }

    .wm-btn:hover:not(:disabled) {
      opacity: 0.92;
      transform: translateY(-1px);
      box-shadow: 0 6px 24px rgba(47, 128, 237, 0.4);
    }

    .wm-btn:active:not(:disabled) {
      transform: translateY(0);
    }

    .wm-btn:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }

    @media (max-width: 480px) {
      .wm-card {
        padding: var(--space-6) var(--space-4);
      }
      .wm-title { font-size: var(--font-size-xl); }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WelcomeModalComponent {
  readonly confirmed = output<string>();
  readonly nameChanged = output<string>();
  readonly userName = signal('');

  confirm(): void {
    const name = this.userName().trim();
    if (name) {
      this.confirmed.emit(name);
    }
  }
}
