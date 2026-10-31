# M45 — Gates obrigatórios de QA, equivalência e certificação

**Nenhum PASS presumido.** A evidência deve trazer: branch + commit SHA, plataforma, comando literal, resultado, fixture hash, data, número de cenários e riscos remanescentes. Diferenciar PASS, FAIL, BLOCKED, NOT_RUN, PARTIAL, CERTIFIED.

## G0 — Fontes, preservação e cobertura

- [ ] HEADs e PRs congelados/referenciados para integration, skills e items; verificados contra GitHub.
- [ ] Todas diferenças funcionais documentadas em matriz por símbolo/feature, inclusive catálogo reference-only e legados não commitados.
- [ ] Backups íntegros, histórico, patches, licenças, assets/manifest SHA e teste de não regressão.
- [ ] Golden baseline reproduzível por branch, com provenance src SHA.
- [ ] Nenhum método/skill/item do legado apagado sem recibo de decisão.

## G1 — Compilação native + WASM

- [ ] rustc/cargo/rustup instalados; lockfile e MSRV declarados; build reproduzível/offline onde possível.
- [ ] cargo fmt --all -- --check; cargo clippy --workspace --all-targets -- -D warnings; cargo test --workspace.
- [ ] cargo build --release --target wasm32-unknown-unknown para crates WASM. Se WASM exige wasm-bindgen/wasm-pack, fixar versões e binários.
- [ ] Teste real de WASM compilado em runtime web ou Node WebAssembly, com valor de referência JS/Rust idêntico.
- [ ] Fixar não só ABI mas contrato de memória/alloc/free e limite de inputs; rodar teste de chamadas repetidas e Unicode UTF-16.
- [ ] Sem Actions inicialmente; execução CI apenas quando indispensável para comprovante de compilação real. Falta de toolchain = BLOCKED, nunca PASS.

## G2 — Contrato / replay / determinismo

- [ ] Protocolo versionado e validação de DTO de entrada/saída, tipos numéricos, ticks e mapas.
- [ ] Para cada fixture: initial state + seed/RNG + two-sided actions + simulated time + final snapshot + causal events + checksum, com teste independente Rust e referência JS.
- [ ] 100% dos contratos migrados testados em 2 ordens de confirmação e repetição determinística.
- [ ] Replay run->restore->run reproduz hash após snapshot e morte/respawn/visão; save schema migrations testadas.
- [ ] Não aceitar diferenças de vencedor, kills, HP crítico, CS, ouro, XP, cooldown, fog, alvo ou ordenação de eventos.
- [ ] Variação numérica tolerada apenas por campo documentado com prova de não alterar decisões semânticas.

## G3 — Autoridade, privacidade, segurança, network

- [ ] Provar que dois assentos representam dois humanos distintos; cada um apenas com seus cinco campeões.
- [ ] Inputs jamais aceitam player/team/owner malicioso; permissão determinada pelo servidor.
- [ ] Idempotência de request_id (ACK retransmitido sem compra, cast ou dano duplos); round seal seguro; anti-race.
- [ ] Confirmar apenas time próprio, não revelar plano inimigo durante planning.
- [ ] Red/blue fog e snapshots filtrados, inclusive stealth, clones, wards, retarget e reconexão.
- [ ] Validar malformed JSON/input, replay request, out-of-order seq, disconnected client, duplicate, timeout, long payload, session theft e denial-of-service básico.
- [ ] Uma só autoridade de escrita por match; dual-run shadow não aplica resultados nem emite receipts.

## G4 — Comandos PT-BR / interface

- [ ] Compiler dos comandos existentes com golden de aliases, gírias, multi-role, farm safe/freeze, gank, jungle path, smite target HP, upgrade EWQ.
- [ ] Persistência do plano entre turnos/partidas conforme contrato, sem arrastar ordem errada ou interferência indevida.
- [ ] Enter previsualiza; Enter confirma; texto e voz são métodos de input e nunca autorizam algo além do seat.
- [ ] Comando inválido rejeitado sem consumo de mana/gold/cooldown.
- [ ] Draft, shop, HUD e controles preservam jornada existente; desktop 16:9 e browser integration.

## G5 — Simulação macro

- [ ] Caminho A*, terreno, colisão estática/dinâmica, range, brush e LOS em golden multi-seed.
- [ ] Waves 3 melee + 3 caster (+ 1 cannon) e últimos golpes reais; XP proximidade, freeze e jungle solo.
- [ ] Dragon/soul/elder, Baron, Rift Elemental, Herald, Voidgrubs, camps, Smite contest, plants, towers/inhibitors/Nexus; perda de buffs ao morrer.
- [ ] Undo da compra permitido só na fonte antes de sair fisicamente; retorno/reconexão não reabilitam.
- [ ] Match termina por Nexus, duração alvo medida com censurados preservados, sem substituir teste real por "resultado simulado".
- [ ] Testes de estruturas, respawn, gold, scoreboard e endgame em ambos os lados.

