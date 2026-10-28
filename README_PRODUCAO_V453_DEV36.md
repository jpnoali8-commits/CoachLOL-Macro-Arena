# CoachLOL — Produção V4.5.3-dev36

Abrir `index.html` para o jogo offline. Em **Loja de itens**, escolher **Consultar os 863 itens oficiais do patch 26.21** para abrir `catalogo_riot_26_21.html` com pesquisa, receitas e elegibilidade. Os itens de referência **não podem ser comprados** até implementação de seus efeitos. O visualizador funciona com o `.js` gerado; imagens remotas podem não aparecer offline.

Fonte estática da Riot, dados completos do coletor do usuário: `data/riot_reference/source_16_21_1/`. Para reconciliação: `docs/QA_EVIDENCE_V453_DEV36/catalog_audit_26_21.json`. Verificações: `npm run test:v453:dev36`, `npm test`, `python tests/browser_v453_dev36_catalog.py`.

**Importante:** cifras-base do motor não foram alteradas; o catálogo de consulta não constitui a atualização automática de LoL. A fonte CommunityDragon `latest` não é garantidamente idêntica ao patch fixado; as habilidades Q/W/E/R armazenadas são textos e valores de referência, não um motor funcional por campeão.
