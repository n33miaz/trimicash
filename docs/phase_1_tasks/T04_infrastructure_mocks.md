# T04 — Infrastructure: Mocks, LocalStorage Adapters & Seeds

**Onda:** W1 · **Paralelismo:** OK com T01, T02, T03 · **Agente:** 1

## Objetivo
Implementar todos os adapters dos repositórios (in-memory + LocalStorage) e seeds realistas para a demo. É o único lugar onde regra é "fingida" — tudo aqui some na Fase 2.

## Pré-requisitos
- T00 concluída (ports e tipos existem).

## Escopo de Arquivos
```
src/app/features/cash-flow/infrastructure/
src/app/features/accounts-payable/infrastructure/
src/app/features/categories/infrastructure/
src/app/features/auth/infrastructure/
src/app/features/settings/infrastructure/
src/app/core/mocks/
src/app/app.config.ts   ← apenas adicionar providers (não mexer em rotas)
```

## Entregáveis

### 1. Adapters LocalStorage
Para cada port de T00 (`MovementRepository`, `PayableRepository`, `CategoryRepository`):
- `*-local.adapter.ts` que implementa a interface usando `localStorage` com chave `trimicash:<entity>`.
- Serialização: `JSON.stringify` com `Date` convertida para ISO; ao ler, reidratar `Date`.
- IDs gerados via `crypto.randomUUID()`.
- Cada operação retorna `Promise` com pequeno `setTimeout(…, 0)` para simular async.

### 2. AuthPort Mock (`auth/infrastructure/auth-mock.adapter.ts`)
- `login(email, password)`: aceita qualquer credencial, retorna `DemoUser` fixo.
- Sessão guardada em `sessionStorage`.
- `current()` lê sessão.
- `logout()` limpa.

### 3. Settings (`settings/infrastructure/settings-local.adapter.ts`)
- Provê `Signal<AppSettings>` com defaults: `reserveSafetyMarginPct=10`, `reserveAttentionThresholdPct=20`, `minSafetyDays=7`.
- Persiste alterações em `localStorage`.

### 4. Seeds (`core/mocks/seeds.ts`)
Dois cenários (selecionáveis via flag `?seed=healthy|risk` na URL ou config):
- **Cenário Saudável:** saldo confortável, contas vencendo em 5–10 dias, gasto fixo mensal pago, reserva atendida.
- **Cenário Risco:** 1 conta atrasada 3 dias, 1 vencendo em 2 dias, déficit de reserva, 1 saldo projetado negativo.

Ambos com:
- 1 `DemoUser` com `businessName` plausível ("Padaria Trimi", "Estúdio Cash").
- ~10 movements distribuídos nos últimos 30 dias.
- 5–7 payables (1 recorrente mensal — aluguel).
- Categorias da RN-010 (Receitas, Fornecedores, Impostos, Salarios, Aluguel, Energia, Marketing, Outros).

### 5. Bootstrap dos Seeds (`core/mocks/seed-runner.ts`)
- Executado em `app.config.ts` via `provideAppInitializer` (Angular 18+).
- Se `localStorage` vazio, popula com cenário padrão (`healthy`).
- Tem método `reseed(scenario)` para a tela de Settings/dev resetar.

### 6. Providers em `app.config.ts`
Adicionar (sem remover nada existente):
```ts
{ provide: MOVEMENT_REPOSITORY, useClass: MovementLocalAdapter },
{ provide: PAYABLE_REPOSITORY,  useClass: PayableLocalAdapter },
{ provide: CATEGORY_REPOSITORY, useClass: CategoryLocalAdapter },
{ provide: AUTH_PORT,            useClass: AuthMockAdapter },
{ provide: APP_SETTINGS,         useFactory: settingsSignalFactory },
```

## Aceite
- [ ] Após `pnpm dev`, `localStorage` tem chaves `trimicash:movements`, `trimicash:payables`, `trimicash:categories`.
- [ ] `?seed=risk` zera e recarrega cenário de risco.
- [ ] Round-trip: criar movement → recarregar página → movement persistido.
- [ ] Adapters não importam de `domain/services/` (apenas dos ports/entities).
- [ ] Sem `NgRx`/store global.

## Fora de Escopo
- Lógica de cálculo (T01–T03).
- UI (T05+).
