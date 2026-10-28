# CoachLOL Macro Arena v2.0 — Gate A: estabilidade de jungle e 40 minutos

**25/10/2026 · protótipo alfa offline · 55 contratos automatizados (10 novos)**

## Alterações implementadas

1. `CAMP_RULES_2026`: cronologia de primeira aparição e respawn para **Summoner's Rift padrão**, não Swiftplay. Red/Blue/Wolves/Raptors 00:55, Krugs/Gromp 01:07, Scuttle 02:55, Dragão 05:00, Barão 20:00; respawns configurados em segundos conforme cada tipo. As mecânicas da temporada 2026 foram verificadas contra o patch oficial 26.1; os tempos de respawn não podem ser copiados de notas exclusivas do Swiftplay.
2. `spawnCamp`: grupos de monstros têm **HP máximo por tipo** e HP escalado pelo nível médio das dez unidades **no momento do spawn**. O motor mantém esse nível/HP congelados enquanto o monstro está vivo. **Números de HP/dano de grupos são valores de balanceamento do CoachLOL, não cópias exatas de estatísticas da Riot.**
3. `advanceCampLeash`: a IA dos monstros adquire alvo, mantém paciência 0–100, perde paciência quando abandonada ou fora do alcance, entra em **soft reset** (até 6 segundos, regen 6%/s) e **hard reset** (retorno ao máximo). Ataques dentro do leash podem recuperar o soft reset; durante hard reset não podem finalizá-lo artificialmente.
4. `monsterRetaliate`: cada acampamento aplica seus próprios ataques periódicos contra um alvo presente em alcance. Gromp, buffs, grupos pequenos e objetivos têm perfis diferentes. **Ainda não há animação/chase do monstro individual nem subunidades de Krugs/Raptors**; cada acampamento continua sendo um grupo de HP único na simulação.
5. **Fog**: a projeção de informação ao time exibe um placeholder neutro de local conhecido, mas não expõe vivo/morto, HP, paciência ou respawn de acampamento oculto. A interface mostra `?` nos pontos sem visão, sem confundir estado desconhecido com monstro morto.
6. **Confronto no último segundo**: `answerDecision()` finaliza automaticamente a rodada se a execução já alcançou zero segundos. Corrige travamento `phase=decision, remaining=0`.
7. **Bot jungler**: um plano criado pelo bot não vira uma ordem irremovível do jogador. Depois de limpar o campo, o bot pode escolher outro acampamento, sem ficar aguardando o respawn do mesmo monstro. **As rotas explícitas dos jogadores continuam persistentes** entre rodadas.
8. `validateInvariants()`: verificação no motor de HP, XP, ouro, CS, níveis, estado da jungle, reservas de Smite, integridade básica de plano e resultado. `tests/v20_long_match.mjs` gera relatório e hash de estado reproduzível por semente.

## Resultados de teste

- **55 contratos**: `npm test` (45 anteriores + 10 novos), todos aprovados.
- **Cenário 40 minutos / seed 26**: 240 turnos, 154 decisões táticas, 96 waves, 3 estruturas destruídas, 0 erros de invariante; junglers 220/225 CS, ambos nível 16.
- **Cenário 40 minutos / seed 101**: 240 turnos, 171 decisões, 96 waves, 2 estruturas destruídas, 0 erros de invariante; junglers 220/219 CS, ambos nível 16.
- **Repetibilidade**: rodar 2400 segundos novamente com seed 26 produziu o mesmo hash final de estado.
- **Chromium (UI)**: política de Golpear, campo JG/ADC, prévia, aplicação e confirmação de turno sem erro de JavaScript nos cenários amostrados.
- Relatórios JSON em `docs/reports/` e a suíte específica em `tests/v20_camp_rules.test.mjs`.

## Ainda não pronto

- Os jogos simulados com bots **não encerraram automaticamente aos 40 minutos**; a IA de cerco/push, as condições reais de vitória em partida completa e as transições tardias ainda precisam de auditoria. Portanto, a conclusão de 40 minutos significa estabilidade de simulação, **não certificação da conclusão de uma partida**.
- Não há kits completos QWER individuais, sistemas de itens/feitiços por patch, múltiplas entidades/ataques de cada acampamento, herald/grubs plenamente integrados, visão online segura, multiplayer autoritativo, matchmaking, MMR, PDL, ranks ou testes de balanceamento estatístico.
- `BIBLIA_COACHLOL.pdf` é uma exportação histórica. A revisão vigente para esta etapa é o adendo `docs/ADENDO_V20_ESTABILIDADE_JUNGLE.md`, o HTML e o presente CHANGELOG. A saída em PDF não foi regenerada.

## Fontes oficiais e técnicas

- Riot Games — [Notas da atualização 26.1 (PT-BR)](https://www.leagueoflegends.com/pt-br/news/game-updates/patch-26-1-notes/) para os horários iniciais, Barão 20 minutos e diferenciação de Swiftplay.
- Riot Games — [Notas 12.22](https://www.leagueoflegends.com/en-us/news/game-updates/patch-12-22-notes/) para o mecanismo de leash, soft reset (6s) e indicadores de paciência.
- [League of Legends Wiki — Monsters](https://wiki.leagueoflegends.com/en-us/Monster) para o modelo de níveis por spawn e estados de paciência (referência comunitária, sujeita a revisão por patch).
