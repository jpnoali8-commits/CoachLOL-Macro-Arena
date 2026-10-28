# CoachLOL Macro Arena V4.5.2 — Offline

**Base oficial:** V4.5.1, sem regressão de versões antigas. Abra `index.html` em um navegador desktop recente. Para desenvolvimento: `npm run test:v452`, `npm test` (falha legada de farm conhecida) e `python tools/sync_browser_v43.py`.

Os novos contratos V4.5.2 cobrem buffs, draft e Ghost, sem certificar paridade 1:1. Consulte `docs/ROADMAP_CANONICO_V452.md`, `docs/AUDITORIA_V452_ENGENHARIA.md` e `docs/QA_SUMMARY_V452.md`.

---

## Histórico
# CoachLOL Macro Arena V4.5.1 — Offline

**Base:** V4.5.0 (sem regressão de versões antigas). Abra `index.html` num navegador desktop recente. Para desenvolvedores: `npm run test:v451`, `npm test` e `python tools/sync_browser_v43.py` antes de empacotar.

Esta versão adiciona o ciclo dos inibidores/superminions, as duas torres do Nexus com respawn, ondas de 2026, controle de push/freeze, corrigindo a seleção por Shift, dano de múltiplos campeões e uso parcial de habilidades para limpar waves. Os kits completos, builds/runas e interações 1:1 ainda não estão disponíveis.

Documentação oficial: `CHANGELOG_V451.md`, `docs/ROADMAP_CANONICO_V451.md`, `docs/AUDITORIA_V451_ENGENHARIA.md`, `data/content_coverage_v451.json`. O registro de cobertura lista sistemas presentes e pendências auditadas.

## Trabalho paralelo V4.5.3-dev69 — três chats

**Estado de desenvolvimento: SOURCE_READY (código e testes textuais). Estado de release: RELEASE_BLOCKED (assets binários e histórico antigo ainda pendentes).**

- [Status verificável / QA](docs/parallel/STATUS_DEV69.md) · [QA da importação](docs/parallel/QA_IMPORT_SOURCE_ONLY.md)
- [Chat 1 — Skills](docs/parallel/CHAT_1_SKILLS.md) → branch `dev69/skills` · [Issue #2](../../issues/2)
- [Chat 2 — Itens](docs/parallel/CHAT_2_ITENS.md) → branch `dev69/items` · [Issue #3](../../issues/3)
- [Chat 3 — Integração](docs/parallel/CHAT_3_INTEGRACAO.md) → branch `dev69/integration` · [Issue #4](../../issues/4)
- [Matriz de propriedade](docs/parallel/ESCOPO_E_CONFLITOS.md) · [Merge/QA](docs/parallel/FLUXO_DE_PR_E_QA.md) · [Handoff](docs/parallel/MODELO_HANDOFF.md)
- [Issue #1: importar assets + resolver histórico Git antes de promover main](../../issues/1)

A base textual (1.624 arquivos) foi importada e testada isoladamente; o clone completo com imagens e todo o histórico antigo **ainda não está certificado**. Não confundir esta branch de trabalho com o ZIP mestre integral do jogo.
