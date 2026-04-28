# T01 — Domain: Cash-Flow

**Onda:** W1 · **Paralelismo:** OK com T02, T03, T04 · **Agente:** 1

## Objetivo
Implementar o domínio de movimentações (entradas/saídas) e cálculo de saldo atual (RN-001, RN-004), em TypeScript puro, sem Angular.

## Pré-requisitos
- T00 concluída.
- Tipos e interfaces já declarados em `features/cash-flow/domain/`.

## Escopo de Arquivos
**Editar somente** dentro de:
```
src/app/features/cash-flow/domain/
tests/unit/cash-flow/
```

## Entregáveis

### 1. Validações de criação/edição (`domain/services/movement-validator.ts`)
- `validateMovementInput(input)` → lança `DomainError` se:
  - `amount <= 0`
  - `type` ≠ `ENTRADA`/`SAIDA`
  - `description` vazio
  - `categoryId` vazio
  - `date` inválida ou no futuro (RN-001.4: movimentação é algo que já aconteceu)

### 2. Serviço de Saldo (`domain/services/balance.service.ts`)
```ts
export class BalanceService {
  computeCurrentBalance(movements: Movement[], openingBalance = 0): number;
  computeInflowTotal(movements: Movement[], period?: Period): number;
  computeOutflowTotal(movements: Movement[], period?: Period): number;
}
```
- `computeCurrentBalance`: `openingBalance + Σ(ENTRADA) - Σ(SAIDA)` arredondado via `roundCurrency`.
- Filtros por período usam `getPeriod` de `core/utils/date.util`.

### 3. Daily Outflow Average (`domain/services/outflow-stats.service.ts`)
- `averageDailyOutflow(movements, refDate, windowDays = 30): { value: number; insufficient: boolean }`
- Se quantidade de saídas no janela < 3 → `insufficient: true`.

### 4. Erros de Domínio (`domain/errors/domain-error.ts`)
Classe `DomainError extends Error` com `code: string`.

### 5. Testes (Vitest, em `tests/unit/cash-flow/`)
Cobrir:
- saldo com lista vazia → `openingBalance`.
- soma simples ENTRADA/SAIDA.
- arredondamento (ex.: 0.1 + 0.2).
- valor inválido (≤ 0) lança `DomainError`.
- data futura lança `DomainError`.
- média diária com histórico insuficiente.

## Aceite
- [ ] `pnpm test cash-flow` verde.
- [ ] Nenhum import de `@angular/*` em `domain/`.
- [ ] Nenhum import de `infrastructure/` ou `application/`.
- [ ] Coverage ≥ 90% nos serviços de cálculo.

## Fora de Escopo
- Adapter concreto (T04).
- Facade/UseCase (T06).
- UI (T08).
