# T03 — Domain: Cálculos Financeiros + Motor de Alertas

**Onda:** W1 · **Paralelismo:** OK com T01, T02, T04 · **Agente:** 1

## Objetivo
Implementar reserva recomendada, saldo projetado, saúde da reserva, dias de segurança (RN-005/006/007/008) e motor de alertas (RN-009).

## Pré-requisitos
- T00 concluída.
- T01 e T02 podem rodar em paralelo — este módulo só depende dos **tipos** de `Movement` e `PayableAccount` (já estão em T00).

## Escopo de Arquivos
```
src/app/features/dashboard/domain/      ← cálculos consolidados
src/app/features/alerts/domain/          ← motor de alertas
tests/unit/dashboard/
tests/unit/alerts/
```
Não tocar em `cash-flow/domain/` ou `accounts-payable/domain/`.

## Entregáveis

### 1. Saldo Projetado (`dashboard/domain/services/projected-balance.service.ts`)
```ts
projectedBalance(input: {
  currentBalance: number;
  payables: PayableAccount[];
  period: Period;
  ref: Date;
}): number;
```
Regras (RN-005): `current - Σ(payables PENDENTE|ATRASADA com dueDate ∈ período)`.
Ignora `PAGA`/`CANCELADA`.

### 2. Reserva Recomendada (`dashboard/domain/services/recommended-reserve.service.ts`)
```ts
recommendedReserve(input: {
  payables: PayableAccount[];
  period: Period;
  safetyMarginPct: number; // ex: 10
  ref: Date;
}): number;
```
- `total = Σ(payables PENDENTE|ATRASADA no período)`.
- `reserve = total * (1 + safetyMarginPct/100)`.
- Nunca negativo (RN-006.4).

### 3. Saúde da Reserva (`dashboard/domain/services/reserve-health.service.ts`)
```ts
reserveHealth(input: {
  currentBalance: number;
  recommendedReserve: number;
  attentionThresholdPct: number; // default 20
}): ReserveHealth;
```
Regras (RN-007):
- `currentBalance < recommendedReserve` → `DEFICIT`.
- `currentBalance < recommendedReserve * (1 + threshold/100)` → `ATTENTION`.
- senão → `HEALTHY`.

### 4. Dias de Segurança (`dashboard/domain/services/safety-days.service.ts`)
```ts
safetyDays(input: {
  currentBalance: number;
  averageDailyOutflow: number;
}): { value: number; insufficient: boolean };
```
- Se `averageDailyOutflow <= 0` → `insufficient: true, value: 0`.
- senão `value = max(0, floor(currentBalance / avg))`.

### 5. Motor de Alertas (`alerts/domain/services/alert-engine.service.ts`)
```ts
buildAlerts(input: {
  payables: PayableAccount[];
  currentBalance: number;
  projectedBalance: number;
  recommendedReserve: number;
  safetyDays: { value: number; insufficient: boolean };
  minSafetyDays: number;
  ref: Date;
}): AppAlert[];
```
Aplica todas as regras da tabela RN-009. Determinístico — mesma entrada → mesma saída e mesma ordem (ordenar por severidade desc → data asc).

### 6. Testes (cobertura crítica)
Para cada serviço: 1 caso happy path + 1 caso de borda + 1 caso inválido.
Motor de alertas: cenário "saudável" (zero alertas) e cenário "risco completo" (todos os alertas críticos disparados).

## Aceite
- [ ] `pnpm test dashboard alerts` verde.
- [ ] Sem imports de Angular ou de `infrastructure/`.
- [ ] Determinismo: rodar 100x com mesma entrada → mesma saída.
- [ ] Coverage ≥ 90%.

## Fora de Escopo
- Persistência, facades, UI.
