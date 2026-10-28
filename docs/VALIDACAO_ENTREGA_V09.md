# Validação de entrega — CoachLOL v0.9

Data da conferência: 25/10/2026.

## Bateria do motor

Comando: `node --test tests/core.test.mjs`.

Resultado: **26 verificações do motor aprovadas** (21 cenários herdados da v0.8 mais cinco do contrato temporal). Entre elas: 5 planos simultâneos, rotas persistentes, fog de aliados, visão de minions, paredes, bots determinísticos, waves, dive, timer 10/30, timeout e soft caps/botas.

## Navegador

- `tests/browser_v08.py`: seleção de unidades, edição de rota, persistência ao trocar de campeão, avanço da rodada e nenhum erro JavaScript.
- `tests/browser_v09.py`: contador de tempo efetivo, clique em Confirmar ordens, avanço do turno e ausência de erros de JavaScript.
- As capturas de tela são geradas no próprio pacote: `PREVIEW_v09_JOGO.png` e `PREVIEW_v09_RODADA2.png`.

**Limite de validação:** testes do navegador foram executados usando scripts/CSS/dados inline pela política de bloqueio de `file://` e acesso local do Chromium de automação. Não há teste certificado de abertura do ZIP em todo PC nem validação do WebGL/3D (a v0.9 continua top-down 2D).

## Fontes de referência

- Riot Patch 26.21 publicado em 20/10/2026 (atualização de 22/10/2026): https://www.leagueoflegends.com/en-us/news/game-updates/league-of-legends-patch-26-21-notes/
- Riot Data Dragon 16.21.1: https://developer.riotgames.com/docs/lol
- Movimento e soft caps: https://wiki.leagueoflegends.com/en-us/Movement_speed

## Pendências declaradas

- Mundo/atlas 4096 ainda sem calibração de marcos físicos certificada.
- Habilidades individuais, receitas de itens, buffs e objetivos completos ausentes.
- Regras de bot não representam IA de Elo calibrada.
- Replay salva frames de resolução, mas ainda não snapshots/RNG necessários para validação completa de reprodução.
- Núcleo Rust/WASM e multiplayer não existem nesta entrega.
