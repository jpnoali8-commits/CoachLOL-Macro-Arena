# QA — CoachLOL V4.5.3-dev33 (2026-10-27)

## Status
- `npm test` integral: **PASS, exit 0**, log `docs/QA_EVIDENCE_V453_DEV33/npm_test_full_patchcenter.log`.
- 9/9 contratos de itens dev33: **PASS**.
- 7/7 contratos da Central de Patches: **PASS**.
- Auditoria loja: **67 itens**, 0 ingredientes ausentes, 0 ciclos, cobertura oficial integral **NÃO CERTIFICADA**.
- Chromium dev33: **PASS** de compra de componentes de Na'Shor na loja real com 15 SVGs e atlas, sem erros JS. `docs/QA_EVIDENCE_V453_DEV33/chromium_dev33_report.json` + PNG. Cenário controlado, NÃO é partida completa.
- Simulação seed 26 original nesta execução: Nexus destruído naturalmente aos 1550s = **25min50s**, vencedor vermelho, nenhum erro de invariante; relatório `docs/QA_EVIDENCE_V453_DEV33/pacing_patchcenter_seed26.json`. Não representa nova média. Amostra anterior da dev33, 5/5 vencedores e média 25:17, preservada em `pacing_5matches.json`.
- Patch 26.21 fixado, 26.22 futuro, nenhum efeito novo aplicado sem revisão.

## Contratos da Central de Patches
1. Interpretação correta 16.21.1→26.21 e 16.22.1→26.22.
2. Input parcial / versão inválida bloqueados; detalhes de outro patch bloqueados.
3. Diff detecta ouro, receitas, atributos, evolução e cooldown de Q.
4. Texto de passiva altera hash sem ser transformado em código de combate.
5. Comparação entre idiomas diferentes bloqueada.
6. `stage`/`diff` em fixture geram artefatos, recusam overwrite e preservam `engine.mjs` byte a byte.
7. Detecção de patch novo é comando pontual; nenhuma ativação automática.

## Pendências de certificação
- Download real de Data Dragon `item.json` + `champion.json` 16.21.1 e detalhes dos campeões bloqueado pela rede; testes da importação realizados com amostras sintéticas rotuladas.
- Patch notes e hotfixes podem alterar habilidades e passivas sem dados numéricos no Data Dragon; revisão manual permanece obrigatória.
- Catálogo e kits incompletos: 67 itens locais não correspondem a loja 1:1; 0 kits completos certificados historicamente.
- Duração média original perto de 30 min **não certificada nesta versão**: amostra prévia 25:17; nenhuma manipulação de HP ou encerramento por relógio.
