import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TopbarComponent } from './topbar/topbar.component';
import { SidebarComponent } from './sidebar/sidebar.component';

@Component({
  selector: 'tc-main-layout',
  standalone: true,
  imports: [RouterOutlet, TopbarComponent, SidebarComponent],
  template: `
    <div class="layout-container">
      <tc-topbar class="topbar" (openAlerts)="onOpenAlerts()"></tc-topbar>
      
      <div class="layout-body">
        <tc-sidebar class="sidebar"></tc-sidebar>
        
        <main class="main-content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
      width: 100vw;
      overflow: hidden;
      background: var(--color-background);
    }
    .layout-container {
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    .topbar {
      flex-shrink: 0;
      z-index: 10;
    }
    .layout-body {
      flex: 1;
      display: flex;
      overflow: hidden;
      position: relative;
    }
    .main-content {
      flex: 1;
      overflow-y: auto;
      padding: var(--space-4);
    }
    
    /* Mobile-first: Sidebar is bottom-nav */
    @media (max-width: 767px) {
      .layout-body {
        flex-direction: column;
      }
      .sidebar {
        order: 2; /* Bottom nav goes at the bottom */
        z-index: 10;
      }
      .main-content {
        order: 1;
        padding-bottom: env(safe-area-inset-bottom, 0); /* Support for mobile safe areas */
      }
    }
    
    /* Desktop: Sidebar is on the left */
    @media (min-width: 768px) {
      .layout-body {
        flex-direction: row;
      }
      .sidebar {
        flex-shrink: 0;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainLayoutComponent {
  onOpenAlerts(): void {
    // To be implemented or handled globally
    console.log('Open alerts');
  }
}
