# Roadmap após V4.5.3-dev62

## Prioridade dev63
1. Certificar fluxo HTTP/SSE **nativo** em Chromium sem política de rede restritiva, preservando isolamento de cookies/autenticação.
2. Teste E2E completo de **dois jogadores reais** até Nexus por ordens: múltiplos campeões, combos QWER, feitiços, reações, farm, torres, recall, reconexão, resultado final, fog e no-leak. As simulações de dois contextos da dev62 não cobrem esse teste.
3. Ampliar itens Riot SR 26.21 com lotes pequenos e fontes `data/riot_reference/source_16_21_1` verificadas, preços/receitas, efeitos únicos e testes; manter `reference_only` até todos os efeitos necessários estarem implementados.
4. QA dos ícones offline: obter apenas assets do Data Dragon oficial Riot quando houver acesso; não fabricar ou usar URLs wiki como evidência.
5. Expandir kits individuais Sylas, Neeko, Viego e ultimate de Mordekaiser; viewport quadrado, arena circular interna clonada com cenário ativo, overlays superiores.
6. Corrigir seleção/reação, colisão, last hits, estruturas e possíveis turn-locks com regressão econômica, sem aumentar artificialmente partidas.

**Gates:** dev61 22/22, dev62 18/18, npm test, sincronização Node/browser, Chromium completo sem bloqueio, partida PvP até Nexus antes de certificação integral. Não mexer na regra de revogação do Desfazer ao sair da fonte nem na arquitetura de dois jogadores.
