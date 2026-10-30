# M45 B02B-I04 — real gateway/UI skill routes, 18 V8 fixtures, no Actions

**2026-10-30** · PR #19 Draft · **Rust HEAD baseline:** `5afd330f260c7a0b1984521732e117dfcd81396f`. Origem skills congelada `f0b1147ac46e585a1d5374a178b1ea462f5dc278`, engine Git blob `41679f7328a42e379fdfb8de5b92006e1bfb529f`.

## Engine/gateway original executado (V8), duas equipes × 5 unidades

Componentes do **mesmo SHA skills**: gateway dev44 blob `4be23bdd9df6d9918a0c32b6ea699be8974bf9de`, dev47 `adf6900a20b1b2c162ec9769b18bf1cc2c23867f`, cliente PvP `e6eb9af2f6ec84204d47eedcbcc67797748b6cff`, servidor `61f9d941852b6378bccccf8956aa699e8761836d`. Fonte enviada via conector, eval em V8 após remover só invólucros import/export, `structuredClone` JSON shim; fog e permissões de duelo forçados para permitir medir roteamento. **Não executamos processo HTTP nem Node ESM completo**.

- **14/14 invocações de rota gateway sem exceções**, source-pinned. Nami W `skill.targeted` aceita para azul/vermelho: dois ACK e mana 1000→930, heal 400→515. Nami W `skill.ground`, `skill.directional`, `skill.self` rejeita em ambos lados: **6 negativas**. Ahri E via `skill.ground`, `skill.directional`, `skill.targeted` rejeita azul/vermelho: **6 negativas**, apesar de autoral `abilityRule('Ahri','E')=board_effect` executável via board interna segundo S11. Todas negativas mantêm mana, HP, checkpoints e pending intactos; todos retry idempotentes de sequência 1 retornaram ACK idêntico. **Essas negativas caracterizam bugs/falta de wire, não funcionalidade PASS.**
- **4/4 combos** (azul/vermelho × targeted→order.combo ou vice-versa) aceitos. `resolveCombat()` cobra W uma vez (1000→930), cancela targeted pendente; segundo `resolveCombat()` em t=10.25 não cobra outra W (930). Ordem attack persiste e pode provocar efeitos de combate adicionais; nenhuma inferência de segurança para todos combos nem para UI real. O BUG interno da Nami W de B02B-I03 continua comprovado **somente em chamadas diretas a duas filas** (4/4).
- Payload completo do QA real `docs/m45_rust_wasm/inputs/core/b02b/B02B_GATEWAY_KIT_V8_EXECUTED.json` Git blob **`30375b17c600b65eef953988f149c6408c588da1`**. Validador puro `validate_gateway_kit_evidence.mjs` blob `ed61250ff7029150e7b2f159a6238d5517c5243a`: **PASS**, adulteração de ACK Ahri E **REJEITADA**. Testes Node `m45_b02b_gateway_kit_receipt.test.mjs` somente preparados, **NOT_RUN**.

## Descoberta de cobertura da API / interface

- Motor original: `BOARD_KITS_V453_DEV69` contém **30 campeões**; `M44_B13A_KITS_V453` contém **14 autorais**, todos ausentes do **catálogo antigo `BOARD_KITS`** (não há overlap). O endpoint `/api/kits` da fonte skills usa `Object.entries(BOARD_KITS_V453_DEV69)` na propriedade `kits`; **não une ali** os 14 autores. Existem propriedades alternativas `specials/formKits/entityKits/mechanicKits`, logo **não declarar 14 campeões completamente invisíveis**, apenas não representados em `kits`.
- Cliente `selectedBoardRuleV453` lê `boardKitsV453`/formas; alvo por botão usa exclusivamente `target_enemy` e `target_ally`, não `target_any` da Nami W; demais shapes entram em `skill.ground` ou `skill.directional` sem resolver Ahri E. `/api/kits` real HTTP e dois navegadores NOT_RUN.
- Fonte do catálogo em `B02B_CLIENT_KIT_SOURCE_DISCOVERY.json` blob **`4dec9b0da3e40252b1929217f87455652fa05ff8`**. Contrato Rust `B02B_SKILL_WIRE_RUST_CONTRACT.json` blob **`a049f91f318e1961931d87716bcd8fca79515f5b`**, **design only**, exige unificar registry autoral/forma, servir DTO seguro, rotas typed de spell, estado de arbiter única intenção, efeitos e recibos idempotentes; nenhuma engine Rust de combate implementada.

## Preservar fatos e gates

- Especialista Skills S10: 26 suítes planejas, **22 V8 PASS, 2 V8 FAIL** (Ahri E misroute, Ashe R golden instantâneo obsoleto) e 2 NOT_RUN (dependências Node/HTTP). **0/26 suites Node originais completas**; S11 comprovou trajetória temporal de Ashe R em V8, não corrigiu o kit em Rust.
- G0 PARTIAL, G1 PARTIAL (somente `core-state` Rust/WASM anterior), G2–G6 NOT_RUN motor Rust, G7 BLOCKED, G8 NOT_RUN. B02B IN_PROGRESS, B03 QUEUED. Nunca substituir lacunas por fallback genérico.
- Nenhuma Action iniciada, nenhum workflow/gatilho modificado. Confirmar PR legacy 3 jobs `skipped` após commit, sem merge/rebase/force. Rollback por revert do commit da branch Rust.
