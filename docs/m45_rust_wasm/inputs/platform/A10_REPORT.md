# CoachLOL Macro Arena — M45 PLATFORM-A10: Texto, voz e persistência bilateral

**Data:** 2026-10-30. Auditoria e QA somente na branch `dev69/m45-audit-platform`; referência legada `dev69/integration@374d87d5f49b52514ec68bbe666df086363c1ec5`; Rust consultado `83a2a8b8dd403f8cf38567a47821d9ea427ab387`. Não houve modificação em app.js, commands.mjs, engine.mjs, cliente PvP, branches originais ou ledger do coordenador.

## Evidência executada

| Suite | Resultado | Ambiente |
| --- | ---: | --- |
| `m45_platform_a10_parser_multiturn.test.mjs` | **14/14** | V8 isolado: Arena + gateway + room + parser Node/browser originais e dados do mapa |
| `m45_platform_a10_voice_ui_contract.test.mjs` | **9/9** | V8 isolado: **handler original** de `app.js`, DOM e Web Speech API falsos |
| `m45_platform_a10_enter_preview_contract.test.mjs` | **8/8** | V8 isolado: **handler original** Enter/preview/apply e parser/Arena reais, DOM falso |
| Total | **31/31** | Golden diagnóstico de comportamento legado |
| `node --check`, Node com checkout completo | **NOT_RUN** | Não há checkout local via GitHub devido a DNS no container deste chat |
| Microfone, permissão real, transcrição real do navegador | **NOT_RUN** | Os 9 casos exercem mock explícito de `SpeechRecognition` |
| Rust protocolo, game-server, WASM UI | **NOT_RUN** | Sem paridade de plataforma implementada |

Os scripts novos foram publicados como blobs GitHub e **seus corpos integrais executados em V8 usando fontes obtidas diretamente por conector**. Foram removidos imports/exports de módulo no ambiente isolado; hash de blob fonte foi conferido via GitHub e a função de hash no harness V8 foi simulada. Não confundir PASS do comportamento do legado com segurança corrigida ou Node checkout end-to-end.

## Resultados 1: compilador e dois turnos PvP reais

- `commands.mjs` e `commands.browser.js` geram prévias equivalentes para seis frases em ambos os times (12 comparações), além de entradas inválidas.
- Foram aplicados **dois planos autorais** sem tocar em campeões adversários:
  - Azul: `MID farmar safe; JG guardar smite`.
  - Vermelho: `TOP freezar wave; ADC kite com AA`.
- Confirmação do primeiro humano não simula; confirmação do segundo libera o motor. `Room.advance(5)` seis vezes chega à rodada 2, gameTime **30 s**; uma segunda rodada completa chega à rodada 3, gameTime **60 s**.
- `blue_MID.policy=safe`, `blue_MID.order.kind=farm`, `blue_JG.smitePolicy.mode=hold`, `red_TOP.tactics.wave=freeze` e `red_ADC.combatStyle=kite` sobrevivem aos turnos e ao snapshot/restore de uma partida. **Não se verificou persistência entre partidas distintas**, nem qualquer storage de preferência global.
- O endpoint PvP atual **não aceita** `{kind:'text_plan'}` como comando: gateway devolve `comando_invalido`. Portanto não se pode conectar `interpretCommands` diretamente à sala como entrada privilegiada.

## Resultado 2: condição relevante após o primeiro ready

`PvPRoomV453Dev47.confirm(p)` faz `this.ready.add(p.seatId)`, mas não altera imediatamente `arena.teams[team].ready` até ambos confirmarem. O gateway `room.command(p,packet)` respeita `room.ready` e devolve `turno_bloqueado`.

**Porém**, `commands.mjs.applyCommands(preview,arena,{team})` testa apenas `arena.teams[team].ready` e `pendingDecision`; em V8 foi possível aplicá-lo diretamente após `room.confirm(blue)` e antes de `room.confirm(red)`. Isso é uma **divergência de limites internos**, não prova de ataque por HTTP: o cliente PvP não chama essa função nem expõe `text_plan` na API. **Rust deve exigir** autorização de assento/fase na mesma fronteira do jogo para planos oriundos de texto ou voz, sem depender exclusivamente de `Arena.ready`.

