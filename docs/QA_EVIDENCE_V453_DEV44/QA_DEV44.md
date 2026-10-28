# QA V4.5.3-dev44 — auditoria e gateway PvP

- `node tests/v453_dev44_authority_catalog.test.mjs`: **15/15 PASS**.
- `npm test`: **PASS** (suite completa existente), ver `npm_test_full.log`.
- Dois assentos de equipes distintas em uma mesma instância Arena: **PASS (in-process)**.
- Testes: posse e proibição de mudar de equipe, fog-of-war, mensagens e sequências inválidas, reenvio idempotente, checkpoint conjunto Arena/gateway, locks de fase, ações reais Ezreal Q e Irelia E.
- Auditoria de 173 fichas de campeão: **173 presentes / 0 certificados 100% PvP**.
- Chromium: **não executado**; nenhuma tela foi modificada, não há transporte novo.
- PvP pela rede real: **NÃO IMPLEMENTADO** — próxima etapa é servidor, lobby, autenticação e relógio.
- IA avançada dos bots: **sem alterações** por decisão do usuário.
- `engine.mjs`, `engine.browser.js`, regras de dano, UI, assets, snapshots existentes não foram modificados.
- O pacote mantém código integral da dev43 e histórico Git; verificar manifesto da entrega.
