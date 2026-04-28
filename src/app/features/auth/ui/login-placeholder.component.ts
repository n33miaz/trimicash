import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AUTH_PORT } from '../../../core/tokens/injection-tokens';

@Component({
  selector: 'tc-login-placeholder',
  standalone: true,
  template: `
    <div style="text-align: center">
      <h2 style="font-family: var(--font-family-display); margin-bottom: 1rem;">Bem-vindo ao TrimiCash</h2>
      <p style="color: var(--color-text-secondary); margin-bottom: 2rem;">Demo Mode - Fase 1</p>
      <button 
        (click)="login()"
        style="
          width: 100%;
          padding: 12px;
          background: var(--color-accent-500);
          color: white;
          border: none;
          border-radius: var(--radius-md);
          font-weight: 500;
          cursor: pointer;
        "
      >
        Entrar na Demo
      </button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPlaceholderComponent {
  private readonly authPort = inject(AUTH_PORT);
  private readonly router = inject(Router);

  async login() {
    await this.authPort.login('demo@trimicash.com', '123456');
    this.router.navigate(['/']);
  }
}
