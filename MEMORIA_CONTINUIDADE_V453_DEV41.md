# Memória de continuidade — V4.5.3-dev41

Usar exclusivamente o ZIP mestre da dev41 como base para dev42. O pacote partiu da dev40, inclui Git com 566 arquivos herdados byte a byte (ver arquivo `source_preservation_dev41.json` após empacotamento). Nunca executar reset/clean/rebase/commits automáticos.

Motor principal `engine.mjs`; sempre sincronizar `engine.browser.js` com `python tools/sync_browser_v43.py`. `CHAMPION_ONHIT_SKILLS_V453_DEV41` contém **somente Ezreal Q e Irelia Q**; `castChampionOnHitV453Dev41` registra custos e cooldown pelo `performActionV40`, depois despacha ao resolvedor autorizado `attack(...,'skill_on_hit')`. Integração direta aos combos `resolveQueuedCombos` e a ordens explícitas Q de `resolveCombat`.

Comportamentos novos: Ezreal Q só primeiro inimigo no segmento, não atravessa parede ou bloqueio de projétil, escudo de feitiço intercepta dano mas mantém refund de CD no impacto; Irelia Q valida parede, move-se fisicamente, gera Energizado pela distância percorrida, cura somente em contato não imune e restaura CD ao abater. Estes são **contratos parciais**; sem declarar kits completos/LoL 1:1.

Testes: `npm run test:v453:dev41` 18/18, `npm test` PASS, `python tests/browser_v453_dev41_champion_onhit_q.py` PASS com zero erros JS. Três partidas completas seeds 26/36/42, média 25min36s. Documentação detalhada em `docs/QA_EVIDENCE_V453_DEV41`.
