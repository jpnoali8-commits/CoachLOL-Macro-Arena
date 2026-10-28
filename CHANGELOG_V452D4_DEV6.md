# CoachLOL Macro Arena — Changelog V4.5.2d-4-dev6

Data de referência: 26/10/2026 · origem única: ZIP completo V4.5.2d-4-dev5.

## Implementação

- Pós-jogo agora usa **cinco abas interativas**, inspiradas na organização do cliente atual de League of Legends: **Placar**, **Visão Geral**, **Estatísticas**, **Gráficos**, **Runas**.
- **Placar**: os dez campeões, K/D/A, nível, CS, ouro disponível, sentinelas ativas e ids dos itens equipados; não confundir slots finais com histórico de compras.
- **Visão Geral**: confronto das duas equipes, objetivos realmente capturados no ledger e linha do tempo de objetivos/abates registrados. Eventos truncados são sinalizados.
- **Estatísticas**: subabas Combate, Economia e Visão; filtro de equipe. Não cria métricas inexistentes.
- **Gráficos**: barras horizontais por campeão, métricas reais (abates, mortes, assistências, CS, nível, ouro em mãos, wards ativas, participação em abates), filtros equipe/função, ordenação. Não apresenta dano, cura, pontuação de visão ou ouro acumulado falsos.
- **Runas**: página equipada por campeão, identificada como protótipo quando aplicável.
- `postgame.js`: cálculo e renderização isolados da engine, com funções puras testáveis no Node.
- `postgame.css`: estilo compacto escuro/dourado com gráficos cyan/vermelho e scroll interno.
- Preservados **Victory/Defeat overlays** do usuário, botão Continue para resultados, motor JS offline, masks 8+4, todos os buffs/contratos legados.

## Referências públicas verificadas

- League Wiki, perfil e histórico de partidas: https://wiki.leagueoflegends.com/en-us/Summoner_profile
- Capturas de 2026 das abas Scoreboard/Graphs como referência visual: https://x.com/Obsess__ e https://x.com/Sardoche_Lol/status/2054704398647836787
- Organização não é cópia de código, marcas ou layout pixel a pixel.

## Status QA

- **PASS**: novos contratos `npm run test:v452d4:dev6` (5/5), `npm test` completo (exit 0), `node --check` JS, sync Node/browser 62 exports.
- **PASS limitado**: Chromium com fixture inline isolada, sem erros JS; navegação das abas/filtros e screenshots anexas.
- **NOT_RUN**: fluxo real Nexus destruído → overlay → Continuar → resultado na aplicação completa; servidor local bloqueado pelo ambiente.
- **NOT_RUN**: performance extensiva, cenários longos de PvP e dados avançados de dano/gold timeline.
