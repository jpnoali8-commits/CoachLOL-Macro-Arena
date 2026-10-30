# CoachLOL Macro Arena — M45 PLATFORM-A08

**Data:** 2026-10-30. **Branch exclusiva de auditoria:** `dev69/m45-audit-platform`. **Código legado consultado sem alteração:** `dev69/integration@374d87d5f49b52514ec68bbe666df086363c1ec5`. **Rust HEAD consultado antes desta operação:** `c8e8f182b87d720619fe5747076b8221413acde7`. Sem merge/cherry-pick/force-push.

## Resultado mais importante — dupla contagem de sequência em UI

O cliente `multiplayer/pvp_client_v453_dev47.js` tem:

```js
// send(): após HTTP ACK
const r=await api('action',{sequence,kind,payload,...(unitId?{unitId}:{})});
sequence++;

// render(v): recebe estado por SSE antes ou depois da resposta HTTP
sequence=Math.max(sequence,v.nextSequence||1);
```

`Room.command()` confirma a ação, persiste e transmite `broadcast()` antes de responder ao HTTP. Se SSE for recebido primeiro, o render atualiza `sequence` de 1 para 2; quando `await api('action')` retorna, `sequence++` atualiza para 3. A ordem seguinte usa sequência 3 e o gateway rejeita `sequencia_fora_de_ordem` porque só foi aceito 1. Isso é **ordenação de eventos de rede plausível no transporte real** e foi **reproduzido em V8 isolado** usando as funções originais exatas de send/render e o motor Arena+Room+gateway original. Não significa que uma execução real de HTTP/SSE no navegador tenha sido observada.

## QA executado

| Evidência | Execução | Estado |
|---|---|---|
| `m45_platform_a08_client_sequence_races.test.mjs` | V8 isolado, client `send/render/connect` extraído do blob original + Arena, gateway dev44/47 e Room reais + mapas GitHub | **8/8 PASS diagnóstico** |
| `m45_platform_a08_sequence_reference.test.mjs` | Node v22.16.0 local, módulo de referência QA, sem dependências externas | **8/8 PASS, exit 0** |
| `node --check` do módulo de referência e respectivo teste | Node v22.16.0 local | **PASS** |
| SHA dos dois arquivos de referência | `git hash-object` no container, comparado com os SHA dos blobs criados no GitHub | **2/2 idênticos** |
| `m45_platform_a08_qa.sh` contra checkout completo | NÃO EXECUTADO | **NOT_RUN** |
| HTTP/SSE + navegador duplo + disco | NÃO EXECUTADO | **NOT_RUN** |
| Rust native/wasm/client adapter | NÃO EXECUTADO nesta branch | **NOT_RUN** |

O **PASS do teste legado significa reprodução de comportamentos originais, incluindo falhas**. Nenhuma falha corrigida em código de produção. O novo `ClientSequenceReference` está em `tests/` e é **apenas uma especificação executável de reconciliação**, sem ser substituto do cliente Rust.

## Matriz de falhas (código legado exato)

- **A08-03 / P0 usabilidade PvP:** SSE de ação aceitada chega antes do ACK HTTP: sequência 1 → render eleva 2 → `sequence++` eleva 3; próxima ordem falha. Reproduzido.
- **A08-04 / P1 recovery:** servidor efetiva `sequence=1`, ACK se perde e `send()` deixa `sequence=1`. O jogador envia uma ordem *diferente* reutilizando 1 e recebe `sequencia_reutilizada_com_dados_diferentes`. Reproduzido. Reenviar manualmente exatamente o primeiro pacote devolve o recibo estável, mas UI não mantém nem retransmite automaticamente essa intenção.
- **A08-06 / P1 troca de sala:** `render()` só usa `Math.max` e não reseta `sequence` ao abrir uma nova partida na mesma aba; a primeira ordem em uma sala nova pode começar em sequência 2+, rejeitada por gap. Reproduzido.
- **A08-07 / P1 troca de sala:** `lastRevision` permanece global e `connect()` só aceita `v.revision >= lastRevision`, independentemente de `roomId`. Uma nova sala com revisão 0 pode não renderizar se a anterior atingiu 50. Reproduzido.
- **A08-01/02/05/08 positivos:** serialização de ordens pela fila `networkLock`, ACK normal em sequência, recibo original recuperável manualmente e descarte de revisão anterior dentro da mesma sala. Preservar identidade da mecânica na migração.

Fonte autenticada por blob GitHub: client `43f42ef9e9022db8aa3cb96a299e8ed69d8522f3`; engine `1737f4f675bd9cc5ed0a48defc68b2fddc124d71`; room `3bdb8cd3b737d20e3700e994a8872943e53366ae`; gateway dev44 `b2ebb58248c8aec9aee0a64c354150757cd71a4a` e dev47 `adf6900a20b1b2c162ec9769b18bf1cc2c23867f`.

## Contrato para implementação Rust/WASM (proposto, não presente na produção)

1. A sessão da UI possui `SessionEpoch{room_id,authenticated_seat,generation}`. Troca de sala ou autenticação reinicializa `lastRevision`, sequence e estado de requisições; callbacks tardios do antigo EventSource/fetch não afetam sessão nova.
2. Em fila por **jogador humano**, gerar um pacote JSON/canônico **imutável** com `client_sequence`, `request_id`, `expected_round`, tipo, unidade e payload; nunca reconstruir payload após falha de rede. O servidor decide autenticação/posse por cookie, não pelo pacote.
3. SSE tem `nextSequence` **informativo**, não um comando para incrementar contador local enquanto ACK está pendente. O ACK correspondente avança a sequência **uma vez**, no máximo para `max(ack.sequence+1,serverNext)`; ACK é vinculado a `room_id,seat_id,request_id,sequence`.
4. Em `ACK_LOST`, bloquear comandos diferentes até recuperar o recibo do comando anterior ou executar ressincronização verificada. Retry retransmite **o mesmo** pacote, nunca um comando novo reutilizando número antigo. A referência Node A08 demonstra essa regra; o servidor Rust deve fornecer recibo persistente e idempotente.
5. `ReadyCommand` também deve receber identificador idempotente com transação durável antes do broadcast, em consonância com A04/A05. Não abrir turno antes dos dois humanos.
6. Eventos `state` e resync só podem trazer perspectiva da sessão, incluindo `VisibleEventDTO` allowlist default-deny, sem RNG nem dados do inimigo. A08 não resolve a falha de privacidade A03–A07.
7. O contrato está em `A08_PROTOCOL_EPOCH_SEQUENCE_VECTORS.json` com **12 vetores** (8 do legado + 4 adicionais de referência). `m45_platform_a08_sequence_reference.mjs` não tem storage/crypto/HTTP e **não implementa request_id nem persistência real**; seu papel é mostrar as transições necessárias.

### Para executar sem GitHub Actions em um checkout completo

```bash
bash tools/m45_platform_a08_qa.sh
# ou individualmente:
node tests/m45_platform_a08_sequence_reference.test.mjs
node tests/m45_platform_a08_client_sequence_races.test.mjs
```

### Gates

G0 PARTIAL; G1 depende do coordenador Rust e dos testes nativos; G2/G3/G4 Rust **NOT_CERTIFIED**; G7 BLOCKED por assets/Browser; G8 NOT_RUN. Não promover `MIGRATION_CERTIFIED`.

**Próxima prioridade Chat 4:** construir camada de comparação dos recibos e estado SSE com session epoch/version, testes de fronteira do parse de comandos e checksum de duas equipes; validar no servidor Rust quando os contratos B04/B06 existirem. Manter legado imutável.
