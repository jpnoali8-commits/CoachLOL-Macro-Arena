# CoachLOL Macro Arena — continue da V4.5.3-dev63

**Base canônica obrigatória:** este ZIP mestre completo dev63. Não retornar a dev61/dev62 como fonte de código. Preservar `.git`, assets, histórico de QA, máscaras, Data Dragon 16.21.1 e todos os arquivos herdados.

Comece por `NOVO_CHAT_COMECE_AQUI.md`, `AGENTS.md`, `.agents/skills/coachlol-producao/SKILL.md`, `MEMORIA_CONTINUIDADE_V453_DEV63.md`, `QA_V453_DEV63.md`, `ROADMAP_V453_DEV63.md` e `CHANGELOG_V453_DEV63.md`.

## Mudança canônica dev63

- `engine.mjs` + `engine.browser.js`: Nexus destruído durante o turno conclui a execução **exatamente no segundo da destruição**, marca `phase=finished`, zera `executionRemaining`, registra a rodada truncada, sem simular segundos extras. `tools/sync_browser_v43.py` gerou 73 exports.
- `multiplayer/room_v453_dev47.mjs`: `winner` público apenas **após** `ended=true`. O servidor permanece autoritativo.
- `multiplayer.html` + `multiplayer/pvp_client_v453_dev47.js` + CSS: overlay compacta de vitória/derrota com base no vencedor do servidor, botão para ver o tabuleiro e bloqueio de loja/ready no pós-jogo.
- `tests/v453_dev63_nexus_pvp_e2e.test.mjs`: 2 clientes automatizados via HTTP, 2 cookies, 5 campeões cada, SSE real em Node, 2 Nexus destruídos organicamente, reconexão a partir de snapshot. Sementes de teste confiáveis 26/42.
- Teste visual Chromium em dois contextos com sessões finais reais injetadas offline: `tools/chromium_pvp_dev63_result.py`.

**Importante:** estes são **clientes de teste programáticos**, NÃO duas pessoas jogando. O Chromium local ainda não permite o acesso HTTP direto a localhost, portanto o transporte browser-native da partida completa **não está certificado**. A certificação dos kits QWER completos e 100 itens ainda só de referência também continua pendente. Não mudar IA bot prematuramente.

## Verificação

```bash
npm run test:v453:dev61
npm run test:v453:dev62
npm run test:v453:dev63
npm test
python tools/chromium_pvp_dev63_result.py
python tools/sync_browser_v43.py
```

**Nunca alterar** a invalidação definitiva de Desfazer ao sair fisicamente da fonte. PvP = 1 humano por equipe, cinco campeões por humano, ambos confirmam. Foco dev64: interações humanas completas via browser HTTP/SSE nativo em ambiente sem bloqueios; teste de reações/combos reais; itens oficiais em lotes pequenos de efeitos realmente implementados.
