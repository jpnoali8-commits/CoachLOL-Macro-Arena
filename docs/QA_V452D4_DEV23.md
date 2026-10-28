# QA — CoachLOL V4.5.2d-4-dev23

## Objetivo
Alcançar aproximadamente 30 minutos de duração média sem limite rígido de tempo, preservando combate, rota de minions, vulnerabilidade de estruturas e progressão do Nexus.

## Auditoria estatística controlada
| Seed | Duração | Vencedor | Estruturas destruídas | Dragões | Nexus destruído |
|---|---:|---|---:|---:|---|
| 26 | 33:18 | Azul | 16 | 2 | Sim |
| 42 | 33:24 | Azul | 13 | 1 | Sim |
| 36 | 26:08 | Vermelho | 13 | 2 | Sim |
| 55 | 25:50 | Vermelho | 11 | 1 | Sim |
| 77 | 21:54 | Vermelho | 8 | 2 | Sim |

**Média 28:07**, mediana 26:08, mínimo 21:54, máximo 33:24. Os valores exatos de objetivos estão no JSON da seed; a tabela acima não substitui os registros.

**Atenção:** cinco simulações determinísticas de treinamento não demonstram que a duração média de todas as partidas seja 30min. Requer amostra maior com drafts alternativos e modos diferentes.

## Validações
| Gate | Resultado |
|---|---|
| `node tests/v452d4_dev23_match_pacing.test.mjs` | PASS 9/9 |
| `npm test` integral | PASS, exit 0 |
| Node/browser | PASS, 68 exports |
| Duração natural do jogo (5 seeds) | PASS 5/5 |
| Ausência de finalização por relógio | PASS, testes de regras e simulação |
| Farm 300s herdado | PASS, incluso no `npm test` |
| Chromium com partida orgânica completa | NOT_RUN |
| PvP autoritativo / LoL 1:1 | NÃO CERTIFICADO |

## Evidências reproduzíveis
- `docs/QA_EVIDENCE_V452D4_DEV23/npm_test_full_final.log`
- `docs/QA_EVIDENCE_V452D4_DEV23/npm_test_full_final.exit`
- `docs/QA_EVIDENCE_V452D4_DEV23/pacing_audit_5seeds.json`
- `docs/QA_EVIDENCE_V452D4_DEV23/seed{26,42,36,55,77}_scaled_max40.json`
- `tools/long_match_pacing_probe_v452d4_dev23.mjs`
- `tools/summarize_pacing_v452d4_dev23.py`

## Como reproduzir
1. Na raiz do projeto, `npm test`.
2. Execute `node tools/long_match_pacing_probe_v452d4_dev23.mjs 2400 26` (e substitua 26 pelas outras seeds).
3. Compare `simulatedSeconds`, `ended`, `winner`, `structures` e `issues`.
4. `python tools/summarize_pacing_v452d4_dev23.py` usa os cinco relatórios salvos em `docs/QA_EVIDENCE_V452D4_DEV23`.

## Regras preservadas
- Torres exteriores de 9000 HP (referência 2026).
- Resistências de torres decaem após 11:00 até 15:00 sem alterar HP.
- Inibidores e Nexus continuam invulneráveis antes das estruturas obrigatórias.
- Caminho até os guardas do Nexus usa navegação real; nenhuma unidade teleporta.
- AIAutomática compra itens apenas na loja e realiza recall normal.
- Nenhum contador ou objetivo recebe recompensa sem captura real.

## Limitações
- Crescimento dos minions **após 5min** usa coeficientes de balanceamento e não os valores integrais de cada onda Riot.
- Base de itens, passivas e kits dos campeões ainda é incompleta; afeta a duração futura.
- A distribuição deverá ser verificada com dezenas de seeds para um intervalo estatístico confiável.
