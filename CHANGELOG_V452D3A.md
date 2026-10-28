# CoachLOL Macro Arena — V4.5.2d-3A (26/10/2026)

Base exata: ZIP do handoff V4.5.2d-dev2, SHA-256 `827c8fac99dfc62e9da10bf3e6ea1ff53ef177eb98af1850b4d3c40180ecb511`.
Este é o **primeiro incremento funcional V4.5.2d-3 (d3-A)**, e **não** a conclusão de d3-B/C/D nem a certificação 1:1 do LoL.

## Implementado

- Constante versionada `ELEMENTAL_DRAKE_RULES_V452D3`, registro de aquisição `dragonCaptureLedgerV452d3` e função pura `elementalDragonStatsV452d3()`.
- Ao derrotar cada dragão elemental, concede UM stack ao time vencedor. Capturas repetidas do mesmo `camp id + spawnCycle` são bloqueadas. Ledger inclui time, tipo, número do stack, ID da captura, autor, patch, modo e tempo simulado. A Soul aos 4 dragões é independente e preserva efeitos legados.
- **Infernal** 3% AD e AP por stack. Refatorados ataque básico e escala de AP/dano derivado; removidos multiplicadores brutos antigos de 4% e 3% para impedir contagem dupla.
- **Montanha** 5% armor/MR por stack. Recalculado na resistência efetiva ao dano; removida antiga redução plana de 3,5%, que se sobrepunha ao multiplicador de resistência. Não concede resistências a minions.
- **Oceânico** 2% de vida ausente recuperada por stack a cada 5 segundos simulados; retém clamp de HP e regra de simTime.
- **Nuvens** 5% de bônus de velocidade fora de combate e 5% slow resist por stack; cálculo nos dois caminhos de movimentação.
- **Hextech** 5 de ability haste e 5% attack speed por stack. AH recalculado ao conjurar, sem encurtar cooldown por velocidade visual 2×. O campo legado `atkSpeed` é um proxy de intervalo, não AS real de LoL: `interval/(1+stacks*.05)` respeita limite 0.55s. Fórmula definitiva fica para V4.5.2e.
- **Quimtec** 6% tenacidade e 6% heal/shield power por stack. CC elegível, cura e escudos tipados no EffectResolver; knockup/suppression não sofrem redução da tenacidade. Nami W deixa de aplicar multiplicador de cura redundante.
- Todos os bônus são derivados dos arrays canônicos `teams[team].dragons`: mudança de nível, compra, venda, morte/respawn e snapshot não acumulam bônus nos atributos brutos do personagem.
- Sincronizado `engine.browser.js` (60 exports), preservados os demais arquivos do jogo e dados do ZIP de origem. Adicionados 10 contratos específicos, script `npm run test:v452d3` e sua inclusão em `npm test`.

## Não implementado / lacunas de fidelidade

- **d3-B**: escala por nível de AD/AP do Barão por campeão, elegibilidade em todos os estados, movimento/aggro de melee/caster/siege/super e efeitos 1:1 da aura. Buffs herdados de dev1/dev2 permanecem.
- **d3-C**: Elder subsegundo/limiar refinado, 5v5 simultâneo com Smite e desempate por ação, fog de eventos e recompensas em competição. Efeitos herdados permanecem experimentais.
- **d3-D**: observabilidade com golden replay interpatch, payloads privados para PvP, profiler de 5v5/carga e auditoria da HUD. O frontend ainda pode exibir os stats-base quando deveria mostrar stats efetivos.
- A fonte wiki reflete os bônus pesquisados em 26/10/2026; Riot 26.21 não publicou nesse patch coeficientes novos específicos de dragões. Isso NÃO prova verificação 1:1 de todos os efeitos em Summoner's Rift; usar classificação `tested_training_partial`.

## Fontes pesquisadas

- Riot, Patch 26.21 (20/10/2026): https://www.leagueoflegends.com/en-us/news/game-updates/league-of-legends-patch-26-21-notes/
- Community League Wiki, Dragon Slayer buffs, conferida em 26/10/2026: https://wiki.leagueoflegends.com/en-us/Hextech_Dragon_Soul

## Compatibilidade / integridade

- JS continua autoridade offline; Rust, WebAssembly e WebSocket permanecem propostas futuras sob contratos/fixtures.
- O repositório extraído chegou com dezenas de caminhos alterados/não rastreados. Não foi utilizado `git reset`, `git clean` nem feito commit que incorporasse alterações locais herdadas por acidente.
- QA completo: `docs/QA_V452D3A_ELEMENTAL_PASSIVES.md`.
