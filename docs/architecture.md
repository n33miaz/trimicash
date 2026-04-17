# TrimiCash — Architecture

> Frontend Angular com dados mockados. Arquitetura preparada para absorver um back-end real em fase futura **sem reescrita** — apenas substituição de adaptadores.

---

## 1. Identidade Visual

### 1.1 — Paleta

| Função | Token | Cor |
|---|---|---|
| Principal (institucional) | `--color-primary-900` | `#051B61` |
| Hover do primário | `--color-primary-700` | `#0B2F8F` |
| Destaque / CTA | `--color-accent-500` | `#2F80ED` |
| Hover do accent | `--color-accent-600` | `#1E6FDD` |
| Sucesso / Entradas | `--color-success-500` | `#16A34A` |
| Sucesso — background | `--color-success-50` | `#DCFCE7` |
| Alerta / Saídas | `--color-danger-500` | `#DC2626` |
| Alerta — background | `--color-danger-50` | `#FEE2E2` |
| Atenção | `--color-warning-500` | `#F59E0B` |
| Atenção — background | `--color-warning-50` | `#FEF3C7` |
| Texto principal | `--color-text-primary` | `#111827` |
| Texto secundário | `--color-text-secondary` | `#6B7280` |
| Texto desabilitado | `--color-text-disabled` | `#9CA3AF` |
| Bordas | `--color-border` | `#E5E7EB` |
| Divisores fortes | `--color-border-strong` | `#D1D5DB` |
| Superfície (cards) | `--color-surface` | `#FFFFFF` |
| Background da página | `--color-background` | `#F9FAFB` |
| Overlay de modal | `--color-overlay` | `rgba(17,24,39,0.55)` |
| Gradiente institucional | `--gradient-primary` | `linear-gradient(135deg, #051B61 0%, #2F80ED 100%)` |

Estados de `hover` derivados via `color-mix(in srgb, var(--color-X) 92%, black)` — zero hex hardcoded em componente.

### 1.2 — Tipografia

```css
--font-family-display: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
--font-family-body:    'Inter', system-ui, -apple-system, sans-serif;

--font-size-xs:  0.75rem;  /* 12 */
--font-size-sm:  0.875rem; /* 14 */
--font-size-md:  1rem;     /* 16 base */
--font-size-lg:  1.125rem; /* 18 */
--font-size-xl:  1.25rem;  /* 20 */
--font-size-2xl: 1.5rem;   /* 24 */
--font-size-3xl: 1.875rem; /* 30 */
--font-size-4xl: 2.25rem;  /* 36 */

--font-weight-regular:  400;
--font-weight-medium:   500;
--font-weight-semibold: 600;
--font-weight-bold:     700;
```

| Classe | Família | Tamanho | Peso | Uso |
|---|---|---|---|---|
| `.display-lg` | Jakarta | 36 | 700 | Números do dashboard (saldo principal). |
| `.display-md` | Jakarta | 30 | 700 | Títulos de página. |
| `.heading-lg` | Jakarta | 24 | 600 | Cabeçalhos de card. |
| `.heading-md` | Jakarta | 20 | 600 | Seções internas. |
| `.body-md` | Inter | 16 | 400 | Texto padrão. |
| `.body-sm` | Inter | 14 | 400 | Texto auxiliar. |
| `.label` | Inter | 12 | 500 | Labels de form e badges. |

### 1.3 — Layout

```css
/* Spacing (escala 4) */
--space-1: 0.25rem; --space-2: 0.5rem;  --space-3: 0.75rem;
--space-4: 1rem;    --space-5: 1.5rem;  --space-6: 2rem;
--space-7: 3rem;    --space-8: 4rem;

/* Radius */
--radius-sm: 4px; --radius-md: 8px; --radius-lg: 12px;
--radius-xl: 16px; --radius-2xl: 24px; --radius-full: 9999px;

/* Elevation */
--shadow-sm: 0 1px 2px rgba(17,24,39,.06);
--shadow-md: 0 4px 8px rgba(17,24,39,.08);
--shadow-lg: 0 12px 24px rgba(17,24,39,.10);
--shadow-xl: 0 24px 48px rgba(17,24,39,.12);

/* Motion */
--motion-fast:   120ms cubic-bezier(.4,0,.2,1);
--motion-normal: 200ms cubic-bezier(.4,0,.2,1);
--motion-slow:   320ms cubic-bezier(.4,0,.2,1);

/* Breakpoints */
--bp-sm:  640px; --bp-md: 768px; --bp-lg: 1024px; --bp-xl: 1280px;
```

