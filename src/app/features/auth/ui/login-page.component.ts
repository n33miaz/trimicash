import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AUTH_PORT } from '../../../core/tokens/injection-tokens';
import { InputComponent } from '../../../shared/components/input/input.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { WelcomeModalComponent } from './components/welcome-modal.component';

@Component({
  selector: 'tc-login-page',
  standalone: true,
  imports: [ReactiveFormsModule, InputComponent, ButtonComponent, WelcomeModalComponent],
  template: `
    <!-- T1: Modal de boas-vindas na primeira visita -->
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

    /* T2: Logo icon */
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

  // T1: Mostrar modal apenas se não há nome salvo
  readonly showWelcome = signal(!localStorage.getItem('trimicash:userName'));

  readonly loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  /** T1: Atualiza campos em tempo real conforme digitação no modal */
  onWelcomeNameChanged(name: string): void {
    const formattedEmail = name.trim() ? `${name.toLowerCase().replace(/\s+/g, '')}@gmail.com` : '';
    this.loginForm.patchValue({
      email: formattedEmail,
      password: name
    });
  }

  /** T1: Persiste nome e fecha modal. */
  onWelcomeConfirmed(name: string): void {
    localStorage.setItem('trimicash:userName', name);
    this.showWelcome.set(false);
    
    const formattedEmail = name.trim() ? `${name.toLowerCase().replace(/\s+/g, '')}@gmail.com` : '';
    this.loginForm.patchValue({
      email: formattedEmail,
      password: name
    });
  }

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
