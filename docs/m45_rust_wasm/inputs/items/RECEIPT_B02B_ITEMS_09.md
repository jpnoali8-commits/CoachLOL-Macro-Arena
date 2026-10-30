# CoachLOL Macro Arena — M45 / Chat 3 — B02B-ITEMS Lote 09

**Data:** 2026-10-30  
**Estado:** `SOURCE_JS_V8_PASS` (**30/30 casos**, **30/30 replays equivalentes**); `NODE_ESM_NOT_RUN`; `RUST_NATIVE/WASM_NOT_RUN`; **G8 NOT_CERTIFIED**.  
**Branch exclusiva:** `dev69/m45-audit-items`.  
**Engine original, somente leitura:** `dev69/items-batch2@182e592fc27cc9516cf6d52ef2fabc17ee1e1b7d`. `engine.mjs` blob `e06cfe0c18ded3d21f7a1d9bc62909543ccbbb6d`.  
**Branch integração preservada:** `dev69/integration@374d87d5f49b52514ec68bbe666df086363c1ec5`.  
**Rust core de referência:** `dev69/rust-core-m45@73cade4632598fbe62bb3cf5034f61cf91dd403a` na leitura inicial B09; somente `core-state`, sem `core-items`/`core-economy`/`core-combat`/`core-skills`.

## Escopo e execução efetiva

O lote avançou do B08 (habilidade genericamente autorizada por `performActionV40` + dano classificado) para **dois caminhos de habilidade realmente resolvidos pelo motor legado**:

- **Ezreal Q / Disparo Místico**: `Arena.castEzrealMysticShotV453Dev42` valida a habilidade e cria um projétil; `Arena.advanceChampionProjectilesV453Dev42` percorre a trajetória atrasada, intercepta minions e campeões, verifica barreiras e executa `Arena.attack(...,'skill_on_hit')`. Uma proteção por Banshee impede dano primário e procs vinculados. Se o alvo sai da trajetória depois do lançamento, o projétil não o persegue.
- **Nami W / Fluxo e Refluxo**: `Arena.queueTargetedSkill` + `Arena.resolveTargetedCasts` realizam a cura inicial em aliado e um ricochete em campeão inimigo, com interações reais de Ídolo Proibido, Semblante Espiritual, Liandry e Banshee.

**Limite essencial:** o lobby fonte padrão seleciona Jinx/Caitlyn como ADCs e Nami/Leona como suportes. **As fixtures substituem apenas o campo de identidade do campeão em arenas descartáveis** para executar Ezreal Q e Nami W em ambas as equipes; isso é auditoria de executores fonte, **não é certificação de seleção completa, atributos oficiais, kits/passivas QWER, combos nem rede PvP**.

A colisão utilizou **minions efetivamente criados por `Arena.spawnWaves()` em `gameTime=80`**, isolando e reposicionando um minion via `bodyX/bodyY` na fixture sem modificar a engine. Os métodos de gameplay invocados foram os originais `minionBodyCollisionAlongV453Dev52`, `resolveChampionMinionBlockV453Dev48`, `moveAlong`, `walkable` e o cálculo de Energizado.

## Resultado executado em V8

| Família | Cenários por equipe | Azul + vermelho | Observações |
|---|---:|---:|---|
| Colisão/minion/movimento | 6 | **12/12 PASS** | Normal bloqueado, Phantom atravessa minion, minion morto não bloqueia, aliado bloqueia, Phantom respeita parede, movimento concede Energizado legítimo |
| Skills resolvidas + itens | 9 | **18/18 PASS** | Ezreal Q real, Banshee, minion interceptador, alvo que muda de posição, barreira posicional, Nami W com Idol, Spirit Visage, Liandry e Banshee |
| **Total** | **15** | **30/30 PASS** | **30/30 registros repetidos identicamente** |

### Observações numéricas registradas no QA

