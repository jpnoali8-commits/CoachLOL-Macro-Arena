# QA V4.5.2d-4-dev12

| Gate | Resultado |
|---|---|
| Novos contratos máscara/Florividente/cone/Quimtec | PASS 6/6 |
| `npm test` integral | PASS exit 0 |
| Testes herdados Scryer dev8 | PASS 8/8 (ajustados ao novo contrato) |
| Testes user masks e gameplay dev2 | PASS 10/10 (ajustados ao novo contrato) |
| Dev9 Golpear competitivo | PASS 20/20 |
| Dev10 combate + Golpear | PASS 7/7 |
| Dev11 dois feitiços D/F | PASS 10/10 |
| Chromium real: UI do cone/ângulo/ativação | PASS, sem page errors |
| Sincronização Node/browser | PASS 66 exports |
| Geometria 1:1 oficial/5+10 definitiva | NÃO CERTIFICADO |
| Partida orgânica integral | NOT_RUN |

A imagem `docs/QA_EVIDENCE_V452D4_DEV12/scryer_angle_picker_chromium.png` é captura real feita por Chromium de uma fixture controlada; nela, os assets de mapa 4096px não estão carregados (fundo do tabuleiro preto). Não é uma captura de gameplay completo. Logs: `npm_test_final.log`, `chromium_scryer.log`.

Máscaras testadas: 15 markers autorais; 1 origem ajustada para caminhabilidade; 34 células brush base alteradas e oceano recalculado a partir do novo brush. Os 10 tier late são inferidos; temporização precisa do surgimento normal além de 15:00 permanece calibrável.
