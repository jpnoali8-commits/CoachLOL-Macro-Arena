# QA — V4.5.2d-4-dev3

**Base**: ZIP dev2 do CoachLOL. Data 26/10/2026. Status geral: **IMPLEMENTED_TESTED_PARTIAL**, não certificado 1:1 com LoL 26.21.

| Gate | Resultado | Evidência |
|---|---|---|
| Dev3 Faelights/Hexgate/Quimtec | **PASS 8/8** | `npm run test:v452d4:dev3` |
| Dev2 máscaras e plantas | **PASS 10/10** | `npm run test:v452d4:masks`, incluído em `npm test` |
| Dev1 Rift Elemental | **PASS 9/9** | `npm run test:v452d4`, incluído em `npm test` |
| d3 passivos / d2 Almas | **PASS 10/10 + 10/10** | `npm run test:v452d3` / `npm run test:v452d2` |
| Farm V4.5.2c | **PASS** | TOP 43/47/44; MID 35/35/35; ADC 41/46/46, roaming ADC 0 |
| Freeze parcial V4.5.2c | **PASS regressão / PARTIAL balance** | TOP 16, MID 22, ADC 46; 1 morte TOP, 0 AAs não-letais |
| `npm test` integral | **PASS exit 0** | `docs/QA_EVIDENCE_V452D4_DEV3/npm_test_full.log` |
| Node e navegador syntax | **PASS** | `node --check` para `engine.mjs`, `engine.browser.js`, `app.js` |
| Sincronização browser | **PASS 62 exports** | `python tools/sync_browser_v43.py` |
| TOP corrigido | **ANALYSIS_ONLY / NOT_ACTIVATED** | `docs/QA_EVIDENCE_V452D4_DEV3/top_route_audit.json`; máscara sem classes individuais de corredor |
| 12º ponto Faelight oficial | **FAIL_PARITY** | 11 pontos anotados; 1 inferido espelhado; posição sem máscara certificada |
| Formas oficiais das regiões | **FAIL_PARITY** | Polígonos locais aproximados, sem dados de contorno oficiais |
| Chromium visual | **NOT_CERTIFIED / TIMEOUT** | Processo local interrompido em 23s; sem captura disponível (`chromium.log`) |
| Blender MCP | **NOT_RUN** | Sem validação GLB/colisão externa |
| Fog/ward/skillshots/replay todas as variantes | **PARTIAL / NOT_RUN** | Contratos unitários restritos; dev4 obrigatório |
| Paridade Hexgate e Quimtec 26.21 | **NOT_CERTIFIED** | Números temporais aproximados de canal, recarga, pulso, cura e movimento |
| Multiplayer/privacidade servidor | **NOT_RUN** | Backend não implementado; autoridade offline continua JS |

## Parâmetros de aproximação

- Faelight: +25% raio e 45s região baseados em patch 26.1; contornos criados por 5 pontos direcionais (não extraídos das máscaras) e posição 12 inferida de simetria.
- Hexgate: bloqueio 5s pós-chegada e canalização herdada de 2s, ambos não certificados.
- Floração Quimtec: +15% velocidade por 3s a aliados interceptados (protótipo), alcance/ângulo herdados são aproximações.
- TOP: vértices sobre máscara preto/branco não asseguram faixa central, offsets ou geometria de colisão correta; sem mudança runtime.

## Próximo gate

Substituir Faelight inferido e polígonos aproximados por máscaras autorais explicitamente verificadas, validar todas as 12 regiões sob fog e brush, incluir Scryer's Bloom de 15min/transformação, e executar Chromium funcional / replay 5v5 para seis Rifts sem alterar farm.
