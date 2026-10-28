# Memória de continuidade — CoachLOL V4.5.2d-4-dev8

**ÚNICA base para próximo chat:** `CoachLOL_MacroArena_V452d4_Dev8_ScryerVision_EndgameE2E_GameComplete.zip`.

## Motor e estado
- JS `engine.mjs` é autoridade offline. `engine.browser.js` sincronizado (62 exports).
- 12 Lumes = 8 early + 4 adicionais na transformação ou 15:00, conforme canon anterior; regiões vêm das máscaras enviadas e sem borda de contorno.
- Florividentes Scryer Bloom, novos na dev8: **2 pontos provisórios de demonstração preexistentes e 10 adicionais** (categorias Riot 26.1). Não são locais certificados: todos os pontos precisam ser substituídos quando máscaras próprias forem fornecidas.
- Novos Scryers: 15m ou Rift; cooldown 90–120 s. Padrão: 200–260 s. Ambos por segundo de simulação, hash independente RNG principal.
- Revelação angular temporária, visão por equipe e wards inimigas persistindo corretamente. Sem modificação de ouro ou farm.
- `app.js`: Victory/Defeat e placar com 5 abas, botão Continue alinhado, funciona no Chromium acelerado. Testes 8/8 e `npm test` PASS.
- Capturas e logs em `docs/QA_EVIDENCE_V452D4_DEV8`.
- Visual e geometrias Riot 1:1 NÃO certificados. Não afirmar partida orgânica completa E2E.
- Farm 35–47 CS/5min e freeze parcial continuam sob testes.

## Próxima prioridade executável
1. Receber máscaras das Florividentes, importar 10 adicionais reais + locais padrão e retirar localizações provisórias.
2. Testar visão, LoS, detecção e fog em seis Rifts sob snapshots/replays.
3. Testar vitória/derrota em partida orgânica e viewport mobile 16:9.
4. Retomar Barão d3-B; depois Elder/Smite d3-C.
