# CoachLOL Macro Arena — M23/B01 · Pós-morte, divisão, execução e aprimoramentos

**Escopo e branch:** `dev69/skills-batch2` · PR **#9 Draft** para `dev69/integration`. Este documento é um handoff técnico e **não certifica nenhum kit**. Proibido fazer merge na branch Skills, gerar `engine.browser.js`, mudar `version.json` ou tocar em Items.

## Implementado e validado na engine autoritativa

| Família sistêmica | Campeão / skill | Mecânica efetiva | Diferenças ainda abertas |
|---|---|---|---|
| `m23DeathDefiedV453`, postmortem castGate/commit | Karthus P, Q/W/E/R | Ao morrer, permanece HP=0, 7s com spells QWER gratuitos, proibição de movimento e abate contado uma vez; R precisa iniciar até 4s e pode concluir canal pós-morte. | E ainda não preserva toggle contínuo durante toda a janela, W precisa parede persistente, Q ainda não tem atraso nem isolamento; pós-morte não libera interações de UI garantidas. |
| `m23ZacDivisionV453`, `zac_blob` em summons | Zac P | Primeiro lethal inicia divisão em **4 blobs atacáveis**; nível 1/6/10/13/17 = duração 8/7/6/5/4s; 1,5s iniciais de invulnerabilidade dos blobs; movimento próprio por estado; pode eliminar todos e registrar um abate normal ou reviver segundo HP total restante. CD 300s; não adiciona unidades à roster de 10. | Ainda faltam Goo chunks de todas QWER, direcionamento visual de blobs, interação de Teleport/Syndra e modelagem integral da vida refletida. |
| `m23ExecuteMarkV453` + evento de morte | Urgot R | Primeiro disparo marca **um inimigo campeão**; até 4s, R2 exige abaixo de 25% da vida e não cobra mana/CD. Execução real passa por `damage()`, não ignora invulnerabilidade; medo próximo em execução; tentativa automática no fim da duração. | Falta canal de correntes de 1,5s, supressão, leash e slow progressivo; não há equivalência visual ou animação. |
| `m23GritV453` + decay | Sett P/W | Dano pós-mitigação guarda Grit até 50% HP, decai 30%/s após 4s, W consome uma vez, ganha escudo e aplica dano central verdadeiro. | Falta cast time 0,75s, decay visual preciso, centro e geometria total da skill, E em ambos lados e R slam. |
| `m23HeimerEmpowerV453` + entidade aprimorada | Heimerdinger R/Q/W/E | R prepara próxima habilidade, Q cria torre aprimorada com HP/dano/duração superior e limite compartilhado 3; W/E recebem variante de dano e consomem estado exatamente uma vez; torre age no scheduler. | Próximos marcos devem implementar Q ultimate cannon/beam, W ondas de foguetes e E granada quíntupla; tempos de carga e técnicas reais de cada skill ainda faltam. |

**Arquitetura:** todas usam `damage()`/scoreboard, `effectResolverV41`, `boardSummonsV453Dev69`, `boardKitForV453Dev69`, `queueBoardSkillV453Dev69`, `executeBoardSkillV453Dev69`, `advanceBoardPassivesV453Dev69` e `reviveAndMove`. Não criamos novo elenco, segundo servidor ou runtime paralelo. Os novos campos persistem nos snapshots V40. O estado derivado é sempre controlado por relógio e eventos do servidor.

## QA evidenciado, 29/10/2026

[CI Skills P1/M23](https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/actions/runs/40811572395) — **SUCCESS**. No mesmo HEAD: Skills QA e Logic QA verdes; integração **falha somente no gate Node→`engine.browser.js`**, reservado ao integrador.

- **M23**: `v453_m23_b01_death_state.test.mjs` **16/16** + `v453_m23_b01_execute_grit_upgrade.test.mjs` **16/16** = **32/32** cenários em azul/vermelho.
- **M22**: `channel_fuse` **14/14** + `second_stage` **14/14** = **28/28**.
- **M21**: estados **16/16**, passivas de evento **12/12**, alvos duais **14/14** = **42/42**.
- **M20**: **280/280** QWER em dois lados, **70/70** snapshots da matriz e **16/16** testes especiais.
- **M19**: 173 campeões, 173 P, 692 QWER; 369 `training`, 323 roteados não certificados, 79 kits completamente `training`, 75 sem `training`, **0 kits CERTIFIED**. Essas contagens não substituem validação da fidelidade individual.

## Riscos e prioridade M24/B01

1. **Pós-morte Karthus E**: duração e toggle automáticos; Q atraso/isolamento; impedir entradas client não disponíveis na UI de mortos.
2. **Zac Goo e entidades**: chunks individuais e 1,5s de invulnerabilidade, vida refletida, animação das quatro peças, interação com Summoner/Teleport e ataques aos blobs via UI; observar replay e fog.
3. **Urgot R autoritativo completo**: 1,5s de corrente/supressão, interrupção por morte do Urgot, execução ao término, limites por targetabilidade, medos e KDA.
4. **Sett E/R e Heimer upgrade Q/W/E**: stun bidirecional, Grit e slam do alvo, variantes únicas da ultimate e inventário/cargas de turret.
5. **Outros B01:** JarvanIV flag+dash e arena walls; Fizz E reativação/untargetable; Syndra orb/E stun; Tahm Kench R devour; Viktor evolves; Mel reflection, Rell mount, Galio R ao impacto.
6. **Certificação integral, não contador de slots:** cada um dos 35 deve ter P+QWER/variantes/recasts/interações/snapshots/fog/Realm/CC/recursos com QA e UI de dois clientes; só integrador sincroniza browser e valida release.

**Fonte externa consultada para especificações, distinta do código:** [Karthus](https://wiki.leagueoflegends.com/en-us/Karthus), [Zac](https://wiki.leagueoflegends.com/en-us/Zac), [Urgot](https://wiki.leagueoflegends.com/en-us/Urgot), [Sett](https://wiki.leagueoflegends.com/en-us/Sett), [Heimerdinger](https://wiki.leagueoflegends.com/en-us/Heimerdinger).

**Não declarar os campeões concluídos:** os 32 cenários verdes provam somente as funções cobertas. Todo o B01 continua `partial_executable` e o PR #9 permanece Draft.
