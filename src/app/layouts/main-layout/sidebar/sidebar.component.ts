import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'tc-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="nav-container">
      <ul class="nav-list">
        <li>
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
            <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            <span>Dashboard</span>
          </a>
        </li>
        <li>
          <a routerLink="/cash-flow" routerLinkActive="active">
            <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
            <span>Caixa</span>
          </a>
        </li>
        <li>
          <a routerLink="/accounts-payable" routerLinkActive="active">
            <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
            <span>Contas</span>
          </a>
        </li>
        <li>
          <a routerLink="/alerts" routerLinkActive="active">
            <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
            <span>Alertas</span>
          </a>
        </li>
        <li>
          <a routerLink="/settings" routerLinkActive="active">
            <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
            <span>Ajustes</span>
          </a>
        </li>
      </ul>
    </nav>
  `,
  styles: [`
    :host {
      display: block;
      background: var(--color-surface);
    }
    
    .nav-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
    }

    a {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--space-1);
      text-decoration: none;
      color: var(--color-text-secondary);
      padding: var(--space-2);
      font-size: var(--font-size-xs);
      font-weight: 500;
      transition: color var(--motion-fast);
    }
    
    a:hover {
      color: var(--color-primary-700);
    }

    a.active {
      color: var(--color-accent-500);
    }

    /* Mobile (bottom nav) */
    @media (max-width: 767px) {
      :host {
        border-top: 1px solid var(--color-border);
      }
      .nav-list {
        justify-content: space-around;
        height: 64px;
      }
      a {
        width: 100%;
        height: 100%;
      }
    }

    /* Desktop (sidebar) */
    @media (min-width: 768px) {
      :host {
        border-right: 1px solid var(--color-border);
        width: 240px;
        height: 100%;
      }
      .nav-list {
        flex-direction: column;
        padding: var(--space-4);
        gap: var(--space-2);
      }
      a {
        flex-direction: row;
        justify-content: flex-start;
        gap: var(--space-3);
        padding: var(--space-3);
        font-size: var(--font-size-sm);
        border-radius: var(--radius-md);
      }
      a:hover {
        background: var(--color-background);
      }
      a.active {
        background: var(--color-primary-50);
        color: var(--color-primary-900);
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {}
