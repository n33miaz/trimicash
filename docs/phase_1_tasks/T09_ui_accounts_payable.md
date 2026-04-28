# T09 — UI: Contas a Pagar

**Onda:** W3 · **Paralelismo:** OK com T08, T10, T11 · **Agente:** 1

## Objetivo
Entregar a tela de contas a pagar: lista com status, criar/editar/cancelar, marcar como paga.

## Pré-requisitos
- W2 concluída.

## Escopo de Arquivos
```
src/app/features/accounts-payable/ui/
src/app/features/accounts-payable/accounts-payable.routes.ts
```

## Entregáveis

### `accounts-payable-page/`
- Header "Contas a pagar" + ação "Nova conta".
- Tabs/segmented: **Todas | Pendentes | Atrasadas | Pagas | Canceladas**.
- KPIs: Total a pagar no mês, Vencendo em 7 dias, Atrasadas (com `tone='danger'`).
- Lista (`tc-table` ou cards em mobile):
  - descrição
  - categoria
  - vencimento (com pill "Vence em N dias" / "Atrasada N dias")
  - valor
  - badge de recorrência (ícone + label "Mensal/Semanal/Anual") quando `recurrence ≠ NONE`
  - status badge (verde paga, amarelo pendente, vermelho atrasada, cinza cancelada)
  - ações: pagar (apenas se PENDENTE/ATRASADA), editar, cancelar, excluir
- Estados: loading, empty (CTA), error.

### `payable-form/` (em `tc-modal`)
- descrição, valor (`tc-money-input`), vencimento (date), categoria, recorrência (`tc-select` NONE/WEEKLY/MONTHLY/YEARLY).
- Validação espelhada do domínio.

### `pay-payable-flow/`
- Modal de confirmação com data de pagamento (default hoje).
- Ao confirmar, chama `accountsPayableFacade.pay(id)` — facade orquestra a criação do `Movement` e da próxima recorrência (T02 + T06).
- Toast de sucesso: "Conta paga. Saldo atualizado."

### `cancel-payable-flow/`
- Confirmação + chamada à facade.

## Regras Visuais
- Conta atrasada SEMPRE com cor `--color-danger-500` no destaque + ícone de alerta.
- Vencimento em ≤ 2 dias com `--color-warning-500`.
- Recorrência indicada por badge azul `tone='info'`.

## Aceite
- [ ] Marcar como paga gera movimentação de saída visível na tela de Caixa (T08).
- [ ] Conta recorrente paga gera próxima ocorrência com vencimento correto.
- [ ] Conta atrasada destacada visualmente.
- [ ] Filtros por status funcionam.
- [ ] Mobile usável.

## Fora de Escopo
- Pagamento real / integração bancária.
- Relatórios.
