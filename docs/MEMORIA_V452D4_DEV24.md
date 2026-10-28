# Memória — V4.5.2d-4-dev24

A única base agora é o ZIP **dev24**, produzido a partir da dev23 completa. A dev24 adiciona **harness de auditoria de duração com cinco elencos**, sem mutações no motor (`engine.mjs` e `engine.browser.js` inalterados). `npm test` integral PASS e 5/5 novos contratos PASS.

Meta de design: **30min médios**; vitórias apenas por destruição natural do Nexus, nunca por timer. Dev23: cinco seeds do draft padrão, todas concluídas, média 28:07. Dev24: dez testes de cinco elencos (seeds 26/36), sete Nexus naturais com média condicional de 23:12 e três **censurados por tempo real do teste**, os quais não entram como duração final. Não proclamar balanceamento multi-draft de 30min.

Novos caminhos: `data/pacing_drafts_v452d4_dev24.json`, `tools/pacing_match_v452d4_dev24.mjs`, `tools/audit_pacing_v452d4_dev24.py`, `tests/v452d4_dev24_pacing_compositions.test.mjs`, `docs/QA_EVIDENCE_V452D4_DEV24/`.

Precisamos de profiling para A* e waves densas, validação de kits/atributos de campeões e auditoria estatística 30–50 cenários antes de mudanças globais em progressão. Não modificar farm V4.5.2c, itens, Smite/Herald ou máscaras em tentativa de forçar média de 30m.
