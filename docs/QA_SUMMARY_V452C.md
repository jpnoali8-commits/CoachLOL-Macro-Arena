# QA V4.5.2c — farm real e migração Rust

**Executado:** 26/10/2026 · **Estado do milestone:** `PASS_BOUNDED_LOCAL` · **Release global:** não aceita.

## Base verificada

- ZIP V4.5.2 de origem: `CoachLOL_MacroArena_v452_Buffs_Draft_Ghost_FarmAuditoria_Offline.zip`, SHA-256 `E6FE3ED7A2C243BA80E308597BA26C004038C1B538A357DF3793D1B999B80454`.
- Handoff V4.5.2b-H1: SHA-256 `EDCC0D77FB2DFD9D56A9C76C1C5E1B3D0B947685E74D784FFEA25280E02B7629`; conferência de 474 arquivos: 0 ausentes, 0 diferentes e 0 extras (fora `.serena`).
- Baseline local commit: `b68637f` (`baseline: CoachLOL V4.5.2b-H1`); milestone na branch `milestone/v452c-farm-real-last-hit`.

## Escopo e resultado

O benchmark determinístico normal roda 300 segundos simulados por cenário, com campeões inimigos derrotados e waves ativas. O limite histórico de **35–62 CS por TOP/MID/ADC** foi mantido sem alteração. Nenhum crédito por proximidade foi adicionado: CS e ouro só são concedidos quando o ataque do campeão reduz HP do minion a zero.

| Seed | Lineup (TOP / MID / ADC) | TOP | MID | ADC | Mortes / invariantes |
|---|---|---:|---:|---:|---|
| 36 | Volibear / Ahri / Jinx | 43 | 35 | 41 | 0 / 0 |
| 451 | Darius / Vex / Caitlyn | 47 | 35 | 46 | 0 / 0 |
| 452 | Warwick / Lux / Vayne | 44 | 35 | 46 | 0 / 0 |

O cenário de roaming com ADC fora da rota terminou em **0 CS** e registrou 46 mortes de minions por aliados/torre com motivo `out_of_range`.

### Estratégias de wave (seed 36, 300 s)

| Estratégia | TOP | MID | ADC | AA não letais do campeão | Resultado local |
|---|---:|---:|---:|---:|---|
| `freeze` | 16 CS | 22 CS | 46 CS | 0 | Âncora no primeiro clash local; faixa da wave respeitada; last hits reais registrados perto da âncora. TOP teve 1 morte por minions. |
| `slow_push` | 43 CS | 35 CS | 41 CS | 0 | Só dá last hit; prioriza caster quando há mais de um alvo elegível. |
| `fast_push` | 16 CS | 10 CS | 27 CS | 268 de 321 AA | Pressiona wave com ataques não letais; sem equivalência de farm com o benchmark normal. |

O freeze continua farmando CS: o campeão só dá dano de AA quando o golpe básico pode matar o minion, enquanto a wave é mantida numa faixa local. O resultado do freeze é **parcial** em eficiência: esse cenário único produziu 16/22/46 CS e uma morte no TOP; não herda o limite de 35–62 do benchmark normal. A telemetria de last hit e as verificações de faixa confirmam o comportamento da wave, não uma simulação 1:1 de aggro dos minions.

Fast push é uma estratégia distinta de push/slow push: na seleção de alvo, prioriza caster e minion de cerco (canhão); a limpeza automática continua restrita a habilidades com kit conhecido. Nami Q e Lux E garantiram 3 CS cada nos testes legais de alcance, mana e cooldown.

## Alterações cobertas

- O AD do campeão já inclui crescimento por nível; removida a segunda redução de dano básico em nível baixo, que tornava os last hits reais inviáveis.
- A seleção de alvo e o ataque básico executado agora compartilham a fórmula de dano, armadura, penetração, Barão, Infernal, Exhaust e estilo on-hit. A previsão não concede CS nem altera HP.
- A margem de avanço para campeões melee em auto-farm permite que alcancem a wave. Quando um campeão sem ordem explícita está em HP crítico após dano recente, ele procura a torre aliada da rota para recuar.
- Telemetria interna registra eventos por minion (tempo, wave, rota, tipo, HP/dano removido, autor e causa da morte, farmer, alcance, AA/cooldown, caminho, ataques aliados iminentes). O histórico mantém no máximo 512 eventos, sobrevive a snapshot e não aparece em `perspective()` do adversário.
- Os asserts verificam CS = contador `secured` = eventos de last hit = registros de ouro. O killer, motivo e dano de cada evento conferem com a morte real. Um contrato isolado em nível 1 compara previsão e HP removido; outro força 513 registros e verifica o limite 512.
- ADR-001 documenta migração Rust por contrato/golden tests; não foi adicionada implementação Rust e `engine.mjs` segue ativo.
- O intervalo de AA permanece uma aproximação por classe, executada em tick de 1 s; windup e tempo de viagem de projétil continuam `null`/não simulados. Por isso a matriz de estratégias é evidência bounded, não calibração de attack speed por campeão.

## Evidência executada

- `python tools/sync_browser_v43.py` com UTF-8 do Python: **PASS**, 57 exports sincronizados.
- `node --check engine.mjs`: **PASS**.
- `node --check engine.browser.js`: **PASS**.
- `npm test`: **PASS** (exit 0), incluindo regressões V38/V38.1, V4.5.1, V4.5.2, V4.5.2b e V4.5.2c.
- `npm run test:v452c`: **PASS** em três seeds/lineups normais, matriz de `freeze`/`slow_push`/`fast_push`, prioridade de alvo, limpeza legal de wave Nami/Lux, previsão vs dano executado, limite/snapshot/fog da telemetria, invariantes e roaming.
- Matriz de wave: freeze TOP/MID/ADC 16/22/46 CS, 0/84 AA não letais e 1 morte no TOP; slow push 43/35/41 CS e 0/119 AA não letais; fast push 16/10/27 CS e 268/321 AA não letais.
- `node --check engine.mjs` e `node --check engine.browser.js`: **PASS**.
- Ambiente: Windows, Node v22.16.0, npm 10.9.2.

## SHA-256 do recibo

```text
0FA4648E36D7B2D066BAAECFD7E95A02360F6AD170A28F3D1FBEA6F4C04920FF  engine.mjs
C0D9D342D212B43C1667CA74CB376E51E3222E77D08F1C77A4E91095AAF6CA0E  engine.browser.js
82EE7B540735C01191EFD0C52D1629AA41520B100E527F7167A7C36AFE400E8A  tests/v452c_farm_ai.test.mjs
48AC9A43940D6CB4C9347EB838337DEA0216A488863E94DDD75B3AAFD9BC5F03  package.json
2E9A94C720819887196E235B4F8A7183CA3DB7761100705BA7D797CD608A8374  version.json
```

## Limites

Evidência local e bounded aos três lineups/seeds normais e a uma matriz de estratégias no seed 36. QA visual em navegador e perfil de performance: `NOT_RUN`. As constantes de movimentação das waves continuam abstrações de treino; a calibração de velocidade/aggro por patch segue pendente. A Riot documenta o ajuste da velocidade base de minions para 350 no [Patch 26.1](https://www.leagueoflegends.com/en-us/news/game-updates/patch-26-1-notes/); esse valor não é declarado como implementado neste milestone. Isso não certifica todas as composições, balanceamento universal, kits/items/runas 1:1, PvP, servidor ou release. O próximo marco funcional listado no roadmap é V4.5.2d (objetivos).
