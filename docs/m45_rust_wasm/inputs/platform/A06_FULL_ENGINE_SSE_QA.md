# M45 PLATFORM-A06 — QA legado de Arena inteira e SSE

**Data:** 2026-10-30. **Fonte:** `dev69/integration@374d87d5f49b52514ec68bbe666df086363c1ec5`. **Branch exclusiva:** `dev69/m45-audit-platform`. Rust HEAD observado: `7635edfb1558b20d5c7bf2e876b18b962e4b8738`.

## Execução funcional nova (10/10 PASS, V8 isolado)

O **código completo**, e não apenas funções recortadas, foi carregado pelo conector GitHub a partir dos Git blobs imutáveis:
- engine.mjs `1737f4f675bd9cc5ed0a48defc68b2fddc124d71`
- authoritative_actions_v453_dev44.mjs `b2ebb58248c8aec9aee0a64c354150757cd71a4a`
- authoritative_actions_v453_dev47.mjs `adf6900a20b1b2c162ec9769b18bf1cc2c23867f`
- room_v453_dev47.mjs `3bdb8cd3b737d20e3700e994a8872943e53366ae`
- coachlol_map_v6.json `ad853bbb6f110c0d2b6b8b4995ac4e80169f7109`
- masks_128.json `ecddcee76f3bce20a483ff7545ce2231696270e2`
- rift_user_manifest_v452d4.json `698f86922a5bf8c8699a306bab097cd2ca3743e5`.

O corpo exato do teste publicado `tests/m45_platform_a06_full_arena_pvp_golden.test.mjs` foi executado em V8 isolado. As definições `import/export` foram retiradas somente para ligar os módulos, e o `structuredClone` do gateway foi substituído por clonagem JSON de payloads simples no isolate. A Arena, Gateway, Room, playTurn, snapshotV40, fromSnapshotV40 e advance são implementações reais do legado. Dois jogadores de fixture foram criados por `restored.players`, não pela API de rede.

Casos PASS: (1) 2 humanos × 5 campeões; (2) fog bilateral; (3) 10 comandos reais, cinco por jogador; (4) owner ACL e sequence gaps; (5) 10 replays idempotentes e tentativa de conflito; (6) primeira confirmação não inicia partida; (7) restaurar checkpoint parcialmente confirmado; (8) segunda confirmação inicia a execução real; (9) restaurar durante execução, com RNG privado no checkpoint e recibos preservados; (10) um tick autoritativo com comandos posteriores bloqueados.

**Limite:** isso é V8 isolado usando o motor completo, NÃO `node` de um checkout, NÃO HTTP/SSE real, NOT cookie/FS/2-browser, NOT Rust/WASM. Os problemas anteriores de evento anônimo e ready idempotente persistem no JS.

## Execução Node 22 real (5/5 PASS)

A02 tinha um teste SSE que lia só o primeiro chunk e presumia `event: state`. O servidor manda primeiro `: connected`. Foram executados com **Node v22.16.0 local e exit 0** os 5 testes de `m45_platform_a06_sse_state_reader.test.mjs`: comentário em chunk separado, CRLF fragmentado/heartbeat, non-state antes do state, EOF sem state e estouro de tamanho. Publicado helper `m45_platform_a06_sse_state_reader.mjs`. A02 atualizado para ler até um evento state completo e interromper após 7 segundos.

O HTTP real do servidor legado segue **NOT_RUN** por indisponibilidade de checkout (DNS git github.com não resolve neste ambiente).

## Próximo QA e gates

```bash
node tests/m45_platform_a06_sse_state_reader.test.mjs
node tests/m45_platform_a06_full_arena_pvp_golden.test.mjs
node tests/m45_platform_a02_network_security.test.mjs
node tests/m45_platform_a03_reconnect_receipts.test.mjs
```

G0 PARTIAL; G1 BLOCKED_TOOLCHAIN; G2/G3 RUST_NOT_RUN (G3 legado inseguro nos eventos A03–A05); G4 NOT_RUN; G7 BLOCKED (78 assets); G8 NOT_RUN. Nenhuma branch original, engine JS ou ledger central foi alterada. Próxima prioridade A07: HTTP/SSE e checkpoint em disco em checkout autorizado, comparação com Rust B04/B06 depois do contrato central.
