import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AlertsFacade } from '../../../features/alerts/application/alerts.facade';
import { AUTH_PORT } from '../../../core/tokens/injection-tokens';

@Component({
  selector: 'tc-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <!-- Overlay mobile -->
    @if (isOpen()) {
      <div class="sidebar-overlay" (click)="close()" aria-hidden="true"></div>
    }

    <aside class="sidebar" [class.open]="isOpen()">
      <!-- Logo -->
      <div class="sidebar-logo">
        <div class="logo-icon" routerLink="/" style="cursor:pointer">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="6" width="20" height="12" rx="2"/>
            <line x1="2" y1="10" x2="22" y2="10"/>
            <line x1="6" y1="15" x2="9" y2="15"/>
          </svg>
        </div>
        <span class="logo-text">Trimi<span class="logo-accent">Cash</span></span>
      </div>

      <!-- Nav -->
      <nav class="sidebar-nav" aria-label="Navegação principal">
        <span class="nav-label">Principal</span>

        <a class="nav-item"
           routerLink="/"
           routerLinkActive="active"
           [routerLinkActiveOptions]="{exact: true}"
           (click)="onNavClick()">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1"/>
            <rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="3" y="14" width="7" height="7" rx="1"/>
            <rect x="14" y="14" width="7" height="7" rx="1"/>
          </svg>
          <span>Dashboard</span>
        </a>

        <a class="nav-item"
           routerLink="/cash-flow"
           routerLinkActive="active"
           (click)="onNavClick()">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="1" x2="12" y2="23"/>
            <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
          </svg>
          <span>Caixa</span>
        </a>

        <a class="nav-item"
           routerLink="/accounts-payable"
           routerLinkActive="active"
           (click)="onNavClick()">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
            <line x1="1" y1="10" x2="23" y2="10"/>
          </svg>
          <span>Contas a Pagar</span>
        </a>

        <span class="nav-label">Sistema</span>

        <a class="nav-item"
           routerLink="/alerts"
           routerLinkActive="active"
           (click)="onNavClick()">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 01-3.46 0"/>
          </svg>
          <span>Alertas</span>
          @if (unreadCount() > 0) {
            <span class="nav-badge" [attr.aria-label]="unreadCount() + ' alertas não lidos'">
              {{ unreadCount() > 9 ? '9+' : unreadCount() }}
            </span>
          }
        </a>

        <a class="nav-item"
           routerLink="/settings"
           routerLinkActive="active"
           (click)="onNavClick()">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
          </svg>
          <span>Configurações</span>
        </a>
      </nav>

      <!-- Footer -->
      @if (user()) {
        <div class="sidebar-footer">
          <div class="sidebar-avatar" aria-hidden="true">{{ initials() }}</div>
          <div class="sidebar-user-info">
            <span class="user-name">{{ user()?.name }}</span>
            <span class="user-role">{{ user()?.businessName }}</span>
          </div>
        </div>
      }
    </aside>
  `,
  styles: [`
    /* ─── Overlay Mobile ─────────────────────────────────── */
    .sidebar-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.45);
      backdrop-filter: blur(4px);
      z-index: 99;
      animation: fadeIn 0.25s ease both;
    }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

    /* ─── Sidebar Base ────────────────────────────────────── */
    .sidebar {
      position: fixed;
      left: 0; top: 0; bottom: 0;
      width: var(--sidebar-width);
      background: var(--sidebar-bg);
      border-right: 1px solid var(--color-border-sidebar);
      padding: 24px 16px;
      display: flex;
      flex-direction: column;
      z-index: 100;
      box-shadow: var(--shadow-sm);
      transition: transform var(--motion-slow);
      /* Mobile: escondida por padrão */
      transform: translateX(-100%);
    }

    /* Desktop: sempre visível */
    @media (min-width: 768px) {
      .sidebar { transform: translateX(0); }
    }

    /* Mobile: aberta via class */
    .sidebar.open { transform: translateX(0); }

    /* ─── Logo ───────────────────────────────────────────── */
    .sidebar-logo {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 36px;
      padding: 0 4px;
    }

    .logo-icon {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      background: var(--gradient-primary);
      display: grid;
      place-items: center;
      flex-shrink: 0;
      box-shadow: 0 0 16px rgba(47, 128, 237, 0.3);
      transition: box-shadow var(--motion-normal);
    }

    .logo-icon:hover {
      box-shadow: 0 0 24px rgba(47, 128, 237, 0.45);
    }

    .logo-text {
      font-family: var(--font-family-display);
      font-size: var(--font-size-xl);
      font-weight: 800;
      letter-spacing: -0.02em;
      color: var(--logo-text-color);
    }

    .logo-accent { color: var(--color-accent-500); }

    /* ─── Nav ────────────────────────────────────────────── */
    .sidebar-nav {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
      overflow-y: auto;
    }

    .nav-label {
      font-size: 0.65rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--color-text-muted);
      padding: 16px 12px 6px;
      font-weight: 600;
      font-family: var(--font-family-body);
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 14px;
      border-radius: var(--radius-sm);
      color: var(--sidebar-text);
      font-size: var(--font-size-sm);
      font-weight: 500;
      font-family: var(--font-family-body);
      cursor: pointer;
      transition: all 0.25s ease;
      text-decoration: none;
      position: relative;
      overflow: hidden;
    }

    /* Indicador lateral animado */
    .nav-item::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 3px;
      height: 0;
      background: var(--color-accent-500);
      border-radius: 0 3px 3px 0;
      transition: height 0.3s var(--motion-spring);
    }

    .nav-item:hover {
      color: var(--sidebar-text-active);
      background: rgba(47, 128, 237, 0.07);
    }

    .nav-item:hover::before { height: 60%; }

    .nav-item.active {
      color: var(--sidebar-text-active);
      background: rgba(47, 128, 237, 0.1);
      font-weight: 600;
    }

    .nav-item.active::before { height: 60%; }

    .nav-icon {
      width: 20px;
      height: 20px;
      flex-shrink: 0;
      opacity: var(--sidebar-icon-opacity);
      transition: opacity var(--motion-fast);
    }

    .nav-item:hover .nav-icon,
    .nav-item.active .nav-icon { opacity: 1; }

    /* Badge de alerta */
    .nav-badge {
      margin-left: auto;
      background: var(--color-danger-500);
      color: #fff;
      font-size: 0.65rem;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: var(--radius-full);
      min-width: 20px;
      text-align: center;
      animation: pulseBadge 2s ease-in-out infinite;
    }

    @keyframes pulseBadge {
      0%, 100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.4); }
      50%       { box-shadow: 0 0 0 6px rgba(220, 38, 38, 0); }
    }

    /* ─── Footer ─────────────────────────────────────────── */
    .sidebar-footer {
      border-top: 1px solid var(--color-border-card);
      padding-top: 16px;
      margin-top: 8px;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .sidebar-avatar {
      width: 38px;
      height: 38px;
      border-radius: 10px;
      background: var(--gradient-primary);
      display: grid;
      place-items: center;
      font-family: var(--font-family-display);
      font-weight: 700;
      font-size: 0.85rem;
      color: #fff;
      flex-shrink: 0;
    }

    .sidebar-user-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
    }

    .user-name {
      font-size: var(--font-size-sm);
      font-weight: 600;
      color: var(--color-text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .user-role {
      font-size: 0.7rem;
      color: var(--color-text-muted);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent implements OnInit {
  private readonly alertsFacade = inject(AlertsFacade);
  private readonly authPort = inject(AUTH_PORT);

  readonly isOpen = signal(false);
  readonly user = signal<{ name: string; businessName?: string } | null>(null);

  readonly unreadCount = computed(() => this.alertsFacade.unreadCount());

  readonly initials = computed(() => {
    const name = this.user()?.name ?? '';
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : name.substring(0, 2).toUpperCase();
  });

  ngOnInit(): void {
    const current = this.authPort.current();
    if (current) {
      this.user.set({ name: current.name, businessName: current.businessName });
    }
    void this.alertsFacade.loadData();
  }

  open(): void  { this.isOpen.set(true); }
  close(): void { this.isOpen.set(false); }
  toggle(): void { this.isOpen.update(v => !v); }

  onNavClick(): void {
    // Fecha sidebar ao navegar no mobile
    if (window.innerWidth < 768) {
      this.close();
    }
  }
}
