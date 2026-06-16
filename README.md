# TrimiCash

Demo frontend para micro e pequenos empreendedores acompanharem caixa, contas a pagar e receber, reserva recomendada, saldo projetado e alertas financeiros.

## Stack

- Angular 18 standalone
- TypeScript strict
- SCSS com design tokens próprios
- Angular Signals + facades por feature
- Persistência mockada em `localStorage` / `sessionStorage`
- Vitest para testes unitários
- Playwright para E2E desktop e mobile

## Como Rodar

Pré-requisitos:

- Node.js 18+
- npm 11+ ou compatível

Instalação:

```bash
npm install
```

Desenvolvimento:

```bash
npm run dev
```

Acesse `http://localhost:4200`.

Build:

```bash
npm run build
```

Testes:

```bash
npm test
npm run lint
npm run e2e
```

Na primeira execução do E2E, instale o Chromium do Playwright:

```bash
npx playwright install chromium
```

## Seeds

A demo sobe sem backend. Os dados são populados automaticamente no primeiro acesso.

- `/?seed=blank`: cenário vazio, todo o sistema zerado.
- `/?seed=healthy`: cenário saudável, com reserva atendida.
- `/?seed=risk`: cenário de risco, com atraso, déficit e alertas críticos.

## Fluxo Principal da Demo

1. Entrar com qualquer e-mail e senha.
2. Ver no Dashboard: saldo atual, saldo projetado, reserva recomendada e dias de segurança.
3. Criar uma nova conta em **Contas**.
4. Voltar ao Dashboard e validar aumento da reserva recomendada.
5. Pagar a conta em **Contas**.
6. Confirmar que o saldo atual diminui, a reserva cai e a saída aparece em **Caixa**.
7. Abrir **Alertas** para mostrar os riscos financeiros calculados.

## Open Finance (demo)

A tela **Open Finance** simula a conexão com várias instituições financeiras
(Banco do Brasil, Itaú, Bradesco, Santander, Caixa, Nubank, Inter, C6, BTG,
Sicoob, Sicredi e Mercado Pago) para visualizar saldos e extrato consolidado.

- Fluxo de consentimento simulado (redirecionamento, autorização e sincronização).
- Saldos e extratos são gerados por mock, de forma estável por instituição.
- As conexões ficam em `localStorage` (`trimicash:bank-connections`) e são limpas no reset de seeds.
- Não há conexão real com bancos — é uma prévia navegável da experiência da Fase 2.

## Limites da Fase 1

Esta entrega é uma demo navegável e mockada. Não inclui backend, banco real,
autenticação real, integração bancária **real** (o Open Finance acima é apenas
simulado), notificações externas, exportação de relatórios, multiusuário ou permissões.
