# M45 PLATFORM-A09 — Equivalência de comandos, recibos e parser PT-BR

**Data:** 2026-10-30. **Branch exclusiva:** `dev69/m45-audit-platform`. **Base legado:** `dev69/integration@374d87d5f49b52514ec68bbe666df086363c1ec5`. **Rust HEAD consultado:** `0dda9398cb9e37b3a54d74cea8ab9b698a752fee`. Nenhum merge, rebase, alteração das fontes originais, Actions ou Codespaces.

## Execução real e limites

Foram buscados diretamente do GitHub o código integral de `engine.mjs`, `commands.mjs`, `authoritative_actions_v453_dev44.mjs`, `authoritative_actions_v453_dev47.mjs`, `room_v453_dev47.mjs` e o mapa/máscaras/manifest. Os módulos foram executados em V8 isolado após remover apenas marcações ES import/export; o gateway recebeu `structuredClone` compatível com JSON (os pacotes do oráculo são JSON); as classes de Arena/gateway/sala e o compilador PT-BR executaram seus métodos reais.

**Resultados V8:** `tests/m45_platform_a09_gateway_contract.test.mjs` **20/20 PASS**; `tests/m45_platform_a09_ptbr_parser_contract.test.mjs` **15/15 PASS**. Cada arquivo de teste publicado foi carregado do blob GitHub e executado no mesmo V8. O último caso do gateway confirma uma **falha de privacidade presente no legado**; seu PASS é de **reprodução do diagnóstico**, não conformidade de segurança.

`A09_ORACLE_MANIFEST.json` guarda 35 IDs, escopo, resultado legado, resultado requerido para Rust e blobs de proveniência, extraídos automaticamente das duas suítes. O shell `tools/m45_platform_a09_qa.sh` executa `node --check` e as duas suítes em checkout integral. **Node checkout, HTTP/SSE em processo Node, 2 browsers, core-protocol Rust, game-server Rust e equivalência Rust: NOT_RUN.**

## 20 testes do gateway — invariantes por assento

- Exatamente **2 humanos**, cada assento controla **5 campeões**; blue e red possuem sequências independentes.
- Ações `order.stop` dos dois assentos recebem ACKs; retransmissão de pacote idêntico retorna recibo idêntico e não aplica nova mutação; reutilizar a sequência com outro comando é rejeitado.
- `seatId`, `team` extras ou `unitId` adversário no pacote são recusados. Assento desconhecido é recusado pela fronteira autenticada.
- Sequências inválidas (0, negativo, fração, string, null, acima de MAX_SAFE_INTEGER) e lacunas são recusadas.
- Tipos não suportados, campos não autorizados em payload, slots QWER inválidos, `point` não finito/fora de [0,1] são recusados sem mutação do snapshot.
- `order.attack` contra adversário sem visibilidade falha nos dois lados; `room.view(p)` filtra campeões ocultos e omite `items`/`order` de adversário visível.
- A primeira confirmação bloqueia novas ações do assento pronto sem executar; a segunda inicia o motor. Recibo de ação já aceito continua recuperável após seal e `Arena.fromSnapshotV40` com checkpoint interno.
- **G3 problema reproduzido:** evento sem `team` ou `unitId`, embora `public:false`, é visível nas duas projeções. `VisibleEventDTO` Rust deve ser **default-deny** e sem propriedades extras, mesmo que isso diverja deliberadamente do legado.

Os testes do gateway não exercitam `POST /api/action` nem os cookies reais; são validação de Arena/sala/gateway integrais *em processo isolado*.

## 15 testes do compilador PT-BR

- Entradas vazias e longas (acima de 1.800 caracteres), ator desconhecido e equipe inválida rejeitados.
- `MID farmar safe, sem trocar`, `TOP freezar wave`, `JG guardar smite`, `ADC kite com AA`, `SUP dar peel no ADC`, `JG red de baixo depois krugs de baixo`, `ADC recall` e compra de anel de Doran mantêm as ações e as funções reconhecidas.
- O nome de campeão presente somente no time adversário não cria permissão de comando para ele.
- `applyCommands` de ordens do time vermelho preserva o checksum completo dos campeões azuis, e vice-versa; plano inválido não é aplicado.
- Ordens de texto não podem ser editadas após `team.ready=true`.

**Alerta de fronteira:** `commands.mjs` é compilador local/offline, **não** endpoint PvP autenticado. Os testes demonstram semântica determinística do compilador, e não autorizam aceitar objetos de `preview` diretamente do navegador no Rust. A fronteira Rust deve validar `kind, payload, unitId, seat` no servidor, preservando gírias e interpretação de fala como entrada de texto **não confiável**. Não há evidência de transcrição por voz ou rede nesse golden.

## Destino Rust e matriz de equivalência

A árvore GitHub de `dev69/rust-core-m45@0dda9398cb9e37b3a54d74cea8ab9b698a752fee` foi verificada (1.803 entradas, `truncated=false`): `crates/core-state` existe, mas **`crates/core-protocol` e `crates/game-server` ainda não existem**. O `STATUS_LEDGER` Rust documenta um **WASM core-state real** compilado com G1 `PASS_BASELINE_ONLY`, mantido como **G1 programa PARTIAL**, não migração integral. Nenhum novo uso de Actions foi feito nesta A09.

**Requisitos B04/B06:**
1. `AuthenticatedSeat` server-derived, exatamente 5 `unitIds`; `ClientCommand` versionado com esquema tipado, rejeição de campos extras, regras estritas para IDs, payloads e coordenadas.
2. `CommandReceipt` idempotente por match/seat/sequence/requestId, preservado após seal/restart. Em `ACK_LOST`, repetir os mesmos bytes/canonical command. Desacoplar revisão de estado compartilhado da sequência por assento.
3. `PublicSnapshotForTeam` e `VisibleEventDTO` estritos e default-deny; nenhuma posição oculta ou evento privado em SSE, HTTP, reconnect ou replay.
4. Compilador de comandos/voz PT-BR com golden semanticamente equivalente, mas sua saída é plano/intenções, **nunca comando já autorizado**.
5. No Rust, rodar os 35 vetores em ambas as equipes; falha de exposição anônima do legado deve ser corrigida, não clonada.
6. Validar dois humanos, duas sessões reais, restore de checkpoint, SSE e navegador quando o servidor/API existir; não promover G3/G4 antes disso.

## Recibo de QA

```text
M45-A09-GW      20/20 PASS  ISOLATED_V8_REAL_LEGACY
M45-A09-PTBR    15/15 PASS  ISOLATED_V8_REAL_LEGACY
M45-A09-TOTAL   35/35 PASS  ISOLATED_V8_LEGACY_GOLDENS
NODE_CHECKOUT   NOT_RUN
RUST_PROTOCOL   NOT_IMPLEMENTED
RUST_SERVER     NOT_IMPLEMENTED
RUST_EQUIV      NOT_RUN
BROWSER         NOT_RUN
G3 PRIVACY      LEGACY_GAP_CONFIRMED / RUST_NOT_CERTIFIED
G4 PARSER       LEGACY_BASELINE_ONLY / RUST_NOT_CERTIFIED
G8              NOT_RUN
```

Próxima prioridade: expandir golden de voz/prompt e interação de parser com ordens persistentes e simultâneas; só conectar à camada Rust quando o Chat 1 introduzir `core-protocol`/servidor.
