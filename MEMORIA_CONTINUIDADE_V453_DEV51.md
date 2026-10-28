# Continuidade para o próximo chat — V4.5.3-dev51

- Versão canônica é o ZIP mestre DEV51, não DEV50 nem versões anteriores.
- O código do motor é `engine.mjs`; atualizar `engine.browser.js` com `python tools/sync_browser_v43.py` após mudanças.
- Rodar `npm test` e testes próprios de nova versão, reportar falhas verificáveis e preservar os 566 arquivos Git exatamente como na base.
- Alterações DEV51: `updateMinionBodiesV453Dev51`, `minionBodyPositionV453Dev51`, `minionBodyRadiusV453Dev51`, 5 itens regen SR e `advanceItemBaseRegenV453Dev51`.
- Visão de wards: **ward amarela, pink e sentinela azul** podem ativar o bônus dos 12 pontos mapeados; 8+4 são as regiões de visão extra por duração, não locais de colocação.
- Evitar regredir HUD, planta Florividente, reação/fechar, farm, economia, compra via receitas, física, PvP e dados visuais do usuário.
- Próxima produção: minion block longitudinal verdadeiro com regressão de farm; itens adicionais SR com passivas/ativos completos, ícones Riot oficiais offline, certificação Chromium; NÃO melhorar IA estratégica dos bots.
