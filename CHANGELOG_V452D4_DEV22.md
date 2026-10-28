# CoachLOL — Changelog V4.5.2d-4-dev22

**Base:** V4.5.2d-4-dev21, mantendo estado Git herdado, ícones CC0, máscaras, Golpear competitivo e Arauto.

## Implementado
- Priorização determinística de rota para bots a partir da destruição da primeira torre exterior (e após 18min de tempo simulado); pontuação usa estruturas públicas e avanço de minions aliados.
- Coordenação de MID, ADC e SUP no mesmo cerco; TOP passa a poder aderir após 30min. Jungler mantém missão de objetivos.
- Macro de push ativa ordens convencionais, sem dano instantâneo nem teleporte.
- Wave aliada REAL permite estender acompanhamento da rota até 96,5% em vez do teto anterior de 87%; sem wave a zona segura permanece limitada.
- Seleção de alvos no combate/farm segue a rota estratégica durante o cerco.
- Preservada sequência torre t1 → t2 → t3 → inibidor → torres Nexus → Nexus.

## Evidências
- `tests/v452d4_dev22_siege_coordination.test.mjs`: 8/8 PASS.
- `npm test`: PASS; `docs/QA_EVIDENCE_V452D4_DEV22/npm_test_full.log`.
- Long match seed26 40min: **7 estruturas** contra 4 na dev21; 1 dragão; nenhum Nexus destruído.
- Long match seed42 20min: 0 estruturas, 2 dragões; nenhum Nexus destruído.
- Chromium: atlas + 15 SVGs reais, 0 erros JS; apenas fixture controlada.

**Não concluído:** vitória orgânica até o Nexus; balanceamento completo, migração multiplayer.
