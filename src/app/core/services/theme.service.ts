import { Injectable, signal } from '@angular/core';

type Theme = 'light' | 'dark';
const STORAGE_KEY = 'trimicash:theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly current = signal<Theme>(this.loadTheme());

  /** Aplica o tema salvo no DOM. Chamar uma vez no AppComponent. */
  init(): void {
    this.applyToDom(this.current());
  }

  /** Alterna entre light ↔ dark e persiste no localStorage. */
  toggle(): void {
    const next: Theme = this.current() === 'light' ? 'dark' : 'light';
    this.current.set(next);
    this.applyToDom(next);
    localStorage.setItem(STORAGE_KEY, next);
  }

  private applyToDom(theme: Theme): void {
    document.documentElement.setAttribute('data-theme', theme === 'dark' ? 'dark' : '');
  }

  private loadTheme(): Theme {
    return (localStorage.getItem(STORAGE_KEY) as Theme) || 'light';
  }
}