### 1.4 — Linguagem visual

- **Cantos arredondados** (`--radius-lg`/`--radius-xl` default em cards).
- **Gradientes lineares suaves** entre tons de azul para superfícies premium.
- **Sombras sutis** (`--shadow-sm` default; `--shadow-md` em hover).
- **Tom de voz visual:** credibilidade + eficiência (estilo SaaS/Fintech).

### 1.5 — Acessibilidade

- Contraste mínimo WCAG AA (4.5:1 texto, 3:1 componentes).
- `:focus-visible` com outline customizado em todos interativos.
- `aria-label` em botões icon-only; `aria-live` em alertas dinâmicos.
- Navegação completa por teclado (tab order lógica).
- Sem `div` clicável — semântica correta sempre.

### 1.6 — Dark mode (previsto, não executado nesta fase)

Tokens já desenhados para suportar `[data-theme="dark"]` — basta sobrescrever neutros sem tocar em nenhuma feature.

---

## 2. Princípios arquiteturais

| Princípio | Aplicação concreta |
|---|---|
| **Clean Architecture** | Camadas concêntricas — domínio no centro, UI na borda. |
| **SOLID** | Especialmente ISP e DIP — dependências apontam para abstrações. |
| **DRY** | Componentes e utilitários reutilizáveis em `shared/`. |
| **KISS** | Sem padrões "de catálogo" sem necessidade. |
| **YAGNI** | A estrutura **prevê** a fase futura; o código **não pré-constrói** ela. |
| **Alta coesão / baixo acoplamento** | Cada feature é um pacote isolado, comunica por portas. |
| **Feature-first** | Estrutura física segue o domínio, não a tecnicalidade. |

## 3. Camadas lógicas

```
┌──────────────────────────────────────────────────────────┐
│  UI (Angular standalone components + Signals)            │  ← mutável
├──────────────────────────────────────────────────────────┤
│  Application (use cases, facades)                        │
├──────────────────────────────────────────────────────────┤
│  Domain (entities, value objects, domain services)       │  ← estável (coração)
├──────────────────────────────────────────────────────────┤
│  Infrastructure (adapters: mock agora, HTTP depois)      │  ← mutável
└──────────────────────────────────────────────────────────┘
```

**Regra da dependência:** camadas internas **não** conhecem as externas.

- `Domain` → TypeScript puro, **zero imports do Angular**. Testável em ms.
- `Application` → `@Injectable` consumindo portas (interfaces).
- `Infrastructure` → implementa portas com `localStorage` / mocks em memória nesta fase.
- `UI` → componentes standalone que apenas orquestram facades.

## 4. Ports & Adapters

Cada feature expõe **portas** (interfaces) no seu domínio. A infra fornece **adaptadores**. Nesta fase, todos os adaptadores são **mock** (em memória ou `localStorage`).

```ts
// features/cash-flow/domain/ports/cash-flow.repository.ts
export interface CashFlowRepository {
  findByPeriod(period: Period): Promise<Movement[]>;
  save(movement: Movement): Promise<void>;
}

// features/cash-flow/infrastructure/cash-flow-local.adapter.ts  ← fase atual
@Injectable({ providedIn: 'root' })
export class CashFlowLocalAdapter implements CashFlowRepository { /* localStorage */ }

// features/cash-flow/infrastructure/cash-flow-http.adapter.ts   ← fase futura
@Injectable({ providedIn: 'root' })
export class CashFlowHttpAdapter implements CashFlowRepository { /* HttpClient */ }
```

Trocar de mock para HTTP é uma **mudança de provider token** em `app.config.ts`. Zero impacto no domínio e na UI.

## 5. Estado

Três níveis, do mais local ao mais global:

1. **Local ao componente** — `signal()` simples.
2. **Facade de feature** — `Injectable` expõe signals + métodos (**padrão default**).
3. **Global** — apenas para estado realmente compartilhado (usuário, preferências). Signal store simples.

Sem NgRx nesta fase — overhead desnecessário. Facades permitem migrar para `@ngrx/signals` depois **sem reescrever componentes**, só a implementação interna.

## 6. Roteamento

- Standalone + **lazy loading por feature** (`loadChildren`).
- Dois layouts: `auth-layout` (público) e `main-layout` (autenticado).
- `authGuard` valida sessão local (mock).

