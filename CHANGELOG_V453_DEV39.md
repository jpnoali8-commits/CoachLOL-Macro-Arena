# CoachLOL Macro Arena — V4.5.3-dev39 (27/10/2026)

Base canônica: ZIP mestre **V4.5.3-dev38**, extraído sem reset/clean/commit; patch de referência PC 26.21 / Data Dragon 16.21.1 (não importar o 26.22 antecipadamente).

## Motor jogável
- **Kraken Slayer/Mata-Cráquens:** a contagem de ataques válidos não depende mais de acertar o mesmo alvo. Dois ataques válidos acumulam, o terceiro consome e aplica dano físico com a implementação parcial já existente. Reset específico na compra/recompra/venda. Cooldown das cargas: 4s (simulação autoritativa).
- **RFC/Canhão Fumegante:** `itemEnergizeRelocateV453Dev39` aceita apenas deslocamento físico validado (`dash`, `knockback`). Movimento normal continua via `moveAlong`; repulsão do motor contabiliza distância real, e a habilidade W de escape da Tristana (modelada como dash) também. Flash, Teleporte, Hexgate, recall, reconfiguração de mapa, respawn e blinks instantâneos não ganham energia por diferença bruta de coordenadas.
- **Estado de itens:** `itemProcStatusV453Dev39` expõe estado determinístico para Energizado, Bullseye, Kraken, Anel de Doran e Armaguarda. O navegador usa a mesma função do Node.

## UI original
- HUD flat preto/dourado com quatro ou mais chips compactos, carga/recarga, acessibilidade (`role=meter`, aria-values), atualizados por refresh autoritativo.
- Inventário da loja com resumo de efeitos e timers, sem romper a árvore de receitas ou alterar os 70 itens compráveis.

## Validação
- `node tests/v453_dev39_onhit_displacement_hud.test.mjs`: **12/12 PASS**.
- `npm test` completo: **PASS** após sincronização de `engine.browser.js` (log em `docs/QA_EVIDENCE_V453_DEV39/npm_test_full.log`).
- Chromium original: **PASS**, nenhuma exceção JS, duas capturas reais e teste de ataque que consome a carga energizada (veja `chromium_dev39_report.json`).
- Três partidas completas seeds 26/36/42: **1626 / 1525 / 1458 segundos**, todas encerradas pelo Nexus, média **1536,33s** (25m36s); sem alongamento artificial.

## Limitações e referências
- **Atenção:** a Wiki de Rapid Firecannon também menciona carga gerada por deslocamentos instantâneos no LoL. O CoachLOL atualmente *não* gera carga em teletransporte/Flash; é uma regra intencional de treino tático, não paridade oficial. A cobertura de dashes ainda é parcial.
- A passiva Kraken funciona neste recorte, porém não certifica todos os seus modificadores nem procs especiais de outros campeões.
- Fontes verificadas: https://www.leagueoflegends.com/en-au/news/game-updates/league-of-legends-patch-26-21-notes/ ; https://wiki.leagueoflegends.com/en-us/Kraken_Slayer ; https://wiki.leagueoflegends.com/en-us/Rapid_Firecannon ; https://wiki.leagueoflegends.com/en-us/Recurve_Bow . Dados oficiais arquivados da dev36 permanecem intactos.
