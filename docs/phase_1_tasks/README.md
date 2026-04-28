# Fase 1 — Plano de Execução Paralela com Agentes IA

> Decomposição da Fase 1 (frontend mockado) em tarefas isoladas, executáveis em paralelo por múltiplos agentes IA. Cada arquivo `T*.md` é **auto-contido**: pode ser entregue a um agente sem precisar de outros arquivos do plano.

---

## 1. Filosofia de Paralelização

A Fase 1 é dividida em **4 ondas (waves)**. Dentro de cada onda, as tarefas podem rodar em paralelo porque:

- **Escopo de pasta isolado:** cada tarefa edita pastas distintas (`features/<x>/domain`, `shared/components`, etc.). Conflito de merge → mínimo.
- **Contratos definidos antes do código:** a Wave 0 cria *stubs* de tipos, ports e tokens que todas as ondas seguintes consomem. Agentes seguintes não inventam contratos — apenas implementam o que já está declarado.
- **Sem dependência runtime entre tarefas da mesma onda:** UI de cash-flow não depende da UI de accounts-payable; ambas dependem só de `shared/` + facades.

A ordem entre ondas é obrigatória. A ordem **dentro** de uma onda é livre.

## 2. Mapa de Ondas

| Onda | Tarefas | Paralelismo | Bloqueia |
|---|---|---|---|
| **W0 — Foundation** | T00 | 1 agente | Tudo |
| **W1 — Domain + Infra** | T01, T02, T03, T04 | 4 agentes | W2, W3 |
| **W2 — Shared UI + Application** | T05, T06, T07 | 3 agentes | W3 |
| **W3 — Feature UIs** | T08, T09, T10, T11 | 4 agentes | W4 |
| **W4 — Polish + QA** | T12 | 1 agente | — |

Total: **13 tarefas**, pico de **4 agentes concorrentes**.

## 3. Inventário de Tarefas

### Wave 0 — Foundation (sequencial, 1 agente)
- **[T00 — Bootstrap & Contracts](./T00_foundation.md)** — Angular standalone + Vitest + ESLint + Prettier + Playwright + design tokens (CSS vars + SCSS) + estrutura de pastas + **stubs de todas as entities, value objects, ports e tipos compartilhados** que as demais tarefas consomem.

### Wave 1 — Domain + Infra (paralelo, 4 agentes)
- **[T01 — Domain Cash-Flow](./T01_domain_cash_flow.md)** — entidade `Movement`, regras RN-001/RN-004, serviço de saldo atual.
- **[T02 — Domain Accounts Payable](./T02_domain_accounts_payable.md)** — entidades `PayableAccount` + `Recurrence`, RN-002/RN-003, transição para movimento ao pagar.
- **[T03 — Domain Calculations & Alerts](./T03_domain_calculations_alerts.md)** — RN-005/006/007/008 (saldo projetado, reserva, saúde, dias de segurança) + RN-009 (motor de alertas).
- **[T04 — Infrastructure Mocks & Seeds](./T04_infrastructure_mocks.md)** — adapters in-memory + LocalStorage + seeds realistas (cenário saudável e cenário de risco).

### Wave 2 — Shared UI + Application (paralelo, 3 agentes)
- **[T05 — Shared UI Library + Layouts + Routing](./T05_shared_ui_layouts.md)** — componentes base (button, card, input, select, modal, table, badge, empty/loading/error), `MainLayoutComponent`, `AuthLayoutComponent`, `app.routes.ts`.
- **[T06 — Application Facades](./T06_application_facades.md)** — facades + use cases de cash-flow, accounts-payable, alerts, dashboard usando Signals.
- **[T07 — Auth (mock) + Settings + Categories](./T07_auth_settings_categories.md)** — login mockado, página de configurações simples, CRUD de categorias (RN-010), guard demo.

### Wave 3 — Feature UIs (paralelo, 4 agentes)
- **[T08 — UI Cash-Flow](./T08_ui_cash_flow.md)** — página de movimentações, formulário, lista, filtros.
- **[T09 — UI Accounts Payable](./T09_ui_accounts_payable.md)** — página, formulário, lista, ação "marcar como paga", badge de status.
- **[T10 — UI Alerts](./T10_ui_alerts.md)** — central de alertas in-app + indicador no topbar.
- **[T11 — UI Dashboard](./T11_ui_dashboard.md)** — cards (saldo atual, saldo projetado, reserva recomendada, dias de segurança, saúde da reserva), lista de últimas movimentações, próximos vencimentos.

### Wave 4 — Polish + QA (sequencial, 1 agente)
- **[T12 — Tests + Responsividade + Demo](./T12_tests_polish_demo.md)** — testes unitários dos cálculos financeiros + 1 fluxo E2E + ajustes finais de mobile + roteiro de demo + atualização do README.

## 4. Como Orquestrar os Agentes

### 4.1 Comando ao agente
Cada arquivo `T*.md` deve ser entregue ao agente **junto** dos seguintes arquivos de contexto:

- `docs/architecture.md`
- `docs/domain_context.md`
- `docs/planning/phase_1_frontend_mock.md`
- `docs/phase_1_tasks/T00_foundation.md` (todos os agentes precisam dos contratos)

### 4.2 Regras de ouro para os agentes
1. **Não criar novos contratos** se já existem em `T00`. Se faltar algo, atualizar `T00` antes — não improvisar.
2. **Editar apenas as pastas listadas em "Escopo de Arquivos"** da própria tarefa.
3. **Não tocar em `app.routes.ts`** fora de T05; tarefas de feature apenas exportam suas próprias `*.routes.ts` lazy.
4. **Sem dependência cruzada de UI** entre features. Se precisar, depende via facade/port.
5. **Componentes standalone, OnPush, Signals.** Nunca `NgModule`.
6. **Testes obrigatórios** apenas onde a tarefa pedir — T12 cobre o restante.
7. **PT-BR no UI**, identificadores em inglês.
8. **Sem hex hardcoded** — só design tokens.

### 4.3 Verificação após cada onda
Antes de liberar a próxima onda, rodar:
```bash
rtk pnpm install
rtk tsc --noEmit
rtk lint
rtk vitest run
```
Tudo verde → próxima onda.

## 5. Critérios de Pronto da Fase 1

A Fase 1 está concluída quando os critérios da seção 8 de `phase_1_frontend_mock.md` estiverem atendidos **e**:

- [ ] `pnpm dev` sobe sem erro.
- [ ] `pnpm test` verde.
- [ ] `pnpm e2e` verde no fluxo "abrir dashboard → cadastrar conta → pagar conta → ver saldo/alerta mudar".
- [ ] Lighthouse mobile ≥ 90 em Performance e Acessibilidade no dashboard.
- [ ] README atualizado com `como rodar` e `roteiro de demo`.

## 6. Anti-padrões

- ❌ Implementar regra financeira dentro de componente UI.
- ❌ Importar de `infrastructure/` direto em `ui/` — só via facade.
- ❌ Criar `index.ts` (barrel) profundo.
- ❌ Adicionar libs além das listadas em T00 sem aprovação.
- ❌ NgRx, Redux, Akita ou qualquer store global pesado.
- ❌ Mover arquivos entre pastas sem atualizar este plano.
