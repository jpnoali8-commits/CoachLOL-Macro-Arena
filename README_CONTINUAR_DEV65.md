# CoachLOL Macro Arena — CONTINUE AQUI V4.5.3-dev65

**Base canônica: este ZIP mestre dev65**. Nunca substitua engine, máscaras, assets ou `.git` por versões históricas. Preserve todos os testes e documentação.

A dev65 habilitou `order.combo` para ataque durante o planejamento PvP, exclusivo do campeão ativo no cliente (grupos mantêm movimento). O gateway faz autenticação por sessão/equipe, valida alvo visível, ranks e feitiços equipados e só então enfileira no motor. O executor processa as etapas gradualmente, gastando recursos e cooldowns; o outro jogador pode reagir após impacto. TESTE: `npm run test:v453:dev65` (28/28) e `python tools/chromium_pvp_dev65_planning.py` (13/13 offline DOM); `npm test` executa suíte completa.

Limites: somente sequência Q→Ignite testada E2E nas duas direções; kits completos e efeitos de todos os itens não certificados; browser-native HTTP/SSE no Chromium não certificado; jogador humano completo até Nexus não certificado. Nenhum item de referência promovido. Consulte `QA_V453_DEV65.md`, `ROADMAP_V453_DEV65.md` e `MEMORIA_CONTINUIDADE_V453_DEV65.md`.
