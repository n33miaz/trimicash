# T11 — UI: Dashboard

**Onda:** W3 · **Paralelismo:** OK com T08, T09, T10 · **Agente:** 1

## Objetivo
Tela principal — primeira impressão da demo. Deve responder em segundos as 5 perguntas-chave (`domain_context.md` §4).

## Pré-requisitos
- W2 concluída (`DashboardFacade`, `AlertsFacade`, shared UI).

## Escopo de Arquivos
```
src/app/features/dashboard/ui/
src/app/features/dashboard/dashboard.routes.ts
```

## Layout

### Header
- Saudação: "Olá, {DemoUser.name}." + nome do negócio.
- Seletor de período (`tc-select`) com opções `CURRENT_MONTH | NEXT_7 | NEXT_15 | NEXT_30 | END_OF_MONTH`.

### Linha 1 — KPIs (`tc-stat-card`, 4 cards em grid 4 colunas desktop / 2x2 tablet / 1x4 mobile)
1. **Saldo atual** — `currentBalance` em BRL grande. Hint: "Entradas - Saídas efetivadas."
2. **Saldo projetado** — `projectedBalance`. Tom `danger` se negativo. Hint: "Após pagar contas pendentes do período."
3. **Reserva recomendada** — `recommendedReserve`. Hint: "Mínimo para honrar compromissos do período."
4. **Dias de segurança** — número grande + label "dias". Se `insufficient`, mostrar "histórico insuficiente". Tom `danger` se < `minSafetyDays`.

### Linha 2 — Saúde da Reserva
- Painel destacado com barra de progresso `currentBalance / recommendedReserve`.
- Status com cor: HEALTHY (verde) / ATTENTION (amarelo) / DEFICIT (vermelho).
- Texto explicativo curto em PT-BR para leigo: "Você tem caixa suficiente para os próximos compromissos." / "Caixa apertado." / "Falta R$ X para cobrir os compromissos."

### Linha 3 — Duas colunas (empilha em mobile)
- **Próximos vencimentos (5)** — lista compacta de payables PENDENTE/ATRASADA ordenados por dueDate. Cada item: descrição, vencimento (pill), valor, ação rápida "Pagar".
- **Últimas movimentações (5)** — lista das 5 mais recentes. Cada item: data, descrição, categoria badge, valor (verde/vermelho).

### Linha 4 — Alertas Resumo (opcional se cabe)
- Top 3 alertas críticos como cards horizontais com botão "Ver detalhes".

## Regras
- Componente da página apenas lê `Signal`/`computed` da `DashboardFacade`. Sem lógica de cálculo.
- Atualização reativa quando T08/T09 alterarem dados.
- `OnPush`, Signals.
- Sem hex hardcoded.

## Aceite
- [ ] Abrir `/` mostra dashboard preenchido com seeds.
- [ ] Pagar uma conta em `/accounts-payable` reflete instantaneamente nos KPIs e nas listas.
- [ ] Mudar o período recalcula projeção e reserva.
- [ ] Cenário `?seed=risk` mostra saldo projetado negativo, déficit e múltiplos alertas.
- [ ] Mobile usável.
- [ ] Lighthouse Performance ≥ 90 mobile no dashboard.

## Fora de Escopo
- Gráficos avançados (Fase 2).
- Exportações.
