# Matriz de interacoes — SHA `b7676d57160ddbc2315e258d03f3c94dd5a81189`

**Legenda:** E = codigo e teste focal de familia localizados, nao certificacao; S = somente inspecao de fonte ou documentacao; N = nao executado nesta auditoria. Todos os testes novos locais **NOT_RUN**. Evita inventar falhas sem reproduzir.

| Sistema A | Sistema B | Evidencia encontrada | Status | Gate que falta |
| --- | --- | --- | --- | --- |
| Camuflagem (Twitch/Rengar/Akshan/Pyke/Viego) | Detecao por proximidade e fog | M16 testa ambos lados e snapshots | E | wards de controle, Oracle, paredes, trackers em PvP completo |
| Invisibilidade (Shaco/Kha'Zix/Akali/Talon/Wukong) | Ataque/skill, quebra e reentrada | M16 e `m16BreakStealth` | E | cenarios de dano simultaneo e reacesso de alvo |
| Teemo P | Idle, brush, ataque | M16 teste direto | E | interrupcoes e torre em jogo inteiro |
| Evelynn P | Nivel 6, proximidade | M16 teste direto | E | morte, recuperacao e verdadeiro reveal |
| Kai'Sa E | evolucao e 0,5s de invisibilidade | M16 verifica condicao de evolucao | E | fonte de evolucao por atributos/equipamentos |
| Senna E | camuflagem de aliados | M16 teste de equipe | E | identidade fake, proximidade sob pressao |
| LeBlanc/Wukong | clone e alias publico | M16 + kernel M15 | E | projeteis, AoE, targetability e pet vs fake |
| Neeko Sho'Ma | disfarce de minion/ward/pet | M15 e perspectiva redactada | E | plantas/armadilhas e regras exatas de reveal |
| Shaco R | clone, recast, 3 caixas | M15 teste dedicado | E | ataques, on-hit, area, torres e Realm |
| Sylas R roubada | Shaco R | M15 documenta via clone factory | E | trocas consecutivas de alvo e outros ults especiais |
| Sylas Hijack | Mordekaiser R, Jhin R, transformacao | M14 testes especificos localizados | S | matrix do ultimo slot roubado, estado e cooldown |
| Mordekaiser R | clones/pets/traps e mapa elemental | `realmContextV453Dev69`, suites M14 | S | visao/targetability do Realm e persistentes em ambos mundos |
| Nidalee / Elise / Shyvana | mudanca de forma e QWER | 24 variantes M14, suite forms | E | todos `missing`, pet AI, colisoes e forma desfeita |
| Nidalee W / Caitlyn W / Teemo R | placement, stock, arm, trigger | M16 testa traps e persistencia | E | maximos, morte do owner, dano AoE, Oracle |
| Jhin P/R/E | quatro tiros, reload, canal, Lotus | M16 testa P/R/E parcialmente | E | R em alvo movel/invisivel, interrompido, Q/W faltantes |
| Vayne / Twitch / Darius | stacks independentes por alvo e dono | implementacoes e testes de familia | S | expiracao, cleanse, on-hit item, duplo tick |
| Yasuo/Samira | projeteis | nao foi comprovada matriz completa | N | bloqueio por origem/direcao e reacoes |
| Morgana Black Shield | CC, spell-shield, multi-hit | M9 test board + EffectResolver | E | comportamento correto de dano magic shield e habilidade multifase |
| Fog / ownership | ID real vs apelido visivel | gateway `submit`, M15/M16 testes | E | reconexao, duplicacao de sequencia e eventos em adversario |
| PvP simultaneo | canais/recasts e reacoes | dispatcher e `resolveCombat` | S | testar disputa cross-champion e assassinato no mesmo turno |
| CC/grounded | dash, blink, R canalizada | paths temporais M1-M16 | S | 2 sessoes, 2 times, ordem de precedencia e morte |
| Items/runas | proc onhit e QWER | loja separada no PR Items | N | QA apos integracao autorizada |

**P0 confirmados por reproducao:** nenhum novo P0 foi demonstrado nesta rodada de inspecao. **P0 candidatos a testar**, nao bugs declarados: vazamento de real-ID em alvo disfarçado; duplo debito em recast/reconnect; projeteis com hits duplicados; efeitos em Realm fora da particao.

Fontes: [motor](https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/blob/b7676d57160ddbc2315e258d03f3c94dd5a81189/engine.mjs#L1113), [gateway](https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/blob/b7676d57160ddbc2315e258d03f3c94dd5a81189/multiplayer/authoritative_actions_v453_dev44.mjs), [QA M16](https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/blob/b7676d57160ddbc2315e258d03f3c94dd5a81189/tests/v453_dev69_mechanics_m16.test.mjs), [QA M15](https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/blob/b7676d57160ddbc2315e258d03f3c94dd5a81189/tests/v453_dev69_clones_m15.test.mjs).
