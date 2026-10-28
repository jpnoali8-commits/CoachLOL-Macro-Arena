# Especificação incremental: passivas, habilidades, formas e reinos — dev19

## Escopo e gate
Esta é uma **especificação de arquitetura**, não implementação de Nidalee, Elise, Shyvana ou Mordekaiser. A dev19 NÃO adiciona nenhum desses personagens à partida. Fonte de patch PC: 26.21; itens e stats exigem importação oficial versionada e revisão de correções intermediárias.

### Núcleo genérico de habilidades
Separar `ChampionProfile` (atributos/recurso/progressão) de `ChampionKit` (passiva e QWER por forma) e `RuntimeState` (ranks, cooldowns por habilidade/forma, cargas, efeitos ativos). Uma ação tem `sourceChampion`, `skillSlot`, `form`, `target/point`, `timestamp`, `castInstanceId`. O motor valida propriedade, nível, forma, recursos, recarga, CC, fog, alcance, colisão e prioridade ANTES de gastar recursos. Efeitos devem ser idempotentes por cast; cada evento aponta ao mesmo `castInstanceId`. Combos concatenam casts válidos, jamais invocam damage direto sem resolver o core.

### Transformações: implementação por lotes
- **Nidalee:** estado `human` ↔ `cougar`; QWER devem selecionar variantes específicas, cooldowns/recasts documentados; a marca Hunted influencia combos, movimentação e permissões de alvo; snapshots precisam preservar forma/marks/recast e fog. Não assumir cooldown exato antes do patch review.
- **Elise:** estado `human` ↔ `spider`; QWER por forma, aranhas invocadas com ownership e visão, Rappel com targeting e untargetability. O reaparecimento/saída de forma não pode reiniciar todos os cooldowns.
- **Shyvana:** forma humana ↔ dragão com recurso de fúria e duração; QWER tem efeitos/alcances diferentes por forma; verificar estado do patch, transformação de R, dash/collision e retorno por recurso.

### Realm of Death (Mordekaiser R)
- A arena recebe `realmInstances: Map<realmId,{owner,target,center,radius,startAt,until,stolenStats}>` e cada unidade/projétil/entidade tem `realmId` explícito (padrão `surface`).
- **Exclusivamente Mordekaiser e alvo** entram no novo realm após validação. Outros oito campeões do 5v5 permanecem no mundo normal e continuam lutando normalmente; o ring 1v1 usa a mesma máscara da arena, com borda física impedindo saída.
- Funções `visible`, `canTarget`, `damage`, `heal`, `projectileCollision`, `aoeCandidates`, `minionAttackTarget`, `wardRadius` e IA de target precisam filtrar `realmId` antes de qualquer interação. A filtragem apenas na UI NÃO basta.
- O motor grava transformação, roubo de stats, entrada/saída, cancelamento, duração, morte, possível dissipação e snap/replay. 7s de Reino da Morte é referência inicial, sujeita à conferência por patch; cooldown, roubo e exatas exceções exigem contratos separados.
- Eventos externos não devem vazar HP/casts das duas unidades por fog; a projeção do time é calculada depois da segregação dimensional. Trajetória de projéteis existentes, efeitos periódicos e itens precisam de regras explícitas de cruzamento/cancelamento.

### Gates por campeão
Para liberar 1 campeão: atributos/18 níveis e recursos auditados; passiva; quatro habilidades em todos ranks (e formas quando aplicável); ataque básico e alcance; alcance/colisão/CC/custos/cooldowns; efeitos por itens/runas; toggles/recasts; snapshot/replay e fog; cinco cenários PVE e cinco PVP bot; testes Node/browser; regressão de farm/objetivos.

### Por que a ordem importa
A tentativa de implementar `Realm of Death` diretamente com `if(champ==='Mordekaiser')` em cada função quebraria combate, fog e replay. Primeiro criar `realmId` testado com duas unidades dummy e 8 terceiros, então integrar o kit. O mesmo vale para formas: construir um resolvedor de estados de forma antes de incluir três campeões complexos.

### Fontes
- Riot Data Dragon: https://developer.riotgames.com/docs/lol
- Patch 26.21: https://www.leagueoflegends.com/en-ph/news/game-updates/league-of-legends-patch-26-21-notes/
- Descrição técnica do Reino: https://wiki.leagueoflegends.com/en-us/Template%3AData_Mordekaiser/Realm_of_Death
