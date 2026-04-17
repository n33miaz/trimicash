# TrimiCash — Domain Context

> Contexto de negócio e regras do domínio financeiro do TrimiCash. Esta etapa contempla apenas o **frontend mockado** — toda persistência é local, sem back-end.

---

## 1. Resumo do que foi discutido com o cliente

### 1.1 — O pedido

O cliente (grupo acadêmico) trouxe a demanda de um "projeto simples" de controle financeiro para o empreendedor. A descrição inicial foi:

> *"O empreendedor vê suas previsões de gastos / contas a pagar e o próprio fluxo de caixa informa o que ele deve ter em reserva dentro do mês e suas movimentações do mês."*
>
> *"🚨 Alertar sobre contas a vencer e comparação ao caixa."*

O cliente também mencionou o interesse em **gastos fixos** como ponto importante.

### 1.2 — Persona

- **Empreendedor** (micro/pequeno): controla o próprio caixa, paga contas, precisa saber se tem dinheiro para honrar compromissos do mês.
- Acessa majoritariamente pelo celular — **mobile-first** é requisito.
- Não é especialista financeiro: a linguagem da interface é simples, sem jargão contábil.

### 1.3 — Proposta de valor

Uma única tela onde o empreendedor entende, em segundos:

1. **Quanto tenho agora?** (saldo atual)
2. **Quanto vou ter no fim do mês?** (saldo projetado)
3. **Quanto preciso ter guardado?** (reserva recomendada)
4. **Por quantos dias aguento?** (dias de segurança)
5. **O que está prestes a vencer?** (alertas)

### 1.4 — Escolhas já tomadas pelo cliente

- **Nome:** TrimiCash.
- **Ícone:** definido pelo grupo.
- **Identidade visual:** paleta azul institucional + semânticas verde/vermelho, tipografia Plus Jakarta Sans + Inter, linguagem SaaS/Fintech com gradientes suaves e cantos arredondados (detalhes em `architecture.md`).
- **Formato:** Web App responsivo (não site estático, não app nativo).

### 1.5 — Escopo desta etapa (frontend mockado)

- Aplicação Angular **standalone** consumindo dados **mockados** (seed em memória + `localStorage`).
- Todas as features funcionam: cadastro, cálculos, alertas, gráfico — mas nada vai a um servidor.
- Objetivo: demo navegável completa, convincente o bastante para apresentação.

### 1.6 — Fora do escopo desta etapa

- Back-end real / banco de dados.
- Autenticação real (login é mock com usuário demo).
- Notificações fora do app (e-mail, WhatsApp, push).
- Integrações bancárias (Open Finance, importação OFX).
- Multi-usuário / papéis.
- Relatórios exportáveis (PDF/Excel).

### 1.7 — Ideias listadas pelo cliente

Capturadas das conversas, convertidas em requisitos funcionais e priorizadas:

**Núcleo (obrigatório nesta etapa):**

| # | Ideia do cliente | Requisito |
|---|---|---|
| 1 | *"Ver suas previsões de gastos / contas a pagar"* | Cadastro e listagem de contas a pagar com filtro por período. |
| 2 | *"O próprio fluxo de caixa informar o que ele deve ter em reserva"* | Cálculo e exibição da **Reserva Recomendada**. |
| 3 | *"Suas movimentações do mês"* | Dashboard com lista + gráfico. |
| 4 | *"Alertar sobre contas a vencer e comparação ao caixa"* | Central de alertas in-app. |
| 5 | *"Gastos fixos"* | Cadastro de recorrências. |

**Implícitos (necessários para o núcleo funcionar):**

- Autenticação (mock).
- Cadastro de movimentações efetivadas.
- Saldo atual em tempo real.
- Categorização.
- Gráfico de fluxo.
- Tela responsiva.

**Evolução provável (fora desta etapa, anotada para não ser esquecida):**

