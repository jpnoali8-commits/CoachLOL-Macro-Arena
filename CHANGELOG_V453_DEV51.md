# CHANGELOG — CoachLOL V4.5.3-dev51

Base canônica: V4.5.3-dev50 (código e histórico Git preservados).

## Motor e minion block

- `updateMinionBodiesV453Dev51()` atribui coordenadas de corpo `bodyX/bodyY` determinísticas e serializáveis aos minions vivos após movimento na lane. A resolução por células evita sobreposição em formações comuns e rejeita posições sobre terreno bloqueado.
- `minionBodyCollisionV453Dev48` utiliza as coordenadas de corpo autoritativas, inclusive no desvio de campeões com ordens de movimento explícitas.
- `app.js` renderiza esses corpos em vez de recalcular uma formação diferente no cliente.
- Permanecem 3 guerreiros + 3 magos ou 3 guerreiros + canhão + 3 magos. O percurso longitudinal `progress` e os ataques do minion ainda usam a espinha histórica, para não desestabilizar o farm. **Não declarar colisão de pathfinding 100% equivalente ao LoL**; gargalos complexos e prioridades de alvo continuam pendentes.

## Loja Summoner's Rift 26.21

- `Amuleto da Fada` (1004): 200g e 50% de regeneração de mana base.
- `Pérola do Rejuvenescimento` (1006): 300g e 100% de regeneração de vida base.
- `Braçadeira Cristalina` (3801): 800g, +200 de vida e 100% de regeneração de vida base.
- `Capuz do Espectro` (3211): 1250g, +200 de vida, +35 resistência mágica e 100% de regeneração de vida base.
- `Espelho de Bandópolis` (4642): 900g, +20 poder de habilidade, +10 aceleração e 100% de regeneração de mana base.
- Todos têm preços, atributos, receitas e exclusão dos componentes consumidos reconciliados com o Data Dragon 16.21.1 PT_BR integrado. Entradas apenas de outros modos não foram promovidas.
- Regeneração por item calculada por segundo simulado; **base de 1 HP/s e 1 mana/s no CoachLOL é parâmetro aproximado**, não estatística própria exata de cada campeão. Percentuais podem ser atualizados quando o catálogo completo de estatísticas de regeneração estiver certificado.
- Corrigido caso inicial do Anel de Doran: reforço de mana não ativa em `gameTime=0` sem acertar campeão; mantém compatibilidade com o segundo final histórico de duração inclusiva.

## Qualidade

- `npm run test:v453:dev51`: 13/13 PASS.
- `npm test`: PASS, log em `docs/QA_EVIDENCE_V453_DEV51/npm_test_full.log`.
- Duas partidas de teste, seeds 26 e 42, encerradas naturalmente pelo Nexus, sem violações de invariantes.
- `engine.browser.js` regenerado a partir do motor canônico.
- Chromium bloqueou abertura local e localhost (`ERR_BLOCKED_BY_ADMINISTRATOR`), sem validação visual real.
- Catálogo SR conservador: 202 itens gerais; 83 vinculados ao motor, 119 apenas referência. `engine_playable` não garante efeitos avançados de todos os itens.