```ts
// app.routes.ts
export const routes: Routes = [
  { path: 'auth', loadChildren: () => import('./features/auth/auth.routes') },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '',                  loadChildren: () => import('./features/dashboard/dashboard.routes') },
      { path: 'cash-flow',         loadChildren: () => import('./features/cash-flow/cash-flow.routes') },
      { path: 'accounts-payable',  loadChildren: () => import('./features/accounts-payable/accounts-payable.routes') },
      { path: 'alerts',            loadChildren: () => import('./features/alerts/alerts.routes') },
      { path: 'settings',          loadChildren: () => import('./features/settings/settings.routes') },
    ],
  },
];
```

## 7. Mocks e persistência local

- Dados seed em `src/app/core/mocks/seed.ts` (usuário demo, movimentações, contas).
- Persistência em `localStorage` por feature (`trimicash:cash-flow`, `trimicash:accounts-payable`, etc.).
- Latência artificial opcional (`delay(200ms)`) para simular rede e validar estados de loading.

## 8. Performance

- `ChangeDetectionStrategy.OnPush` em todos os componentes.
- **Signals** como fonte primária de reatividade.
- **Defer blocks** do Angular para seções abaixo da dobra.
- Lazy loading por feature.

## 9. Testes

| Nível | Ferramenta | Cobertura-alvo |
|---|---|---|
| Unit (domínio) | Vitest | ≥ 90% |
| Unit (componente) | Vitest + Testing Library | ≥ 70% |
| Integração (use cases) | Vitest com adapters mock | 100% dos críticos |
| E2E | Playwright | Golden path + cenários críticos |
| Acessibilidade | axe-core via Playwright | Zero violação A/AA |

TDD obrigatório no domínio; recomendado na UI.

---

## 10. Estrutura de Pastas

