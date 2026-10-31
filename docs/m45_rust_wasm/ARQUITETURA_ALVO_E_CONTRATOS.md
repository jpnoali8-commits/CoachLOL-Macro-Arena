# M45 — Arquitetura-alvo, segurança e contratos de Rust/WASM

**Normativa.** Motor inteiro de gameplay em Rust; cliente só renderiza/apresenta e prepara intenções. Reutilizar componentes puros no navegador quando seguros; preservar compatibilidade com dados/visual existentes.

## 1. Topologia

~~~text
 Browser: HTML/CSS/TypeScript UI
   | teclado/texto/voz/draft/combos + ACK/eventos/snapshot filtrado
   | (opcional) WASM para funções puras com SOMENTE entradas públicas
   v
 Rust native edge server
   + HTTP/assets/version/catalog public, health
   + WebSocket ou SSE+POST conforme contrato migrado, session/resume
   + autenticação/session->seat binding, rate limiting, validação
   v
 Rust Match Actor único por partida
   + core-state: Team, 5 unidades/time, IDs, schema/version, snapshots
   + core-clock: planning, commit/seal, deterministic ticks
   + core-commands: parser PT-BR seguro + planos persistentes
   + core-map: navmesh, obstacleLine, plantas, LOS, fog
   + core-economy: gold, XP, waves, shop/Undo, recipes
   + core-objectives: jungle, smite, rift, baron/herald/elder
   + core-combat: attack/projectiles/CC/effects/realm/recast
   + core-champions: passivas, kits, skill executor original
   + core-items: recipes/effects/active/ward/trinket/summoners/runes
   + core-replay: ordered events, canonical hash, RNG, deterministic restore
   + game-server: input ACL, player ack, reliable replay/reconnect
   v
 Snapshot team-filtered -> transport -> client. No private state to UI.
~~~

## 2. Estrutura proposta

~~~text
apps/web-ui/                    UI + input bindings + renderer + sound + HUD
crates/core-state/              canonical entities, stable IDs, turns, schema
crates/core-clock/              seals, planning, time, deterministic resolution
crates/core-commands/           pure parser/normalizer PT-BR, no implicit authority
crates/core-map/                atlas/masks, path, walls, LOS, fog, plants
crates/core-economy/            XP/CS, wave, gold, buy/sell/undo
crates/core-objectives/         jungle/Smite/Herald/Dragons/Baron/Rift
crates/core-combat/             damage, projectiles, attack/CC/effects/realm
crates/core-champions/          registry and authored P/QWER executors
crates/core-items/              builds, passives, actives, runes and summoners
crates/core-replay/             canonical hash, deterministic RNG, diff/snapshot
crates/core-protocol/           versioned wire DTO, receipts, ACL-filtered views
crates/wasm-api/                safe exports (public state only, no ownership)
services/game-server/           authoritative Rust actor/match-room/network
data/patches/                   versioned patch, champion/item IDs and stats
tests/golden/                   frozen fixtures per source SHA with provenance
tests/cross-runtime/            JS authority vs Rust native vs WASM public
docs/m45_rust_wasm/             authoritative work ledger & audit
legacy/                        frozen JS reference/optional archived test adapter
~~~

Proposta de diretórios: criar por etapas, não mover tudo imediatamente e quebrar imports/assets. M45 B01 já iniciou crates/core-state no root. Reuse existing assets/ and docs until migration succeeds.

## 3. Contratos de rede e versão

