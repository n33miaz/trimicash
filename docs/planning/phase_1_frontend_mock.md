# TrimiCash - Fase 1: Frontend Mockado

> Objetivo: entregar uma demo Angular navegavel, convincente e estavel para apresentacao, sem backend real.

---

## 1. Objetivo da Fase

A Fase 1 deve provar a ideia do produto visualmente e funcionalmente. O usuario precisa conseguir navegar pelo fluxo principal e entender o valor do TrimiCash sem depender de servidor, banco de dados ou integracoes externas.

Esta fase nao deve tentar ser produto final. Ela deve ser uma demonstracao forte, com boas regras de negocio, bom design e arquitetura suficiente para evoluir.

## 2. Resultado Esperado

Ao final da Fase 1, o projeto deve permitir:

- visualizar dashboard financeiro;
- cadastrar movimentacoes de entrada e saida;
- cadastrar contas a pagar;
- marcar uma conta como paga;
- visualizar gastos fixos/recorrentes;
- ver reserva recomendada;
- ver saldo projetado;
- ver dias de seguranca;
- receber alertas in-app;
- navegar bem no desktop e no mobile.

## 3. Escopo Incluso

### 3.1 Telas

- Login demo, se for util para a apresentacao.
- Dashboard.
- Fluxo de caixa / movimentacoes.
- Contas a pagar.
- Alertas.
- Configuracoes simples.

### 3.2 Funcionalidades

- Dados iniciais de exemplo.
- Criacao, edicao e exclusao basica de movimentacoes.
- Criacao, edicao e pagamento de contas a pagar.
- Classificacao de contas atrasadas.
- Calculo de saldo atual.
- Calculo de saldo projetado.
- Calculo de reserva recomendada.
- Calculo de dias de seguranca.
- Alertas por vencimento, atraso, deficit e saldo projetado negativo.
- Responsividade mobile-first.

### 3.3 Qualidade Minima

- Regras financeiras fora dos componentes visuais.
- Componentes com estado de loading, vazio e erro quando aplicavel.
- Design tokens aplicados.
- Testes unitarios para calculos financeiros.
- Um fluxo E2E basico, se o setup estiver disponivel.

## 4. Fora do Escopo

- Backend.
- Banco de dados real.
- Autenticacao real.
- Cadastro real de usuarios.
- Interceptor HTTP.
- Deploy em infraestrutura definitiva.
- Integracao bancaria.
- Envio de e-mail, WhatsApp ou push.
- Relatorios PDF/Excel.
- Auditoria.
- Multiusuario.
- Permissoes e papeis.
- Pagamentos reais.

## 5. Dados Mockados

Os dados devem ser realistas o bastante para a demo:

- empreendedor demo;
- saldo inicial coerente;
- entradas recentes;
- saidas recentes;
- contas vencendo em 2 e 7 dias;
- conta atrasada;
- gasto fixo mensal;
- categorias variadas;
- cenario com reserva saudavel;
- cenario com risco/deficit, se houver alternancia de dados.

## 6. Arquitetura da Fase 1

Usar Angular standalone, Signals e facades.

Recomendacao:

- `domain/` para regras financeiras;
- `application/` para use cases e facades;
- `infrastructure/` para mocks/local adapters;
- `ui/` para paginas e componentes.

Features simples podem ficar menores. Nao criar complexidade que nao sera usada na demo.

## 7. Ordem Recomendada de Implementacao

1. Configurar projeto Angular, estilos globais e tokens.
2. Criar layout principal.
3. Implementar dominio de movimentacoes e saldo.
4. Implementar contas a pagar.
5. Implementar calculos de reserva e saldo projetado.
6. Implementar alertas.
7. Montar dashboard.
8. Refinar responsividade.
9. Adicionar testes dos calculos.
10. Preparar roteiro de apresentacao.

## 8. Criterios de Aceite

- A demo abre sem depender de servico externo.
- O dashboard apresenta dados coerentes.
- Ao pagar uma conta, o saldo e os alertas mudam.
- Conta vencida aparece como risco.
- Reserva recomendada fica clara para usuario leigo.
- Layout funciona em mobile e desktop.
- Nao ha texto tecnico demais na interface.
- O projeto esta organizado para continuar na Fase 2.

## 9. Riscos

| Risco | Mitigacao |
|---|---|
| Escopo crescer durante a demo | Manter Fase 1 limitada ao frontend mockado |
| Arquitetura ficar pesada | Aplicar camadas completas apenas nas features financeiras |
| Dados mockados parecerem artificiais | Criar seeds com situacoes reais de pequeno negocio |
| Cliente confundir demo com produto pronto | Documentar claramente o que e simulado |

## 10. Entrega

A entrega da Fase 1 deve conter:

- codigo frontend;
- documentacao atualizada;
- dados de exemplo;
- instrucoes para rodar localmente;
- roteiro curto de demonstracao.
