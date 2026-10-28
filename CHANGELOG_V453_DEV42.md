# CoachLOL Macro Arena — V4.5.3-dev42 (27/10/2026)

Base: pacote completo da dev41. Nunca reconstruir o jogo ou alterar o histórico Git.

## Implementações verificadas
- **Ezreal Q**: projétil de direção fixa nasce do lançamento autoritativo e é resolvido em um tick futuro; o alvo pode entrar/sair da rota, a primeira colisão com campeão ou minion intercepta, paredes originadas das máscaras do Rift bloqueiam; guardas/escudos são avaliados no impacto. A recarga só é reduzida por colisão com inimigo, incluindo impacto absorvido por escudo de feitiço. Projeto conserva ray, owner, time, speed, revision, ID e `raw` no snapshot.
- **Irelia Q**: rejeita dash sob enraizamento, grounded, stun, suppression ou knockup *antes* de gastar mana. Marcas `Unsteady` por E/R têm TTL de 5 segundos e owner explícito. Acerto válido do Q consome marca e reduz cooldown restante a 0,2s; morte do alvo ainda restaura completamente a recarga; escudo de feitiço bloqueia consumo e dano. Não há marca de graça no Q e E/R completos ainda não implementados.
- **Interface**: tracer compacto dourado para projéteis aliados em curso, respeitando privacidade de fog. Indicador de marca na projeção visível. Não habilitar visão de inimigos ocultos.
- **Node e navegador** compartilham o mesmo `engine.mjs` sincronizado com `engine.browser.js`. O jogo usa resolução adiada por padrão. Cenários legados da dev41 têm flag exclusiva de compatibilidade de teste.
- **Compatibilidade**: estado serializado no snapshot V4, migração de checkpoints antigos e journal sem criar novas duplicações de combate.

## Testes realmente executados
- Novos contratos: 19/19 PASS (`tests/v453_dev42_projectile_mark_interrupt.test.mjs`).
- Regressão completa: `npm test` PASS (`docs/QA_EVIDENCE_V453_DEV42/npm_test_full.log`).
- Chromium headless no `index.html` real: PASS, 0 page errors; evidências e JSON em `docs/QA_EVIDENCE_V453_DEV42`.
- 3/3 partidas por destruição do Nexus: seeds 26 = 1626s, 36 = 1525s, 42 = 1458s; média 1536,3s (25m36s). Composição padrão não exercita necessariamente Ezreal Q ou Irelia Q.
- Arquivos Git originais preservados byte a byte; todos os arquivos dev41 permanecem pelo mesmo caminho.

## Fontes e maturidade
- Referência externa: https://wiki.leagueoflegends.com/en-us/Irelia (Unsteady / Bladesurge), https://leagueoflegends.fandom.com/wiki/Ezreal/LoL (Mystic Shot); dados oficiais do catálogo local são outra camada e não equivalem a implementação jogável.
- **Limitações intencionais**: resolução em intervalos de 1 segundo, sem voo sub-tick; sem Yasuo Wind Wall posicional; sem colisão integral de monstros neutros; dash da Irelia instantâneo dentro do tick; marcas ainda sem E/R produtor. Isso não é paridade completa com o League of Legends.
