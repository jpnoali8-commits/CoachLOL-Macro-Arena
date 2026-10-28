# Memória portátil — CoachLOL V4.5.2d-4-dev7

## Ponto de partida absoluto
ZIP **CoachLOL_MacroArena_V452d4_Dev7_PostgameTelemetry_JogoCompleto.zip** com fontes, `.git` sujo herdado, skills, QA e máscaras. Não substituir por bases anteriores.

## Implementado
- 12 Lumes da máscara v2: 8 iniciais + 4 desbloqueados em 15:00 OU Rift, os 8 persistem. Sem outline da região bônus.
- Vitória/Derrota, botão Continue, tela com cinco abas e gráficos.
- `u.postgameV452d4Dev7` como telemetria autoritativa; `arena.postgameTimelineV452d4Dev7.samples` com timeseries por minuto simulado.
- Gold earned exclui saldo inicial e refund. Damage a campeões é HP efetivo pós-escudo por tipo.
- Snapshots antigos sem telemetria mostram indisponível, não zero histórico falso.
- JS é motor offline canônico. Sync `python tools/sync_browser_v43.py` obrigatório após mudar `engine.mjs`.

## QA
Contratos novos 7/7, npm test PASS, farm seed36 TOP43 MID35 ADC41, Chromium fixture PASS limitado. E2E Nexus real NOT_RUN. Não certifica Riot 1:1.

## Próximo marco V4.5.2d-4-dev8
1. Scryer's Bloom: auditoria 15:00 OU Rift, 10 novos lugares oficiais da regra 26.1 e correção da diferença entre plantas existentes e novas; não ativar coordenadas não fornecidas/certificadas.
2. Fluxo Chromium real até Nexus → overlay Victory/Defeat → Continue → filtros/abas → Continue.
3. Revisitar Barão d3-B e Elder/Smite d3-C com mecânicas determinísticas.
4. Dano a escudos/estruturas e visão além de wards apenas após contratos próprios; preservar farm/snapshots/fog.
