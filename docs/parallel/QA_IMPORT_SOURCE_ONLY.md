# QA da importação textual da dev68 — 2026-10-28

## Evidência de origem

- ZIP mestre original: `CoachLOL_MacroArena_V453_Dev68_Lux_Q_Projetil_2_Alvos_PvP_JogoCompleto.zip`
- SHA-256 mestre: `019e09b6dc302c063d715be0b583897cbbc90791422a91ec2172682fa12d26be`
- 2.549 entradas; 566 arquivos internos do Git, preservados no ZIP original, **não** migrados ao GitHub.
- Snapshot textual importado para GitHub: **1.624 arquivos** JS/MJS/JSON/HTML/CSS/MD/TXT/CSV/PY/BAT/YML/SVG.
- Fonte leve disponível na Biblioteca: `/CoachLOL/Dev69/CoachLOL_Dev68_Fonte_Textual_Para_3_Chats.zip`, 5.443.580 bytes, SHA256 `561563dbc3984b2188275a48da3ada1bfaa228556331e2b60e410ea705e4be8c`.

## Inspeção remoto/origem

`engine.mjs`, `engine.browser.js`, `app.js`, `version.json`, `package.json` e `tests/v453_dev68_lux_projectile_pvp.test.mjs` foram recuperados da branch de importação e comparados diretamente ao conteúdo textual de origem, sem divergências.

## Testes numa cópia isolada composta apenas de fonte textual

| Comando | Resultado |
|---|---|
| `npm run test:v453:dev61` | PASS, 22/22 |
| `npm run test:v453:dev62` | PASS, 18/18 |
| `npm run test:v453:dev64` | PASS, 26/26 |
| `npm run test:v453:dev65` | PASS, 28/28 |
| `npm run test:v453:dev66` | PASS, saída 0 (ambas suítes) |
| `npm run test:v453:dev67` | PASS, 48/48 |
| `npm run test:v453:dev68` | PASS, 40/40 |
| `npm test` integral | NOT_RUN nesta base textual |
| Chromium real, visuais, assets e HTTP/SSE nativo | NOT_RUN nesta importação |
| ZIP mestre completo construído do clone GitHub | NOT_RUN — falta conteúdo binário |

Os PASS são de execução isolada local após reconstrução textual; não são execução de GitHub Actions nem jogo humano real.

## Restrições

A base é `SOURCE_READY` para codificar e certificar lógica dos módulos mencionados. NÃO é `RELEASE_READY`: o repositório ainda não contém todas as 2.549 entradas do ZIP mestre, o Git antigo não foi migrado e os assets visuais não foram validados. O Issue #1 permanece aberto. Não substituir artefatos faltantes por placeholders.

## Próximos passos

Liberar branches de especialistas a partir desse snapshot, avançar por pequenos PRs e integrar um por vez; transferir/comparar assets para o release, registrar política de histórico Git e executar a regressão integral do clone completo antes de promover `main`.
