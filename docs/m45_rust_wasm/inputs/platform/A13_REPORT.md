# CoachLOL Macro Arena — M45 PLATFORM-A13
## Persistência de partida, falhas de gravação e recuperação de recibos

**Data:** 2026-10-30. **Branch de escrita:** `dev69/m45-audit-platform`. **Fonte imutável:** `dev69/integration@374d87d5f49b52514ec68bbe666df086363c1ec5`. **Coordenador Rust observado:** `dev69/rust-core-m45@5afd330f260c7a0b1984521732e117dfcd81396f`. Não foi realizado merge/rebase/force-push, não foram alteradas fontes de produção e não foram acionadas Actions.

## Execução e recibos efetivos

| Suite | Evidência | Resultado |
| --- | --- | --- |
| `tests/m45_platform_a13_room_persist_faults.test.mjs` | `PvPRoomV453Dev47`, Arena, gateway e mapa originais; substituição **apenas** de `room.persist()` para lançar erro | **6/6 PASS em V8 isolado**: reproduz comportamentos perigosos |
| `tests/m45_platform_a13_durable_reference.test.mjs` | Node 22, `fs` real, arquivos reais sob `mkdtempSync`, `fsyncSync`, `renameSync`, nova instância após erro | **14/14 PASS, exit 0** |
| Validação sintática | `node --check` dos dois arquivos Node autossuficientes | **PASS** |
| Identidade dos dois arquivos Node | `git hash-object` no container versus SHA de GitHub | **2/2 SHA idênticos** |
| `tools/m45_platform_a13_qa.sh` | Teste combinado em checkout integral | **NOT_RUN** (sem DNS GitHub no container deste chat) |
| HTTP/SSE de verdade, navegador, Rust/WASM, kill de processo | **NOT_RUN** | Não há certificação final |

O código real da Arena/sala/gateway foi obtido pelo conector GitHub e executado em V8 após remover invólucros de import/export de módulo e fornecer clone JSON compatível. O teste de disco é uma implementação **autossuficiente e exclusiva de QA**, não uma reimplementação do jogo.

## Descoberta P0: estado de memória e checkpoint divergem após falha

No legado, `PvPRoom.command`, `confirm` e `advance` alteram `Arena`, recibos e `revision` **antes** de executar `persist()`. O método de persistência grava `checkpointPath+'.new'` e faz `renameSync`, sem rollback do estado vivo quando a gravação lança exceção.

Com `room.persist() => throw Error('A13_SIMULATED_DISK_FAILURE')`, foram reproduzidos:

1. **Comando:** `order.stop` aceito e registrado na gateway, revisão incrementada, exceção antes do ACK ou broadcast; snapshot anterior ao retry não contém o comando. A mesma sala em memória devolve um recibo, mas a sala reconstituída do checkpoint anterior não.
2. **Primeiro ready:** `room.ready.has('p1')=true` e revisão incrementada apesar de nenhum checkpoint. Retry de `ready` é negado; o restore perde essa confirmação.
3. **Segundo ready:** `playTurn` entra em `executing` na memória, mas um checkpoint anterior restaura a sala em `preparation` com apenas `p1` confirmado.
4. **Tick:** `gameTime` avança na memória após `advance(5)`; o checkpoint anterior recupera o tempo antigo.
5. **Broadcast:** uma persistência lançando erro impede o `broadcast()` desse caminho, mas não reverte a mutação já aplicada, gerando divergência entre cliente, RAM e disco.
6. Controle positivo: quando a persistência é bem-sucedida, o checkpoint inclui a revisão e a sequência de comando antes do broadcast.

**Escopo:** falhas injetadas na chamada da função original, não falha física de disco ou evento explorado em partida HTTP. O legado usa `renameSync`, mas não há `fsync` explícito do arquivo temporário e diretório; rename sozinho não certifica durabilidade contra perda de energia.

## Referência Node: armazenamento com checkpoint e recibo antes do ACK

