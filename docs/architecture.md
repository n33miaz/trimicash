# TrimiCash - Architecture

> Angular frontend-first. Fase 1 entrega uma demo mockada e navegavel. A estrutura preserva os pontos de extensao necessarios para a Fase 2 virar um produto funcional sem reescrever o dominio e as telas principais.

---

## 1. Escolhas Visuais

### 1.1 Paleta

| Funcao | Token | Cor | Uso |
|---|---|---|---|
| Principal | `--color-primary-900` | `#051B61` | Marca, topbar, destaques institucionais |
| Hover principal | `--color-primary-700` | `#0B2F8F` | Estados hover/active do azul principal |
| Destaque / CTA | `--color-accent-500` | `#2F80ED` | Botoes primarios, links importantes |
| Hover destaque | `--color-accent-600` | `#1E6FDD` | Hover/active de CTAs |
| Entradas / sucesso | `--color-success-500` | `#16A34A` | Entradas, status saudavel |
| Fundo sucesso | `--color-success-50` | `#DCFCE7` | Badges e alertas positivos |
| Saidas / risco | `--color-danger-500` | `#DC2626` | Saidas, deficit, atraso |
| Fundo risco | `--color-danger-50` | `#FEE2E2` | Badges e alertas criticos |
| Atencao | `--color-warning-500` | `#F59E0B` | Reserva apertada, vencimento proximo |
| Fundo atencao | `--color-warning-50` | `#FEF3C7` | Alertas de aviso |
| Texto principal | `--color-text-primary` | `#111827` | Texto de maior hierarquia |
| Texto secundario | `--color-text-secondary` | `#6B7280` | Metadados, labels auxiliares |
| Borda | `--color-border` | `#E5E7EB` | Divisores e contornos |
| Superficie | `--color-surface` | `#FFFFFF` | Cards, modais, paineis |
| Background | `--color-background` | `#F9FAFB` | Fundo geral da aplicacao |
| Gradiente institucional | `--gradient-primary` | `linear-gradient(135deg, #051B61 0%, #2F80ED 100%)` | Areas de destaque |

Regra: componentes consomem tokens. Evitar hex hardcoded em arquivos de componente.

### 1.2 Tipografia

```css
--font-family-display: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
--font-family-body: 'Inter', system-ui, -apple-system, sans-serif;

--font-size-xs: 0.75rem;
--font-size-sm: 0.875rem;
--font-size-md: 1rem;
--font-size-lg: 1.125rem;
--font-size-xl: 1.25rem;
--font-size-2xl: 1.5rem;
--font-size-3xl: 1.875rem;
--font-size-4xl: 2.25rem;
```

| Classe | Familia | Uso |
|---|---|---|
| `.display-lg` | Plus Jakarta Sans | Numeros principais do dashboard |
| `.display-md` | Plus Jakarta Sans | Titulos de pagina |
| `.heading-lg` | Plus Jakarta Sans | Cabecalhos de card |
| `.body-md` | Inter | Texto padrao |
| `.body-sm` | Inter | Texto auxiliar |
| `.label` | Inter | Labels, badges e metadados |

### 1.3 Layout

```css
--space-1: 0.25rem;
--space-2: 0.5rem;
--space-3: 0.75rem;
--space-4: 1rem;
--space-5: 1.5rem;
--space-6: 2rem;
--space-7: 3rem;
--space-8: 4rem;

--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-xl: 16px;

--shadow-sm: 0 1px 2px rgba(17,24,39,.06);
--shadow-md: 0 4px 8px rgba(17,24,39,.08);
--shadow-lg: 0 12px 24px rgba(17,24,39,.10);

--motion-fast: 120ms cubic-bezier(.4,0,.2,1);
--motion-normal: 200ms cubic-bezier(.4,0,.2,1);
```

### 1.4 Direcao Visual

- Visual de fintech/SaaS: confiavel, limpo, objetivo.
- Mobile-first, porque a persona tende a consultar o caixa pelo celular.
- Cards podem usar cantos arredondados, mas a tela principal nao deve parecer um prototipo preso dentro de outro card.
- Gradiente azul deve ser usado com moderacao. O conteudo financeiro precisa de contraste e leitura rapida.
- Estados financeiros usam cor semantica: verde para entradas/saudavel, vermelho para risco/saida, amarelo para atencao.

### 1.5 Acessibilidade

- Contraste minimo WCAG AA.
- Navegacao completa por teclado.
- `:focus-visible` visivel em todos os elementos interativos.
- `aria-label` em botoes apenas com icone.
- `aria-live` para alertas dinamicos importantes.
- Sem `div` clicavel quando `button` ou `a` resolvem semanticamente.

---

## 2. Principios Arquiteturais

