# T06 — Application Layer: Facades + Use Cases

**Onda:** W2 · **Paralelismo:** OK com T05, T07 · **Agente:** 1

## Objetivo
Criar a camada `application/` de cada feature: use cases isolados + facades baseadas em Signals que a UI consome. Aqui o domínio puro (W1) é orquestrado com os adapters (T04).

## Pré-requisitos
- T00 e Wave 1 (T01–T04) concluídas.

## Escopo de Arquivos
```
src/app/features/cash-flow/application/
src/app/features/accounts-payable/application/
src/app/features/alerts/application/
src/app/features/dashboard/application/
src/app/features/categories/application/
```
Não tocar em `domain/`, `infrastructure/` ou `ui/`.

## Padrão de Facade
- `@Injectable({ providedIn: 'root' })` quando estado é global da feature.
- Expor estado via `signal()` privados → `readonly` `Signal`/`computed` públicos.
- Métodos retornam `Promise<void>` ou `Observable` quando útil; preferir async/await.
- Erros de domínio capturados e expostos em `errorMessage = signal<string|null>(null)`.

## Entregáveis

### Cash-Flow (`cash-flow/application/`)
- `create-movement.usecase.ts`, `update-movement.usecase.ts`, `delete-movement.usecase.ts`, `list-movements.usecase.ts`.
- `cash-flow.facade.ts` expõe:
  - `movements: Signal<Movement[]>`
  - `currentBalance: Signal<number>` (computed via `BalanceService`)
  - `loading`, `error`
  - métodos `load(period?)`, `create(input)`, `update(id, patch)`, `remove(id)`.

### Accounts Payable (`accounts-payable/application/`)
- `create-payable.usecase.ts`, `update-payable.usecase.ts`, `cancel-payable.usecase.ts`, `pay-payable.usecase.ts`, `list-payables.usecase.ts`.
- `pay-payable.usecase` orquestra: `PayPayableService.pay` → `MovementRepository.create` → `PayableRepository.update` → (se houver) `PayableRepository.create(nextRecurrenceDraft)`.
- `accounts-payable.facade.ts`:
  - `payables: Signal<PayableAccount[]>` (com status reavaliado pelo `PayableStatusService` em `computed`)
  - `pending`, `overdue`, `paid` (computed).
  - métodos CRUD + `pay(id)`.

### Alerts (`alerts/application/`)
- `alerts.facade.ts`:
  - depende de `CashFlowFacade`, `AccountsPayableFacade`, `DashboardFacade` (ou recebe valores).
  - `alerts: Signal<AppAlert[]>` via `computed` chamando `AlertEngineService`.
  - `unreadCount: Signal<number>` (persistir "lidos" em `localStorage` por id).
  - `markAsRead(id)`, `markAllAsRead()`.

### Dashboard (`dashboard/application/`)
- `dashboard.facade.ts` agrega:
  - `currentBalance` (do `CashFlowFacade`)
  - `projectedBalance` (computed via `ProjectedBalanceService`)
  - `recommendedReserve` (computed)
  - `reserveHealth` (computed)
  - `safetyDays` (computed)
  - `period: signal<PeriodKey>` (default `CURRENT_MONTH`).
  - `recentMovements`, `upcomingPayables` (top 5 cada).

### Categories (`categories/application/`)
- Facade simples com CRUD; `categories: Signal<Category[]>`.

## Aceite
- [ ] Todas as facades expõem APIs reativas (Signals).
- [ ] UI poderá ler estado sem chamar repositórios diretamente.
- [ ] Facades **não** importam adapters concretos — apenas via DI por InjectionToken.
- [ ] Tests opcionais de integração das facades em `tests/integration/` — não bloqueante; T12 cobre.

## Fora de Escopo
- Componentes UI (T08–T11).
- Cálculos puros (já em W1).
