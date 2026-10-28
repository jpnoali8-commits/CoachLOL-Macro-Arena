# CoachLOL dev44 — entrada PvP e verificação

Rodar `npm run test:v453:dev44`, `npm run audit:champions:dev44` e `npm test`. O gateway não possui tela ou rede: conectar a um servidor autenticado será tarefa da dev45.

API: `new AuthoritativeActionsV453Dev44(arena, [{seatId:'alice',unitId:'blue_ADC'}, ...])`. O servidor confiável recebe conexão autenticada e chama `gateway.submit(seatId,{sequence:1,kind:'order.stop',payload:{}})`. Para projetar visão use `gateway.view(seatId)`, jamais snapshot integral; para persistir `gateway.exportSession()` junto de `arena.snapshotV40()`.

Tipos aceitos: order.move, order.attack, order.stop, order.recall, order.ward, skill.directional, skill.ground, skill.targeted, skill.onhit_target (somente Ezreal/Irelia Q auditados), skill.ultimate, skill.recast_vex, skill.upgrade, summoner.queue, item.queue. As chamadas são revalidadas pelo próprio motor; nem todos os kits aceitam todos os tipos. Não usar credenciais no pacote, nem confiar no `seatId` fornecido pelo cliente sem autenticação externa.

Para jogadores PvP reais, **ainda faltam** servidor, lobby, segurança da identidade da sessão, reconexão, relógio de decisão e testes entre clientes.
