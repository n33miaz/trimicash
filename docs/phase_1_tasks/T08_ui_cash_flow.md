# T08 — UI: Cash-Flow (Movimentações)

**Onda:** W3 · **Paralelismo:** OK com T09, T10, T11 · **Agente:** 1

## Objetivo
Entregar a tela de movimentações: lista filtrável + criar/editar/excluir.

## Pré-requisitos
- W2 concluída (facades + shared UI + layouts).

## Escopo de Arquivos
```
src/app/features/cash-flow/ui/
src/app/features/cash-flow/cash-flow.routes.ts
```

## Entregáveis

### `cash-flow-page/`
- `tc-page-header` "Caixa" + ação primária `tc-button` "Nova movimentação".
- Filtros: tipo (Todos/Entradas/Saídas), categoria, período (`PeriodKey`).
- KPIs no topo (`tc-stat-card` x3): Entradas no período, Saídas no período, Saldo no período.
- Lista (`tc-table`) com: data, descrição, categoria (badge colorido), valor (verde/vermelho), ações (editar/excluir).
- Estados: loading, empty (com CTA "Adicionar primeira movimentação"), error.
- Mobile: cada linha vira `tc-card` empilhado.

### `movement-form/` (em `tc-modal`)
- Campos: tipo (segmented control entrada/saída), valor (`tc-money-input`), data (default hoje, não permite futuro), categoria (`tc-select` carregando do `CategoriesFacade`), descrição.
- Validação client-side espelhando o `MovementValidator` do domínio.
- Submit chama `CashFlowFacade.create` ou `update`.
- Erros do domínio mostrados inline (mapear `DomainError.code`).

### `delete-confirm-modal/`
- Confirmação simples antes de chamar `remove`.

## Regras
- Componentes `OnPush`, Signals.
- **Nenhum cálculo** dentro de componentes — apenas leitura de `Signal`/`computed` da facade.
- Texto da UI em PT-BR.

## Aceite
- [ ] CRUD completo funcional, dados persistem em `localStorage`.
- [ ] Filtros aplicam corretamente.
- [ ] Saldo no dashboard atualiza ao criar/excluir movimentação.
- [ ] Mobile usável (≤ 360px).
- [ ] Sem hex hardcoded.

## Fora de Escopo
- Importação OFX/CSV.
- Exportação.
