# QA — CoachLOL Macro Arena V4.5.2d-4-dev2

Data: 26/10/2026. Fonte: `CoachLOL_MacroArena_V452d4_Dev1_Rift_Elemental_Blender_Handoff.zip` e `masks-and-maps(1).zip` do usuário. Status **incremento testado, não release 1:1 certificado**.

## Evidências executadas

| Gate | Estado | Evidência |
|---|---|---|
| Parse motor Node `node --check engine.mjs` | PASS | Exit 0 |
| Parse cliente `node --check app.js` | PASS | Exit 0 |
| Gerador `python tools/sync_browser_v43.py` | PASS | 62 exports; `node --check engine.browser.js` exit 0 |
| 10 novos contratos `npm run test:v452d4:masks` | PASS | 10/10: máscara, gatilho, walls/nav, brush/fog, blast, Quimtec, ward, gates, vento/infernal, Bloom cone |
| Contratos Rift dev1 `npm run test:v452d4` | PASS | 9/9 |
| Contratos Barão/objetivos dev1 `npm run test:v452d` | PASS | 7/7 |
| Almas dev2 `npm run test:v452d2` | PASS | 10/10 |
| Passivos dragões d3A `npm run test:v452d3` | PASS | 10/10 |
| `npm test` integral após 10º teste | **PASS** | Exit 0, cobertura do conjunto herdado + incrementos; log arquivado em `docs/QA_EVIDENCE_V452D4_DEV2/npm_test_full.log` |
| CS farm V4.5.2c seeds 36/451/452 | PASS | TOP 43/47/44, MID 35/35/35, ADC 41/46/46, last hits reais, roam ADC 0 |
| Freeze parcial | PASS (regressão), parcial (balanceamento) | TOP 16 / MID 22 / ADC 46; sem AA não letal; TOP 1 morte |
| Integridade física base | PASS | Máscaras-base não sobrescritas; deltas Montanha 33+123, Oceano 104+18 |
| Versão e mutabilidade Git | PASS | `.git` herdado mantido, nenhum commit; alterações locais preservadas |
| Chromium headless visual | **NOT_CERTIFIED / TIMEOUT** | Comando de screenshot excedeu 35s; sem imagem de comprovação de UI |
| Testes de máscara TOP revisada no gameplay | **NOT_RUN** | Arquivo conservado e não aplicado para preservar benchmark |
| Blender MCP interativo, GLB e cena final | **NOT_RUN** | Export de dados autorais feito; conexão/remodelagem de Blender não executada |
| Forma completa das 12 áreas Faelight | **FAIL_PARITY** | 11 pontos encontrados, 12 esperados para conjunto da temporada; raios de visão extrapolados |
| Paridade 1:1 de números/colisões/portais Quimtec, Elder, Barão | **NOT_CERTIFIED** | Alguns valores protótipos e sistemas de objetivos d3-B/C pendentes |
| QA de adversários e multiplayer | **NOT_RUN** | Arquitetura multiplayer futura; não afirmar isolamento do estado privado no servidor inexistente |

## Gatilho de mapa e valores parciais

Rift comum: depois de duas capturas, o terceiro dragão surge em um mapa elemental, sem novas alterações durante a partida. Swiftplay: após primeira captura. Infernal mantém máscaras de colisão/brush idênticas à base, apenas tint vermelho sutil. Montanha e Oceano têm valores de pixels registrados na árvore; contornos visuais 4096 renderizados das imagens do usuário.

Faelights: +25% de raio de ward (ponto especial) e visão bônus por 45 segundos; contorno circular aproximado, faltando forma específica e 1 ponto. Frutas Quimtec: 10% maxHP + 5% shield **aproximação**, não fórmula LoL; Bloom cone ~0.13 unidades/12s **aproximação**, sentinelas atingidas reduzem para 1 HP. Hexgate canaliza 2s simulados **valor sujeito a auditoria**; vento aprox. +20%; explosão salto base 0.052 espaço relativo com configuração Quimtec 2×. Nenhum número é certificado 1:1.

## Próximos testes obrigatórios

Testar máscaras no Blender com mesmos IDs e coordenadas, para cada transformação em posição real: fog/ward/brush, transição com campeões sobre nova parede, skillshots colidindo nas paredes, portal com CC e simultaneidade, múltiplos inimigos no cone, compra/recarga, snapshots e replays; executar Chromium via ferramenta visual confiável. Testar nova máscara TOP com regressão de 5 minutos antes de ativar.

Referências patch da Riot no material `docs/COACHLOL_RIFT_ELEMENTAL_26_21_REFERENCIAS.md`. As máscaras são do usuário e devem ser validadas artisticamente e quanto à licença para distribuição pública.
