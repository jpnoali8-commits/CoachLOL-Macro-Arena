# CoachLOL Macro Arena — M45 / Chat 3 — B02B-ITEMS Lote 11

**Data:** 2026-10-30. **Escrita exclusiva:** `dev69/m45-audit-items`.  
**Resultado:** **38/38 SOURCE JS/V8 PASS**, com **38/38 repetições idênticas**. São **19 tipos de cenário × azul/vermelho**: 24 verificações de gateway e 14 de sala PvP. **Node ESM NOT_RUN; HTTP/SSE NOT_RUN; Rust/WASM NOT_RUN; G8 NOT_CERTIFIED.**

## Fonte real auditada
- Engine JS: `engine.mjs` blob `e06cfe0c18ded3d21f7a1d9bc62909543ccbbb6d`.
- Gateway dev44: `multiplayer/authoritative_actions_v453_dev44.mjs` blob `b2ebb58248c8aec9aee0a64c354150757cd71a4a`.
- Gateway dev47: `multiplayer/authoritative_actions_v453_dev47.mjs` blob `adf6900a20b1b2c162ec9769b18bf1cc2c23867f`.
- Sala dev47: `multiplayer/room_v453_dev47.mjs` blob `3bdb8cd3b737d20e3700e994a8872943e53366ae`.
- Fonte histórica congelada: `dev69/items-batch2@182e592fc27cc9516cf6d52ef2fabc17ee1e1b7d`.

**Escopo exato do V8:** avaliadas as classes reais de sala e gateway após remover exclusivamente imports/exports ESM e injetar dependências. O motor Arena e os dados de mapa são da fonte original. APIs exclusivas do Node (`randomBytes`, `createHash`, filesystem) foram substituídas apenas por **shims determinísticos** para permitir execução isolada; **isso NÃO testa resistência criptográfica, segurança de cookies, API HTTP/SSE ou durabilidade física de checkpoints**.

## Casos e resultados
- **24 gateway PASS:** compra com a mesma seat controlando todos os 5 campeões (JG adquire primeiro pet da selva), proibição de controlar inimigos, replay do ACK e sequência após snapshot, colisão de bytes com mesmo sequence e `unitId` distinto, rejeição de salto de sequência, dois assentos independentes, rejeição de `team`/ouro injetados, rejeição sem consumir sequência, redaction de inventários/informações ocultas, persistência de intenção privada após restauração.
- **14 room PASS:** projeção de fonte e Undo restrita aos cinco campeões do dono, retry aceito depois de `ready` sem duplicar efeitos, novo comando bloqueado depois de ready, lock de ready persistente no checkpoint, ACK preservado depois do restore da sala, decisão de reação só para o defensor, separação entre checkpoint interno e projeção pública, vista mutável do cliente não afeta estado autoritativo.
- **Determinismo:** execução independente reproduziu os 38 registros completos sem divergências; checksums V40 antes/depois em todos os cenários e pontos de restauração relevantes.

### Correção na fixture durante o desenvolvimento
O primeiro preflight reportou 36/38 porque o teste tentava comprar botas para JG antes de seu pet inicial. Foi corrigida **apenas a fixture** para comprar `jungle_gustwalker` antes de `boots`. Reexecução final: **38/38 PASS**. Nenhuma regra do motor foi alterada.

## Artefatos
- `pvp_replay_boundary_b11_cases.mjs`: 19 cenários, executáveis em Node ou V8.
- `golden_b11_pvp_replay_boundary.test.mjs`: Node ESM com source lock e 38 asserts de cenário. **Não executado**.
- `QA_V8_PVP_REPLAY_BOUNDARY_B11.json`: recibo completo da execução fonte V8 e repetição.
- `PVP_REPLAY_RUST_CONTRACT_B11.json`: invariantes para Rust e separação de autoridade/privacidade.
- `run_items_goldens_b04.mjs`: agregador atualizado para B01–B11, agora **581 candidatos Node** (543+38), **sem execução integral**.

## Migração Rust/WASM
O núcleo central `dev69/rust-core-m45` consultado tem `core-state`, mas **não** `core-protocol`, `core-replay`, `core-economy` ou `core-items`. **Não portar o bug P1 de trinket no gateway como comportamento correto**. A auditoria do B11 estabelece apenas comportamento de referência, não certifica Rust/HTTP/segurança operacional.

**Sem GitHub Actions, merge, rebase, force push ou edição do motor original.**

## Reproduzir em Node real
```bash
node docs/m45_rust_wasm/inputs/items/golden_b11_pvp_replay_boundary.test.mjs
node docs/m45_rust_wasm/inputs/items/run_items_goldens_b04.mjs
# Apenas após verificação real:
node docs/m45_rust_wasm/inputs/items/golden_b11_pvp_replay_boundary.test.mjs --write
```

## Próxima prioridade B12
Parar de expandir somente cobertura de referência: preparar a implementação inicial de `core-economy` e `core-items` sob contrato do coordenador Rust. Caso `core-protocol`/`core-replay` continuem ausentes, publicar interfaces/DTOs Rust como proposta de integração na branch de itens, com testes nativos quando executáveis; não criar implementação paralela incompatível na engine original.