- Contas a receber (fluxo completo, não só custos).
- Alertas fora do app (e-mail / WhatsApp).
- Importação OFX/CSV do banco.
- Conciliação via Open Finance.
- Relatórios exportáveis e DRE simplificado.
- Múltiplas contas bancárias por usuário.
- Metas e projeção anual.
- Dark mode e PWA instalável.

---

## 2. Glossário

| Termo | Definição |
|---|---|
| **Empreendedor** | Usuário primário. Gerencia o próprio fluxo de caixa. |
| **Movimentação** | Entrada ou saída **efetivada** (já impactou o caixa). |
| **Conta a Pagar** | Saída **prevista** com data de vencimento futura, ainda não efetivada. |
| **Gasto Fixo** | Conta recorrente de valor e periodicidade conhecidos (aluguel, energia, assinatura). |
| **Saldo Atual** | Soma algébrica das movimentações efetivadas. |
| **Saldo Projetado** | Saldo Atual − Contas a Pagar pendentes no horizonte considerado. |
| **Reserva Recomendada** | Montante mínimo que o caixa deve manter para honrar compromissos do mês. |
| **Dias de Segurança** | Quantos dias o caixa atual cobre à taxa média de saída diária. |

---

## 3. Regras de Negócio

### RN-001 — Cadastro de movimentação

1. Toda movimentação possui: `id`, `tipo (ENTRADA | SAIDA)`, `valor > 0`, `dataEfetivacao`, `categoria`, `descricao` (opcional).
2. `valor` é tratado como **inteiro em centavos** no domínio para evitar erros de ponto flutuante.
3. `dataEfetivacao` não pode ser futura. Registro com data futura deve ser modelado como **Conta a Pagar**, não movimentação.
4. Moeda default: `BRL`. Estrutura prevê multi-moeda no futuro, mas não implementa agora.

### RN-002 — Cadastro de conta a pagar

1. Campos: `id`, `descricao`, `valor`, `dataVencimento`, `categoria`, `recorrencia (NENHUMA | MENSAL | SEMANAL | ANUAL)`, `status (PENDENTE | PAGA | ATRASADA | CANCELADA)`.
2. Ao transicionar para `PAGA`, **gera automaticamente uma movimentação de saída** vinculada por `contaPagarId`.
3. Contas com `dataVencimento < hoje` e `status = PENDENTE` são automaticamente reclassificadas para `ATRASADA` ao iniciar a sessão.
4. Recorrência `MENSAL` gera a próxima ocorrência quando a atual vira `PAGA`.

### RN-003 — Cálculo do Saldo Atual

```
SaldoAtual = Σ(movimentações.tipo=ENTRADA.valor) − Σ(movimentações.tipo=SAIDA.valor)
```

- Agregado **no domínio**, não no armazenamento.
- Atualizado reativamente a cada nova movimentação efetivada.

### RN-004 — Saldo Projetado (fluxo de caixa)

Para um horizonte `H` (ex.: fim do mês vigente):

```
SaldoProjetado(H) = SaldoAtual − Σ(contasPagar onde dataVencimento ≤ H, status ∈ {PENDENTE, ATRASADA})
```

- O usuário pode **ajustar o horizonte**: 7d, 15d, 30d, fim do mês, custom.
- Nesta etapa, contas a receber não entram no cálculo (fora do escopo).

### RN-005 — Reserva Recomendada do mês

```
ReservaRecomendada = Σ(contasPagar.valor do mês vigente com status ∈ {PENDENTE, ATRASADA})
                   + buffer
```

- `buffer` = percentual sobre o total, configurável pelo usuário (5% – 30%, default **10%**).
- **Estado de saúde:**
  - `SaldoAtual < ReservaRecomendada` → **DEFICIT** (sinalização vermelha).
  - `ReservaRecomendada ≤ SaldoAtual < ReservaRecomendada × 1.2` → **ATENÇÃO** (amarelo).
  - `SaldoAtual ≥ ReservaRecomendada × 1.2` → **SAUDÁVEL** (verde).

