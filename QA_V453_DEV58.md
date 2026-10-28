# QA — CoachLOL Macro Arena V4.5.3-dev58

## Origem
- Base canônica **dev57**, preservada sem reset/rebase/commit Git.
- Escopo **LoL PC Summoner's Rift 26.21 / Riot Data Dragon 16.21.1**, não ARAM/TFT; lista filtrada por catálogo dev49.
- Não foi implementada melhoria estratégica de bots; a formação nova só entra em `mode:'pvp'` após 300s.

## Mudanças verificadas
1. **Foco PvP físico**: minion prefere alvo de combate já válido; se não há foco de combate, mantém alvo físico vivo e próximo; limpa alvo morto, de outra lane ou ausente. Após resolver cada frame de combate, alinha a referência física ao foco sobrevivente e remove referências mortas. Não mexe em ouro/HP/range/dano do last hit.
2. **Inspeção não-mutável de formação**: `pvpMinionEngagementAuditV453Dev58()` retorna divergências de foco, alvo inválido, congestionamento e interpenetração de corpos para QA.
3. **Lacre Sombrio** (1082, 350 ouro, +15 AP/+50 HP) e **Ladrão de Almas de Mejai** (3041, 1500 ouro, +20 AP/+100 HP, receita Lacre) agora possuem Glória autoritativa, transferência na evolução, AP dinâmico, +10% MS no Mejai com >=10 acúmulos, perda por morte, ganho em kill/assist, venda e snapshots; preservada interação com Rabadon.
4. **Escopo dos números**: os limites de Glória (10/25), AP por carga (4/5), perda ao morrer (5/10) e bônus de movimento são explícitos no Data Dragon `pt_BR` 16.21.1. O ritmo de ganho (Lacre +2/+1, Mejai +4/+2 por kill/assist) foi registrado como **adaptação do CoachLOL**, pois o texto arquivado não especifica esse ritmo: não declarar paridade Riot total.
5. **Loja**: catálogo `sr_shop_26_21_dev49.json/js` regerado, mismatch=0; 98 itens gerais vinculados, 104 reference-only, 202 normais na seleção conservadora. Vincular != certificar todos efeitos.

## Evidências reais
| Gate | Resultado |
|---|---|
| Contratos específicos `tests/v453_dev58_pvp_glory.test.mjs` | **17/17 PASS** |
| Regressão histórica e atual `npm test` | **PASS** |
| Motor Node → Browser | sincronizado com `tools/sync_browser_v43.py` (71 exports); `node --check` PASS |
| PvP duas equipes em HOLD, 900s por seed 26 e 42 | **PASS** para escopo de minions, 30 waves por seed, 39 amostras por seed, 0 overlap, 0 foco inválido, 0 divergência, 0 restrições, 0 violações de invariantes |
| Partidas PvP humanas 5v5 / cliente duplo | **NÃO CERTIFICADO** (simulação acima não controla jogadores reais nem estressa a rede) |
| Last hits dos campeões no teste HOLD | **NÃO TESTADOS** no teste HOLD (0 CS por definição); testes históricos mantidos em `npm test` |
| Torretas, match completo e balanceamento | **NÃO CERTIFICADOS** no teste HOLD (nenhuma torre destruída) |
| Duas partidas longas em modo bot com harness estendido | dev57 **e** dev58 idênticos, ambas NÃO acabam por Nexus até 2400s, seed26 CS MID 0/1; seed42 0/9; **limitação preexistente deste harness** |
| `tests/v20_long_match.mjs` padrão com 1000-decisões guard | **NÃO PASSA**, limite alcançado em seed26 aos 1093s; também ocorre em dev57 no mesmo teste estendido; não declarar PASS |
| Visual Chromium | não certificado |
| Ícones Riot PNG offline | pendentes; não usar fontes Wiki |

Evidências detalhadas em `docs/QA_EVIDENCE_V453_DEV58/` e log global `/mnt/data/CoachLOL_Dev58_Regressao_Integral.log` disponibilizado separadamente.

## Pendências
- Testes integrados 5v5 no servidor multiplayer com dois clientes humanos, fog privada, reconexão, treino de CS real e torres; evitar equivalência entre o teste minion-only e essa certificação.
- Corpos de minions ao longo de toda a partida, inclusive pathfinding sob congestionamento de campeões e torres. Auditoria amostral não é prova de ausência de qualquer colisão interframe.
- Confirmar em cliente oficial quantidades de stacks por abate/assistência. Evoluir outros 104 itens sem ARAM/TFT.
- Corrigir/qualificar o harness de partidas longas e não usar seu resultado como gate de duração natural por Nexus.
- Ícones oficiais versionados offline e testes Chromium permanecem pendentes.