```
trimicash/
├── .vscode/
├── docs/
│   ├── architecture.md
│   └── domain_context.md
├── public/
│   ├── favicon.ico
│   └── logo.svg
├── src/
│   ├── app/
│   │   ├── core/                    # Singletons, cross-cutting
│   │   │   ├── auth/
│   │   │   │   ├── guards/
│   │   │   │   │   └── auth.guard.ts
│   │   │   │   ├── interceptors/
│   │   │   │   │   └── auth.interceptor.ts
│   │   │   │   └── services/
│   │   │   │       └── auth.service.ts
│   │   │   ├── config/
│   │   │   │   └── app.config.ts            # Bootstrap providers
│   │   │   ├── errors/
│   │   │   │   ├── domain.error.ts
│   │   │   │   └── validation.error.ts
│   │   │   ├── mocks/
│   │   │   │   ├── seed.ts                  # Dados iniciais demo
│   │   │   │   └── storage.util.ts          # Wrapper de localStorage
│   │   │   ├── tokens/
│   │   │   │   └── storage-key.token.ts
│   │   │   └── utils/
│   │   │       ├── money.util.ts
│   │   │       ├── date.util.ts
│   │   │       └── id.util.ts
│   │   ├── shared/                  # UI reutilizável (sem conhecimento de feature)
│   │   │   ├── components/
│   │   │   │   ├── button/
│   │   │   │   ├── input/
│   │   │   │   ├── card/
│   │   │   │   ├── modal/
│   │   │   │   ├── badge/
│   │   │   │   ├── alert-banner/
│   │   │   │   ├── empty-state/
│   │   │   │   └── skeleton-loader/
│   │   │   ├── directives/
│   │   │   │   ├── click-outside.directive.ts
│   │   │   │   └── auto-focus.directive.ts
│   │   │   ├── pipes/
│   │   │   │   ├── brl-currency.pipe.ts
│   │   │   │   └── relative-date.pipe.ts
│   │   │   ├── validators/
│   │   │   │   └── strong-password.validator.ts
│   │   │   └── types/
│   │   │       └── common.types.ts
│   │   ├── features/                # Um diretório por bounded-context
│   │   │   ├── auth/
│   │   │   │   ├── domain/
│   │   │   │   │   ├── entities/
│   │   │   │   │   │   └── user.entity.ts
│   │   │   │   │   └── ports/
│   │   │   │   │       └── auth.repository.ts
│   │   │   │   ├── application/
│   │   │   │   │   ├── login.usecase.ts
│   │   │   │   │   ├── logout.usecase.ts
│   │   │   │   │   └── auth.facade.ts
│   │   │   │   ├── infrastructure/
│   │   │   │   │   └── auth-local.adapter.ts
│   │   │   │   ├── ui/
│   │   │   │   │   ├── pages/
│   │   │   │   │   │   ├── login-page/
│   │   │   │   │   │   └── register-page/
│   │   │   │   │   └── components/
│   │   │   │   │       └── login-form/
│   │   │   │   └── auth.routes.ts
│   │   │   ├── dashboard/
│   │   │   │   ├── domain/
│   │   │   │   ├── application/
│   │   │   │   │   ├── get-dashboard-summary.usecase.ts
│   │   │   │   │   └── dashboard.facade.ts
│   │   │   │   ├── infrastructure/
│   │   │   │   ├── ui/
│   │   │   │   │   ├── pages/
│   │   │   │   │   │   └── dashboard-page/
│   │   │   │   │   └── components/
│   │   │   │   │       ├── balance-card/
│   │   │   │   │       ├── projection-card/
│   │   │   │   │       ├── reserve-health/
│   │   │   │   │       ├── safety-days-gauge/
│   │   │   │   │       └── monthly-chart/
│   │   │   │   └── dashboard.routes.ts
│   │   │   ├── cash-flow/
│   │   │   │   ├── domain/
│   │   │   │   │   ├── entities/
│   │   │   │   │   │   ├── movement.entity.ts
│   │   │   │   │   │   └── period.vo.ts
│   │   │   │   │   ├── services/
│   │   │   │   │   │   └── balance.calculator.ts
│   │   │   │   │   └── ports/
│   │   │   │   │       └── cash-flow.repository.ts
│   │   │   │   ├── application/
│   │   │   │   │   ├── list-movements.usecase.ts
│   │   │   │   │   ├── create-movement.usecase.ts
│   │   │   │   │   ├── delete-movement.usecase.ts
│   │   │   │   │   └── cash-flow.facade.ts
│   │   │   │   ├── infrastructure/
│   │   │   │   │   └── cash-flow-local.adapter.ts
│   │   │   │   ├── ui/
│   │   │   │   │   ├── pages/
│   │   │   │   │   │   └── cash-flow-page/
│   │   │   │   │   └── components/
│   │   │   │   │       ├── movement-form/
│   │   │   │   │       ├── movement-list/
│   │   │   │   │       └── period-selector/
│   │   │   │   └── cash-flow.routes.ts
│   │   │   ├── accounts-payable/
│   │   │   │   ├── domain/
│   │   │   │   │   ├── entities/
│   │   │   │   │   │   └── account-payable.entity.ts
│   │   │   │   │   └── services/
│   │   │   │   │       └── reserve.calculator.ts
│   │   │   │   ├── application/
│   │   │   │   ├── infrastructure/
│   │   │   │   │   └── accounts-payable-local.adapter.ts
│   │   │   │   ├── ui/
│   │   │   │   │   ├── pages/
│   │   │   │   │   │   └── accounts-payable-page/
│   │   │   │   │   └── components/
│   │   │   │   │       ├── account-form/
│   │   │   │   │       ├── account-list/
│   │   │   │   │       └── pay-account-dialog/
│   │   │   │   └── accounts-payable.routes.ts
│   │   │   ├── alerts/
│   │   │   │   ├── domain/
│   │   │   │   │   ├── entities/
│   │   │   │   │   │   └── alert.entity.ts
│   │   │   │   │   └── services/
│   │   │   │   │       └── alert-engine.service.ts
│   │   │   │   ├── application/
│   │   │   │   ├── infrastructure/
│   │   │   │   ├── ui/
│   │   │   │   │   ├── pages/
│   │   │   │   │   │   └── alerts-center-page/
│   │   │   │   │   └── components/
│   │   │   │   │       ├── alert-bell/
│   │   │   │   │       ├── alert-card/
│   │   │   │   │       └── alert-banner/
│   │   │   │   └── alerts.routes.ts
│   │   │   ├── categories/
│   │   │   │   ├── domain/
│   │   │   │   ├── application/
│   │   │   │   ├── infrastructure/
│   │   │   │   └── ui/
│   │   │   └── settings/
│   │   │       ├── domain/
│   │   │       ├── application/
│   │   │       ├── ui/
│   │   │       │   └── pages/
│   │   │       │       ├── profile-page/
│   │   │       │       └── preferences-page/
│   │   │       └── settings.routes.ts
│   │   ├── layouts/
│   │   │   ├── auth-layout/
│   │   │   │   └── auth-layout.component.ts
│   │   │   └── main-layout/
│   │   │       ├── main-layout.component.ts
│   │   │       ├── sidebar/
│   │   │       ├── topbar/
│   │   │       └── footer/
│   │   ├── app.component.ts
│   │   ├── app.config.ts
│   │   └── app.routes.ts
│   ├── assets/
│   │   ├── icons/
│   │   ├── images/
│   │   └── fonts/                   # Plus Jakarta Sans + Inter (self-hosted)
│   ├── environments/
│   │   ├── environment.ts
│   │   └── environment.development.ts
│   ├── styles/
│   │   ├── _tokens.scss             # Design tokens (item 1)
│   │   ├── _typography.scss
│   │   ├── _mixins.scss
│   │   ├── _reset.scss
│   │   ├── _utilities.scss
│   │   └── _themes.scss             # Hook de tema (dark futuro)
│   ├── index.html
│   ├── main.ts
│   └── styles.scss
├── tests/
│   ├── unit/
│   ├── integration/
│   ├── e2e/
│   └── fixtures/
├── .editorconfig
├── .eslintrc.json
├── .gitignore
├── .nvmrc
├── .prettierrc
├── angular.json
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.spec.json
├── vitest.config.ts
├── playwright.config.ts
└── README.md
```

