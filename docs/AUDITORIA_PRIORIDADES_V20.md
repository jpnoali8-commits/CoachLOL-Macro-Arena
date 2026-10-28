# Auditoria de prioridades após v2.0

| Prioridade | Estado v2.0 | Próximo critério de aceitação |
|---|---|---|
| P0 — Cerco / vitória | Estruturas têm bloqueio correto; bots não fecharam partidas de 40 minutos | Bot-vs-bot e player-vs-bot chegam a Nexus legalmente destruído, sem bypass e sem travar |
| P0 — Jungle | Spawns e resets por perfil, HP por nível, Smite tático; ainda grupo agregado | Monstros individuais, leash e path/chase, escalonamento fiel e casos de roubo/aggro simultâneo |
| P0 — Tempo & decisões | 10s execução após confirmação, pausas e correção do último segundo | Revisar cenários de decisão consecutiva, reconexão e replay parcial |
| P0 — Visão | Fog retira status dos campos desconhecidos na perspectiva do time | Serviço de visão no servidor com ocultação de ordens/cooldowns inimigos |
| P1 — Campeões / combate | QWER genéricos com ranks, AA/kite e ranges abstratos | Kits 5v5 individuais completos, passivas, on-hit, CC, casts e golden tests |
| P1 — Economia | Pet/Smite/Atlas e starters funcionais no protótipo | Catálogo versionado, receitas/ativos, builds persistentes e matchups |
| P1 — UX | HUD + texto e scoreboard; muitos controles ainda densos | Painel compacto de plano ativo, telemetria de falha de rota, tutorial de turnos |
| P2 — Conta/rank | Não existe backend nem dados confiáveis de partida | Auth, servidor autoritativo, matchmaking, MMR/PDL e temporadas depois de partidas end-to-end |

## Gatilhos de reprovação

- Campeão fora do tabuleiro, HP/nível/CS/ouro não finito; Smite excede 2 cargas.
- Campo fora de visão revela status privado do inimigo.
- JG perde a ordem por uma wave ou bot fica preso sem alterar rota após concluir um acampamento.
- Uma decisão congela o mundo sem conseguir retomar, especialmente no último segundo.
- Nexus danificado enquanto protegido, ou vitória sem respeitar torres/inibidor/guardas.
- Experimento de longo prazo não termina: **não declarar que o modo competitivo está pronto.**

**Resultados v2.0:** `npm test`: 55 contratos. `docs/reports/V20_40MIN_SEED26.json` e `V20_40MIN_SEED101.json`: dois cenários 40min sem erros registrados, hashes repetíveis e sem vitória. Estes resultados não são testes de paridade estatística entre equipes ou matchups.
