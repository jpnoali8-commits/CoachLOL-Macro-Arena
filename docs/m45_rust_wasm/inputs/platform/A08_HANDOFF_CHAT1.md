# M45 Chat 4 → Chat 1 — PLATFORM-A08 (client sequence race / session epoch)

**2026-10-30.** Integration `374d87d5f49b52514ec68bbe666df086363c1ec5`; client `43f42ef9e9022db8aa3cb96a299e8ed69d8522f3`, engine `1737f4f675bd9cc5ed0a48defc68b2fddc124d71`, room `3bdb8cd3b737d20e3700e994a8872943e53366ae`. HEAD do core Rust consultado `c8e8f182b87d720619fe5747076b8221413acde7`.

## Confirmação executada de bug real do cliente legado

No client: `render(v)` atualiza `sequence=Math.max(sequence,v.nextSequence||1)`, enquanto `send()` executa `sequence++` após HTTP ACK. Uma transmissão SSE antes do ACK causa 1 → 2 → 3 sem a sequência 2 ser usada; gateway autoritativo responde `sequencia_fora_de_ordem` ao comando seguinte. **Reproduzido** com `send/render` originais e Arena+gateway+Room integrais em V8. Não é end-to-end de navegador.

Outras reproduções: ACK perdido seguido de pacote diferente reutilizando a mesma sequence -> conflito; trocar sala mantém sequence e lastRevision da sala anterior, causando gap ou ignorando SSE boot. Comportamentos positivos: networkLock enfileira ações, replay manual de pacote idêntico recupera ACK, revisão antiga na mesma sala é descartada.

## Artefatos na branch `dev69/m45-audit-platform`

- `tests/m45_platform_a08_client_sequence_races.test.mjs` — **8/8 PASS V8 isolado com métodos e classes originais**, preparado para Node de checkout (**Node full NOT_RUN**).
- `tests/m45_platform_a08_sequence_reference.mjs` + `.test.mjs` — **8/8 PASS Node v22.16.0, exit 0**, referência normativa apenas QA; mesmos Git blob SHAs confirmados entre container e connector.
- `A08_PROTOCOL_EPOCH_SEQUENCE_VECTORS.json` — 12 vetores de legado vs requisito Rust, proveniência e atributos de protocolo.
- `A08_REPORT.md` — evidência, limites e comando de execução.
- `tools/m45_platform_a08_qa.sh` — runner em checkout completo (NOT_RUN).

## Entregas exigidas do core-protocol/game-server / browser adapter

1. `SessionEpoch(roomId,authenticatedSeat,generation)`: reset de `lastRevision/nextSequence` e invalidação de ACK/SSE atrasados ao trocar sala.
2. Cliente mantém comando **imutável in-flight**, serializa por jogador, e processa `ACK` **uma vez**. SSE `nextSequence` durante in-flight NÃO incrementa novamente. Depois de ACK, `next=max(ack.seq+1,snapshot.nextSequence)`.
3. Reenviar o mesmo `request_id` e payload ao perder ACK; o servidor persiste receipts por match+seat+round antes do broadcast, incluindo after seal/restart. Não assumir que retry do `ready` é idempotente no legado.
4. Fog default-deny/allowlist em todos os snapshots/SSE/replay (P0 anteriores) e no reply. Dois humanos × cinco campeões, posse do lado azul/vermelho derivada da conexão.

**Status:** 8/8 V8 legado + 8/8 Node referência QA; HTTP/browser/Rust nativo/WASM **NOT_RUN** nesta operação; G4 NOT_CERTIFIED. Nenhum merge, alteração de JS de produção ou update no ledger do Chat 1.

Próxima: executar suite A08 no checkout completo e portar as transições para tipos Rust genuínos ao liberar B04/B06.
