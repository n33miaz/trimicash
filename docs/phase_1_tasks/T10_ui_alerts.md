# T10 — UI: Alertas

**Onda:** W3 · **Paralelismo:** OK com T08, T09, T11 · **Agente:** 1

## Objetivo
Entregar a central de alertas in-app + indicador de não-lidos no topbar.

## Pré-requisitos
- W2 concluída (especialmente `AlertsFacade`).
- `MainLayoutComponent` (T05) deve emitir output `(openAlerts)` no badge do topbar.

## Escopo de Arquivos
```
src/app/features/alerts/ui/
src/app/features/alerts/alerts.routes.ts
```

## Entregáveis

### `alerts-page/`
- Lista agrupada por severidade: **Críticos**, **Avisos**, **Informativos**.
- Cada item: ícone (por código), título, mensagem, data relativa ("há 2 horas"), ação contextual quando aplicável (ex.: ALR-VENC-2D → botão "Ver conta" → navega para `/accounts-payable` filtrado).
- Botão "Marcar todos como lidos".
- Estado empty: ilustração leve + texto "Nenhum alerta. Caixa saudável."
- `aria-live="polite"` na lista.

### Indicador no Topbar
- Badge numérica com `unreadCount` da facade.
- Click navega para `/alerts`.
- Pop-over opcional desktop com top 3 alertas (não bloqueante).

## Mapeamento de Códigos → Visual
| Código | Ícone | Tom |
|---|---|---|
| ALR-VENC-7D | clock | warning |
| ALR-VENC-2D | clock-alert | danger |
| ALR-ATRASO | alert-octagon | danger |
| ALR-DEFICIT | trending-down | danger |
| ALR-PROJEC-NEG | calendar-x | danger |
| ALR-CAIXA-CRIT | shield-alert | danger |

(Usar set de ícones livre — Lucide ou Heroicons SVG inline.)

## Aceite
- [ ] Alertas aparecem automaticamente quando uma conta vira atrasada ou saldo cai.
- [ ] "Marcar como lido" persiste em `localStorage`.
- [ ] Badge no topbar atualiza em tempo real (Signal).
- [ ] Mobile usável.

## Fora de Escopo
- Notificações por e-mail/push (Fase 2).
