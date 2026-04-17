# TrimiCash - Fase 2: Projeto Funcional

> Objetivo: transformar a demo validada na Fase 1 em um produto funcional, com backend, persistencia real, autenticacao e preparacao para uso continuo.

---

## 1. Gatilho Para Iniciar

A Fase 2 deve comecar apenas se o cliente validar a apresentacao e decidir evoluir o TrimiCash para uso real.

Antes de iniciar, e necessario confirmar:

- quem sera o usuario real;
- quais dados precisam ser persistidos;
- quais regras financeiras continuam iguais;
- quais funcionalidades entram no primeiro produto funcional;
- quais dispositivos serao prioridade;
- se havera uso interno, uso por um cliente piloto ou uso publico.

## 2. Objetivo da Fase

Sair de uma demo mockada para uma aplicacao operacional.

Isso significa:

- dados persistidos de forma confiavel;
- autenticacao real;
- regras de seguranca;
- backend/API;
- deploy;
- logs e monitoramento basico;
- tratamento serio de erros;
- testes mais amplos;
- fluxo preparado para manutencao.

## 3. Escopo Inicial Sugerido

### 3.1 Produto

- Cadastro/login real.
- Dashboard financeiro.
- Movimentacoes.
- Contas a pagar.
- Gastos fixos.
- Alertas in-app.
- Categorias.
- Preferencias do usuario.
- Historico basico de acoes importantes.

### 3.2 Backend

- API para usuarios, sessoes, movimentacoes, contas, categorias e preferencias.
- Validacoes no servidor.
- Persistencia em banco de dados.
- Autorizacao por usuario.
- Logs de erro.

### 3.3 Frontend

- Substituir adapters mock por adapters HTTP.
- Manter dominio e telas principais sempre que possivel.
- Melhorar estados de erro, loading e retry.
- Ajustar fluxos conforme feedback da demo.

## 4. Fora do Primeiro Corte da Fase 2

Mesmo como produto funcional, estes itens devem ser tratados como evolucao posterior se nao forem essenciais:

- integracao bancaria/Open Finance;
- importacao OFX/CSV;
- notificacoes WhatsApp;
- relatórios PDF/Excel avancados;
- multiplas empresas por usuario;
- permissoes complexas;
- plano de assinatura;
- conciliacao bancaria;
- app nativo.

## 5. Decisoes Tecnicas a Tomar no Inicio

Antes de codar a Fase 2, decidir:

- stack do backend;
- banco de dados;
- estrategia de autenticacao;
- ambiente de deploy;
- modelo de backup;
- padrao de logs;
- estrategia de versionamento da API;
- se havera homologacao separada de producao.

Essas decisoes nao pertencem a Fase 1 para evitar compromisso prematuro.

## 6. Migracao da Fase 1

O plano e preservar:

- design system;
- telas principais;
- componentes compartilhados;
- dominio financeiro;
- casos de uso;
- facades;
- validacoes de negocio.

O que muda:

- adapters mock viram adapters HTTP;
- seeds deixam de ser fonte principal de dados;
- login demo vira login real;
- erros simulados viram erros reais tratados;
- dados passam a ser associados a usuario autenticado.

## 7. Regras Que Devem Ser Revalidadas

Antes de virar produto real, revalidar com o cliente:

- margem da reserva recomendada;
- limites de saude financeira;
- regra de dias de seguranca;
- tratamento de recorrencias;
- categorias iniciais;
- necessidade de contas a receber;
- se pagar conta deve sempre gerar uma saida automaticamente;
- se alertas devem sair do app.

## 8. Requisitos Nao Funcionais

### 8.1 Seguranca

- Senhas nunca armazenadas em texto puro.
- Autorizacao por usuario em todas as consultas.
- Validacao no backend mesmo que o frontend valide antes.
- Protecao contra acesso indevido a dados financeiros.

### 8.2 Confiabilidade

- Banco com backup.
- Tratamento de falhas de rede.
- Estados de loading e retry.
- Logs para diagnostico.

### 8.3 Manutencao

- Testes automatizados nos calculos.
- Padrao claro de pastas.
- API documentada.
- Migrations versionadas.

## 9. Criterios de Aceite

- Usuario real consegue criar conta e entrar.
- Dados persistem apos fechar e abrir novamente.
- Usuario nao acessa dados de outro usuario.
- Dashboard reflete dados reais do usuario.
- Conta paga altera saldo.
- Alertas sao recalculados com base nos dados reais.
- Erros de rede sao tratados sem quebrar a interface.
- Deploy de homologacao esta acessivel para teste.

## 10. Roadmap Possivel Depois da Fase 2

- Contas a receber.
- Relatorios gerenciais.
- Exportacao PDF/Excel.
- Importacao de extrato.
- Open Finance.
- Notificacoes externas.
- PWA.
- Multiempresa.
- Permissoes.
- Assinaturas e cobranca.
