# Memória técnica — CoachLOL 4.5.3-dev39

Partir exclusivamente do ZIP mestre `CoachLOL_MacroArena_V453_Dev39_OnHit_Movimento_HUD_JogoCompleto.zip`. Preserve `.git` preexistente (sem reset, rebase, commits), `assets`, masks, six elemental Rift variants, wards, Smite overlay, and Node/browser parity. 70 itens jogáveis locais; 863 registros oficiais 26.21 e 173 fichas de campeão são referências, não mecânicas completas.

Mecânicas mudadas: Kraken `krakenHitV453Dev32` acumula entre diferentes alvos, limpa na venda/recompra; `itemEnergizeRelocateV453Dev39` aceita dash/knockback físicos e não gera por Flash/TP/Hexgate/blink; `itemProcStatusV453Dev39(u)` é a única fonte do HUD para RFC/Bullseye/Kraken/Doran/Armaguarda. `moveAlong` continua carregando pela distância percorrida. Mudanças no `engine.mjs` requerem `python tools/sync_browser_v43.py` para gerar `engine.browser.js`.

QA: 12/12 dev39 contratos PASS, `npm test` PASS, Chromium com duas capturas originais e 0 JS errors, 3/3 partidas completas seeds 26/36/42 com 25m36s média; relatórios em `docs/QA_EVIDENCE_V453_DEV39`. Limites da implementação por campeão e diferença parcial vs LoL documentados em `CHANGELOG_V453_DEV39.md`.

Próximo foco dev40: procs especiais de habilidades, categorias reais de dash e efeitos energizados sem carregar teletransportes, correções de dano em escudos e golpes fatais, teste de UI e replay. Não alterar automaticamente o patch do combate nem avançar para o 26.22 antes de haver evidência oficial e review.
