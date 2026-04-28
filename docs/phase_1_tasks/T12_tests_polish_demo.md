# T12 — Testes + Responsividade Final + Roteiro de Demo

**Onda:** W4 · **Paralelismo:** sequencial (após W3) · **Agente:** 1

## Objetivo
Fechar a Fase 1: testes unitários dos cálculos críticos, 1 fluxo E2E, ajustes finais de responsividade/acessibilidade, README atualizado e roteiro curto de apresentação.

## Pré-requisitos
- Toda a Wave 3 concluída e mergeada.

## Escopo de Arquivos
```
tests/unit/             ← complementar testes faltantes
tests/integration/      ← integração de facades (opcional)
tests/e2e/
README.md
docs/demo_script.md     ← novo
src/styles/_responsive.scss  ← se necessário
src/app/**/*.component.scss  ← apenas ajustes finos
```

## Entregáveis

### 1. Testes Unitários (Vitest)
Garantir cobertura ≥ 90% nos serviços de domínio. Adicionar onde faltar:
- `BalanceService` — cenários de borda (lista vazia, valores grandes, saldo inicial).
- `PayPayableService` — recorrência mensal cruzando virada de mês.
- `ProjectedBalanceService` — período sem payables.
- `RecommendedReserveService` — payables canceladas/pagas ignoradas.
- `ReserveHealthService` — limiares exatos.
- `SafetyDaysService` — média zero, valores fracionários.
- `AlertEngineService` — cenário "saudável" (vazio) e "risco completo" (todos os alertas).

### 2. Teste de Integração (1, em `tests/integration/`)
- `pay-payable.integration.test.ts`: usa `PayableLocalAdapter` + `MovementLocalAdapter` em memória → criar payable PENDENTE → pagar → verificar movement criado, saldo recalculado, alerta de atraso desaparecendo.

### 3. E2E (Playwright, em `tests/e2e/`)
Um fluxo crítico (`demo-flow.spec.ts`):
1. Visitar `/?seed=healthy`.
2. Login mock (qualquer credencial).
3. Dashboard carrega com KPIs.
4. Ir para Contas a pagar → criar nova conta vencendo amanhã → R$ 500.
5. Voltar ao dashboard → reserva recomendada aumentou.
6. Pagar a conta criada → confirmar.
7. Dashboard → saldo atual diminuiu R$ 500, reserva recomendada diminuiu.
8. Caixa → ver movimento de saída de R$ 500 com origem da conta.
9. Alertas → não há alerta `ALR-VENC-2D` para essa conta (pois foi paga).

### 4. Responsividade Final
- Conferir breakpoints 360, 480, 768, 1024, 1440.
- Garantir que nenhum overflow horizontal aparece em mobile.
- Bottom-nav não cobre conteúdo (padding bottom no main).
- Inputs em mobile sem zoom acidental (font-size ≥ 16px).

### 5. Acessibilidade
- Rodar axe-core via Playwright em pelo menos 3 páginas (dashboard, accounts-payable, alerts) e zerar issues críticos.
- Conferir foco visível em todos os interativos.
- `aria-live` em alertas e toasts.

### 6. README Final (raiz)
Seções:
- O que é o TrimiCash.
- Stack.
- Como rodar (`pnpm install`, `pnpm dev`).
- Como rodar testes (`pnpm test`, `pnpm e2e`).
- Cenários de seed (`?seed=healthy`, `?seed=risk`).
- Limites da Fase 1 (frontend mockado, sem backend).
- Link para `docs/demo_script.md`.

### 7. Roteiro de Demo (`docs/demo_script.md`)
Roteiro de **5–7 minutos** apresentável ao cliente:
1. Abertura — problema do empreendedor.
2. Login mock.
3. Dashboard — 5 perguntas-chave.
4. Trocar período → mostrar reserva mudando.
5. Cadastrar conta a pagar.
6. Pagar conta → saldo e alerta mudando ao vivo.
7. Mostrar central de alertas.
8. Mostrar settings (margem da reserva) → impacto imediato.
9. Mostrar cenário de risco com `?seed=risk`.
10. Encerramento — visão da Fase 2.

Cada passo com: tela, fala sugerida (curta, PT-BR), ponto-chave a destacar.

## Aceite
- [ ] `pnpm test` verde com cobertura ≥ 90% em domínio.
- [ ] `pnpm e2e` verde no fluxo principal.
- [ ] axe sem violações críticas.
- [ ] Lighthouse mobile ≥ 90 em Performance e Acessibilidade no dashboard.
- [ ] README e `demo_script.md` revisados.
- [ ] Sem console errors no `pnpm dev`.

## Fora de Escopo
- Backend, auth real, deploy (Fase 2).
