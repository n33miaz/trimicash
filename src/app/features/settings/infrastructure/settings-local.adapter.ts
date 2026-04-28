import { Injectable, signal, Signal } from '@angular/core';
import { AppSettings, DEFAULT_APP_SETTINGS } from '../domain/settings.types';

const STORAGE_KEY = 'trimicash:settings';

@Injectable({
  providedIn: 'root'
})
export class SettingsLocalAdapter {
  private readonly state = signal<AppSettings>(this.readStorage());

  /** Retorna o estado como um Signal (read-only) */
  get settings(): Signal<AppSettings> {
    return this.state.asReadonly();
  }

  /** Atualiza as configurações e persiste no localStorage */
  updateSettings(patch: Partial<AppSettings>): void {
    const current = this.state();
    const updated = { ...current, ...patch };
    this.state.set(updated);
    this.writeStorage(updated);
  }

  private readStorage(): AppSettings {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return DEFAULT_APP_SETTINGS;
    try {
      return JSON.parse(data);
    } catch {
      return DEFAULT_APP_SETTINGS;
    }
  }

  private writeStorage(settings: AppSettings): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }
}

/** 
 * Factory para o token APP_SETTINGS,
 * provê o Signal diretamente a partir do SettingsLocalAdapter.
 */
export function settingsSignalFactory(adapter: SettingsLocalAdapter): Signal<AppSettings> {
  return adapter.settings;
}
