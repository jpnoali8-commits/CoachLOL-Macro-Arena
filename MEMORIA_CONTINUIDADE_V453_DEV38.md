# Memória técnica — CoachLOL 4.5.3-dev38

A base é o ZIP mestre da dev37. **Não trocar pelo Dev36**. 70 locais jogáveis e 863 registros oficiais estáticos 16.21.1. `engine.mjs` é canônico; `engine.browser.js` é sincronizado. `app.js` contém loja compacta preto/dourado. Estado dos procs novos: `scoutBullseyeReadyAtV453Dev38`, `energizeStacksV453Dev38`, `doransCombatManaUntilV453Dev38` no campeão. Os snapshots V40 devem manter esses campos intactos. `ITEM_EFFECTS_V43` possui as três entradas `maturity` dev38 parciais.

**Cuidado**: vendas, upgrade e compra devem zerar estado apenas do item alterado; básicos do Canhão precisam autorizar distância extra apenas com 100 cargas e consumir o efeito depois de ataque conectar. `advanceItemRegenV453Dev38` é acionado em `tick()`. `moveAlong` acumula percurso (não teleporte). A previsão de last-hit recebe +5 do Anel antes da resistência. Evitar procs recursivos Bullseye/Canhão no `damage()`.

**QA validado:** 13 contratos específicos, `npm test`, Chromium original sem exceções, 3/3 seeds terminadas pelo Nexus, 25m36s média. Efeitos restantes não estão completos. Outras habilidades QWER/itens/recargas dependem de QA individual.

**Preservar** cenário e máscaras fornecidos, fog/wards, seis Rift Elementais, Golpear competitivo, dragões/Barão/Arauto, replay/determinismo, compra de receita por componente, UI e histórico Git pré-existente. Ult de Mordekaiser ainda requisito futuro do overlay quadrado superior esquerdo com limite circular e mapa clonado, sempre acima do HUD comum.
