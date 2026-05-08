import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AUTH_PORT } from '../../../core/tokens/injection-tokens';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputComponent } from '../../../shared/components/input/input.component';
import {
  buildDemoEmail,
  readDemoCredentials,
  saveDemoCredentials,
  USER_NAME_KEY,
} from '../infrastructure/auth-mock.adapter';
import { WelcomeModalComponent } from './components/welcome-modal.component';

@Component({
  selector: 'tc-login-page',
  standalone: true,
  imports: [ReactiveFormsModule, InputComponent, ButtonComponent, WelcomeModalComponent],
  template: `
    @if (showWelcome()) {
      <tc-welcome-modal
        (nameChanged)="onWelcomeNameChanged($event)"
        (confirmed)="onWelcomeConfirmed($event)">
      </tc-welcome-modal>
    }

    <div class="login-container">
      <div class="login-logo">
        <img
          src="assets/icons/logo.png"
          alt="TrimiCash Logo"
          class="logo-img"
        />
      </div>

      <div class="login-header">
        <h2 class="login-title">TrimiCash</h2>
        <p class="login-subtitle">Sistema Fluxo de Caixa</p>
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
          [block]="true"
          [loading]="loading()"
          [disabled]="loginForm.invalid || loading()"
          style="margin-top: var(--space-4);"
        >
          Entrar
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

    .login-logo {
      display: flex;
      justify-content: center;
      margin-bottom: var(--space-4);
    }

    .logo-img {
      width: 160px;
      height: 160px;
      margin: -32px;
      object-fit: contain;
      border-radius: 12px;
      filter: drop-shadow(0 4px 12px rgba(47, 128, 237, 0.2));
    }

    .login-header {
      text-align: center;
      margin-bottom: var(--space-6);
    }

    .login-title {
      font-family: var(--font-family-display);
      font-size: var(--font-size-3xl);
      font-weight: 800;
      letter-spacing: -0.03em;
      color: var(--color-text-primary);
      margin: 0 0 var(--space-1) 0;
    }

    .login-subtitle {
      font-family: var(--font-family-body);
      font-size: var(--font-size-md);
      color: var(--color-text-secondary);
      line-height: 1.5;
      margin: 0 0 -6px 0;
    }

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
  private readonly savedCredentials = readDemoCredentials();
  private readonly savedName = localStorage.getItem(USER_NAME_KEY);

  readonly showWelcome = signal(!this.savedCredentials && !this.savedName);

  readonly loginForm = this.fb.group({
    email: [this.savedCredentials?.email ?? '', [Validators.required, Validators.email]],
    password: [this.savedCredentials?.password ?? '', Validators.required],
  });

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  constructor() {
    if (!this.savedCredentials && this.savedName) {
      const generatedCredentials = {
        name: this.savedName,
        email: buildDemoEmail(this.savedName),
        password: this.savedName,
      };

      saveDemoCredentials(generatedCredentials);
      this.loginForm.patchValue({
        email: generatedCredentials.email,
        password: generatedCredentials.password,
      });
    }
  }

  onWelcomeNameChanged(name: string): void {
    const formattedEmail = name.trim() ? buildDemoEmail(name) : '';

    this.loginForm.patchValue({
      email: formattedEmail,
      password: name,
    });
  }

  onWelcomeConfirmed(name: string): void {
    const credentials = {
      name,
      email: buildDemoEmail(name),
      password: name,
    };

    saveDemoCredentials(credentials);
    this.showWelcome.set(false);
    this.loginForm.patchValue({
      email: credentials.email,
      password: credentials.password,
    });
  }

  showError(controlName: string): boolean {
    const control = this.loginForm.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    try {
      const { email, password } = this.loginForm.value;
      const existingCredentials = readDemoCredentials();

      saveDemoCredentials({
        name: existingCredentials?.name || this.savedName || 'Empreendedor',
        email: email!,
        password: password!,
      });

      await this.authPort.login(email!, password!);
      await this.router.navigate(['/']);
    } catch (err: unknown) {
      this.error.set(err instanceof Error ? err.message : 'Erro ao efetuar login');
    } finally {
      this.loading.set(false);
    }
  }
}
