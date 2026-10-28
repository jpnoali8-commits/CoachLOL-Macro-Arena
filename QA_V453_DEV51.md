# QA — V4.5.3-dev51

## Evidências executadas

- Base: ZIP completo da V4.5.3-dev50. Nenhum reset/rebase/commit solicitado ou executado.
- `node tests/v453_dev51_minion_block_regen_items.test.mjs` — **13/13 PASS**.
- `npm test` — **PASS**, log preservado em `docs/QA_EVIDENCE_V453_DEV51/npm_test_full.log`.
- `tools/sync_browser_v43.py` — navegador sincronizado, 71 exports.
- Partidas: seed 26, 1331 s (Azul, Nexus destruído), seed 42, 1374 s (Vermelho, Nexus destruído). Ambas com `issues: []`.
- Análises de integralidade do ZIP, hashes e preservação `.git` registradas no relatório SHA-256 externo ao ZIP.

## Cobertura funcional

- 5 itens SR: disponibilidade DD 16.21.1, ID, preço, receita, stats, compra/venda, regen e snapshots.
- Minions: 3+3 ou 3+1+3; corpos sem sobreposição no cenário inicial normal; bloqueio espacial de movimento explícito de campeões usando corpos sincronizados; snapshots determinísticos.
- A posição longitudinal econômica ainda é independente do corpo. Colisões dinâmicas complexas de minions e target selection completa exigem próxima certificação.

## Limitações / falhas de ambiente

- **Chromium não certificado**: `file://` e `http://localhost` retornaram `ERR_BLOCKED_BY_ADMINISTRATOR`. Não há captura nova aprovada.
- **Ícones Riot offline** continuam pendentes: sem PNGs certificados da versão 16.21.1 na distribuição. Nenhum fallback da Wiki incluído.
- Regen 1 HP/s e 1 mana/s por base é adaptação de treinamento, não valores exatos de campeões LoL.
- O lote não completa todas as passivas/ativáveis dos 119 itens SR ainda somente de referência e não aprova paridade universal.
- Multiplayer PvP e habilidades completas dos 173 campeões continuam linha prioritária; IA estratégica dos bots permanece fora da produção.