## G6 — Combate, conteúdos e identidade

- [ ] Todos executores legacy mapeados (P/QWER, formas, recasts, invocações) com provenance e status da matriz.
- [ ] Skills: rank, mana/energy, CD, spellrange, collision, projectile, cast/travel/impact, CC/interrupt, realm, kill ownership, summon, clone, stealth, windup.
- [ ] Sylas invoca R original, inclusive R futuras; Viego copia aparência+P/QWE do derrotado, não R, preserva owner/time e sua R. Testes de futura skill sem lista fixa.
- [ ] Itens/receitas/efeitos/ativos/passivos, runas, trinkets e 2 spells campeões (JG Smite obrigatório) comprovados.
- [ ] Não promover reference_only/partial à implementado sem testes de engine real.
- [ ] Ambos lados PvP, 2 direções de alvo, interações item-skill e kit-CC, snapshots, pathing, fog, no double-charge.
- [ ] Regra comum não pode obliterar identidade de campeão. Nenhum fallback genérico oculto para habilidades não migradas.

## G7 — Web/integração e ativos

- [ ] Rust server, versão/protocolo e serviço por partida; reconexão/restauração e transport 2 sessões navegador.
- [ ] WASM público com explicit whitelist; teste adversarial prova ausência de private data no bundle, payloads, logs e APIs.
- [ ] UI usa somente receipts/events/public snapshots para desenhar, não engine.browser.js para simular.
- [ ] Assets runtime faltantes da Issue #1 restaurados com SHA real (78) ou impeditivo permanece; icons/licenças originais.
- [ ] Browser real: draft -> two-player planning -> combat/reactions -> items -> objectives -> Nexus -> postgame.
- [ ] Acessibilidade básica, HUD, screen sizes, 16:9, gameplay visuals, lojas e controles; não regredir tema preto/dourado.

## G8 — MIGRATION_CERTIFIED e RUST_CONTENT_PRODUCTION

Critérios ALL:
- [ ] G0–G7 aplicáveis aprovados em commits identificados e disponíveis no checkout final (não somente em branches paralelas).
- [ ] 100% das features/símbolos LEGADOS encontrados nas 3 branches reconciliados na matriz, sem item silenciosamente desaparecido. Todos gameplay executáveis existentes foram migrados ou receberam exceção expressamente aceita e descrita, nunca marcada DONE.
- [ ] Nenhuma dependência runtime da JS engine autoritativa, parser de regras JS ou server de simulação JS. Arquivos legados podem continuar como teste/oráculo.
- [ ] Testes Rust native + WASM + browser + 2 jogadores + privacidade/ownership/reconnect + rollback + replicação do golden.
- [ ] npm test legado (quando aplicável) e regressão funcional equivalente Rust executados; failures antigos tratados explicitamente.
- [ ] Artefatos de deploy, scripts de build, hashes/version e assets disponíveis; compilação reproduzível e instruções de recuperação documentadas.
- [ ] Operação manual de aceitação da integração, sem merge em main até release gate.

MIGRATION_CERTIFIED habilita apenas a **retomada de produção de novas skills/itens em Rust**. Não significa catálogo completo de todos campeões do LoL; catálogo total é meta posterior.

## Modelo de recibo mínimo

~~~text
RECEIPT_ID:
PHASE / TASK:
SOURCE_SHA(S): integration, skills, items, rust
RUST_COMMIT_SHA:
TOUCHED_FILES:
NATIVE_CMD + RESULT:
WASM_CMD + RESULT:
JS_GOLDEN_CMD + RESULT:
BLUE_RED_SCENARIOS:
NETWORK_PRIVACY:
BROWSER_VISUAL:
GATES: [Gx: PASS/FAIL/NOT_RUN/PARTIAL/BLOCKED]
DIFFS_AND_EXCEPTIONS:
BLOCKER_ID/OWNER:
ROLLBACK:
NEXT_ELIGIBLE_TASK:
~~~

## Evidência conhecida em 2026-10-30

M45 B01: 18 linhas golden e 3 casos Smite aprovados no JS real em V8 isolado (21/21); adaptador WASM parse OK, hash memória simulado. Cargo e WASM executáveis **NOT_RUN**. Estes resultados NÃO atendem G1/G8.
QA histórico M44 JS não é QA Rust. O pacote remoto atual contém ausência de assets binários e por isso G7 não pode ser marcado PASS.