### RN-006 — Dias de Segurança

```
MediaSaidaDiaria = Σ(saídas dos últimos 30 dias) / 30
DiasSeguranca    = floor(SaldoAtual / MediaSaidaDiaria)
```

- Se `MediaSaidaDiaria = 0` → exibir `"—"` (histórico insuficiente).
- Considera apenas saídas efetivadas (não conta a pagar futura).

### RN-007 — Sistema de Alertas

#### RN-007.1 — Alertas disparáveis

| Código | Condição | Severidade |
|---|---|---|
| `ALR-VENC-7D` | Conta a pagar vence em ≤ 7 dias e está `PENDENTE` | `WARN` |
| `ALR-VENC-2D` | Conta a pagar vence em ≤ 2 dias | `DANGER` |
| `ALR-ATRASO` | Conta passou do vencimento sem pagamento | `DANGER` |
| `ALR-DEFICIT` | `SaldoAtual < ReservaRecomendada` do mês | `DANGER` |
| `ALR-CAIXA-CRIT` | `DiasSeguranca < 5` | `DANGER` |
| `ALR-PROJEC-NEG` | `SaldoProjetado(fim-do-mês) < 0` | `DANGER` |

#### RN-007.2 — Canais

Nesta etapa: **apenas in-app** (banner no dashboard + badge no sino da topbar). Nenhum canal externo.

#### RN-007.3 — Desduplicação

Alertas com a mesma chave `código + entidade + dia` não se repetem. Debounce de 24h por chave.

### RN-008 — Categorias

1. Categorias são **por usuário**.
2. Default ao iniciar: `Receitas`, `Fornecedores`, `Impostos`, `Salários`, `Aluguel`, `Energia`, `Marketing`, `Outros`.
3. Categoria com movimentações vinculadas não pode ser excluída — apenas **arquivada**.

### RN-009 — Gastos fixos (recorrência)

1. Gasto fixo = conta a pagar com `recorrencia ≠ NENHUMA`.
2. Ao criar, a UI apresenta as próximas 3 ocorrências previstas para confirmação.
3. Ao pagar uma ocorrência, o sistema gera automaticamente a próxima com `status = PENDENTE` e a `dataVencimento` correspondente.
4. Editar um gasto fixo oferece ao usuário: aplicar apenas à ocorrência atual ou a toda a série futura.

### RN-010 — Autenticação (mock nesta etapa)

1. Login por e-mail + senha.
2. Nesta etapa, as credenciais são validadas contra um **usuário demo seed** (`demo@trimicash.app` / `demo1234`).
3. Senha mínima: 8 caracteres, 1 maiúscula, 1 número (regra já ativa para futuro back-end).
4. Sessão persiste em `localStorage` com timestamp de expiração (8h).

### RN-011 — Identificação do usuário

Toda entidade persistida carrega `userId`. A camada de repositório **filtra por `userId`** em todas as consultas, mesmo no mock — o padrão já está enforçado para que o dia de trocar por back-end real seja trivial.

### RN-012 — Auditoria de ações (log interno)

Ações críticas (`criar/editar/excluir movimentação`, `pagar conta`, `alterar preferências`) geram registro em um log local (`audit_log`) com `userId`, `entityType`, `entityId`, `action`, `timestamp`. Nesta etapa o log é persistido mas não exposto em UI.

---

## 4. Invariantes do domínio (testes obrigatórios)

Toda alteração no domínio deve manter verdes estes testes:

- `Σ(entradas) − Σ(saídas) === SaldoAtual` em qualquer ponto do tempo.
- Movimentação nunca tem `valor ≤ 0`.
- Conta marcada `PAGA` sempre tem movimentação de saída vinculada (operação atômica).
- Nenhuma consulta retorna dados de outro `userId` (enforçado no repositório).
- `DiasSeguranca` é sempre `≥ 0` ou o sentinela `"—"`.
- `Reserva Recomendada` nunca é negativa.
