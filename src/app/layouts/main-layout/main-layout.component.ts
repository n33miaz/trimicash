import {
  ChangeDetectionStrategy,
  Component,
  ViewChild,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TopbarComponent } from './topbar/topbar.component';
import { SidebarComponent } from './sidebar/sidebar.component';

@Component({
  selector: 'tc-main-layout',
  standalone: true,
  imports: [RouterOutlet, TopbarComponent, SidebarComponent],
  template: `
    <!-- Topbar (visível apenas no mobile — contém hamburger) -->
    <tc-topbar (menuToggled)="sidebar.toggle()" (openAlerts)="onOpenAlerts()"></tc-topbar>

    <!-- Sidebar (fixed, overlay no mobile) -->
    <tc-sidebar #sidebar></tc-sidebar>

    <!-- Conteúdo principal -->
    <main class="main-content">
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background: var(--color-background);
    }

    .main-content {
      /* Desktop: deslocar para direita da sidebar */
      margin-left: 0;
      min-height: 100vh;
      padding: 16px 12px 80px; /* Mobile: padding inferior p/ bottom safe area */
      transition: margin-left var(--motion-slow);
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
  @ViewChild('sidebar') sidebar!: SidebarComponent;

  onOpenAlerts(): void {
    return;
  }
}
