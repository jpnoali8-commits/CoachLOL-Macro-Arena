# CoachLOL Macro Arena — Changelog V4.5.2d-4-dev18

## Implementado

- **Dragão Ancião:** sub-resolvedor temporal determinístico para eventos dentro de cada segundo simulado, sem mudar o frame rate do motor.
  - Queimadura verdadeira aos **+0,25 / +1,25 / +2,25 segundos** após o acerto original.
  - Execução programada após **+0,5 segundo** do golpe que deixou a vítima abaixo do limite de 20%.
  - Cura até superar 20%, invulnerabilidade e estase impedem a execução programada.
  - Não reaplicar queimadura nem execução a partir de seus próprios efeitos.
  - Ordenação estável quando efeitos de múltiplos campeões vencem simultaneamente.
  - Ledger compacto persistido em snapshots; dados legados sem campos de micro-ticks aceitos.
- **Rift Elemental:** matriz de regressão para as 6 variantes, incluindo fog, sentinelas comuns, pinks de controle, máscara original imutável e restauração do estado transformado.
- Preservados sem alterações: minions/cerco do Barão, Golpear competitivo D/F, máscaras autorais, ícones CC0 e replay de pós-jogo.

## Importante
- A resolução **lógica** de eventos utiliza sub-ticks, mas a apresentação visual continua no ciclo do simulador de **1 segundo por tick**. Não foi implementado novo VFX de meio segundo nem vídeo/GLB do Ancião.
- Duração do Ancião **180 segundos** foi preservada como regra herdada da dev14. Fontes de épocas diferentes divergem sobre a duração; **paridade exata com 26.21 não certificada**.
- Os testes nas 6 variantes cobrem as invariantes citadas, não uma partida 5v5 orgânica completa.

## Arquivos principais
- `engine.mjs` — programação de eventos, fila de micro-ticks e ligação ao tick de combate.
- `engine.browser.js` — gerado do mesmo motor (68 exports).
- `tests/v452d4_dev18_elder_subticks_fog.test.mjs` — 11 novos contratos.
- `tests/browser_v452d4_dev18_elder_microticks.py` — parity Chromium e screenshot real da fixture.
- `docs/QA_EVIDENCE_V452D4_DEV18/` — logs e evidência.
