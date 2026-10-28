# Continuidade — dev58

Base de trabalho: CoachLOL V4.5.3-dev58 (ZIP mestre). Não aplicar reset/rebase/commit ou sobrescrever assets, histórico Git ou máscaras. Patch fixado LoL PC 26.21, DDragon 16.21.1, SR normal. IA estratégica permanece adiada.

`npm test` inclui 17 testes dev58; `node tools/audit_pvp_minions_v453_dev58.mjs 900` reproduz duas equipes PvP controladas em HOLD, 39 amostras por seed após 300s, 30 waves por seed. Não confundir com teste de 5v5 humano/rede: torres e last hit de campeão não são exercitados nele.

Glória: Dark Seal 1082, Mejai 3041; 10/25 stacks, 4/5 AP por stack, perda 5/10 ao morrer, bônus +10% MS do Mejai após 10. Os valores de stack gain por kill/assist são adapter e precisam ser certificados externamente. Regressão com Rabadon, compras, upgrade e snapshot.

Limitação preexistente: `tests/v20_long_match.mjs 2400 26` atinge guard de 1000 decisões. Harness estendido, aplicado **sem alterações tanto na dev57 como na dev58**, não obtém vitória Nexus até 2400s, com CS MID baixo em ambos. Não afirmar que regressão de partidas longas passou ou que duração anterior foi reproduzida por esse harness. Manter prioridade de investigação na dev59.
