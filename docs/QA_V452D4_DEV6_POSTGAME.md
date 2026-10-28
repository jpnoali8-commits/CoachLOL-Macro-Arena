# QA — Postgame V4.5.2d-4-dev6

| Gate | Status | Evidência |
|---|---|---|
| Git e base dev5 | PASS | ZIP canônico verificado; git sujo herdado preservado |
| Cinco abas, tabela 5v5, métricas e filtros | PASS | 5 contratos Node + Chromium fixture |
| Linha do tempo objetivos/snapshot | PASS | ledger V4.4, snapshot V4.0 |
| Farm 5min e freeze | PASS | `npm test` inclui `v452c_farm_ai` |
| Máscaras Faelight 8+4 e destrave time-or-rift | PASS | `test:v452d4:dev5` dentro do npm test |
| `npm test` integral | PASS | exit 0, `QA_EVIDENCE_V452D4_DEV6/npm_test_full.log` |
| Syntax JS + sincronização browser | PASS | 62 exports e node check |
| Chromium isolado: cliques/controle/5 abas | PASS_LIMITED | capturas de fixture no diretório `QA_EVIDENCE...` |
| End-to-end UI depois de Nexus destruído | NOT_RUN | Localhost bloqueado por política do ambiente (ERR_BLOCKED_BY_ADMINISTRATOR) |
| Dados avançados LoL 1:1 | NOT_RUN | Dano, ouro recebido, visão histórica ainda não instrumentados |
| PVP/Rust/backend | NOT_RUN | Itens fora do escopo |

**Observação**: as telas de screenshot de fixture não comprovam paridade de gameplay, apenas layout/controles. Nenhum evento foi criado pelo módulo de visualização. Os 110 últimos eventos e até 100 objetivos no ledger são limites históricos conhecidos.
