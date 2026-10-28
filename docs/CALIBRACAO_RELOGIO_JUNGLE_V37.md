# V3.7 — Relógio único e calibração experimental da jungle

## Referência temporal — Summoner’s Rift 2026
- **00:30**: primeira wave de minions nasce (Patch 26.1).
- **00:55**: rubrivira/red, azuporã/blue, lobos e acuâminas.
- **01:07**: krugs e gromp.
- **02:55**: aronguejo.
- **05:00**: Dragão (mode padrão); **20:00**: Barão.
- Uma rodada resolve `roundSeconds` de jogo **somente após planejamento e confirmação**; planejamento de 60s é relógio de parede, não avança a partida.
- Wards, buffs, cooldowns, spawn e campos compartilham `arena.gameTime` em segundos simulados.

## Balanço por amostra controlada (Warwick)
Método: 6 campos sequenciais blue-side; pet verde, Q inicial, mana e sobrevivência controladas para isolar o DPS, dano por tick e duração; **não é replay de uma partida, nem simula decisões de um jogador real**. O tempo de deslocamento foi estimado por distância retilínea / MS, ou seja, **não inclui desvios reais de pathfinding**.

| Campo | Tempo de luta (s) |
|---|---:|
| Red | 18 |
| Krugs | 16 |
| Acuâminas | 19 |
| Lobos | 18 |
| Blue | 20 |
| Gromp | 17 |
| **Total** | **108** |

Deslocamento mínimo estimado: **32 s**. Último camp em **2:43** sem deslocamento; estimativa com percurso **3:15**. Fontes públicas de clears reais de Warwick 2026 variam aproximadamente **3:11–3:25**, dependendo do método. Este benchmark **não valida** combate real com minions, fog, rota A* ou risco de invasão. Pronto para calibração de motor; falta A/B real entre campeões, level, leash, pets, builds e habilidades.

## Variáveis ajustadas
- `CAMP_DAMAGE_BALANCE.clusteredMonsterMultiplier`: 0,77 (representa múltiplos monstros no HP agregado).
- `CAMP_DAMAGE_BALANCE.soloMonsterMultiplier`: 0,93.
- `CAMP_DAMAGE_BALANCE.petBonusDpsMultiplier`: 0,82.
- Smite continua como dano verdadeiro 600/1000/1400, sem redução.

## Referências
- Riot Patch 26.1: https://www.leagueoflegends.com/pt-br/news/game-updates/patch-26-1-notes/
- LoL Recommender (2026): https://www.lolrecommender.com/jungle-clear-times/
- KO.LOL 16.21: https://ko.lol/data/clear-time/