| Principio | Aplicacao concreta |
|---|---|
| Feature-first | Estrutura organizada pelo dominio do produto, nao apenas por tipo tecnico |
| Clean Architecture pragmatica | Dominios com regra real ficam isolados de Angular e storage |
| SOLID | Dependencias apontam para portas/interfaces quando ha chance real de troca |
| DRY | Componentes, pipes, validators e utils reutilizaveis ficam em `shared/` ou `core/` |
| KISS | Evitar camada extra quando a feature for simples |
| YAGNI | Preparar extensao futura sem implementar backend, auditoria e auth real agora |
| Alta coesao | Cada feature concentra suas telas, casos de uso e regras |
| Baixo acoplamento | Uma feature nao importa detalhes internos de outra feature |

## 3. Decisao Central

A Fase 1 e frontend mockado. Portanto:

- O foco e entregar experiencia navegavel, regras de calculo e apresentacao convincente.
- Persistencia local e mocks sao detalhes de implementacao da demo.
- Autenticacao e apenas simulada.
- Nenhuma decisao de backend, banco, cloud, CI/CD ou mensageria deve virar compromisso da Fase 1.

A arquitetura deixa as portas preparadas para a Fase 2:

```text
UI Angular
  -> Facades / Use cases
    -> Domain puro
    -> Ports
      -> Adapters mock/local na Fase 1
      -> Adapters HTTP/API na Fase 2
```

## 4. Camadas

### 4.1 Domain

TypeScript puro. Nao importa Angular.

Contem:

- entidades;
- value objects;
- regras de calculo;
- validacoes de negocio;
- portas quando a regra depende de fonte externa.

Usar em features com regra real: `cash-flow`, `accounts-payable`, `alerts`, `dashboard`.

### 4.2 Application

Orquestra casos de uso e expoe facades para UI.

Contem:

- `*.usecase.ts`;
- `*.facade.ts`;
- composicao de dados para telas.

### 4.3 Infrastructure

Implementa adaptadores.

Na Fase 1:

- mock em memoria;
- storage local quando fizer sentido para a demo;
- seeds de apresentacao.

Na Fase 2:

- HTTP clients;
- mappers DTO <-> dominio;
- integracao com auth real.

### 4.4 UI

Componentes standalone Angular.

Contem:

- pages;
- componentes da feature;
- formularios;
- composicao visual.

Regra: componente nao calcula regra financeira complexa. Ele chama facade/computed do dominio.

## 5. Estado

Usar Signals como padrao.

Niveis:

1. `signal()` local para estado visual simples.
2. Facade por feature para estado compartilhado dentro da feature.
3. Store global simples apenas para usuario demo/preferencias.

Nao usar NgRx na Fase 1. Se a Fase 2 crescer, avaliar `@ngrx/signals` antes de introduzir NgRx Store classico.

## 6. Roteamento

- Angular standalone.
- Lazy loading por feature.
- Layout principal para area logada/demo.
- Layout auth simples apenas se o login mockado for mantido.

Rotas previstas na Fase 1:

```ts
export const routes: Routes = [
  { path: 'auth', loadChildren: () => import('./features/auth/auth.routes') },
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', loadChildren: () => import('./features/dashboard/dashboard.routes') },
      { path: 'cash-flow', loadChildren: () => import('./features/cash-flow/cash-flow.routes') },
      { path: 'accounts-payable', loadChildren: () => import('./features/accounts-payable/accounts-payable.routes') },
      { path: 'alerts', loadChildren: () => import('./features/alerts/alerts.routes') },
      { path: 'settings', loadChildren: () => import('./features/settings/settings.routes') },
    ],
  },
];
```

Auth guard e interceptor HTTP ficam para quando houver necessidade real. Na Fase 1, no maximo um guard simples de sessao demo.

## 7. Testes

### Fase 1

- Testes unitarios dos calculos financeiros.
- Testes unitarios dos casos de uso criticos.
- Um fluxo E2E basico: abrir dashboard, cadastrar conta, pagar conta, ver saldo/alerta mudar.

Cobertura numerica alta nao e meta da Fase 1. A meta e proteger as regras que podem quebrar a apresentacao.

### Fase 2

- Expandir testes unitarios do dominio.
- Testar adapters HTTP com mocks.
- E2E dos fluxos criticos.
- Acessibilidade com axe/Playwright.
- Cobertura minima pode ser definida quando houver produto funcional.

## 8. Estrutura de Pastas

