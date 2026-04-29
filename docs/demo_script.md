# TrimiCash - Roteiro de Demo da Fase 1

Roteiro estimado: 5 a 7 minutos.

## 1. Abertura

Tela: Login.

Fala sugerida: "O TrimiCash foi pensado para o empreendedor que precisa responder rápido se o caixa cobre os compromissos próximos."

Ponto-chave: a Fase 1 é uma demo navegável, com dados simulados e regras financeiras reais no frontend.

## 2. Login Demo

Tela: Login.

Fala sugerida: "Nesta versão, qualquer e-mail e senha entram na demo. A autenticação real fica para a próxima fase."

Ponto-chave: deixar claro que não há backend nem cadastro real nesta entrega.

## 3. Dashboard

Tela: Dashboard.

Fala sugerida: "Aqui a pessoa responde as cinco perguntas centrais: quanto tem agora, quanto terá no fim do período, quanto precisa reservar, por quantos dias o caixa aguenta e quais contas exigem atenção."

Ponto-chave: destacar saldo atual, saldo projetado, reserva recomendada, dias de segurança e saúde da reserva.

## 4. Período

Tela: Dashboard.

Fala sugerida: "Ao trocar o período, a projeção e a reserva são recalculadas para os compromissos daquele recorte."

Ponto-chave: mostrar que a visão não é só estática; ela simula decisões de curto prazo.

## 5. Nova Conta

Tela: Contas.

Fala sugerida: "Ao cadastrar uma conta a pagar, ela passa a entrar na reserva recomendada e nos alertas."

Passos:

1. Abrir **Contas**.
2. Clicar em **Nova conta**.
3. Informar descrição, valor, vencimento, categoria e recorrência.
4. Salvar.

Ponto-chave: contas futuras não alteram o saldo atual antes do pagamento.

## 6. Pagamento

Tela: Contas e Dashboard.

Fala sugerida: "Quando a conta é paga, o TrimiCash cria uma saída no caixa, atualiza o saldo e remove aquela pendência da reserva."

Passos:

1. Clicar em **Pagar** na conta criada.
2. Confirmar pagamento.
3. Voltar ao Dashboard.
4. Validar saldo atual menor e reserva recomendada menor.

Ponto-chave: pagar conta impacta o caixa como saída efetivada.

## 7. Caixa

Tela: Caixa.

Fala sugerida: "O pagamento aparece no fluxo de caixa como uma movimentação de saída vinculada à conta paga."

Ponto-chave: separar movimentações efetivadas de compromissos futuros.

## 8. Alertas

Tela: Alertas.

Fala sugerida: "A central de alertas mostra vencimentos, atrasos, déficit de reserva, saldo projetado negativo e dias de segurança críticos."

Ponto-chave: alertas são in-app nesta fase; e-mail, WhatsApp e push ficam fora do escopo.

## 9. Configurações

Tela: Ajustes.

Fala sugerida: "A margem da reserva, o limite de atenção e o mínimo de dias de segurança podem ser ajustados para demonstrar sensibilidade do cálculo."

Ponto-chave: mudanças refletem imediatamente no dashboard via Signals.

## 10. Cenário de Risco

Tela: `/?seed=risk`.

Fala sugerida: "Este cenário mostra a demo em situação crítica: conta atrasada, vencimento próximo, déficit de reserva e saldo projetado negativo."

Ponto-chave: usar para vender o valor do produto em uma situação realista de decisão.

## Fechamento

Fala sugerida: "A Fase 1 valida a experiência e as regras principais. A Fase 2 troca os adapters mock por backend, banco real, autenticação real e segurança operacional."
