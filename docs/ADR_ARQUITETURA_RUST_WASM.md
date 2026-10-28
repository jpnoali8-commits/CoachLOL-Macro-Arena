# ADR-009 — Rust + WebAssembly no núcleo, UI Web

**Estado:** arquitetura recomendada, ainda não migrada. Decisão em 25/10/2026.

## Por que

O CoachLOL já possui visual, editor e Champ Select em HTML/CSS/JS que mudam frequentemente; uma migração total para Rust aumentaria custo e risco. Precisamos de determinismo de regras, processamento de pathfinding/visão, bugs de sincronização menores e reuso nativo no servidor multiplayer. Rust é adequado para o núcleo; WASM o torna consumível no navegador; um app desktop pode usar Tauri com o mesmo core.

## Crates e interfaces

```text
coachlol/
  apps/web-ui/          -> TypeScript, Three.js, draft, shop, board, HUD
  apps/desktop/         -> Webview/Tauri (futuro)
  crates/core-state/    -> entities/IDs, fixed-point coords, serialization
  crates/core-map/      -> atlas 4096, masks, navmesh, LOS
  crates/core-clock/    -> seals, elapsed clock, turn simulation
  crates/core-combat/   -> stats, damage, targeting, abilities, effects
  crates/core-economy/  -> waves, CS, gold, item builds, shops
  crates/core-objectives/-> jungle, dragons, baron, structures
  crates/core-bot/      -> utilityAI on filtered view only
  crates/core-replay/   -> deterministic events, hashes, snapshots
  crates/wasm-api/      -> wasm-bindgen JSON/typed arrays, bindings
  services/game-server/ -> native Rust authoritative runtime (futuro)
  data/patches/         -> asset manifests, rules.json patch
```

## Regras de equivalência JS → Rust

1. Congelar um corpus de replays/estados da v0.9 com seed, mapa, ordens, elapsed seconds, resultado.
2. Definir norma numérica: f32/f64 versus fixed-point. Para replicação bit a bit entre WASM, JS e Rust, preferir fixed-point para posições/dano de core ou aceitar equivalência semântica formal com tolerância controlada.
3. Migrar por subsistema, não tudo de uma vez: clock → movement → waves → turrets → fog → jungle → combat → items.
4. Cada alteração deve passar os mesmos golden tests, sem render; hashes públicos de estado canônico.
5. Render 3D consome snapshots; **não controla a simulação**, FPS não altera rodada.
6. Modelos 3D, sprites e texturas não são parte do binário WASM: manter em `assets/` e usar manifest versionado.
7. Preservar backend multiplayer privado; clientes recebem estado filtrado por visão e confirmações ACK.

## Critérios para escolher Rust agora

Bom quando: backend determinístico já estabilizado, equipe mantém testes/CI e deseja browser+desktop+server com mesmo motor. Prematuro quando: regras mudam diariamente sem testes, percepção principal é HUD visual e ainda há problemas de navegação do atlas. Recomendado iniciar **M02 após M01/M03/M04 terem golden tests**.
