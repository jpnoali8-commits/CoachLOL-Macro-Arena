# M45 B02 Skills S20 — `coachlol-core-protocol` (proposta Rust isolada)

Esta crate Rust **implementa** uma fatia de protocolo de reações PvP (não apenas declara interfaces). Foi criada **em branch isolada derivada do commit `daf1df4ce7259cc6502e1b1e7b19a4ca19cd443f`** do Chat 1. O workspace central, `core-state`, `engine.mjs`, servidor JavaScript, main e PRs originais não foram editados.

## APIs reais implementadas
- `ReactionProtocol::register_from_server_impact`: ingresso privado de decisão após impacto autoritativo; não gera dano.
- `SeatIdentityView`: resolvedor trusted/seat de alias **atual**, sem confiar no cliente.
- `public_json` e `sse_frame`: **mesma** projeção allowlist por seat; nenhum ID de agressor estável na carga (o ID do defensor é do próprio seat).
- `authorize_response`: aceita somente alias público ativo para alvo, ou `None` para defesa sem alvo; devolve ID privado exclusivamente ao executor confiável.
- `seal_observed_event`: congela alias/hide no instante do evento, mantendo histórico imutável quando disfarce/clone/fog mudam.
- `Clone` de protocolo privado permite persistência/restauração pelo ator autoritativo; IDs públicos de reação/evento possuem prefixos e charset restritos.

## Execução no GitHub Codespaces — sem Actions
```bash
git fetch origin dev69/m45-skills-s20-protocol
git switch dev69/m45-skills-s20-protocol
cargo test --manifest-path crates/core-protocol/Cargo.toml --offline
cargo fmt --manifest-path crates/core-protocol/Cargo.toml -- --check
```

**Estado de QA ao publicar:** testes Rust escritos, mas **NÃO executados** nesta sessão (sem rustc/cargo local). Nenhum PASS de `cargo test`, servidor nativo, HTTP TCP, WASM ou paridade com a engine é reivindicado.

## Integração requerida e limitações intencionais
1. Chat 1 deve revisar o schema e decidir se incorpora esta crate ao workspace ou move o módulo para `core-state/core-protocol` canônico. Esta branch **não mexe no Cargo.toml raiz**.
2. Chat 4 deve criar autenticação real HTTPS/CSPRNG, projetar `SeatIdentityView` a partir de estado Rust autoritativo e sessão→room→seat, chamar a **mesma** função `public_json` em HTTP e SSE e impedir qualquer serialização de room bruto.
3. A integração de combate deve chamar `register_from_server_impact` **após um impacto real**, preservar reação durante fog e expirar/consumir a decisão com `finish_decision`.
4. O servidor continua responsável por sequência/nonce, ACK idempotente, snapshot da partida, reconexão, criptografia de tokens e transação única de reação; esta crate **não aplica dano nem simula rede**.
5. `core-state/src/pvp_projection.rs` no HEAD de origem publica `VisibleUnit.id` e `VisibleImpact.source_id` brutos para unidades visíveis. O Chat 1 deve garantir que aliases mascarados sejam usados **também nesses campos**, não somente em `pendingDecision`. Não declarar G3 aprovado enquanto houver qualquer canal alternativo de ID interno.

## Critérios de aceitação da integração
- Neeko (alias `appearance_1`) e Shaco/clone (alias `appearance_3`) em azul e vermelho; perda de visão; restore e reconnect.
- Request sem sessão: 401; reação do seat errado invisível; ID estável e alias expirado: rejeitados; alias válido: aceito; ACK repetido: exatamente um dano.
- `/api/session`, SSE inicial e atualizações: mesmas decisões/identidades autorizadas, sem IDs estáveis em qualquer chave ou eventos históricos.
- Histórico congelado em event-time; clone expirado/Neeko desdisfarçada não revelam IDs/textos privados retroativamente.
- Somente após `cargo test` real, TCP duas sessões e execução autoritativa pode-se promover gates G3/G8.

**Fonte de reprodução legada:** S19 161/161 assertivas V8 comprovam o defeito no legado; não certificam Rust. Ver `docs/m45_rust_wasm/inputs/skills/M45_B02_S19_HANDOFF.md` na branch de auditoria.
