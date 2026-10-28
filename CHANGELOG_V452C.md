# CoachLOL V4.5.2c — farm real com telemetria

**Status:** `PASS_BOUNDED_LOCAL` · 26/10/2026

- Corrigido dano de ataque básico: `u.ad` já contém o crescimento de nível e não deve receber uma segunda escala redutora.
- Last hit automatizado calcula dano efetivo com a mesma função usada no ataque confirmado. Alvo só é escolhido como last hit quando o ataque real pode causar a morte.
- Ajustado o avanço de farm melee e incluído recuo para torre aliada após dano recente em HP crítico.
- `freeze` agora ancora a wave no primeiro choque local, mantém minions na faixa de freeze e continua farmando com AA apenas em last hit. A eficiência do cenário seed36 é parcial: TOP/MID/ADC 16/22/46 CS e uma morte no TOP. `slow_push` também usa AA só em last hit; `fast_push` preserva ataques não letais para limpar a wave.
- Diferenciadas as prioridades de alvo de `push` e `fast_push`; fast push prioriza caster/minion de cerco (canhão). A limpeza automática testada continua limitada a Nami Q e Lux E, respeitando alcance, mana e cooldown.
- Intervalo de AA registrado como proxy por classe num tick de 1 s; windup e tempo de voo não são simulados por campeão. QA não declara fidelidade 1:1.
- Telemetria por morte de minion adiciona atacante/causa, dano, health antes do golpe, rota, wave, distância/range, disponibilidade de AA e dano aliado iminente. Eventos limitados a 512, serializados no snapshot e mantidos fora da perspectiva inimiga.
- Novo `test:v452c` verifica três lineups/seeds, CS/gold reais, mortes, invariantes, telemetria, snapshot, fog e ADC fora da rota. `npm test` inclui os contratos V4.5.2, V4.5.2b e V4.5.2c.
- ADR-001 aceita migração Rust incremental por contrato, preservando `engine.mjs` como core ativo até golden tests e promoção explícita de autoridade.

**QA:** consulte `docs/QA_SUMMARY_V452C.md` para métricas e hashes. QA visual e performance seguem `NOT_RUN`; nenhum dado de kit, item ou runa recebe certificação 1:1 nesta versão.
