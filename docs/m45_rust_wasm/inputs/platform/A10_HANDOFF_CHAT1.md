# M45 Chat 4 → Chat 1 — PLATFORM-A10 (texto, voz e persistência)

**2026-10-30.** Origem imutável `dev69/integration@374d87d5f49b52514ec68bbe666df086363c1ec5`; plataforma auditada na branch exclusiva `dev69/m45-audit-platform`; Rust HEAD consultado `83a2a8b8dd403f8cf38567a47821d9ea427ab387`.

## Executado

- **14/14 PASS V8**: `tests/m45_platform_a10_parser_multiturn.test.mjs` — parser Node/browser equivalentes em ambas equipes; blue MID safe/JG hold Smite, red TOP freeze/ADC kite; dois turnos reais de Arena+Room terminam em **60 s, round 3**; ordem persiste durante 2 rodadas e snapshot/restore.
- **9/9 PASS V8**: `tests/m45_platform_a10_voice_ui_contract.test.mjs` — handler original `app.js`, Web Speech API **falsa**, exige processLocally pt-BR, final único, abort/ sessão antiga, install somente após clique, sem auto-submit. **Microfone/navegador real NOT_RUN**.
- **8/8 PASS V8**: `tests/m45_platform_a10_enter_preview_contract.test.mjs` — handler Enter original e parser/Arena; primeiro Enter prévia, segundo aplica, ignora IME/Shift/repeat, bloqueia prévia stale.
- `A10_TEXT_VOICE_MULTITURN_VECTORS.json`: 31 vetores e 4 lacunas; `A10_REPORT.md` contém evidências e limites; `tools/m45_platform_a10_qa.sh` pronto, checkout Node NOT_RUN.

## Duas lacunas importantes para Rust

**A10-GAP-01, P0 auth:** `Room.confirm(blue)` grava `room.ready.has('p1')`, mas `arena.teams.blue.ready=false` até segunda confirmação; `room.command` já nega novos pacotes enquanto **`commands.mjs.applyCommands` direto ainda aceita** o plano offline. Não é vulnerabilidade de HTTP demonstrada: client PvP não expõe `text_plan`. **Não ligar parser à sala sem validar assento/fase/ready na mesma barreira autoritativa Rust!**

**A10-GAP-02, feature:** `app.js` tem voz local e prompt; `multiplayer/pvp_client_v453_dev47.js` não tem `CoachCommands` ou voz. Integrar texto/voz no adapter WASM com transcrição tratada como não confiável, prévia e confirmação explícitas, sem nunca despachar `preview` bruto com permissões de servidor.

## Outros contratos essenciais

- `CompiledIntent` aplica comandos somente sob `AuthenticatedSeat` e sequências/recibos idempotentes (A08/A09); 1 humano controla 5 unidades, teams não declarados pelo cliente.
- Persistência por campeão entre turnos dentro da partida; checkpoint versionado, próprio time apenas. **Persistência entre partidas NÃO testada**.
- `SpeechRecognition.available({langs:['pt-BR'],processLocally:true})`, sem fallback para cloud e sem auto-aplicar resultado; política de privacidade.
- G3 fog/private event default-deny antes de SSE/reconnect. A10 não corrige esse bug legado.

**Status:** G0 PARTIAL; G1 baseline core-state WASM aprovado em workflow do coordenador mas programa PARTIAL; G3/G4 Rust NOT_CERTIFIED; G7 BLOCKED; G8 NOT_RUN. Zero novas Actions/Codespaces, nenhum merge e nenhuma mudança nas branches de integração/skills/items/core.

**Próxima prioridade Chat 4:** A11 contratos de preview e comandos textuais/voice → typed `ClientCommand` sob checkpoint/ready, runner Rust quando `core-protocol` estiver disponível.
