# M45 PLATFORM-A02 — Testes adversariais de rede e contrato Rust

**Data** 2026-10-30. Fonte legada fixa `374d87d5f49b52514ec68bbe666df086363c1ec5`. Núcleo Rust consultado `a1e4b37c8ed32675ebe22859d26d072bf52b3750`. Ramal exclusivo `dev69/m45-audit-platform`.

## Realizado nesta operação
- Inspeção automatizada de 16 padrões concretos no servidor, sala, gateway, cliente e perspectiva de `engine.mjs`: **16/16 padrões encontrados**. Isso valida apenas a correspondência de código lido, não a segurança funcional.
- Dois scripts Node adicionados: `tests/m45_platform_a02_network_security.test.mjs` (9 grupos de cenários) e `tests/m45_platform_a02_event_redteam.test.mjs` (testes de default-deny).
- `A02_WIRE_CONTRACT.json` fornece as rotas atuais e versões propostas de intent/receipt/visible-events, claramente **PROPOSED**.
- Handoff ao coordenador com novo risco de filtragem de eventos.

## Evidência e limites

O servidor usa HTTP + SSE com cookies HttpOnly/SameSite Strict, um jogador por equipe, cinco personagens por sessão. O gateway verifica unitId por seat, action shape, sequence e reaction; checkpoint grava `snapshotV40()` somente no servidor. A perspectiva filtra unidades/wards inimigas, mas `engine.mjs` inclui eventos também quando `(!e.team&&!e.unitId)`, sem exigir `public === true`.

**PLATFORM-016 / P0:** evento anônimo sem time nem unidade não é necessariamente público. A fault injection insere evento `private:true` e texto canário sem owner. Pelo código inspecionado, o evento pode ser exposto no snapshot; isso NÃO demonstra que um evento privado real seja produzido pela partida. O teste estrito foi criado para sinalizar a lacuna no oráculo JS e forçar default-deny na migração Rust; pode falhar no legado. Não o adicionar indiscriminadamente ao `npm test` até triagem.

**PLATFORM-017 / P1:** Origin ausente é permitido, cookie não define Secure; definir HTTPS, CSRF, rotation/revocation e rate limiting.

**PLATFORM-018 / P1:** EventSource recebe visão completa em cada update, mas não existe `Last-Event-ID`, journal limitado ou mecanismo explícito de gaps; definir cursor, backpressure e resync.

**PLATFORM-019 / P1:** checkpoint e receipts persistidos contêm estado privado. Garantir ACL, retenção, restarts, quotas e esquema de migração.

**PLATFORM-020 / P1:** garantir que receipt retransmitido sobreviva a seal/reconnect e que nova request_id não permita gastar item ou cast duas vezes.

## Testes de dois jogadores (código versionado, runtime NOT_RUN)

| ID | Verificação |
|---|---|
| A02-01 | 2 cookies / 2 assentos humanos / 5 campeões por seat |
| A02-02 | não autenticado e spoof de unitId proibidos sem consumir estado |
| A02-03 | campo team forjado, sequence gap e Origin hostil rejeitados |
| A02-04 | ambas equipes enviam ordem; retry idempotente, mismatch rejeitado |
| A02-05 | inventário/ordem de inimigo em view e cotações shop protegidas |
| A02-06 | fog sintético e pendingDecision somente para o defensor |
| A02-07 | primeira confirmação não inicia turno; segunda inicia |
| A02-08 | SSE isolado por cookie e sem RNG/token hash |
| A02-09 | checkpoint/restore mantém tokens, ACKs, seq e RNG apenas interno |
| REDTEAM-01 | evento privado anônimo artificial deve ser negado por padrão |

## Execução e bloqueios

A branch privada não pode ser clonada via Git neste executor, que não resolve `github.com`. `node` está disponível, mas sem checkout completo não é possível realizar os testes de runtime. O parser sintático isolado foi executado sobre o código novo depois de neutralizar `import.meta` para análise de módulo; isso NÃO substitui `node --check` nem execução.

Comandos para ambiente completo:

```bash
node --check tests/m45_platform_a02_network_security.test.mjs
node --check tests/m45_platform_a02_event_redteam.test.mjs
node tests/m45_platform_a02_network_security.test.mjs
node tests/m45_platform_a02_event_redteam.test.mjs
node tests/v453_dev47_multiplayer_network.test.mjs
node tests/v453_dev61_shop_undo_pvp.test.mjs
```

**Gates:** G0 PARTIAL; G1 Rust BLOCKED; G2/G3/G4 NOT_RUN; G7 BLOCKED (Issue #1 e engine Rust faltante); G8 NOT_RUN. Nenhum PASS de segurança presumido.

Próxima prioridade Chat 4: executar fixtures reais num checkout; investigar política explícita de eventos e adicionar matrizes de reconnect/fog, sem alterar `engine.mjs` original nem habilitar Rust antes do contrato central.
