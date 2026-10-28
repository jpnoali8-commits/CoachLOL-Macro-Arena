# Marcos e auditoria de produção — v2.2

## Critérios já validados nesta iteração
- 55 contratos anteriores e 7 novos contratos de loja/XP.
- Compra por campeão na fonte somente em planejamento.
- Compra remota NÃO existe: ações geram ordens de compra na próxima visita.
- Sequências de itens textuais são ordenadas e não cancelam movimento, farm ou ordens persistentes.
- Fila por campeão serializável entre rodadas, inclusive falta de ouro.
- UI de loja com cinco seletores e compra múltipla sem fechar, validada em Chromium.
- XP de minion apenas a aliados vivos no raio de 1.500 unidades quando morre; XP dos monstros da jungle separado.

## Bloqueadores que permanecem
P0 - Mapa funcional com rota de minions/tower/inibidor/Nexus validada em partida **que termine**. Cenários v2.0 de 40 minutos não terminaram naturalmente.
P0 - Combate com kits completos por campeão, QWER, passivas, CC, autoattacks, alcance, prioridades e resposta simultânea sem vieses.
P0 - Equilibrar XP, gold, wave, jungle/monstros, itens e evolução por patch com cenários de teste quantitativos.
P0 - Sistema de lojas oficial completo por patch: receitas, componentes, venda, desfazer, inventário, itens únicos, efeitos ativos/passivos (atualmente o Rabadon é um item de custo integral, sem receita).
P1 - Planos de compra com upgrades de componentes e recomendações por classe/situação; editor completo de arsenais.
P1 - Conferir onboarding, comandos em português/siglas, reconhecimento local offline de voz sem upload, fog e timers de jungle.
P1 - Nova revisão de layouts / HUD e consistência do design preto + dourado em resoluções variadas.
P2 - Multiplayer autoritativo, anticheat, matchmaking, rank, MMR e PDL após certificar regras de partida.

## Regra de engenharia
**Não concluir outro marco apenas por existir botão.** Um comportamento só está pronto quando tem teste de motor, teste de integração e caso negativo documentado.
