# TrimiCash

> Controle financeiro para micro e pequenos empreendedores. Visualize seu fluxo de caixa, contas a pagar e saúde financeira em segundos.

## Stack

- **Framework:** Angular 18+ standalone
- **Linguagem:** TypeScript 5.5 (strict mode)
- **Estilos:** SCSS com design tokens próprios
- **Estado:** Angular Signals
- **Testes unitários:** Vitest + @analogjs/vitest-angular
- **E2E:** Playwright
- **Lint/Format:** ESLint (@angular-eslint) + Prettier
- **Datas:** date-fns
- **Pacotes:** pnpm

---

## Como Rodar

### Pré-requisitos

- Node.js ≥ 18
- pnpm ≥ 9 (`npm install -g pnpm`)

### Instalação

```bash
pnpm install
```

### Desenvolvimento

```bash
pnpm dev
# Acesse: http://localhost:4200
```

### Build de produção

```bash
pnpm build
```

### Testes unitários

```bash
# Roda uma vez
pnpm test

# Modo watch
pnpm test:watch
```

### Lint e formatação

```bash
pnpm lint
pnpm format
```

### Testes E2E (Playwright)

```bash
# Instalar browsers na primeira vez
npx playwright install

# Rodar E2E (necessita dev server rodando)
pnpm e2e
```

---

## Arquitetura

Veja [`docs/architecture.md`](./docs/architecture.md) para decisões de design, tokens, camadas e estrutura de pastas.

## Contexto de Domínio

Veja [`docs/domain_context.md`](./docs/domain_context.md) para regras de negócio, glossário e invariantes.

## Plano de Execução

Veja [`docs/phase_1_tasks/README.md`](./docs/phase_1_tasks/README.md) para o plano de ondas e tarefas da Fase 1.

---

## Roteiro de Demo (Fase 1)

> Em construção — será atualizado em T12.

1. Fazer login com qualquer e-mail/senha na tela de autenticação
2. Ver o Dashboard com saldo atual, projetado e reserva recomendada
3. Navegar para **Fluxo de Caixa** e cadastrar uma movimentação
4. Navegar para **Contas a Pagar** e marcar uma conta como paga
5. Verificar a mudança de saldo e o disparo de alertas

---

*Fase 1 — Demo mockada. Fase 2 — Produto funcional com backend real.*
