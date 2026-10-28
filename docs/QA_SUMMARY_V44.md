# QA V4.4 — 26/10/2026

- **Novos contratos V4.4:** 11/11 aprovados em `node tests/v44_jungle_objectives_teamfights.test.mjs`.
- **Regressão histórica:** 28 scripts revisados em execução paralela; na primeira passada, 26 aprovados e os testes v19/v37 falharam por fixtures antigos que tentavam lançar Golpear remotamente. Corrigido **somente o posicionamento de preparo**; ambos foram reexecutados e aprovados sem remoção de asserções. Uma segunda reexecução integral não terminou no ambiente devido a timeout da ferramenta; não a classificamos como teste concluído.
- **Caminhos sensíveis:** alcance 500, disputa simultânea, cast de Smite enquanto AA está indisponível, fog, snapshot compatível e teamfight agregado foram cobertos nos 11 contratos.
- **Smoke de código:** `node --check engine.mjs`, `engine.browser.js` e `app.js` aprovados. Sincronização Node/browser verificada em teste.
- **Stress:** `node tests/v20_long_match.mjs 300 44` sem invariantes violadas; isso não prova toda a partida até Nexus.
- **Chromium/UI:** o Chromium headless do ambiente não concluiu a inicialização dentro do limite disponível nesta execução. Código da UI analisado/sintaticamente válido; conferir manualmente a renderização de Vastilarvas, Arauto e cabeçalho 4 objetivos no Windows antes de publicar.
- **Artefato:** ZIP gerado sobre V4.3, CRC verificado após criação. Os arquivos da base foram preservados exceto mudanças deliberadas e documentos de versão.

Limite: sem 1:1 completo de buffs, kits, Arauto invocado, condições completas de vitória e multiplayer seguro. Consulte auditoria e roadmap.
