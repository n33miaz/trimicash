import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AUTH_PORT } from '../../../core/tokens/injection-tokens';
import { InputComponent } from '../../../shared/components/input/input.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';

@Component({
  selector: 'tc-login-page',
  standalone: true,
  imports: [ReactiveFormsModule, InputComponent, ButtonComponent],
  template: `
    <div class="login-container">
      <div class="login-header">
        <h2 class="display-md">Bem-vindo ao TrimiCash</h2>
        <p class="body-sm text-secondary">Acesse sua conta para continuar.</p>
        
        <div class="demo-notice">
          <p class="body-sm"><strong>Modo Demonstração (Fase 1)</strong></p>
          <p class="body-xs">Qualquer e-mail e senha serão aceitos. Esta é uma versão mock sem backend real.</p>
        </div>
      </div>

      <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
        <tc-input
          formControlName="email"
          label="E-mail"
          type="email"
          [error]="showError('email') ? 'E-mail inválido' : ''"
        ></tc-input>

        <tc-input
          formControlName="password"
          label="Senha"
          type="password"
          [error]="showError('password') ? 'Senha é obrigatória' : ''"
        ></tc-input>

        @if (error()) {
          <div class="error-alert">{{ error() }}</div>
        }

        <tc-button
          type="submit"
          variant="primary"
          size="lg"
          [loading]="loading()"
          [disabled]="loginForm.invalid || loading()"
          style="width: 100%; margin-top: var(--space-4);"
        >
          Entrar na Demo
        </tc-button>
      </form>
    </div>
  `,
  styles: [`
    .login-container {
      width: 100%;
      max-width: 400px;
      margin: 0 auto;
    }
    .login-header {
      text-align: center;
      margin-bottom: var(--space-6);
    }
    .text-secondary {
      color: var(--color-text-secondary);
    }
    .demo-notice {
      margin-top: var(--space-4);
      padding: var(--space-3);
      background-color: var(--color-warning-50);
      border: 1px solid var(--color-warning-500);
      border-radius: var(--radius-md);
      color: var(--color-warning-900);
      text-align: left;
    }
    .demo-notice p { margin: 0; }
    .demo-notice .body-xs { margin-top: var(--space-1); font-size: var(--font-size-xs); }
    
    .login-form {
      display: flex;
      flex-direction: column;
    }
    .error-alert {
      color: var(--color-danger-500);
      font-size: var(--font-size-sm);
      margin-bottom: var(--space-3);
      text-align: center;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPageComponent {
  private readonly authPort = inject(AUTH_PORT);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly loginForm = this.fb.group({
    email: ['demo@trimicash.com', [Validators.required, Validators.email]],
    password: ['123456', Validators.required]
  });

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  showError(controlName: string): boolean {
    const control = this.loginForm.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  async onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    try {
      const { email, password } = this.loginForm.value;
      await this.authPort.login(email!, password!);
      this.router.navigate(['/']);
    } catch (err: unknown) {
      this.error.set(err instanceof Error ? err.message : 'Erro ao efetuar login');
    } finally {
      this.loading.set(false);
    }
  }
}
