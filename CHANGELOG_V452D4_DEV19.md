# CHANGELOG — CoachLOL Macro Arena V4.5.2d-4-dev19

## Conteúdo entregue

- Auditoria local automática de **14 campeões e 41 itens**, com maturidade explícita, arquivo JSON detalhado e relatório em Markdown.
- Importador de referência do **Data Dragon 16.21.1**, mapeado ao patch PC 26.21, para atributos-base + crescimento por nível 1–18 e preços/stats/receitas de itens SR. O importador não insere conteúdo novo no motor e não inventa comportamento de passivas/ativos.
- Documento de arquitetura para passivas, QWER, **Nidalee/Elise/Shyvana** (formas e recargas) e **Mordekaiser** (Reino da Morte, isolamento de combate, fog e replay).
- Simulador autônomo corrigido no **harness de QA** para responder usando a mesma ação válida do HUD (em vez de cancelar cada reação), sem mudar a engine.
- Testes de 20 min (seeds 26 e 42) e 40 min (seed 26), com resultados/invariantes registrados. **Nenhuma captura de dragão nem Nexus destruído**; são pendências explícitas para dev20.
- Preservados motor da dev18, Golpear D/F, SVGs CC0, Baron, Elder, máscaras e Git herdado.

## Não concluído

- Referência **completa** de todos os campeões/itens Riot: download bloqueado pelo ambiente; importador testado com fixtures de exemplo.
- Disponibilidade jogável de Nidalee, Elise, Shyvana, Mordekaiser: **NÃO**.
- Todas as passivas/QWER/itens/receitas 1:1: **NÃO**.
- Partida autônoma até Nexus com captura de objetivos: **NÃO**.

## Evidência

- `docs/QA_V452D4_DEV19.md`
- `docs/QA_EVIDENCE_V452D4_DEV19/npm_test_full.log`
- `docs/QA_EVIDENCE_V452D4_DEV19/npm_test_long.log`
- `data/coverage_audit_v452d4_dev19.json`
