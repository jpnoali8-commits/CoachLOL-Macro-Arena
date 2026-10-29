# Auditoria arquitetural — CoachLOL Macro Arena (snapshot imutavel)

**SHA de codigo:** `b7676d57160ddbc2315e258d03f3c94dd5a81189` — branch `dev69/skills-batch2`. PR #9 Draft, nao mesclado. **Patch PC de referencia: 26.21**, lançado 21/10/2026; baseline estatistico offline Riot/Data Dragon 16.21.1. **Nenhuma mudanca no motor ou no navegador foi feita por este auditor.**

## Metodo e limites da evidencia
- Leitura remota de `engine.mjs` (1 linhas), gateways PvP, registradores M9/M14/M15/M16, contratos V42, documentação e testes representativos.
- Esta matriz automatica inclui **173 campeoes** e **897 registros** (P/Q/W/E/R e variantes), classificada de forma conservadora. **UNVERIFIED nao equivale a MISSING**, nem implica que o codigo legado inexista.
- `PARTIAL` significa primitiva/implementacao parcial reconhecida; **nao** significa funcionalidade certificada. Nenhum `CERTIFIED` foi atribuido.
- Execucao local: **NOT_RUN**, pois o repositório privado foi lido pelo conector GitHub; o ambiente de execucao nao pode fazer clone DNS do remoto. Resultados do GitHub Actions sao evidencias de CI remoto, nao testes locais desta auditoria.

## Inventario estatico de familias
| Fonte | Registros | Interpretacao |
| --- | ---: | --- |
| `CHAMPION_BASE_ROSTER_V453_DEV69` | 173 | Stats de referencia; nao ha certificacao de skills |
| `BOARD_KITS_V453_DEV69` M9 | 30 campeoes / 120 QWER | `board_prototype`; habilidades jogaveis genericas com parametros diferenciados, nao paridade individual |
| `M16_MECHANIC_KITS` | 19 campeoes / 22 slots | Familia de stealth, traps, cegueira e quatro disparos, PARCIAL |
| `FORM_KITS_V453_M14` | 3 campeoes / 24 slots em duas formas | `missing` enumera varias mecanicas nao cobertas |
| M15 | 2 slots especiais e passiva/transformacao da Neeko | clones e aliases parciais |
| M1–M7 | 7 campeoes | P/QWER com caminhos individuais; nenhum certificado integral |
| Caminhos especiais M14 | Sylas, Mordekaiser, Kalista | Ultimates especiais sob auditoria |

## Achados prioritarios
### F01 — P1: fallback de treinamento no caminho canonico
`abilityRule(u,slot)` usa M16, M9, M15, M14, V42, V382 e retorna `{kind:'training', ...}` quando nao encontra regra. Isso NAO prova que o slot simula o campeao. **Correcao recomendada:** negar cast competitivo de slots sem contrato jogavel, ou indicar claramente treino em modos nao competitivos; nao inventar QWER por dano generico. [Codigo](https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/blob/b7676d57160ddbc2315e258d03f3c94dd5a81189/engine.mjs#L1113).

### F02 — P1: 30 kits M9 sao prototipos, nao kits individuais certificados
A matriz `BOARD_KITS_V453_DEV69` contem 30 descritores com QWER. O teste `v453_dev69_board_grammar.test.mjs` declara explicitamente 30 descritores/120 slots `board_prototype`, nao equivalencia completa a LoL. **Correcao:** compor efeitos reutilizaveis especificos com `effect ledger`, geometria, custo, alvo, stacks, canais e CC, sem duplicar o motor.

### F03 — P1: os contratos M14 declaram lacunas no proprio codigo
Nidalee, Elise e Shyvana possuem duas formas, mas habilidades usam `missing` para gatilhos, escala de dano, familiars/pets, stasis, velocidade de projeteis, etc. Prioridade de W humana Nidalee passa pelo M16 por desenho de `abilityRule`; validar convivencia com a versao M14. [Codigo](https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/blob/b7676d57160ddbc2315e258d03f3c94dd5a81189/engine.mjs#L886).

### F04 — P1: M15 cobre identidade/clone, nao todo o kit
Neeko P/disfarce/W; Shaco R clone; Sylas R de Shaco possuem execucao especifica, mas outras habilidades e colisao de todo o universo de entidades nao estao certificadas. O proprio documento `M15_CLONE_DISGUISE_AUDIT.md` lista as lacunas. Requer matriz de projeteis/AoE/AA/torres/visao/Realm.

### F05 — P1: M16 e uma familia parcial, nao 19 kits completos
Ha 19 campeoes e 22 slots M16; o teste examinado valida estados, custos, fog, traps e snapshot para varias familias dos dois lados, mas nao todas as habilidades dos 19 campeoes. `Jhin` R e `Teemo` R sao contratos de turno, sujeitos a QA de canal, recarga, limites, colisoes e morte.

### F06 — P1 (gate de integracao): browser nao sincronizado
CI remoto do SHA: Skills sucesso `40796453314`, Logic sucesso `40796453350`; Integrated QA falhou `40796453232` na etapa **Verify official Node to browser regeneration**; job `npm test full` ficou **skipped**. Divergencia Node/browser e esperada enquanto PR #9 permanece Draft, mas impede certificacao/release. Browser so pelo integrador apos autorizacao/merge.

### F07 — P1: falta de evidencia de certificacao transversal
Os testes focais verificam parte dos caminhos (inclusive resultados reais), mas nao provam automaticamente todos os 173 × P/QWER, itens, runas, reconexao durante canais, replay, duplo-debito, visibilidade por identidade falsa, estruturas/monstros e duas sessoes visuais. **Nao transformar CI PASS em CERTIFIED.**

## Fluxo de execucao constatado
`Auth transport -> AuthoritativeActionsV453Dev44.submit -> dispatch -> queueBoardSkillV453Dev69 / queueKitSkillV42 / queueSpecialUltimate -> resolveCombat -> executeBoardSkillV453Dev69 / resolveKitSkillsV42 -> damage/effects/state -> perspective -> snapshotV40`.

Evidencias positivas de projeto: controle por seat + lista de ate cinco unitIds, sequencia com recibos, resolucao do ID publico de clones/disfarces, fog no gateway, custos na etapa de resolucao, estado de summons fora do roster. A implementacao total de cada skill atraves desse caminho ainda exige certificacao separada.

## Execucao registrada
| Suite | SHA | Resultado |
| --- | --- | --- |
| Skills Actions `40796453314` | b7676d57160ddbc2315e258d03f3c94dd5a81189 | **PASS remoto**; M16 **73/73** no log |
| Logic `40796453350` | b7676d57160ddbc2315e258d03f3c94dd5a81189 | **PASS remoto** |
| Integrated `40796453232` | b7676d57160ddbc2315e258d03f3c94dd5a81189 | **FAIL** em Node/browser sync; full npm test **SKIPPED** |
| Execucao nova local nesta auditoria | b7676d57160ddbc2315e258d03f3c94dd5a81189 | **NOT_RUN** |
| Chromium duas sessoes, assets, UX | b7676d57160ddbc2315e258d03f3c94dd5a81189 | **NOT_RUN** |

## Interpretacao dos CSVs
Cada campeao possui P/Q/W/E/R no CSV, mesmo sem contrato individual verificado. `UNVERIFIED` sinaliza que **esta etapa nao confirmou a consequencia executavel**; `PARTIAL` sinaliza um contrato reconhecido que ainda tem gaps. Campos de `testes existentes` identificam suites por familia, nao uma assercao individual para cada slot.
