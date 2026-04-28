# T00 — Foundation: Bootstrap & Contratos

**Onda:** W0 · **Paralelismo:** sequencial (bloqueia tudo) · **Agente:** 1

## Objetivo
Bootstrappar o projeto Angular standalone, instalar tooling, criar design tokens globais e declarar **todos os contratos** (entities stub, value objects, ports, tipos compartilhados) que as ondas seguintes irão implementar. Nada de regra de negócio aqui — apenas esqueleto + interfaces.

## Pré-requisitos
- Pasta `src/` já existe vazia (apenas a árvore inicial). Preservar.
- Ler `docs/architecture.md` (seções 1, 4, 8, 9).

## Stack a Instalar
- Angular 18+ standalone (`@angular/core`, `@angular/router`, `@angular/forms`, `@angular/common`).
- Build: Angular CLI / esbuild via `@angular-devkit/build-angular`.
- Testes unitários: **Vitest** + `@analogjs/vitest-angular` (preferir Vitest a Karma).
- E2E: **Playwright**.
- Lint/format: ESLint + `@angular-eslint` + Prettier.
- Estilos: SCSS.
- Datas: `date-fns`.
- Sem CSS framework — design tokens próprios.

## Escopo de Arquivos (criar/editar somente estes)
```
package.json, pnpm-workspace.yaml (se aplicável), tsconfig*.json, angular.json,
.eslintrc.cjs, .prettierrc, vitest.config.ts, playwright.config.ts,
src/main.ts, src/index.html, src/styles.scss,
src/styles/_tokens.scss, src/styles/_typography.scss, src/styles/_reset.scss, src/styles/_utilities.scss,
src/environments/environment.ts, src/environments/environment.development.ts,
src/app/app.component.ts, src/app/app.config.ts, src/app/app.routes.ts (com rotas placeholder),
src/app/core/tokens/*.ts (InjectionTokens),
src/app/core/utils/money.util.ts, src/app/core/utils/date.util.ts,
src/app/shared/types/*.ts,
src/app/features/<feature>/domain/entities/*.entity.ts (stubs),
src/app/features/<feature>/domain/ports/*.port.ts (interfaces),
src/app/features/<feature>/domain/value-objects/*.vo.ts (stubs),
README.md (instruções básicas de rodar).
```

## Entregáveis Concretos

### 1. Design Tokens (`src/styles/_tokens.scss`)
Reproduzir exatamente a tabela da seção 1.1 e blocos 1.2/1.3 de `architecture.md`. Expor como CSS Custom Properties em `:root`. Tipografia importada via `@import` de Google Fonts em `index.html`.

### 2. Tipos Compartilhados (`src/app/shared/types/`)
```ts
// money.type.ts
export type Money = number; // centavos? não — usar number em reais com 2 casas; util faz arredondamento

// period.type.ts
export type PeriodKey = 'CURRENT_MONTH' | 'NEXT_7' | 'NEXT_15' | 'NEXT_30' | 'END_OF_MONTH';
export interface Period { start: Date; end: Date; key: PeriodKey; }

// alert.type.ts
export type AlertSeverity = 'INFO' | 'WARNING' | 'CRITICAL';
export type AlertCode = 'ALR-VENC-7D' | 'ALR-VENC-2D' | 'ALR-ATRASO' | 'ALR-DEFICIT' | 'ALR-PROJEC-NEG' | 'ALR-CAIXA-CRIT';
export interface AppAlert {
  id: string; code: AlertCode; severity: AlertSeverity;
  title: string; message: string; createdAt: Date; relatedId?: string;
}

// reserve-health.type.ts
export type ReserveHealth = 'HEALTHY' | 'ATTENTION' | 'DEFICIT';
```

### 3. Stubs de Domínio (apenas assinaturas, **sem implementação**)

**Cash-Flow** (`features/cash-flow/domain/`):
```ts
// entities/movement.entity.ts
export type MovementType = 'ENTRADA' | 'SAIDA';
export interface Movement {
  id: string; type: MovementType; amount: number; date: Date;
  categoryId: string; description: string; sourcePayableId?: string;
}

// ports/movement.repository.ts
export interface MovementRepository {
  list(period?: Period): Promise<Movement[]>;
  getById(id: string): Promise<Movement | null>;
  create(input: Omit<Movement, 'id'>): Promise<Movement>;
  update(id: string, patch: Partial<Movement>): Promise<Movement>;
  remove(id: string): Promise<void>;
}
export const MOVEMENT_REPOSITORY = new InjectionToken<MovementRepository>('MOVEMENT_REPOSITORY');
```

