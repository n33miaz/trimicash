import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/**
 * MainLayoutComponent — placeholder para T00.
 * T05 substituirá com sidebar, topbar, footer e layout responsivo.
 */
@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<router-outlet />`,
})
export class MainLayoutComponent {}
