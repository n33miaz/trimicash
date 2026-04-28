# T07 — UI: Auth (mock) + Settings + Categories

**Onda:** W2 · **Paralelismo:** OK com T05, T06 · **Agente:** 1

## Objetivo
Entregar telas leves de Auth (login mock), Settings (margens da reserva, mínimo de dias de segurança, reset de seeds) e CRUD de Categorias (RN-010). São features curtas que não precisam ser bloqueadas pelas features financeiras pesadas da W3.

## Pré-requisitos
- T00, Wave 1, T05 (layouts) e T06 (facades) **podem** estar acontecendo em paralelo. Esta tarefa só depende de T00 + T04 + T05 (`AuthLayoutComponent`, `MainLayoutComponent`).

## Escopo de Arquivos
```
src/app/features/auth/ui/
src/app/features/auth/auth.routes.ts
src/app/features/settings/ui/
src/app/features/settings/auth/settings.routes.ts
src/app/features/categories/ui/      ← embutido em settings; sem rota top-level
```

## Entregáveis

### Auth (`features/auth/ui/`)
- `login-page/` com formulário (email + senha) — qualquer credencial funciona; chama `AUTH_PORT.login`.
- Logo TrimiCash + texto curto explicando ser uma demo.
- Após login, redireciona para `/`.
- `auth.routes.ts` exporta rotas dentro de `AuthLayoutComponent`.

### Settings (`features/settings/ui/settings-page/`)
Formulário simples com:
- Margem de segurança da reserva (% — default 10).
- Limite de atenção sobre a reserva (% — default 20).
- Mínimo de dias de segurança (default 7).
- Botão "Resetar dados de demonstração" com `tc-modal` de confirmação → chama `seedRunner.reseed('healthy'|'risk')`.
- Linguagem leve, em PT-BR. Cada campo com `tc-input` + dica explicativa.
- Persiste alterações via `APP_SETTINGS` adapter (T04).

### Categories (dentro do Settings)
Sub-aba ou seção na mesma página:
- Lista (`tc-table`) com nome + cor.
- Formulário inline para criar/editar.
- Botão excluir desabilitado se categoria está em uso (consultar facades de cash-flow e accounts-payable). Tooltip explicando.

## UX
- Estados loading/empty/error obrigatórios na lista de categorias.
- Mobile-first: formulários empilham, botões largura total ≤ 768px.
- Mensagens de sucesso via toast simples (componente em `shared/components/tc-toast`, criar se não existir — se T05 já criou, reutilizar).

## Aceite
- [ ] Login mock funciona, sessão persiste em `sessionStorage`.
- [ ] Logout volta para `/auth/login`.
- [ ] Alterar margem da reserva reflete imediatamente em `dashboard.facade` (via Signal).
- [ ] Reset de seeds limpa e recarrega cenário escolhido.
- [ ] CRUD de categoria funcional com bloqueio de exclusão de categoria em uso.
- [ ] Acessibilidade: navegação por teclado, focus-visible.

## Fora de Escopo
- Auth real (Fase 2).
- Permissões/papéis.
