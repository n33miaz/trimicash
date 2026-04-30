import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  inject,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastComponent } from './shared/components/toast/toast.component';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <router-outlet />
    <tc-toast />
  `,
})
export class AppComponent {
  private readonly theme = inject(ThemeService);

  constructor() {
    this.theme.init();
  }

  /** T3 — Aviso nativo ao fechar/recarregar enquanto há sessão ativa. */
  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload(event: BeforeUnloadEvent): void {
    if (sessionStorage.getItem('trimicash:session')) {
      event.preventDefault();
    }
  }
}
