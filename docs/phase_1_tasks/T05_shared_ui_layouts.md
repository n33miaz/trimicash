# T05 — Shared UI Library + Layouts + Routing

**Onda:** W2 · **Paralelismo:** OK com T06, T07 · **Agente:** 1

## Objetivo
Construir biblioteca de componentes compartilhados, layouts (auth e main) e configurar o roteamento real com lazy-loading. As páginas de feature ainda não existem — apenas placeholders importáveis.

## Pré-requisitos
- T00 e Wave 1 (T01–T04) concluídas.

## Escopo de Arquivos
```
src/app/shared/components/
src/app/shared/directives/
src/app/shared/pipes/         ← exceto brl-currency.pipe (já em core)
src/app/layouts/auth-layout/
src/app/layouts/main-layout/
src/app/app.routes.ts
src/styles/_components.scss   ← se necessário
```

## Componentes a Entregar (`shared/components/`)
Todos **standalone, OnPush, Signals**, com testes de smoke (render):

| Componente | API | Notas |
|---|---|---|
| `tc-button` | `variant: 'primary'\|'secondary'\|'ghost'\|'danger'`, `size: 'sm'\|'md'\|'lg'`, `loading`, `disabled` | Usa tokens; `:focus-visible` |
| `tc-icon-button` | `aria-label` obrigatório, `icon` (string nome do SVG) | |
| `tc-card` | `title?`, `subtitle?`, slot `<ng-content>` | Sombra, radius via tokens |
| `tc-input` | `label`, `value` (model), `error?`, `hint?`, `type` | Integra com Reactive Forms |
| `tc-money-input` | model em `number`, máscara BRL | Reusa `formatBRL` |
| `tc-select` | `options: {label,value}[]`, model | |
| `tc-date-input` | wrapper de `<input type="date">` | |
| `tc-modal` | `open` (model), `title`, `closeOnBackdrop` | `aria-modal`, foco trap simples |
| `tc-table` | `columns`, `rows`, slot células | Mobile: vira lista de cards |
| `tc-badge` | `tone: 'neutral'\|'success'\|'warning'\|'danger'\|'info'` | |
| `tc-empty-state` | `title`, `message`, slot ação | |
| `tc-loading-state` | `message?` | Spinner + texto |
| `tc-error-state` | `message`, `retry` (output) | |
| `tc-page-header` | `title`, slot ações | |
| `tc-stat-card` | `label`, `value`, `tone?`, `hint?` | Cards de KPI do dashboard |

## Layouts

### `MainLayoutComponent` (`layouts/main-layout/`)
- Topbar com logo, nome do negócio (do `AuthPort.current()`), badge de alertas (output `(openAlerts)`), avatar simples.
- Sidebar desktop / drawer mobile com links: Dashboard, Caixa, Contas a pagar, Alertas, Configurações.
- `<router-outlet>` no centro.
- Mobile-first: bottom-nav abaixo de 768px; sidebar acima.

### `AuthLayoutComponent` (`layouts/auth-layout/`)
- Centralizado, gradiente institucional como fundo, cartão branco no centro.

## Roteamento (`app.routes.ts`)
Substituir os placeholders de T00 pelas rotas reais com lazy-loading **referenciando arquivos `*.routes.ts` que ainda exportam `[]`** (T08–T11 preencherão). Estrutura final igual à seção 6 de `architecture.md`. Adicionar guard demo `authGuard` (lê `AUTH_PORT.current()`; redireciona para `/auth/login` se nulo).

## Acessibilidade (mínimo)
- Todos os interativos navegáveis por Tab.
- `:focus-visible` aplicado.
- `aria-current="page"` no link ativo.
- Drawer/modal com retorno de foco.

## Aceite
- [ ] `pnpm dev` mostra o layout principal com sidebar funcional.
- [ ] Navegação entre rotas placeholder funciona (mostra título de cada feature).
- [ ] Mobile: bottom-nav substitui sidebar abaixo de 768px.
- [ ] Storybook **não** é obrigatório — basta rota oculta `/_dev/components` opcional para ver os componentes (não bloqueante).
- [ ] Lighthouse Acessibilidade ≥ 90 nas páginas vazias.

## Fora de Escopo
- Conteúdo das páginas (T08–T11).
- Facades (T06).