- ProtocolVersion, PatchVersion e SchemaVersion explícitos em todo envelope. Rejeitar versões incompatíveis sem tentar inferir formato.
- ClientCommand { request_id, match_id, champion_id, kind, payload, expected_round, client_sequence } recebe **seat do token/conexão**, nunca do payload. Não aceitar owner/team do cliente como autoridade.
- AcceptedIntent: canonicalized { seat, champion_id, kind, payload, turn_id, received_sequence }, compatível com Undo/recall e ações duradouras, imutável após seal.
- OrderReceipt { request_id, accepted/rejected, reason, accepted_sequence, round, state_revision } é idempotente. Retransmissão não compra itens outra vez nem aplica spells duplicados.
- TurnSealed apenas depois de 2 confirmações, com ordenação determinística e reações autoritativas às exceções documentadas.
- TurnResolved { tick_range, canonical_event_sequence, replay_hash, visible_revision } descreve efeitos, não expõe rngState ou estado privado.
- PublicSnapshotForTeam(team) filtra vision/brush/wards/stealth, IDs/coords escondidos, ordens futuras inimigas, inventário se privado, timers não revelados. Testar red/blue cruzado e reconexão.
- 1 match actor escreve estado; nenhuma dupla escrita Rust/JS. Shadow engine lê cópia de fixture sem emitir efeito real.

## 4. Determinismo, datas, coordenadas e RNG

- Coordenadas do atlas: declarar espaço canônico, escala e round-tripping de tela/board; evitar tolerância que altere collision ou range.
- Rounds com ticks inteiros de simulação; UI FPS e latência nunca alteram efeito. Ordens simultâneas resolvidas com ordem explícita: rule priority, tick, sequence, actor ID (não preferir time por bug).
- Regra de Math.imul e FNV-1a do legado opera code units UTF-16; em Rust use encode_utf16 para golden. documentar per-field numeric policy e limites.
- RNG seed+estado/stream por match, com consumo centralizado; multi-seed golden e rollback. Public WASM nunca recebe seed privada do servidor.
- Snapshots canônicos: schema, patch, map hash, turn, unit IDs, effects, items, fog, timers, objectives, history, RNG state SERVER ONLY, purchases/source-exit gate.
- Checksum reprodutível, ignorar apenas atributos de apresentação não causais explicitamente definidos; comparar eventos na ordem total.

## 5. Unidades, skills e execução reutilizável

- SkillDefinition mapeia campeão+slot+forma/passiva/rank e um executor Rust real; ação valida range/mana/cooldown/status/visão antes de commit. Pending casts/flight/recast/interruptions em core-combat.
- Separar intents, queued actions, committed effects, projectiles on-map e hits. Ordem: validate -> cost/commit -> travel/collision -> impact/effect -> combat events/replay.
- Todos efeitos comuns reutilizados, mas comportamentos autorais sem fallback genérico de dano. Habilidades não migradas são blocked/partial, não "implemented".
- Sylas stolen R = referência ao executor R original (com adaptação de owner/time e contexto); Viego = aparência, passiva, Q/W/E, NÃO R da vítima, preserve própria R; futuro campeão entra automaticamente se executor estiver registrado.
- Morde R realm: isolate actual game state and return safely; Neeko/Shaco clones/disguise ownership/visibility; Azir/Taliyah/Yorick walls -> core-map collision; Tibbers/summons and pets -> unit ownership; projectile interrupt/windup/recast shared.
- Smite competition and objective ownership one authoritative turn; never use client/wallclock RNG.
- Dados oficiais/patch podem ser data-driven; lógica de skill special-case própria permanece executável Rust; catalog reference-only não é "implementado".

## 6. Serviços e ferramentas

- Node tests e server JS permanecem **somente como oráculo** durante migração, não no caminho de produção final.
- Catálogo importado/geradores poderão ser tooling Node/Python sem gameplay: o build precisa validar schemas e gerar assets/dados canônicos, não runtime de regra paralelo.
- Voice-to-text pode usar API do browser; o parser/ACL final pertence ao Rust. HTML/CSS/renderer são legítimos fora do WASM.
- Deploy: runtime servidor Rust + WASM public + bundle web + asset manifest patch/version; health, logs sem dados privados, version pinning e rollback.
- Observabilidade: receipt/correlation IDs, replay hashes, counters; nunca registrar credenciais nem conteúdo privado do adversário no navegador.
- Compatibilidade antiga: manter assets originais e URLs durante transição; no final nenhum script .js executa regras da partida no servidor.
