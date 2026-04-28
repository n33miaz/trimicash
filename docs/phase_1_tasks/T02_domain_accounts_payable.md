# T02 — Domain: Accounts Payable

**Onda:** W1 · **Paralelismo:** OK com T01, T03, T04 · **Agente:** 1

## Objetivo
Implementar o domínio de contas a pagar e gastos fixos (RN-002, RN-003), incluindo transição para movimentação ao pagar.

## Pré-requisitos
- T00 concluída.
- Stubs em `features/accounts-payable/domain/`.

## Escopo de Arquivos
```
src/app/features/accounts-payable/domain/
tests/unit/accounts-payable/
```

## Entregáveis

### 1. Validador (`domain/services/payable-validator.ts`)
- `description` não vazio.
- `amount > 0`.
- `dueDate` válida.
- `recurrence` ∈ `NONE | WEEKLY | MONTHLY | YEARLY`.

### 2. Status Resolver (`domain/services/payable-status.service.ts`)
```ts
export class PayableStatusService {
  /** Reavalia o status considerando a data de referência. */
  resolveStatus(p: PayableAccount, ref: Date): PayableStatus;
  isOverdue(p: PayableAccount, ref: Date): boolean;
  daysToDue(p: PayableAccount, ref: Date): number;
}
```
Regras (RN-002.3):
- `PAGA` ou `CANCELADA` → mantém.
- `PENDENTE` com `dueDate < ref` → retorna `ATRASADA`.
- Demais → `PENDENTE`.

### 3. Pagamento (`domain/services/pay-payable.service.ts`)
```ts
export interface PaymentResult {
  updatedPayable: PayableAccount;
  generatedMovement: Omit<Movement, 'id'>;
  nextRecurrenceDraft?: Omit<PayableAccount, 'id' | 'status'>;
}

export class PayPayableService {
  pay(payable: PayableAccount, paidAt: Date): PaymentResult;
}
```
- Marca `status = 'PAGA'`, preenche `paidAt`.
- Emite `Movement` SAIDA com `sourcePayableId = payable.id`, `amount`, `categoryId`, `description`.
- Se `recurrence ≠ NONE`, gera `nextRecurrenceDraft` com `dueDate` calculada via `date-fns` (`addWeeks`, `addMonths`, `addYears`) e mesmo `recurrenceGroupId`.

### 4. Testes
- pagamento gera movement correto (valor, categoria, sourcePayableId).
- pagamento de recorrente gera próxima ocorrência com data correta.
- conta vencida resolve para `ATRASADA`.
- conta `PAGA` não muda status quando reavaliada.
- pagamento de `CANCELADA` lança `DomainError`.

## Aceite
- [ ] `pnpm test accounts-payable` verde.
- [ ] Sem import de Angular ou de outras features.
- [ ] Coverage ≥ 90% nos serviços.

## Fora de Escopo
- Persistência (T04).
- Facade (T06).
- UI (T09).
