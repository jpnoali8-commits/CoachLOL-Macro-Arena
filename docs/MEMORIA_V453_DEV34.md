# Memória de continuidade — Dev34

**Base exata:** `4.5.3-dev34`; estado anterior: dev33. **Patch LoL ativo:** 26.21. **Data Dragon:** 16.21.1 como referência, não cobertura completa.

- Central de Patches tem validação adicional em `tools/patch_release_v453_dev34.mjs`; 20 novos testes. `npm test` integral PASS. Preview 26.22 não ativa o motor.
- Snapshot completo futuro exige todos os `champion/<id>.json`, hashes SHA para cada arquivo, ingredientes sem lacunas/ciclos e revisão por modificação.
- `engine.mjs`, `engine.browser.js`, `app.js` iguais byte a byte à dev33; 3/3 simulações (seeds 26,36,42) com vencedor, duração e hash idênticos.
- **A média de 30 minutos é indicativa; pouco abaixo é permitido**. Jamais encerrar por cronômetro.
- Fonte de versões: Riot Data Dragon; notas oficiais de patch e hotfixes; futuro 26.22 04/11, 26.23 18/11, 26.24 09/12 (datas previstas).
- **67 itens locais**. Catálogo integral e passivas/ativos 1:1 ainda pendentes; a loja permite compra direta de componentes internos nas receitas.
- **Mordekaiser (V4.5.4):** isolamento 1v1 real com cópia da topologia original (paredes, brushes, modificações elementais), HUD QUADRADO no canto superior esquerdo, CÍRCULO interno de limites e colisão, fechar automaticamente no fim; overlay Mordekaiser e Smite sempre no topo da UI.
- Próximo Dev35: obter o arquivo completo oficial quando a rede permitir, guardar versões imutáveis, auditar lote de itens com seus efeitos reais, manter recursão de receita e testes de duração.
- Nunca tratar catálogo só com ícones/descriptions como paridade de motor. Não atualizar `current.json.activePatch` só por um feed de versões.
