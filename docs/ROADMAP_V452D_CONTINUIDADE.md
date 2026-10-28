# CoachLOL — Continuidade a partir V4.5.2d-dev1

## Base imutável
Jogo extraído do `CoachLOL_MacroArena.zip` recém-enviado, com V4.5.2c do Codex já funcional no benchmark normal. Não regredir a V4.5.2b, V3.7 ou V4.5.0. H1 Tactical Prompt Engine é documentação, não IA ativa.

## Ordem recomendada (gates)
1. **V4.5.2d-2 — completar objetivos**: Souls por elemento com procs/temporizadores individuais, Barão com tipos e ritmo dos minions/recall, Ancião burn+execute com resolução sub-tick/eventos, Arauto e Vastilarvas, Smite contestado, golden tests 1v1/5v5, fog e snapshots. Não certificar efeito aproximado como 1:1.
2. **V4.5.2e — calibração de ataque e wave**: attack speed por campeão, windup e travel time, aggro e movimento de minions; manter CS por último golpe real. Corrigir freeze TOP/MID e fast push sem alterar a banda oficial de CS nem fabricar ouro.
3. **V4.5.3 (por lotes)**: receitas/itens ativos e passivos, árvore de runas, spells equipadas apenas no champ select, preço/patch, filtros e builds. Cada item com testes por interações.
4. **V4.5.4+ (por kits)**: estatísticas base e crescimento nível 1–18; passiva QWER, custo, range, projetil, colisão, recast e VFX descriptor por campeão, uma família reutilizável de resolvedores.
5. **V4.5.5–4.6**: golden tests JS→Rust, AST de ações, Postgres/contas/nível de conta separado, perfil/amigos, draft/lobby, match actors nativos Rust, WS push sem polling, fog autoritativa, reconnect, carga 100/1000/5000 clientes.
6. **V4.7–4.9/V5.x**: VFX, assets low-poly GLB otimizados após gameplay, áudio/camera, parser PT-BR→AST, LLM local Qwen quantizado opcional, certificação de mecânicas por patch.

## Próximos comandos
`npm run test:v452d`; `npm run test:v452c`; `npm test`; `python tools/sync_browser_v43.py`.

## Critério de pronto para cada patch
Regras consultadas/versionadas; testes unitários e integrados; golden fixtures de snapshot/RNG; observabilidade/privacidade; validação no navegador; stress/performance; matriz de conteúdo classificada como `missing/data_only/training/partial/behavior_tested/certified`.