## 11. Regras de organização

### 11.1 — A regra do "bata na porta"

Uma feature **não importa** de outra feature diretamente. Se precisa de algo, importa do `shared/` ou define uma **porta** no próprio domínio e a infra conecta os dois no bootstrap.

```ts
// ❌ ERRADO
import { MovementEntity } from '../cash-flow/domain/entities/movement.entity';

// ✅ CERTO
// alerts/ declara a porta `MovementsSource`; cash-flow/ fornece a implementação;
// a ligação acontece em app.config.ts via provider.
```

### 11.2 — Cada feature tem as 4 camadas (quando aplicável)

`domain/` → `application/` → `infrastructure/` → `ui/`

Features triviais podem colapsar camadas, mas **nunca** pule `domain/` se há regra de negócio.

### 11.3 — Nomenclatura consistente

| Tipo | Sufixo | Exemplo |
|---|---|---|
| Entidade de domínio | `.entity.ts` | `movement.entity.ts` |
| Value object | `.vo.ts` | `period.vo.ts` |
| Porta / interface | `.repository.ts` / `.port.ts` | `cash-flow.repository.ts` |
| Caso de uso | `.usecase.ts` | `create-movement.usecase.ts` |
| Facade | `.facade.ts` | `dashboard.facade.ts` |
| Adaptador | `.adapter.ts` | `cash-flow-local.adapter.ts` |
| Página | `*-page/` | `dashboard-page/` |
| Componente | `*.component.ts` | `balance-card.component.ts` |
| Guard | `.guard.ts` | `auth.guard.ts` |
| Interceptor | `.interceptor.ts` | `auth.interceptor.ts` |
| Serviço | `.service.ts` | `alert-engine.service.ts` |
| Rotas | `.routes.ts` | `dashboard.routes.ts` |
| Pipe | `.pipe.ts` | `brl-currency.pipe.ts` |
| Diretiva | `.directive.ts` | `click-outside.directive.ts` |
| Validator | `.validator.ts` | `strong-password.validator.ts` |
| Utilitário | `.util.ts` | `money.util.ts` |

### 11.4 — Tamanho de arquivo

Limite soft de **300 linhas**. Passou? Quebre.

### 11.5 — Barrels

**Evitar `index.ts` barrels profundos** — quebram tree-shaking e geram ciclos. Exportação direta pelo caminho do arquivo.

### 11.6 — Componentes

- `ChangeDetectionStrategy.OnPush` sempre.
- Inputs via `input()` / `model()`; outputs via `output()`.
- Zero lógica em template — mover para `computed` signal.
- Sempre prever estados `loading`, `empty`, `error`.

## 12. Como adicionar uma nova feature

1. Criar `src/app/features/<nome-kebab>/` com as 4 pastas.
2. Definir entidades e portas em `domain/`.
3. Escrever testes do domínio (Vitest).
4. Implementar casos de uso em `application/`.
5. Criar adaptador mock em `infrastructure/`.
6. Montar páginas e componentes em `ui/`.
7. Criar `<feature>.routes.ts` e registrar via `loadChildren`.
