# CoachLOL V4.5.3-dev34 — Patch futuro sem regressão de combate

**Base:** V4.5.3-dev33; **patch ativo:** 26.21; **Data Dragon:** 16.21.1; **futuro 26.22:** planejado para 04/11/2026, não lançado em 27/10/2026.

## Implementado
- `tools/patch_release_v453_dev34.mjs`: pré-verificação de lançamento oficial, avaliação de receita/ingredientes/ciclos, integridade SHA-256 de arquivos `item.json`, `champion.json` **e detalhes Q/W/E/R de todos os campeões**, decisões de revisão com evidência/testes por mudança, exigência dos gates de QA e relatório de prontidão.
- `tools/check_riot_patch_v453_dev33.mjs`: versões antecipadas são marcadas **previewOnly**; arquivos obtidos antes do lançamento são destinados a `previews/`, não a `incoming/`. Estar no `versions.json` não comprova o lançamento.
- `tools/patch_center_v453_dev33.mjs`: manifestos de hashes para detalhes dos campeões ao gerar snapshots versionados.
- `data/patch_center/current.json`: calendário de 26.22/26.23/26.24; política de duração flexível.
- Teste reproduzível `tests/v453_dev34_future_patch_gates.test.mjs` com **20 contratos**.

## Preservado e não implementado nesta etapa
- Motor `engine.mjs`, `engine.browser.js` e `app.js` **byte a byte idênticos** à dev33.
- Loja de 67 itens locais, compra de componentes na árvore de receitas, passivas/ativáveis existentes e overlay competitivo preservados.
- **Não** foi obtido o payload completo oficial; **não** houve ativação do 26.22; **não** foram implementadas habilidades inéditas nem a R de Mordekaiser.
- Nenhuma regra de dano, HP, ouro ou bot sofreu ajuste; não há temporizador para forçar a vitória.

## Resultado
`npm test`: PASS, com 20/20 contratos dev34. Três partidas naturais reproduzidas com hash idêntico à base dev33. A média desta amostra pequena é **24:41**, aceitável como observação sem alterar o balanceamento somente pelo relógio.
