# QA — CoachLOL Macro Arena V4.5.3-dev67

## Escopo efetivamente implementado

- O servidor preserva o modo **1 humano azul / 1 humano vermelho, cinco campeões controlados por cada um**.
- `Curar (Heal)` agora aplica a parcela primária ao conjurador **uma vez** e a secundária somente a **outro** campeão aliado vivo até 900 unidades. Prioriza um aliado explicitamente selecionado; se esse aliado sair de alcance, **não** redireciona para um terceiro. Sem aliado elegível, não dobra a cura do próprio caster.
- `Incendiar (Ignite)` e `Exaustão (Exhaust)` com alvo explícito mantêm identidade de alvo durante a execução: se for ocultado/sair do alcance, o feitiço aguarda sem consumir cooldown e **não seleciona outro inimigo**. A fila de alvo morto é descartada na próxima resolução. Sem `targetId`, permanece o comportamento anterior de escolha automática de inimigo visível no raio.
- `summoner.queue` rejeita IDs inexistentes e Curar direcionado a inimigo. Combos defensivos usam o mesmo resolvedor de cura, sem duplicar efeito.
- Testes abrangem Fantasma sob root, Barreira sob stun, absorção do escudo, cooldowns, controle de sessão por proprietário, replay idempotente e persistência após checkpoint.

## Evidências executadas

| Gate | Resultado | Evidência |
|---|---|---|
| Dev67 — autenticação, cura, alvo específico, Ghost/Barrier, snapshots em ambas equipes | **PASS 48/48** | `docs/QA_EVIDENCE_V453_DEV67/dev67_contract.log` |
| Dev61 — Desfazer por visita à fonte | **PASS 22/22** | `docs/QA_EVIDENCE_V453_DEV67/regression_dev61.log` |
| Dev62 — loja PvP | **PASS 18/18** | `docs/QA_EVIDENCE_V453_DEV67/regression_dev62.log` |
| Dev64 — reações PvP | **PASS 26/26** | `docs/QA_EVIDENCE_V453_DEV67/regression_dev64.log` |
| Dev65 — combos | **PASS 28/28** | `docs/QA_EVIDENCE_V453_DEV67/regression_dev65.log` |
| Dev66 — Purificar, CC, Exaustão | **PASS 29/29 + 14/14** | `docs/QA_EVIDENCE_V453_DEV67/regression_dev66.log` |
| `npm test` legado + dev67 | **PASS, exit 0** | `docs/QA_EVIDENCE_V453_DEV67/npm_test_full_retry.log`, `npm_test_retry_exit_code.txt` |
| Sincronização engine Node/browser | **PASS 73 exports** | `docs/QA_EVIDENCE_V453_DEV67/sync_browser.log` |
| Checagem de sintaxe Node/browser | **PASS** | `node --check` nos módulos usados |

A primeira tentativa do `npm test` foi interrompida pelo limite de execução do ambiente, sem status conclusivo; uma segunda execução completa concluiu com **exit 0**. O log da tentativa inicial está preservado como `npm_test_full.log`.

## Limites de certificação

- E2E usa **duas sessões HTTP autênticas independentes**, cookies e servidor de partida, mas os campeões são controlados por testes automatizados, **não** por duas pessoas clicando até o Nexus.
- **Não executado na dev67:** novo smoke visual em Chromium HTTP/SSE nativo, validação manual de HUD 16:9, nova simulação de 30 partidas para farm/duração, e bateria 1:1 dos 173 kits.
- Sem novas certificações dos **100 itens `reference_only`**: 102 vinculados ao motor, 100 somente referenciais. O patch de referência continua **26.21 / Data Dragon 16.21.1**. Não foram alterados atributos de itens, regras de economia ou redução de farm.
- Curar, Fantasma, Barreira, Incendiar e Exaustão foram certificados **apenas nos comportamentos listados**, não em toda matriz de efeitos individuais oficial.
- O histórico Git e os assets herdados permanecem preservados; ver relatório JSON de integridade e SHA-256 do ZIP.
