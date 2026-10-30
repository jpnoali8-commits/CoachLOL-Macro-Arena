# M45 B02 — Chat 2 / Skills S05: reconciliação V42 e executores legados

**Data:** 2026-10-30 · **MODE:** MIGRATION_ONLY · **Sem merge/rebase/force-push**

## Fontes reais

- Branch de skills: `dev69/skills-batch2` @ `f0b1147ac46e585a1d5374a178b1ea462f5dc278`, somente leitura, PR #9 Draft preservado.
- `engine.mjs`: Git blob `41679f7328a42e379fdfb8de5b92006e1bfb529f`, não alterado.
- Branch exclusiva Chat 2: `dev69/m45-audit-skills`.
- Visibilidade do repositório GitHub: **public** confirmada pelo conector GitHub neste turno; no terminal local `git ls-remote` ainda falha por DNS `Could not resolve host: github.com`.

## Descoberta crítica — scanner anterior omitia primeiro campeão V42

Em `CHAMPION_KITS_V42`, o scanner S03/S04 pulou a primeira entrada, **Ezreal**, e deixou seus P/W/E sem evidência de catálogo. A revisão manual/programática dos sete blocos de fonte reconstruiu **35 descritores P/Q/W/E/R**: Ezreal, Irelia, Nami, Lux, Vex, Jinx e Ahri.

- **5 descritores Ezreal** recuperados (P/Q/W/E/R), com SHA e linhas da fonte.
- **25 caminhos de execução/hook** encontrados, incluindo Ezreal P/W/E/R, Irelia P/W/R, Nami P/E, Lux P/W/E, Vex P/Q/W/E/R, Jinx P/Q/E/R e Ahri P/Q/W/R.
- **22 slots** promovidos de `absent` ou `reference-only` para `partial` após evidência de executor/hook; nenhum promovido a `implemented` por mera presença de função.
- Status estático após S05: **234 implemented, 365 partial, 1 reference-only, 265 absent**, somando 865 P/Q/W/E/R. São classificações de fonte, NÃO certificação LoL PvP nem Rust.
- 27 overlaps de registro distintos da S04 preservados. Ao incorporar 25 rotas de handlers e os cinco descritores Ezreal omitidos, o campo `duplicate_slots` fica **50 linhas com mais de uma evidência**, não 50 competições de execução! Não substituir silenciosamente a definição efetiva.
- A única entrada `reference-only` remanescente neste conjunto de matriz é Nami Q. Precisa de auditoria do caminho de execução (há kit V42) sem inferir completude apenas pelo nome.

## Entregas

- `S05_V42_HANDLER_RECONCILIATION.json` — 35 registros catálogo, 25 handlers, SHA original, linha, 7 testes candidatos e mudanças de classificação.
- `inventory_slots.json` v4 — 865 entradas atualizadas, variantes preservadas, status Rust `SOURCE_ONLY`.
- `golden_plan.json` — **19 suítes** pinadas por SHA/seed/ambos assentos, adicionando M1–M7 e `skills_batch2` (8 novas).
- `S05_STATIC_QA_RECEIPT.json` — 14 verificações estáticas **PASS**, 8/8 novas suítes com SHA e cenário bilateral/marker de sucesso conferidos na origem.
- `run_golden.mjs` já acompanha o manifest e aceita as 19 suítes sem alterar a engine.

## QA executado e bloqueado

- **STATIC PASS**: 865 IDs exclusivos, os 35 descritores, 25 hooks, 22 reclassificações, fonte original congelada, status sem promoção indevida, 19 testes listados, validação específica das oito fontes novas.
- **Node gameplay goldens 0/19: NOT_RUN**. Fonte pública acessível pelo conector, mas checkout do terminal ainda sem DNS. Não há hashes reais before/after capturados.
- **Rust native / WASM / browser / rede real: NOT_RUN**. Dependência dos contratos B16–B19 para portar executores.
- **G0 PARTIAL; G6 NOT_RUN; G8 NOT_CERTIFIED**.

## Para Chat 1

Incorporar na matriz central a distinção `registry_descriptor` vs `standalone_handler`, não tratar quantidade de linhas multivariantes como duplicatas de gameplay. Preservar ownership e projéteis/marks/recarga/CC de Ezreal, Irelia, Nami, Lux, Vex, Jinx, Ahri. **Não mover produção para Rust antes dos contratos de core-combat e core-champions, e jamais descartar código por status `absent` sem varredura dos executores alternativos.** Este Chat 2 não atualizou `STATUS_LEDGER.md` central.

## Próxima prioridade S06

1. Rodar `node docs/m45_rust_wasm/inputs/skills/run_golden.mjs --verify-only` e depois `node docs/m45_rust_wasm/inputs/skills/run_golden.mjs` num checkout efetivo, versionando recibos só após execução real.
2. Reconciliar explicitamente `Nami.Q` no `resolveKitSkillsV42` e demais skills handler-only sem registro, priorizando `absent` e `reference-only` por símbolo SHA.
3. Capturar fixtures before/action/after, clock, evento, perspective blue/red, checksumV40 e diferenças da fila para 19 suítes e ampliar cobertura para os executores M14–M44 restantes.
4. Migrar para Rust apenas executores legados elegíveis após publicação de contratos compartilhados B16–B19.

**Rollback:** reverter apenas commits desta branch independente. Nenhum arquivo da engine, browser, ledger central, PR #9 ou PR #19 foi modificado neste sublote.
