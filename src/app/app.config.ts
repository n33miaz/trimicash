import {
  ApplicationConfig,
  provideZoneChangeDetection,
  APP_INITIALIZER,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';

import { routes } from './app.routes';

// ─── Tokens de injeção ───────────────────────────────────────────────────────
import {
  MOVEMENT_REPOSITORY,
  PAYABLE_REPOSITORY,
  CATEGORY_REPOSITORY,
  AUTH_PORT,
  APP_SETTINGS,
} from './core/tokens/injection-tokens';

// ─── Adapters (implementações mock da Fase 1) ────────────────────────────────
import { MovementLocalAdapter }  from './features/cash-flow/infrastructure/movement-local.adapter';
import { PayableLocalAdapter }   from './features/accounts-payable/infrastructure/payable-local.adapter';
import { CategoryLocalAdapter }  from './features/categories/infrastructure/category-local.adapter';
import { AuthMockAdapter }       from './features/auth/infrastructure/auth-mock.adapter';
import {
  SettingsLocalAdapter,
  settingsSignalFactory,
} from './features/settings/infrastructure/settings-local.adapter';

// ─── Seeds ───────────────────────────────────────────────────────────────────
import { SeedRunner, seedRunnerFactory } from './core/mocks/seed-runner';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withFetch()),

    // ── Repositórios mock ──
    { provide: MOVEMENT_REPOSITORY,  useClass: MovementLocalAdapter },
    { provide: PAYABLE_REPOSITORY,   useClass: PayableLocalAdapter },
    { provide: CATEGORY_REPOSITORY,  useClass: CategoryLocalAdapter },

    // ── Auth mock ──
    { provide: AUTH_PORT, useClass: AuthMockAdapter },

    // ── Settings signal ──
    {
      provide:    APP_SETTINGS,
      useFactory: (adapter: SettingsLocalAdapter) => settingsSignalFactory(adapter),
      deps:       [SettingsLocalAdapter],
    },

    // ── Bootstrap: popula localStorage antes do primeiro render ──
    {
      provide:    APP_INITIALIZER,
      useFactory: seedRunnerFactory,
      deps:       [SeedRunner],
      multi:      true,
    },
  ],
};
