# TrimiCash - Domain Context

> Contexto de negocio, linguagem do produto e regras financeiras do TrimiCash. Este documento evita decisoes de infraestrutura; detalhes tecnicos ficam em `architecture.md`.

---

## 1. Contexto Resumido

O cliente trouxe a ideia de um sistema simples para ajudar o empreendedor a visualizar previsoes de gastos, contas a pagar, movimentacoes do mes e necessidade de reserva dentro do proprio fluxo de caixa.

O ponto central da conversa foi transformar uma percepcao vaga de "controle financeiro simples" em uma experiencia objetiva: o empreendedor deve abrir o TrimiCash e entender rapidamente se o caixa atual cobre os compromissos proximos.

Tambem foi mencionado que **gastos fixos** sao relevantes, porque boa parte das despesas recorrentes do pequeno negocio se repete mensalmente e precisa entrar na previsao.

## 2. Produto

**Nome:** TrimiCash.

**Formato:** Web App responsivo.

**Objetivo da primeira entrega:** demonstrar uma experiencia navegavel e convincente, com dados simulados, para validar a apresentacao do projeto.

**Objetivo de evolucao:** caso o projeto seja vendido/aprovado, transformar a demo em produto funcional com persistencia real, autenticacao real e infraestrutura propria.

## 3. Persona

**Empreendedor micro/pequeno**

- Controla o proprio caixa.
- Precisa pagar contas no prazo.
- Quer saber se pode assumir novos compromissos.
- Nao necessariamente domina termos contabeis.
- Valoriza respostas diretas: "tenho dinheiro?", "vai faltar?", "quanto devo guardar?".
- Pode acessar pelo celular, entao a experiencia precisa ser mobile-first.

## 4. Proposta de Valor

O TrimiCash deve responder cinco perguntas em poucos segundos:

1. Quanto tenho agora?
2. Quanto vou ter no fim do periodo?
3. Quanto preciso manter em reserva?
4. Por quantos dias meu caixa aguenta?
5. Quais contas exigem atencao agora?

## 5. Ideias Listadas Pelo Cliente

| Ideia capturada | Traducao para requisito |
|---|---|
| Ver previsoes de gastos/contas a pagar | Cadastro e listagem de contas a pagar |
| Fluxo de caixa informar a reserva necessaria | Calculo de reserva recomendada |
| Ver movimentacoes do mes | Dashboard com entradas, saidas e historico |
| Alertar sobre contas a vencer | Alertas in-app por vencimento proximo |
| Comparar contas com o caixa | Alertas de deficit e saldo projetado negativo |
| Gastos fixos | Recorrencia para despesas previsiveis |

## 6. Escopo de Negocio da Fase 1

Na primeira fase, a experiencia deve simular o comportamento do produto final, sem exigir produto operacional completo.

Inclui:

- dashboard financeiro;
- saldo atual;
- entradas e saidas efetivadas;
- contas a pagar;
- gastos fixos;
- reserva recomendada;
- saldo projetado;
- dias de seguranca;
- alertas dentro da aplicacao;
- filtros simples por periodo;
- dados suficientes para uma apresentacao realista.

Nao inclui:

- uso por clientes reais em producao;
- notificacoes por e-mail, WhatsApp ou push;
- integracao bancaria;
- exportacao de relatorios;
- multiplos usuarios reais;
- regras contabeis avancadas.

## 7. Glossario

| Termo | Definicao |
|---|---|
| Empreendedor | Usuario principal que acompanha o proprio caixa |
| Movimentacao | Entrada ou saida ja efetivada |
| Entrada | Dinheiro que entrou no caixa |
| Saida | Dinheiro que saiu do caixa |
| Conta a pagar | Compromisso futuro ou pendente que ainda precisa ser pago |
| Gasto fixo | Conta recorrente, como aluguel, energia, assinatura ou salario |
| Saldo atual | Resultado das entradas menos as saidas efetivadas |
| Saldo projetado | Saldo esperado apos considerar contas pendentes dentro de um periodo |
| Reserva recomendada | Valor minimo sugerido para cobrir compromissos do periodo |
| Dias de seguranca | Estimativa de quantos dias o caixa cobre o ritmo medio de saidas |
| Alerta | Aviso que chama atencao para vencimento, atraso ou risco financeiro |

---

## 8. Regras de Negocio

### RN-001 - Movimentacao

1. Toda movimentacao deve possuir tipo, valor, data, categoria e descricao.
2. O tipo deve ser `ENTRADA` ou `SAIDA`.
3. O valor deve ser maior que zero.
4. Uma movimentacao representa algo que ja aconteceu.
5. Lancamentos futuros devem ser tratados como conta a pagar, nao como movimentacao efetivada.

### RN-002 - Conta a Pagar

1. Toda conta a pagar deve possuir descricao, valor, data de vencimento, categoria e status.
2. Status permitidos: `PENDENTE`, `PAGA`, `ATRASADA`, `CANCELADA`.
3. Conta pendente com vencimento anterior ao dia atual deve ser tratada como atrasada.
4. Ao marcar uma conta como paga, ela passa a impactar o caixa como saida efetivada.

