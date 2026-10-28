# Memória de continuidade — V4.5.2d-4-dev14

- Base canônica: `CoachLOL_MacroArena_V452d4_Dev14_BaronElder_HUD_JogoCompleto.zip`.
- Barão: AD/AP individuais temporários (12–48 AD, 20–80 AP), curva de interpolação explícita não certificada, freeze no momento da conquista, sem mutar stats-base nem multiplicar AA em 12%.
- Ancião: buff temporário 180s, holders somente vivos, burn/execute continuam com discretização tática pré-existente.
- Motor decide captura pelo sistema de combate/objetivos, sem prêmio duplo; `engine.browser.js` gerado com 68 exports.
- HUD indica bônus e remanescente.
- Preservar: 15 Florividentes autorais e buffs Quimtec, máscaras normal/Oceano, 12 Lumes 8+4, Golpear competitivo com D/F, 2 spells de campeão, batalha por objetivos, pós-jogo e arquivos Git sujos.
- Testes novos 11/11, `npm test` PASS, Chromium HUD em fixture PASS.
- Ainda pendentes: curva Barão calibrada 1:1, movimento/resistência de minions Barão, Elder 0,5s vs tick de 1s, multiplayer Rust autoritativo e corrida de partida completa orgânica 5v5.
