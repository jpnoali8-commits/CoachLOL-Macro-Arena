# Memória de continuidade — V4.5.2d-4-dev19

## Base única e preservação

Este pacote deriva diretamente de **V4.5.2d-4-dev18**, sem rebase/reset/clean. Motor Node/browser e `app.js` de gameplay não foram alterados pelo marco dev19; 68 exports sincronizados. Preservar masks e SVGs CC0, Golpear D/F, comportamento de objetivos e Elder sub-ticks.

## Verdade sobre cobertura

- 14 campeões no draft. 5 stats/growth auditados e 5 kits **incompletos** (0 completos).
- 41 itens, 9 stats básicos auditados; sem inventário completo de LoL.
- Nidalee, Elise, Shyvana e Mordekaiser estão fora do draft e não possuem kits, formas ou realm implementados.
- Referência externa Data Dragon 16.21.1 não foi baixada nesta execução. O importador existe, funciona com JSON de exemplo e não afeta runtime.

## Novos artefatos essenciais

- `data/coverage_audit_v452d4_dev19.json`
- `docs/AUDITORIA_COBERTURA_V452D4_DEV19.md`
- `tools/riot_reference_v452d4_dev19.mjs`
- `tools/import_riot_reference_v452d4_dev19.mjs`
- `tools/audit_parity_v452d4_dev19.mjs`
- `docs/ARQUITETURA_KITS_FORMAS_REALMS_V452D4_DEV19.md`
- `docs/ROADMAP_V452D4_DEV19_CONTENT.md`
- `tests/v452d4_dev19_parity_reference.test.mjs`
- `tests/v452d4_dev19_long_match.test.mjs`

## Próxima etapa

**dev20**: estabilizar autonomia dos objetivos; o bot joga 40 minutos mas não captura dragão e não encerra Nexus. Depois iniciar série 4.5.3 (catálogo itens por patch) e 4.5.4 (campeões em lotes). Construir máquina de estados de formas e instâncias `realmId` ANTES de Nidalee/Elise/Shyvana/Mordekaiser.

## Comandos

- `npm test`
- `npm run test:v452d4:dev19`
- `npm run test:long:dev19`
- `npm run audit:parity:dev19`
