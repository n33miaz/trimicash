import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { AUTH_PORT } from '../../../core/tokens/injection-tokens';
import { DemoUser } from '../../../features/auth/domain/auth.types';
import { AlertsFacade } from '../../../features/alerts/application/alerts.facade';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'tc-topbar',
  standalone: true,
  imports: [RouterLink],
  template: `
    <header class="topbar">
      <div class="topbar-left">
        <!-- Hamburger: visível apenas no mobile -->
        <button
          class="hamburger"
          (click)="menuToggled.emit()"
          aria-label="Abrir menu lateral"
          aria-expanded="false">
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div class="logo-container" routerLink="/">
          <div class="logo-icon" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="6" width="20" height="12" rx="2"/>
              <line x1="2" y1="10" x2="22" y2="10"/>
              <line x1="6" y1="15" x2="9" y2="15"/>
            </svg>
          </div>
          <span class="logo-text">Trimi<span class="logo-accent">Cash</span></span>
        </div>
      </div>

      <div class="topbar-right">
        @if (user()) {
          <span class="business-name">{{ user()?.businessName }}</span>

          <!-- T4: Toggle tema -->
          <button
            class="topbar-btn"
            (click)="toggleTheme()"
            [attr.aria-label]="isDark() ? 'Mudar para modo claro' : 'Mudar para modo escuro'">
            @if (isDark()) {
              <!-- Sol -->
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            } @else {
              <!-- Lua -->
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
              </svg>
            }
          </button>

          <button
            class="topbar-btn"
            (click)="goToAlerts()"
            [attr.aria-label]="'Abrir alertas — ' + unreadCount() + ' não lidos'">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 01-3.46 0"/>
            </svg>
            @if (unreadCount() > 0) {
              <span class="notif-dot" aria-hidden="true"></span>
            }
          </button>

          <div class="avatar" [attr.aria-label]="'Usuário: ' + user()?.name">
            {{ getInitials() }}
          </div>
        }
      </div>
    </header>
  `,
  styles: [`
    :host {
      display: none; /* Topbar oculta — logo e hamburger ficam na sidebar no desktop */
    }

    /* No mobile, mostrar topbar */
    @media (max-width: 767px) {
      :host {
        display: block;
        position: sticky;
        top: 0;
        z-index: 50;
        background: var(--header-bg);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border-bottom: 1px solid var(--color-border-card);
      }
    }

    .topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: var(--header-height);
      padding: 0 16px;
    }

    .topbar-left, .topbar-right {
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }

    /* ─── Hamburger ─────────────────────────────────────── */
    .hamburger {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 5px;
      width: 40px;
      height: 40px;
      border-radius: var(--radius-sm);
      background: var(--color-bg-card);
      border: 1px solid var(--color-border-card);
      cursor: pointer;
      transition: all var(--motion-fast);
    }

    .hamburger:hover {
      border-color: var(--color-accent-500);
      background: rgba(47, 128, 237, 0.06);
    }

    .hamburger span {
      width: 18px;
      height: 2px;
      background: var(--color-text-secondary);
      border-radius: 2px;
      transition: all 0.3s ease;
    }

    /* ─── Logo (mobile apenas) ──────────────────────────── */
    .logo-container {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      cursor: pointer;
    }

    .logo-icon {
      width: 32px;
      height: 32px;
      background: var(--gradient-primary);
      border-radius: 9px;
      display: grid;
      place-items: center;
    }

    .logo-text {
      font-family: var(--font-family-display);
      font-weight: 800;
      font-size: var(--font-size-lg);
      letter-spacing: -0.02em;
      color: var(--color-text-primary);
    }

    .logo-accent { color: var(--color-accent-500); }

    /* ─── Business name ─────────────────────────────────── */
    .business-name {
      font-weight: 500;
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      display: none;
    }

    @media (min-width: 768px) {
      .business-name { display: block; }
    }

    /* ─── Botões da topbar (tema + alertas) ─────────────── */
    .topbar-btn {
      position: relative;
      width: 40px;
      height: 40px;
      border-radius: var(--radius-sm);
      border: 1px solid var(--color-border-card);
      background: var(--color-bg-card);
      color: var(--color-text-secondary);
      display: grid;
      place-items: center;
      cursor: pointer;
      transition: all var(--motion-fast);
    }

    .topbar-btn:hover {
      border-color: var(--color-accent-500);
      color: var(--color-accent-500);
      background: rgba(47, 128, 237, 0.06);
    }

    .notif-dot {
      position: absolute;
      top: 8px;
      right: 8px;
      width: 8px;
      height: 8px;
      background: var(--color-danger-500);
      border-radius: 50%;
      border: 2px solid var(--color-background);
      animation: pulseBadge 2s ease-in-out infinite;
    }

    @keyframes pulseBadge {
      0%, 100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.4); }
      50%       { box-shadow: 0 0 0 6px rgba(220, 38, 38, 0); }
    }

    /* ─── Avatar ────────────────────────────────────────── */
    .avatar {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: var(--gradient-primary);
      color: white;
      display: grid;
      place-items: center;
      font-family: var(--font-family-display);
      font-weight: 700;
      font-size: var(--font-size-sm);
      cursor: default;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopbarComponent implements OnInit {
  private readonly authPort = inject(AUTH_PORT);
  private readonly router = inject(Router);
  private readonly alertsFacade = inject(AlertsFacade);
  private readonly themeService = inject(ThemeService);

  readonly openAlerts = output<void>();
  readonly menuToggled = output<void>();
  readonly user = signal<DemoUser | null>(null);

  readonly unreadCount = computed(() => this.alertsFacade.unreadCount());
  readonly isDark = computed(() => this.themeService.current() === 'dark');

  ngOnInit(): void {
    this.user.set(this.authPort.current());
    void this.alertsFacade.loadData();
  }

  getInitials(): string {
    const name = this.user()?.name || '';
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  goToAlerts() {
    this.openAlerts.emit();
    this.router.navigate(['/alerts']);
  }

  toggleTheme(): void {
    this.themeService.toggle();
  }
}
