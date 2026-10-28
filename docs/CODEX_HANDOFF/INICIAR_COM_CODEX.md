# Instruções para iniciar localmente no Codex

1. Copie o ZIP base oficial `CoachLOL_MacroArena_v452_Buffs_Draft_Ghost_FarmAuditoria_Offline.zip` para um diretório de trabalho versionado com Git e extraia-o. **Este handoff não contém/reescreve o jogo**, apenas documentação e orientação.
2. Copie `AGENTS.md`, `docs/PLANO_MESTRE_COACHLOL_V452.md`, `contracts/` e `.agents/skills/coachlol-producao/` deste pacote para a raiz do projeto extraído. Se já existir `AGENTS.md` ou arquivo da mesma espécie, mescle conscientemente.
3. Abra o Codex **na pasta do jogo**. Verifique `node --version`, `npm --version`, `npm test`, `npm run test:v452` e `npm run test:v38`. Capture saídas, hashes, cobertura e estado de falha de farm.
4. Não executar testes na VPS de produção ainda. Use máquina local/branch e, depois, staging em Ubuntu.
5. Cole o prompt abaixo para a primeira sprint. Não permita que o agente altere outras áreas por conta própria.

## Prompt de primeira sprint (copiar no Codex)

> Leia AGENTS.md e docs/PLANO_MESTRE_COACHLOL_V452.md. Continue exclusivamente a partir do código V4.5.2 presente neste repositório. Sua tarefa atual é **V4.5.2b — correção P0 do farm automático**, sem inventar CS/ouro, sem retirar o teste histórico, preservando wave freeze/slow/fast push, seleção múltipla, mecânicas de objetivos, fog, spells do draft e snapshots. Primeiro audite e reproduza a falha do farm TOP em 5 minutos com seed fixa. Instrumente causas de minions perdidos; melhore previsão de dano futuro, range, posicionamento, cast/AA timing, pathfinding, aggro e cooldown. Critério: 35–62 CS em 5 min em TOP/MID/ADC livres nos seeds de regressão, menor farm quando houver rotação/ausência, nenhum CS sem último golpe real. Depois prepare apenas um ADR e contratos JSON de migração do engine JS para `arena_core` Rust, sem substituir engine.mjs. Execute e relate npm test, testes de seleção/combos/objetivos, checkpoints e browser QA quando disponível. Documente mudanças, falhas e próximo marco. Não alegue LoL 1:1; respeite IP e fontes por patch.

## Depois do farm

Solicitar sequencialmente: V4.5.2a objetivos oficiais → V4.5.3 itens/runas/spells por patch → V4.5.4 kits em lotes → V4.5.5 núcleo Rust + golden tests → V4.5.6 autenticação/perfil → V4.6 web online com match actors e WebSockets → V4.7 VFX → V4.8 GLB → V4.9 AST prompts → V5.x certificação. É permitido paralelizar apenas com contratos e branches isoladas.

## Comandos mínimos de QA

```bash
npm install
npm run test:v452
npm run test:v38
npm test
npm run audit:content
node --check engine.mjs
```

**Atenção:** no package.json original `npm test` invoca duas vezes `test:v451`; corrigir essa duplicidade somente com teste e changelog. Verifique o README original de execução local antes de executar `npm install` com rede. Use `npm ci` preferencialmente se houver lockfile.
