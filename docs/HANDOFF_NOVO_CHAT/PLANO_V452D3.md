# V4.5.2d-3 — Plano de engenharia executável

**Situação:** próximo marco a ser implementado. Nada neste handoff equivale a implementar V4.5.2d-3. Preserve `version.json` V4.5.2d-dev2 até o primeiro incremento ser efetivamente desenvolvido e validado.

## 0. Baseline e gates de preservação

- Ler `AGENTS.md`, `docs/QA_V452D2_SOULS.md`, fonte `engine.mjs` e testes de objetivos; executar `git status` e registrar mudanças locais.
- Snapshot da seed da V4.5.2c e **golden tests**: mesma distribuição CS normal, sem CS artificial, mesmos cooldowns e gold quando efeitos extras não intervêm.
- Números de balanceamento por `patch=26.21`, `mode=Summoner's Rift`, com fontes (Riot patch notes quando disponíveis; wiki versionada quando necessário), data de conferência, fallback `training` quando não houver confirmação. O patch seguinte ainda não deve ser antecipado.
- Evitar alterar frontend, layout e caminho de farm salvo bug reproduzido; manter `engine.browser.js` derivado da fonte canônica.

## 1. Regras elementais por equipe (incremento d3-A)

Implementar passivos permanentes e acumuláveis de cada dragão **independentemente** da Alma e do Ancião. Cada stack deve ser representado por um registro canônico: tipo, equipe capturadora, quantia, fonte e versão do patch. Derivar atributos do conjunto de stacks; não somar diretamente em stats finais de modo irreversível.

- Infernal: modificadores ofensivos conforme patch, integrados ao pipeline de atributos recalculáveis.
- Montanha: armor/MR conforme patch, na fonte canônica de estatísticas.
- Oceânico: cura/regen de HP ausente conforme simTime, sem overheal.
- Nuvens: movimento ou outros modificadores oficiais conforme patch.
- Hextech: attack speed / ability haste conforme patch e clamps de estatísticas.
- Quimtec: tenacity e healing/shielding power conforme patch; testar elegibilidade por CC.

**Não inventar percentuais.** Verificar valores 26.21 antes de gravar coeficientes. Testar stack 0,1,2,3, efeitos de crescimento por level e mudança de itens, morte, respawn, snapshot e duplicidade de processamento.

## 2. Barão individual e minions fortalecidos (d3-B)

- Concessão de Baron buff a campeões elegíveis no abate, start/expiry em `simTime`, eliminação ao morrer, nenhuma reativação pelo respawn.
- Modificadores AD/AP por campeão com escala por nível conforme patch, recalculados sem duplicar após `snapshot` e recomposição de itens.
- Aura por distância apenas de portadores vivos, separando melee/caster/siege/super; manter as diferenças testadas d1. Movement speed/pathing/aggro/redução de dano por classe, com fallback documentado onde modelo exato ainda não existir.
- Recall reduzido 4s somente enquanto buff ativo; testar morte, expiração, interrompimento e `speed 2×`.
- Dano em torres e interação com superminions: nunca permitir atacar estruturas protegidas por regras de lane.
- Não usar `teams[team].baronUntil` legado como fonte autoritativa individual.

## 3. Ancião, Smite e simultaneidade (d3-C)

- Elder verdadeiro em ticks (já existe versão parcial d1), execute threshold/tempo correto e interação com imunidade, stasis, shields, cura, DoT, morte e disengage.
- Processamento determinístico de ações simultâneas em objetivos: AA, habilidades, Smite, aliados ao mesmo tempo, empate, overkill, última ação válida. **Não** gastar Smite fora do alcance ou consumir cargas duplamente.
- Validar 5v5 em cova, fog, exposição de mensagens, rewards e score; tests para Barão, Dragão, Elder, Arauto e Vastilarvas.
- Rastrear qualquer diferença restante entre resolução de ticks do CoachLOL e eventos subsegundo do LoL como dívida técnica, não como certificação.

## 4. Dados, snapshots e estabilidade (d3-D)

- Um `ObjectiveEffectLedger` (ou extensão do ledger atual) com IDs estáveis para stack, source, timestamps simulados, expiry, kill/source team; versões de payload.
- Journal só contém eventos observáveis para cada equipe. Replay/snapshot preserva ordem, RNG, prazos e dono do buff.
- Deduplicação de eventos secundários: só um crédito de kill, só um crédito de ouro/XP/objetivo, não reacender procs de Soul por ticks DoT derivados.
- Instrumentar CPU por tick, quantidade de verificações de aura, resolução de 5v5 e memória; caso haja custo relevante, usar spatial bucketing e cache por movimentação/tick em vez de varrer todos os atores por frame.

## Sequenciamento e definição de pronto

- Primeiro implementar **d3-A** e testes, sem tentar d3-A/B/C/D em uma única mudança extensa se houver risco de regressão.
- Cada incremento deve gerar `CHANGELOG`, QA, matriz de maturidade e flags `partial/tested/certified` corretamente.
- Gate P0: `npm run test:v452c` mantendo CS normal + testes V4.5.2d/d2 + novos casos específicos; `npm test` integral PASS **ou** reportar timeout/falha com precisão; `node --check`, sincronização do navegador e teste visual quando disponível.
- Entrega: ZIP atualizado **completo**, sem regredir código e Git, com instruções de continuidade.

## Próxima etapa depois da V4.5.2d-3

**V4.5.2e:** attack speed e windup por campeão, projéteis temporais, aggro de minions, freeze TOP/MID, paridade de dano em waves. Depois V4.5.3 itens/runas/feitiços e V4.5.4+ kits de campeões por lotes.