- Sem `phantom_dancer`, minion vivo bloqueou deslocamento: **0** unidades.
- Com `phantom_dancer`, mesmo segmento: **299,8** unidades.
- Com `phantom_dancer`, parede real não atravessável: **0** unidades.
- Ezreal Q com alvo deslocando-se lateralmente após o lançamento: **0** dano, razão `sem_alvo`.
- Ezreal Q com barreira posicional inimiga: **0** dano, razão `bloqueio_posicional`; cooldown do Q permanece inalterado na colisão bloqueada.
- Nami W, cura inicial do aliado no teste azul: **115 HP** sem Ídolo; **124,2 HP** com `forbidden_idol`, mantendo a etapa real de ricochete.
- Nami W com Liandry gera efeito DoT no alvo se o bounce atinge; Banshee bloqueia tanto o impacto quanto a queimadura, com efeito Annul consumido.

## Artefatos publicados

- `spatial_skill_b09_cases.mjs`: módulo **puro JS**, com 15 cenários x duas equipes, testes reutilizáveis por V8 e Node, sem implementação de gameplay. **Git blob** `70788383dd463c73b1d9cae03af00d137cc5bba4`.
- `golden_b09_spatial_skills.test.mjs`: runner Node ESM, source lock, assert 30/30, compara replay completo e somente grava `GOLDEN_B09_SPATIAL_SKILLS_EXECUTED.json` após assertions. **Git blob** `a69fbcec3783d7e7070420dc404c91779b9796c0`; **NOT_RUN** como Node.
- `QA_V8_SPATIAL_SKILLS_B09.json`: dados das 30 execuções reais V8 (caso/seed/equipe/resultado/checksum), originados da engine legada congelada e dos métodos originais; **30/30 PASS e 30/30 repetidos**. Nunca emitir `GOLDEN_*_EXECUTED` apenas por um teste V8.
- `SPATIAL_SKILL_RUST_CONTRACT_B09.json`: proposta para Chat 1. Contratos de colisão, vida de projétil, impacto e itens em habilidades reais. Não é crate Rust.
- `run_items_goldens_b04.mjs`: agregador Node atualizado para B01–B09, **519 candidatos** (489 de B01–B08 + 30 B09), sem consumir Actions; **Node full checkout NOT_RUN**.

## Handoff Rust — fronteiras importantes

1. **core-pathing**: minion block por *swept-circle* em coordenadas autoritativas, corpo vivo e tempo de spawn, limites e paredes; Phantom Dancer ignora apenas colisões de unidade, não `walkable`.
2. **core-clock / core-skills**: projétil com origem e direção imutáveis, velocidade e intervalo no tempo lógico, seleção de interceptores por profundidade, barreiras e snapshot serializável.
3. **core-combat / core-items**: `ability_onhit` explicitamente opt-in; aplicação de Banshee antes de dano e procs; Liandry apenas após dano real; amplificação de cura por origem/recipiente; cooldowns e origem dos efeitos.
4. **core-protocol / core-replay**: cada ação pertence a uma seat autenticada que controla cinco campeões; ordem autoritativa dos comandos e dos eventos precisa sobreviver aos snapshots e ao reconnect (referência B06).
5. **P1 conhecido**: troca de trinket no gateway PvP legado ausente. Esse problema deve ser corrigido como desvio declarado na migração Rust, não usado como funcionalidade aprovada (B04–B08).

**Nenhum** `core-items`/Rust foi implementado por este chat porque as crates/contratos compartilhados ainda não estão publicados. **G8 segue bloqueado**.

## Como executar os Node goldens quando checkout estiver disponível

```bash
git switch dev69/m45-audit-items
node docs/m45_rust_wasm/inputs/items/golden_b09_spatial_skills.test.mjs
node docs/m45_rust_wasm/inputs/items/run_items_goldens_b04.mjs
# Gravar somente após validação integral:
node docs/m45_rust_wasm/inputs/items/run_items_goldens_b04.mjs --write
```

**Não foram acionadas GitHub Actions/Codespaces, nem realizados merges, rebase, force-push ou alterações na engine/branches legadas/central Rust.**

## Próxima prioridade: B10

Priorizar cenários reais de habilidades × itens que percorrem múltiplos ticks e snapshots/reconnect (projétil lançado antes de salvar, impacto após restauro) e ampliar testes de bloqueios/reação PvP. Em paralelo, verificar se o coordenador publicou contratos/crates para iniciar portagem Rust propriamente dita.
