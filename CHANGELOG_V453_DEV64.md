# Changelog V4.5.3-dev64

- Corrigido bug PvP de reações: defensor vermelho humano recebe o mesmo prompt autoritativo do defensor azul após dano real. Bot mode permanece inalterado.
- Novo montador de reação no HUD PvP (alvo, QWER, feitiços, 12 etapas, limpar, defender/recuar/contra-atacar); validação do servidor permanece autoritativa.
- FLASH não equipado agora é recusado desde a validação do combo de reação, evitando aceitar ordens impossíveis.
- Mesmo recibo após `decision.reaction` retomada/snapshot: correção de retry na borda da sala, sem repetir operação ou efeitos.
- Contratos novos para dois contextos HTTP independentes e ambas as direções de luta, impacto real do motor, privacidade, snapshot, reconexão, tentativa de R não aprendida e retry antifraude.
- Sincronizados engine.mjs / engine.browser.js, mesma base 26.21 / 16.21.1. Nenhuma alteração de minions, farm, torres, economia ou status de itens.
