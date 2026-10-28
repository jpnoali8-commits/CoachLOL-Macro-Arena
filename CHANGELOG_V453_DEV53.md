# CHANGELOG — CoachLOL V4.5.3-dev53

Base canônica: ZIP completo **V4.5.3-dev52**. Nenhum arquivo foi removido; alterações Git preexistentes não foram descartadas.

## Minion block

- `minionBodyCollisionAlongV453Dev52()` agora encontra a primeira interseção entre o trajeto e a hitbox circular usando solução analítica, em vez de amostragem a cada 24 unidades.
- Desvio de campeão usa o mesmo verificador contínuo; colisões tangentes e diagonais não são perdidas por intervalo de amostragem.
- Caminho que começa dentro do corpo de um minion pode sair dele, evitando deadlocks de início de movimento. Continuam válidos `bodyX/bodyY` e snapshots existentes.
- **Não** alterados: modelo de dano, preços de farm, foco histórico até 300s, progressão econômica ou o comportamento estratégico de bots.
- A colisão completa e a dinâmica de movimentação entre todos os minions nas waves ainda não foram certificadas como equivalentes às regras de League of Legends.

## Itens — Summoner's Rift normal, patch 26.21/Data Dragon 16.21.1

- **Capítulo Perdido (3802)**: 1.200 ouro, +40 AP, +300 mana, +10 aceleração. Receita `amp_tome+sapphire_crystal+glowing_mote`. Ao subir de nível restaura 20% do mana máximo em 3 pulsos de 1 segundo. Vários level-ups acumulam eventos; venda cancela pulsos pendentes.
- **Catalisador das Eras (3803)**: 1.300 ouro, +300 vida, +375 mana. Receita `ruby_crystal+ruby_crystal+sapphire_crystal`. Receber dano REAL de campeões recupera 10% desse dano como mana; conjurar habilidade autorizada cura 25% do mana gasto, respeitando limite de vida/mana. Não dispara com ataques bloqueados, escudos absorvendo integralmente, monstros ou conjurações rejeitadas.
- Lote certificado em `tests/v453_dev53_lane_collision_items.test.mjs`, incluindo preço, receita, desconto, snapshots e dano real.
- Contagem: **88/202** itens gerais vinculados ao motor, **114** apenas consultáveis. A vinculação não prova 100% das passivas e ativáveis. Nenhum item de ARAM/TFT/fora do patch foi adicionado.

## QA

- `npm run test:v453:dev53`: **14/14 PASS**.
- `npm test`: **PASS** incluindo testes legados e dev53.
- Partidas de controle seeds 26 (1284 s, vitória vermelha) e 42 (1400 s, vitória azul): Nexus destruído naturalmente, invariantes sem falha.
- `engine.browser.js` regenerado do motor Node por `tools/sync_browser_v43.py`, 71 exports.
- **Sem certificação visual nova no Chromium**: não foram produzidas capturas nesta etapa.
- Ícones offline Riot ainda pendentes; nenhum fallback da Wiki incluído.
