import { ChangeDetectionStrategy, Component, inject, output, signal, OnInit, computed } from '@angular/core';
import { AUTH_PORT } from '../../../core/tokens/injection-tokens';
import { DemoUser } from '../../../features/auth/domain/auth.types';
import { RouterLink, Router } from '@angular/router';
import { AlertsFacade } from '../../../features/alerts/application/alerts.facade';

@Component({
  selector: 'tc-topbar',
  standalone: true,
  imports: [RouterLink],
  template: `
    <header class="topbar">
      <div class="topbar-left">
        <div class="logo-container" routerLink="/">
          <div class="logo-icon"></div>
          <span class="logo-text">TrimiCash</span>
        </div>
      </div>
      
      <div class="topbar-right">
        @if (user()) {
          <span class="business-name">{{ user()?.businessName }}</span>
          
          <button class="alerts-btn" (click)="goToAlerts()" aria-label="Abrir alertas">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            @if (unreadCount() > 0) {
              <span class="badge">{{ unreadCount() > 9 ? '9+' : unreadCount() }}</span>
            }
          </button>
          
          <div class="avatar">
            {{ getInitials() }}
          </div>
        }
      </div>
    </header>
  `,
  styles: [`
    :host {
      display: block;
      background: var(--color-surface);
      border-bottom: 1px solid var(--color-border);
      padding: 0 var(--space-4);
      height: 64px;
    }
    .topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 100%;
    }
    .topbar-left, .topbar-right {
      display: flex;
      align-items: center;
      gap: var(--space-4);
    }
    .logo-container {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      cursor: pointer;
      text-decoration: none;
    }
    .logo-icon {
      width: 32px;
      height: 32px;
      background: var(--gradient-primary);
      border-radius: var(--radius-sm);
    }
    .logo-text {
      font-family: var(--font-family-display);
      font-weight: 700;
      font-size: var(--font-size-lg);
      color: var(--color-text-primary);
    }
    .business-name {
      font-weight: 500;
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      display: none;
    }
    @media (min-width: 768px) {
      .business-name { display: block; }
    }
    .alerts-btn {
      position: relative;
      background: none;
      border: none;
      color: var(--color-text-secondary);
      cursor: pointer;
      padding: var(--space-1);
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .alerts-btn:hover {
      background: var(--color-background);
      color: var(--color-text-primary);
    }
    .badge {
      position: absolute;
      top: -4px;
      right: -4px;
      min-width: 16px;
      height: 16px;
      padding: 0 4px;
      background: var(--color-danger-500);
      color: white;
      border-radius: 8px;
      font-size: 10px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--color-primary-900);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: var(--font-size-sm);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopbarComponent implements OnInit {
  private readonly authPort = inject(AUTH_PORT);
  private readonly router = inject(Router);
  private readonly alertsFacade = inject(AlertsFacade);
  
  openAlerts = output<void>();
  user = signal<DemoUser | null>(null);

  readonly unreadCount = computed(() => this.alertsFacade.unreadCount());

  ngOnInit(): void {
    this.user.set(this.authPort.current());
    void this.alertsFacade.loadData();
  }

  getInitials(): string {
    const name = this.user()?.name || '';
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  goToAlerts() {
    this.openAlerts.emit();
    this.router.navigate(['/alerts']);
  }
}