**Accounts Payable** (`features/accounts-payable/domain/`):
```ts
// entities/payable-account.entity.ts
export type PayableStatus = 'PENDENTE' | 'PAGA' | 'ATRASADA' | 'CANCELADA';
export type RecurrenceFrequency = 'NONE' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
export interface PayableAccount {
  id: string; description: string; amount: number; dueDate: Date;
  categoryId: string; status: PayableStatus;
  recurrence: RecurrenceFrequency; recurrenceGroupId?: string;
  paidAt?: Date; paidMovementId?: string;
}

// ports/payable.repository.ts
export interface PayableRepository {
  list(filter?: { status?: PayableStatus; period?: Period }): Promise<PayableAccount[]>;
  getById(id: string): Promise<PayableAccount | null>;
  create(input: Omit<PayableAccount, 'id' | 'status'>): Promise<PayableAccount>;
  update(id: string, patch: Partial<PayableAccount>): Promise<PayableAccount>;
  remove(id: string): Promise<void>;
}
export const PAYABLE_REPOSITORY = new InjectionToken<PayableRepository>('PAYABLE_REPOSITORY');
```

**Categories** (`features/categories/domain/`):
```ts
export interface Category { id: string; name: string; color: string; }
export interface CategoryRepository {
  list(): Promise<Category[]>;
  create(input: Omit<Category,'id'>): Promise<Category>;
  update(id: string, patch: Partial<Category>): Promise<Category>;
  remove(id: string): Promise<void>;
}
export const CATEGORY_REPOSITORY = new InjectionToken<CategoryRepository>('CATEGORY_REPOSITORY');
```

**Auth (mock)** (`features/auth/domain/`):
```ts
export interface DemoUser { id: string; name: string; businessName: string; }
export interface AuthPort {
  current(): DemoUser | null;
  login(email: string, password: string): Promise<DemoUser>;
  logout(): void;
}
export const AUTH_PORT = new InjectionToken<AuthPort>('AUTH_PORT');
```

**Settings** (`features/settings/domain/`):
```ts
export interface AppSettings {
  reserveSafetyMarginPct: number; // default 10
  reserveAttentionThresholdPct: number; // default 20
  minSafetyDays: number; // default 7
}
export const APP_SETTINGS = new InjectionToken<Signal<AppSettings>>('APP_SETTINGS');
```

### 4. Utilitários (com implementação mínima)
- `money.util.ts`: `formatBRL(value)`, `roundCurrency(value)`, `sum(values)`.
- `date.util.ts`: `daysBetween(a,b)`, `isOverdue(date, ref)`, `getPeriod(key, ref): Period`.
- `brl-currency.pipe.ts` (em `shared/pipes/`).

### 5. Layout Mínimo de Rotas (`app.routes.ts`)
Configurar lazy-loading exatamente como mostrado em `architecture.md` §6, mas **sem componentes** ainda — cada `*.routes.ts` exporta `[]` ou um placeholder. T05 substitui depois.

### 6. Scripts em `package.json`
```json
{
  "dev": "ng serve",
  "build": "ng build",
  "test": "vitest run",
  "test:watch": "vitest",
  "lint": "eslint .",
  "format": "prettier --write .",
  "e2e": "playwright test"
}
```

### 7. README.md (raiz)
Seção `## Como Rodar` com `pnpm install`, `pnpm dev`, `pnpm test`, `pnpm e2e`.

## Aceite
- [ ] `pnpm install` sem erro.
- [ ] `pnpm dev` sobe e renderiza uma página em branco com fonte Inter aplicada.
- [ ] `pnpm tsc --noEmit` zero erros.
- [ ] `pnpm lint` zero erros.
- [ ] `pnpm test` roda (mesmo sem testes).
- [ ] Todos os InjectionTokens, interfaces e tipos da seção "Entregáveis Concretos" existem.
- [ ] `_tokens.scss` exporta todas as variáveis da architecture.md §1.

## Fora de Escopo
- Implementação de regra financeira (T01–T03).
- Adapters concretos (T04).
- Componentes UI reais (T05).
- Páginas de feature (T08–T11).
