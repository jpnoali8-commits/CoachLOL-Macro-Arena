# Memória de continuidade — V4.5.2d-4-dev11

## Fonte atual de verdade
- Usar **este** diretório/ZIP para o próximo marco. Passados dev10/dev9 são históricos.
- `engine.mjs` motor determinístico; `engine.browser.js` gerado por `python tools/sync_browser_v43.py` (66 exports).
- Cada campeão possui `summonerSlots: [D,F]`. Validação de feitiços central: `hasSummonerV452d4Dev11`. Ingestão de draft: `draft.summonerSlots[team][role]`.
- Jungle precisa Golpear no D ou F, independente da escolha de segundo feitiço. A tecla vem do slot, inclusive durante o overlay.
- `summonerSpell`, `smiteKey` e `smiteKeys` mantidos para compatibilidade com testes/histórico, não usar como fonte principal para novas features.
- Capturas visuais são arquivos reais Chromium controlados; nunca substituí-las por imagens ilustrativas.
- Overlay 16:9 com media stage `smiteContestMediaStage`, HP numérico real e stage `smiteContestVideo`; preparar vídeos MP4/WebM quando disponíveis. GLB ainda requer renderer, fallback disponível.
- 12 Faelights 8+4 e Scryer's Bloom provisórios herdados e intactos.
- Regressão e QA preservados, sem reset, clean ou commit de alterações herdadas.

## Próximo marco
- Auditoria da seleção D/F no fluxo end-to-end por diferentes funções, replay e hotseat; ampliar validade de cooldown de feitiços em filas/combos.
- Simulação orgânica objetiva 5v5; refinar individualmente Barão d3-B e Ancião d3-C; máscaras Florividentes após upload do usuário.