Arquivos em `tests/`: `m45_platform_a13_durable_reference.mjs` e `.test.mjs`. O modelo usa `openSync`, `writeFileSync`, `fsyncSync` do temporário, `renameSync` e `fsyncSync` do diretório antes do ACK. Cada transação grava o **mesmo objeto** com `revision`, comandos, eventos e recibos, permitindo consulta idempotente depois da reconexão.

**14 testes reais Node (todos PASS):** checkpoint inicial, comando salvo antes do ACK, recibo idêntico após reinicialização, conflito de `requestId`, falha antes de escrever, falha depois do `fsync` do temporário, ACK perdido após `rename`, assentos e unidades próprios, primeiro ready durável, segundo ready com execução lógica única, falha antes de gravar o último ready, projeção por equipe sem segredos, arquivo não acessível a terceiros por permissões básicas e checkpoint JSON inválido rejeitado.

**Limitações essenciais:**
- Modelo de apenas um escritor/um processo. Não possui WAL, bloqueio distribuído, race handling de requisições simultâneas nem crash/recovery genuíno; falhas são hooks **no mesmo processo**.
- Aceita apenas `order.stop` e `ready`, em sala e rodada de demonstração, sem motor LoL; autenticação é **simulada pelo argumento `auth`**, não conexão HTTP.
- SHA-256 do `JSON.stringify` é uma comparação de estrutura simples e **não uma serialização canônica de protocolo**. Não adotar o código QA como servidor de produção.
- A projeção `view()` é uma allowlist deliberadamente reduzida; não prova que os eventos da Arena legada estejam seguros. A falha dos eventos anônimos anteriores A03–A12 **permanece**.
- Permissões e `fsync` fornecem evidência de operação de arquivo no container Linux de testes, **não** testes de energia, disco real com falhas, múltiplos escritores, filesystem remoto, recuperação WAL ou navegador.

## Contrato formal de migração Rust

`A13_DURABLE_CHECKPOINT_VECTORS.json` contém **20 vetores source-pinned**, seis riscos e a ordem de commit:

1. Autenticar `roomId/seatId` pelo servidor; comparar `round`, `epoch`, `requestId`, comando e payload canônico. Não confiar em `team/seat` do navegador.
2. Construir nova Arena inteira por estágio e incluir **RNG, eventos, histórico, economia, ready, phase, revision e recibos**, sem mutar o estado visível.
3. Gravar commit durável da mesma versão de estado e recibo (checkpoint/WAL ou transação equivalente), com garantias de recuperação apropriadas ao armazenamento.
4. **Só após commit** publicar nova versão em memória, responder HTTP e fazer SSE **filtrado por assento**; eventos nunca devem vazar posição, ordens, wards, RNG, tokenHash ou segredo adversário.
5. Falha antes do commit: manter estado/revisão antigos e nenhuma divulgação; retry seguro pode aplicar uma vez. Falha após commit antes do ACK: reenviar o recibo anterior **sem reexecutar**.
6. Duas confirmações devem provocar **exatamente uma** execução lógica do turno e persistir o resultado correspondente. Falha durante `advance` não pode expor um tick não salvo.
7. Testes Rust deverão incluir crash kill, falha de I/O `ENOSPC`, checkpoint corrompido, reconexão SSE com cursor, dois clientes e conflitos de escritores. Esses testes ainda não foram executados neste chat.

### Runner disponível para checkout

```bash
bash tools/m45_platform_a13_qa.sh
```

**Gates:** G0 PARTIAL; G1 baseline de `core-state` Rust/WASM previamente validada pelo coordenador (programa ainda PARTIAL); G3/G4 servidor/paridade Rust NOT_CERTIFIED; G7 BLOCKED; G8 NOT_RUN. A árvore Rust consultada inclui `crates/core-state`, mas ainda não `crates/core-protocol` ou `crates/game-server`.

**Próxima prioridade Chat 4 — A14:** evidência de perda/duplicação de SSE após persistência e de eventos privados em ressync, preparando primeiro runner HTTP real com duas sessões assim que o servidor Rust estiver disponível.
