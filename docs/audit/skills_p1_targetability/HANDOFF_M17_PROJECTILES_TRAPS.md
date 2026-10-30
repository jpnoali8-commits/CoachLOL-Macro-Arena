# CoachLOL Macro Arena — M17 interações de clones com projéteis, canal e armadilhas

**Status:** marco de Skills em branch isolada; **não integrado**, **não é release**, e **nenhum campeão declarado CERTIFIED**.

## Base, branches e limites
- Base de Skills: `dev69/skills-batch2` no SHA `b7676d57160ddbc2315e258d03f3c94dd5a81189`.
- Continuidade das correções P1 anteriores: `fix/skills-entity-targetability-p1-dev69`.
- Branch `dev69/skills-batch2`, PR #9, `dev69/integration`, `engine.browser.js`, itens e `main` intocados neste marco.
- [GitHub Actions M17 aprovado](https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/actions/runs/40802618110), ambiente Node 22.

## O problema
A engine já possuía uma entidade-alvo comum para habilidades de tabuleiro M9 e DoT, mas:
1. Jhin R selecionava apenas `Arena.units`, ignorando clones que o jogador adversário podia ver.
2. O loop de projéteis caminhava por `Arena.units + minions`, sem clones.
3. A ativação e detonação de armadilhas M16 também ignoravam esses objetos.
4. A Jhin Lotus E podia descartar a explosão já agendada quando o tick chegava depois da janela estreita `explodeAt ... until`.

## Alteração sistêmica, sem copiar os kits
- Jhin R usa o resolvedor universal `boardCombatEnemyPoolV453Dev69` filtrado para alvos elegíveis de disparo. O clone pode absorver um dos quatro tiros, mas não recebe slow/True Sight exclusivo de campeões, nem cria marca indevida.
- O sweep de `advanceChampionProjectilesV453Dev42` usa o mesmo conjunto autoritativo, incluindo clones válidos, para hits físicos de mísseis. Mantém ordem por profundidade, campo `hitIds`, interrupção por barreiras e geometria existente.
- Jinx R pode explodir ao tocar um clone e sua área considera entidades danificáveis.
- Vex R é consumida pelo clone sem criar `vexMark` / acesso a R2, respeitando o modelo de identidade falsa.
- Armadilhas com dano em clone: Teemo mushroom (DoT), Maokai sapling (área), Jhin lotus (agendamento e explosão), Nidalee Bushwhack (DoT). Efeitos de CC e caçada ligados a campeões reais continuam restritos por `v.champ`.
- Caitlyn W e caixa do Shaco conservam as políticas existentes de alvo de campeão; **não foram convertidas indiscriminadamente em armadilhas de clone**.
- `advanceMechanicsV453M16` resolve detonação da Lotus mesmo após um passo de tempo que ultrapasse por pouco `until` quando `explodeAt` já venceu.

## Evidências (ambas equipes)
| Suite | Resultados do CI |
| --- | --- |
| M17 entitidade/timers/Jhin R/Lux Q + 4 tipos de armadilha + negativos | **14/14 PASS** |
| M17 projéteis reais: Nami R, Vex R/Q, Jinx R/W, Ahri E, Ezreal R | **14/14 PASS** |
| Snapshot/restauração e replay das sete famílias de mísseis | **14/14 snapshots e comparação de estado da colisão em execução** (integrado à matriz acima) |
| P1 clones/identity/ownership/fog/AA/targeted strict | **24/24 PASS** |
| M9 board shape matrix, incluindo DoT | **140/140 PASS** |
| M15 clones + Sylas, M16 stealth/traps, M9, formas, Nami/Vex, Lux PvP | PASS nos workflows focais |

Os 14 casos novos dos sete projéteis são *casos integrados*, não 14 campeões novos completos; testam as rotas de execução existentes. O mesmo vale para as suites base.

## Ficheiros que mudaram nesta extensão M17
- `engine.mjs`: receptor único de alvos em Jhin R, 4 famílias de armadilhas, sweep de projéteis, Jinx R, Vex R e janela de detonação Jhin E.
- `tests/audit/v453_entity_projectile_trap_m17.test.mjs`: 14 verificações reais nas equipes.
- `tests/audit/v453_entity_projectile_matrix_m17.test.mjs`: 14 verificações adicionais, chamadas de cast reais e replay determinístico.
- `.github/workflows/skills-entity-targetability-p1.yml`: validadores e regressões mantidos num único workflow de especialidade.

## Próximas prioridades / gates
1. Reconciliar este conjunto no **PR #9 existente** pelo engenheiro de Skills, sem criar PRs concorrentes para a mesma engine. Auditoria de diff e conflitos obrigatória.
2. Testar a mesma matriz com Neeko, Wukong e LeBlanc, não apenas Shaco, incluindo passiva disfarçada, clones letais, expiração e explosão.
3. Auditar os sub-sistemas adicionais que ainda têm pools individuais: retorno Ahri Q/Lux W, Ezreal W, lanças de Nidalee, Jinx E, Vex E, Irelia, mundo do Mordekaiser, efeitos de zona e invocações alternativas. Cada um requer contratos por classe de entidade, sem alargar indiscriminadamente CC ou targets de wards.
4. Cobrir o catálogo de skills P+QWER e os **509 slots em `training`**, por marcos de 25–40 campeões completos conforme os contratos forem maduros. Continuar a evitar `certified` falso.
5. Integrador valida `engine.browser.js` recompilado, `npm test` global, Chromium 2 sessões, Undo/fog/reconexão/Smite/replay antes de qualquer release.