## Resultado 3: voz, privacidade e Enter

Trecho real `app.js` linhas **1521–1576** (fonte blob `09ab1c0feaaf58dd48a94e72641a77358055f932`):

- A API tem de oferecer `SpeechRecognition.available({langs:['pt-BR'],processLocally:true})`; `recognition.processLocally=true`; sem essa disponibilidade, **não inicia** reconhecimento (sem fallback de código para serviço remoto).
- Transcrições intermediárias não são aceitas; uma frase final é adicionada uma vez ao campo de ordens, aciona `input` e abre **prévia**, nunca aplica automaticamente. Após parar manualmente, o callback da sessão antiga não altera o texto.
- Pacote de idioma `downloadable` só é solicitado após clique explícito em “Instalar idioma local”. Erro de disponibilidade falha fechado.
- Os **8 testes do contrato de Enter** verificam: primeiro Enter faz prévia, segundo aplica; Shift+Enter, IME/repeat não aplicam; edição invalida ou substitui prévia; texto inválido e prévia stale não são aplicados.
- Nenhum teste efetivo de gravação real, eco de permissão do navegador, latência ou suporte browser foi executado.

## Fronteira que ainda falta no cliente PvP

O código `multiplayer/pvp_client_v453_dev47.js` SHA `43f42ef9e9022db8aa3cb96a299e8ed69d8522f3` **não possui** `CoachCommands`, `interpretCommands`, `SpeechRecognition` ou `voiceLocal`. Os testes de voz e texto cobrem a UI local `app.js`, **não o frontend multiplayer completo**. A migração precisará criar um adapter de UI que converta texto/voz local em intenções tipadas, mantenha prévia explícita e submeta comandos individuais autenticados, com atomicidade/ready/ACL/receipts definidos pelo servidor Rust; sem novo motor autoritativo JS.

## Contratos a entregar a core-protocol/game-server/adapter Rust

1. `TextInputDraft{sessionEpoch,teamDerivedFromAuth,text,previewRevision}` e `CompiledIntent` **não têm autorização por si só**. Autenticação determina assento, cinco campeões e fase antes de cada mutação.
2. `ReadySeat` e bloqueio de ordens devem ser transacionais no servidor e prevalecer sobre qualquer `Arena.ready` desatualizado. Não permitir edição pós-ready nem replay de plano que diverge do draft pré-confirmado.
3. `SpeechTranscript` é texto não confiável. Somente reconhecedor local opt-in, sem fallback remoto sem aprovação informada; transcrição final entra na prévia e aguarda aplicação consciente (Enter duas etapas).
4. Preservar semântica PT-BR de gírias, Smite hold, farm safe, freeze, kite, rotas e compras, inclusive persistência por campeão entre turnos e snapshot do match. Perseguir cross-match só com requisito e consentimento específicos.
5. Não expor eventos anônimos através de fog, nem RNG/planos inimigos no SSE. Gate G3 permanece NÃO CERTIFICADO em Rust; falha legacy A03–A09 ainda tem oráculo.

`A10_TEXT_VOICE_MULTITURN_VECTORS.json` contém **31 vetores**, quatro lacunas e proveniência source pinned. `tools/m45_platform_a10_qa.sh` está pronto para checkout local, **NOT_RUN**.

### Gates

G0 PARTIAL; G1 Rust baseline core-state WASM `PASS_BASELINE_ONLY` conforme ledger do coordenador, **programa PARTIAL**; G3/G4 Rust NOT_CERTIFIED; G7 BLOCKED por assets/browser; G8 NOT_RUN.

**Próxima prioridade Chat 4:** equivalência entre prompt, parser e `ClientCommand` versionado; verificação de ordens sob ready/reconnect com reenvio de recibos e fronteira de privacidade. Aguardando contratos Rust e server genuínos antes de comparar WASM ou promover gates.
