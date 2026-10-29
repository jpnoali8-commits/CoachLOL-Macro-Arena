# Marco P1 — entidades-alvo compartilhadas, clones e DoT (Skills dev69)

**Estado:** correção pronta para revisão do especialista, **NÃO integrada**. Trabalho isolado da auditoria e do PR principal #9.

## Rastreabilidade
- Baseline exata de Skills: `b7676d57160ddbc2315e258d03f3c94dd5a81189`.
- Branch desta correção: `fix/skills-entity-targetability-p1-dev69`.
- [Issue #18](https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/issues/18), evidência anterior: [auditoria P1 40799020225](https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/actions/runs/40799020225) — 10 falhas em 24 casos.
- Evidência depois da correção: [CI 40800775113](https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/actions/runs/40800775113) — todos os passos da suite focal aprovaram.

## Alterações de produção (sem patch por campeão)
1. Em `engine.mjs`, **`boardCloneDamageableV453Dev69`** define os quatro tipos de decoy elegíveis (`neeko_clone`, `shaco_clone`, `wukong_clone`, `leblanc_clone`), sujeitos a HP, duração e time.
2. **`boardCombatEntityByIdV453Dev69`** aceita campeão ou clone autoritativo sem acrescentar campeões ao roster nem copiar entidades.
3. **`boardCombatEnemyPoolV453Dev69`** agrega os alvos de dano em área para geometria de linha, cone e círculo, respeitando visibilidade, expiração e Realm.
4. A fila **`queueBoardSkillV453Dev69`** e o executor **`executeBoardSkillV453Dev69`** verificam o mesmo contrato de tipo, range, vision e Realm antes de cobrar mana/cooldown.
5. A primitiva `performActionV40` preserva o invariante original (destinatários de `targetId` no roster de dez campeões); casts em clone transferem apenas **coordenadas** no commit e causam dano pela referência de entidade sob responsabilidade do executor. Assim se evita propagar IDs de invocação a funções legadas de campeões.
6. Teemo Q via adaptador M16 aceita causar dano em clone; **cegueira continua exclusiva de campeões**, charm de Evelynn exige campeão.
7. `EffectResolverV41.advanceTick` também executa DoT em clones danificáveis — antes os efeitos eram registrados mas não avançavam. Sem alteração do relógio, sem incluir wards/pets/tower ou inventar dano instantâneo.
8. Em `multiplayer/authoritative_actions_v453_dev44.mjs`, IDs internos de Wukong e LeBlanc também são proibidos para o oponente; seus aliases públicos continuam sendo os identificadores do cliente.

## Evidências de QA em Node 22
- **24/24** cenários `--strict` do P1 (10 anteriormente falhavam).
- **140/140** cenários de dano reais gerados dos contratos M9: `target_enemy` 48, `circle_enemy` 52, `cone_enemy` 8, `line_enemy` 32; incluem 8 casos de DoT que exigem tick posterior, sem efeito duplo.
- **2/2** casos de recibo PvP (ambos seats): mesmo sequence+payload retorna mesmo ack, recurso debitado apenas uma vez; sequence repetida com payload diferente é rejeitada; snapshots reconstituídos.
- Roteamento **173 × QWER × 2 seats** sem exceção, **336 execuções authored** de M9/M14/M15/M16: não certifica fidelidade.
- Regressões: M15 25/25, M16 73/73, board M9 28/28, formas M14 14/14, Sylas 16/16, batch2 44/44, Lux/PvP dev68 40/40, além de V42 e outras etapas do CI.
- Invariante: **10 campeões por partida**, clones não modificam `Arena.units.length`.

## Arquivos editados no patch (não na auditoria)
- `engine.mjs`.
- `multiplayer/authoritative_actions_v453_dev44.mjs`.
- `tests/audit/v453_clone_targetability_audit.test.mjs`.
- `tests/audit/v453_global_contract_execution_audit.test.mjs`.
- `tests/audit/v453_entity_shape_matrix.test.mjs`.
- `.github/workflows/skills-entity-targetability-p1.yml`.

## Restrições e gates restantes
- O patch NÃO altera `engine.browser.js`, `version.json`, Itens, `dev69/skills-batch2`, `dev69/integration` ou `main`; **PR #9 não foi integrado**.
- Antes da incorporação ao PR #9, especialista deve revisar os hunks e incorporar esta branch sem reescrever `engine.mjs` integralmente nem gerar conflitos com outras mudanças posteriores. A integração consolidada deve regenerar o browser pelo script oficial e executar `npm test`/Chromium 2 sessões.
- Ainda fora da cobertura estrita: colisão de projéteis cinematográficos e paredes, Jhin R e outros canais M16 contra decoys, armadilhas contra pets/clones, controles de grupo específicos de entidades, interações de Sylas/Neeko com transformação no mesmo microtick, e cobertura de 173 passivas P individuais.
- Os **509 slots QWER no fallback `training`** permanecem inalterados. Nenhum campeão foi promovido a certificado.
- Nada disso autoriza merge direto em `dev69/integration` ou release.