```text
trimicash/
├── docs/
│   ├── architecture.md
│   ├── domain_context.md
│   ├── phase_1_frontend_mock.md
│   └── phase_2_functional_product.md
├── public/
│   ├── favicon.ico
│   └── logo.svg
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── auth/
│   │   │   │   ├── guards/
│   │   │   │   └── services/
│   │   │   ├── config/
│   │   │   ├── errors/
│   │   │   ├── mocks/
│   │   │   ├── tokens/
│   │   │   └── utils/
│   │   ├── shared/
│   │   │   ├── components/
│   │   │   ├── directives/
│   │   │   ├── pipes/
│   │   │   ├── validators/
│   │   │   └── types/
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   │   ├── application/
│   │   │   │   ├── infrastructure/
│   │   │   │   └── ui/
│   │   │   ├── dashboard/
│   │   │   │   ├── domain/
│   │   │   │   ├── application/
│   │   │   │   ├── infrastructure/
│   │   │   │   └── ui/
│   │   │   ├── cash-flow/
│   │   │   │   ├── domain/
│   │   │   │   │   ├── entities/
│   │   │   │   │   ├── services/
│   │   │   │   │   └── ports/
│   │   │   │   ├── application/
│   │   │   │   ├── infrastructure/
│   │   │   │   └── ui/
│   │   │   ├── accounts-payable/
│   │   │   │   ├── domain/
│   │   │   │   │   ├── entities/
│   │   │   │   │   ├── services/
│   │   │   │   │   └── ports/
│   │   │   │   ├── application/
│   │   │   │   ├── infrastructure/
│   │   │   │   └── ui/
│   │   │   ├── alerts/
│   │   │   │   ├── domain/
│   │   │   │   ├── application/
│   │   │   │   ├── infrastructure/
│   │   │   │   └── ui/
│   │   │   ├── categories/
│   │   │   │   ├── domain/
│   │   │   │   ├── application/
│   │   │   │   ├── infrastructure/
│   │   │   │   └── ui/
│   │   │   └── settings/
│   │   │       ├── application/
│   │   │       └── ui/
│   │   ├── layouts/
│   │   │   ├── auth-layout/
│   │   │   └── main-layout/
│   │   ├── app.component.ts
│   │   ├── app.config.ts
│   │   └── app.routes.ts
│   ├── assets/
│   │   ├── fonts/
│   │   ├── icons/
│   │   └── images/
│   ├── environments/
│   ├── styles/
│   ├── index.html
│   ├── main.ts
│   └── styles.scss
└── tests/
    ├── unit/
    ├── integration/
    ├── e2e/
    └── fixtures/
```

## 9. Nomenclatura

| Tipo | Sufixo / padrao | Exemplo |
|---|---|---|
| Entidade | `.entity.ts` | `movement.entity.ts` |
| Value object | `.vo.ts` | `period.vo.ts` |
| Porta | `.port.ts` ou `.repository.ts` | `cash-flow.repository.ts` |
| Caso de uso | `.usecase.ts` | `create-movement.usecase.ts` |
| Facade | `.facade.ts` | `dashboard.facade.ts` |
| Adaptador | `.adapter.ts` | `cash-flow-local.adapter.ts` |
| Pagina | `*-page/` | `dashboard-page/` |
| Componente | `.component.ts` | `balance-card.component.ts` |
| Rotas | `.routes.ts` | `dashboard.routes.ts` |
| Pipe | `.pipe.ts` | `brl-currency.pipe.ts` |
| Diretiva | `.directive.ts` | `auto-focus.directive.ts` |
| Validator | `.validator.ts` | `positive-money.validator.ts` |
| Utilitario | `.util.ts` | `money.util.ts` |

## 10. Regras de Organizacao

### 10.1 Regra da Porta

Uma feature nao importa detalhes internos de outra feature.

Se `alerts` precisa ler contas a pagar, ela depende de uma porta. A implementacao concreta fica na infraestrutura/composicao da aplicacao.

### 10.2 Camadas Quando Fizer Sentido

Features com regra financeira usam as quatro camadas.

Features simples podem colapsar estrutura. Exemplo: `settings` pode ter apenas `application/` e `ui/` na Fase 1.

### 10.3 Componentes

- `ChangeDetectionStrategy.OnPush`.
- Inputs com `input()` / `model()`.
- Outputs com `output()`.
- Estado derivado em `computed()`.
- Estados obrigatorios para telas de dados: loading, empty e error.

### 10.4 Arquivos

- Limite soft de 300 linhas por arquivo.
- Evitar barrels `index.ts` profundos.
- Utilitarios compartilhados so entram em `shared/` ou `core/` quando ha reuso real.

## 11. Itens Explicitamente Futuros

Nao implementar na Fase 1, exceto se virar requisito novo:

- backend real;
- banco de dados;
- interceptor HTTP;
- auditoria de acoes;
- notificacoes externas;
- multiusuario;
- permissoes/papeis;
- dark mode completo;
- PWA instalavel;
- exportacao PDF/Excel;
- integracoes bancarias.
