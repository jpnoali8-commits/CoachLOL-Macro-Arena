# Achados de caminho de codigo e cenarios de reproducao

Snapshot: `b7676d57160ddbc2315e258d03f3c94dd5a81189`. Esta auditoria nao alterou codigo funcional. Inspecao do codigo remoto + logs CI; **novo teste end-to-end: NOT_RUN**.

## C01 — P1 — clones visiveis nao podem receber skills unit-target (inconsistencia de alvo)

**Evidencia de fluxo, confirmada por inspecao estatica:**
1. `Arena.perspective()` inclui clones Shaco/Neeko/Wukong/LeBlanc como unidades visiveis ao oponente com `publicId` (motor, aproximadamente linhas 2410–2440).
2. O gateway em `AuthoritativeActionsV453Dev44.submit()` aceita um ID publico visivel, chama `m15ResolvePublicId` e o traduz para o ID da entidade servidor. Permite procurar `boardSummonsV453Dev69`.
3. `dispatch()`, para `skill.targeted`, envia o ID de entidade para `Arena.queueTargetedSkill()`.
4. Em `queueTargetedSkill()` (linhas 5542–5547), habilidades M16/M9 sao encaminhadas para `queueBoardSkillV453Dev69()`.
5. `queueBoardSkillV453Dev69()` (aprox. linhas 3165–3190) procura `targetId` **somente em `this.units`**, nao em `boardSummonsV453Dev69`; um clone valido nao vira `target`. Para `shape:'target_enemy'`, retorna `alvo_inimigo`.

**Consequencia estrategica prevista:** um clone inimigo Shaco visivel como campeao provavelmente nao pode ser selecionado por `Teemo Q` (target_enemy) apesar de seu alias publico ser aceito pelo gateway. A falha precisa ser reproduzida em teste instrumentado antes de marcar `BROKEN` com prova runtime.

**Teste especifico a adicionar na branch de auditoria ou no lote de Skills (nao executado aqui):** construir uma Arena PvP com Shaco vermelho R ativa e Teemo azul Q nivel 1; capturar do `perspective('blue')` o alias publico do clone; submeter `skill.targeted` com Teemo Q pelo seat azul e alvo `alias`; exigir sucesso, dano/efeito no clone, nenhuma revelacao de ID real e nenhum dano fantasma no Shaco original. Testar caso equivalente com Neeko W e LeBlanc P, ambos os lados e replay.

**Solucao estrutural:** criar primitiva compartilhada `resolveTargetableEntity(team,publicOrInternalId)` + regras de targetability por tipo sem inserir clones nos 10 campeoes reais. Reusar em casts, AA, CC, projeteis, area e ownership. Armazenar somente IDs do servidor no executor; projetar aliases opacos na view. Testar com `spell_shield`, dano e expiração no mesmo turno.

**Severidade:** P1, `CODE_PATH_CONFIRMED / NOT_RUN_RUNTIME`, nao P0 confirmado.

## C02 — P1 — habilidades genericas sem semantica individual

`abilityRule()` cai para `kind:'training'` em campeoes sem registro especifico, apos consultar M16, M9, M15, M14, V42, V382. Essa regra e dado consultavel, **nao prova, isoladamente, que o gateway permite o cast**. Para cada campeao da coluna `UNVERIFIED`, auditar chamadores da regra e distinguir UI, treinamento e executor. Em PvP competitivo, nao converter um fallback em habilidade "completa". [Motor linha 1113](https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/blob/b7676d57160ddbc2315e258d03f3c94dd5a81189/engine.mjs#L1113).

## C03 — P1 — prioridade M16 da armadilha de Nidalee sobre M14 forma humana

`abilityRule` e `boardKitForV453Dev69` usam M16 primeiro quando `m16OnlyHuman`; a versao `human W` do M14 utiliza `boardTemporal:'minefield'`. O M16 sobrepoe e passa a usar `m16Trap:'nidalee_bushwhack'`. A sobreposicao pode ser deliberada para eliminar uma aproximacao legada; manter **um contrato canonical**, um so agendamento e teste de nao duplicacao da W humana, mais comportamento da W de puma. Situacao: `DESIGN_RECONCILIATION_REQUIRED`, nao bug demonstrado.

## C04 — CI integrado nao certificado

No SHA, [Skills run 40796453314](https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/actions/runs/40796453314) PASS, [Logic run 40796453350](https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/actions/runs/40796453350) PASS, [integrated run 40796453232](https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/actions/runs/40796453232) FAIL em `Verify official Node to browser regeneration`; `npm test full` foi `skipped`. Esperado por contrato de branches; nao fazer merge nem sincronizar `engine.browser.js` neste escopo.

## Proximos ensaios negativos por risco
- clone com alvo unico, AoE e projetil, mesmo turno de expiração;
- reveal de Neeko/P e Shaco/R em recast/canal, campos de ID em `perspective`/eventos;
- Teemo R/Jhin R/Kha R sem cargas e com dois casts simultaneos;
- rollback/reconnect durante ult de Mordekaiser com pet e traps;
- mesma origem de dano em AA/item/runa/counter quando alvo morre na etapa anterior;
- friendly-fire bloqueado e stealth verdadeiro nao selecionavel atraves de aliases.

**Regra de QA:** registrar o evento e o checksum antes/depois, ambos os seats, custo/CD contabilizado uma so vez, snapshot/checkpoint, replay e assert do efeito estrategico. Nao considerar `return ok:true` uma prova de skill completa.
