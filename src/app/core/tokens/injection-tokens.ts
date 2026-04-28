/**
 * injection-tokens.ts — TrimiCash
 * Centraliza todos os InjectionTokens da aplicação.
 * Cada token aponta para a interface/porta correspondente.
 * Os providers concretos (adapters) são registrados em app.config.ts na Fase 2
 * ou nos providers dos feature modules com os adapters mock na Fase 1 (T04).
 */

import { InjectionToken, Signal } from '@angular/core';
import type { MovementRepository } from '../../../app/features/cash-flow/domain/ports/movement.repository';
import type { PayableRepository } from '../../../app/features/accounts-payable/domain/ports/payable.repository';
import type { CategoryRepository } from '../../../app/features/categories/domain/category.repository';
import type { AuthPort } from '../../../app/features/auth/domain/auth.types';
import type { AppSettings } from '../../../app/features/settings/domain/settings.types';

/** Repositório de movimentações (entradas/saídas efetivadas) */
export const MOVEMENT_REPOSITORY = new InjectionToken<MovementRepository>(
  'MOVEMENT_REPOSITORY'
);

/** Repositório de contas a pagar */
export const PAYABLE_REPOSITORY = new InjectionToken<PayableRepository>(
  'PAYABLE_REPOSITORY'
);

/** Repositório de categorias */
export const CATEGORY_REPOSITORY = new InjectionToken<CategoryRepository>(
  'CATEGORY_REPOSITORY'
);

/** Porta de autenticação (mock na Fase 1) */
export const AUTH_PORT = new InjectionToken<AuthPort>('AUTH_PORT');

/** Configurações globais da aplicação como Signal */
export const APP_SETTINGS = new InjectionToken<Signal<AppSettings>>(
  'APP_SETTINGS'
);