### RN-003 - Gastos Fixos

1. Gasto fixo e uma conta a pagar recorrente.
2. Recorrencias iniciais previstas: mensal, semanal e anual.
3. O usuario deve conseguir identificar visualmente que uma conta pertence a uma recorrencia.
4. Ao pagar uma ocorrencia recorrente, o produto pode sugerir ou gerar a proxima ocorrencia.

> Premissa de produto: a geracao automatica da proxima ocorrencia e recomendada para evolucao, mas pode ser simplificada na demo.

### RN-004 - Saldo Atual

```text
Saldo Atual = soma das entradas efetivadas - soma das saidas efetivadas
```

1. O saldo atual considera apenas movimentacoes efetivadas.
2. Contas futuras nao alteram o saldo atual.
3. O saldo deve atualizar quando uma movimentacao for criada, editada, excluida ou quando uma conta for paga.

### RN-005 - Saldo Projetado

```text
Saldo Projetado = Saldo Atual - contas a pagar pendentes/atrasadas no periodo
```

1. O saldo projetado mostra o risco futuro do caixa.
2. Contas canceladas ou pagas nao entram como pendencia futura.
3. O periodo padrao da demonstracao deve ser o mes atual.
4. Periodos adicionais podem ser oferecidos: 7 dias, 15 dias, 30 dias e fim do mes.

### RN-006 - Reserva Recomendada

```text
Reserva Recomendada = total de contas pendentes/atrasadas do periodo + margem de seguranca
```

1. A reserva representa o minimo recomendado para honrar os compromissos proximos.
2. A margem de seguranca inicial sugerida e 10%.
3. A margem pode ser apresentada como configuracao simples.
4. A reserva recomendada nunca pode ser negativa.

> Premissa de produto: 10% e uma sugestao inicial para demo. Em produto real, esse percentual deve ser validado com o cliente.

### RN-007 - Saude da Reserva

| Condicao | Estado | Cor sugerida |
|---|---|---|
| Saldo atual menor que reserva recomendada | Deficit | Vermelho |
| Saldo atual cobre a reserva, mas com pouca folga | Atencao | Amarelo |
| Saldo atual cobre a reserva com margem | Saudavel | Verde |

> Premissa de produto: a faixa de "pouca folga" pode iniciar com 20% acima da reserva recomendada, mas deve ser ajustavel em evolucao futura.

### RN-008 - Dias de Seguranca

```text
Media diaria de saidas = saidas dos ultimos 30 dias / 30
Dias de seguranca = Saldo Atual / Media diaria de saidas
```

1. Considera apenas saidas efetivadas.
2. Se nao houver saidas suficientes para calcular media, a interface deve informar historico insuficiente.
3. O resultado nao deve ser negativo.

### RN-009 - Alertas

Alertas iniciais:

| Codigo | Regra | Severidade |
|---|---|---|
| `ALR-VENC-7D` | Conta pendente vence em ate 7 dias | Aviso |
| `ALR-VENC-2D` | Conta pendente vence em ate 2 dias | Critico |
| `ALR-ATRASO` | Conta passou do vencimento sem pagamento | Critico |
| `ALR-DEFICIT` | Saldo atual menor que reserva recomendada | Critico |
| `ALR-PROJEC-NEG` | Saldo projetado fica negativo | Critico |
| `ALR-CAIXA-CRIT` | Dias de seguranca abaixo do limite minimo | Critico |

Na primeira fase, os alertas sao apenas dentro da aplicacao.

### RN-010 - Categorias

1. Categorias ajudam a organizar entradas, saidas e contas a pagar.
2. Categorias iniciais sugeridas: Receitas, Fornecedores, Impostos, Salarios, Aluguel, Energia, Marketing e Outros.
3. Categoria em uso nao deve ser excluida sem tratar os registros vinculados.

### RN-011 - Experiencia de Login na Demo

1. A primeira fase pode simular login para deixar a apresentacao mais realista.
2. Esse login nao representa autenticacao real.
3. A regra de autenticacao real pertence a evolucao do produto funcional.

---

## 9. Invariantes de Negocio

Estas regras devem permanecer verdadeiras:

- Saldo atual sempre reflete entradas menos saidas efetivadas.
- Movimentacao nunca tem valor menor ou igual a zero.
- Conta paga deve impactar o caixa como saida.
- Conta futura nao altera saldo atual antes de ser paga.
- Reserva recomendada nunca e negativa.
- Dias de seguranca nunca deve ser menor que zero.
- Conta atrasada deve ser destacada como risco.

## 10. Evolucoes Provaveis

Itens desejaveis para uma fase posterior:

- contas a receber;
- relatorios exportaveis;
- multiplas contas bancarias;
- metas financeiras;
- visao anual;
- notificacoes externas;
- importacao OFX/CSV;
- integracao bancaria;
- usuarios reais;
- permissoes;
- historico/auditoria;
- PWA;
- dark mode.
