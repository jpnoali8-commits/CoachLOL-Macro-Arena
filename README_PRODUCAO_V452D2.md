# CoachLOL Macro Arena — V4.5.2d-dev2 | Continuidade Codex/Opus

Abra `AGENTS.md`, `.agents/skills/coachlol-producao/SKILL.md`, `docs/ROADMAP_V452D2_CONTINUIDADE.md`, `docs/QA_V452D2_SOULS.md`, `CHANGELOG_V452D_DEV2.md`. Este é o jogo **completo**, e o Git herdado acompanha o pacote. Não apagar mudanças locais pré-existentes nem voltar ao motor V3.7.

## Alterações
Almas dos seis dragões com lógica por time e procs por campeão, sem loops de dano/recompensa; Recall acelerado de portadores vivos do Barão; validação individual e snapshot; farm V4.5.2c inalterado.

## Executar
1. `npm run test:v452d2`
2. `npm run test:v452d && npm run test:v452c`
3. `npm test` (suite completa pode exceder limite da máquina)
4. `python tools/sync_browser_v43.py`

## Em seguida
Concluir V4.5.2d-3 com passivos e objetivos completos antes de migrar o executor para Rust. Perfis, matchmaking, IA de prompts, 3D e multiplayer continuam não implementados.
