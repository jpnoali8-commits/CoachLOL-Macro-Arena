# M22/B01 — estados em múltiplas etapas, canais, munição e bombas

**Projeto:** CoachLOL Macro Arena — `dev69/skills-batch2` · PR #9 ainda Draft e sem merge.

## Resumo técnico

M22 aprofunda o mesmo **B01 fixo, com 35 campeões**, em vez de fragmentar a produção em PRs por campeão. A engine autoritativa continua usando `abilityRule`/board skill executor, efeitos V41, `gameTime`, snapshots V40, regras PvP 1v1 com dois humanos (cada um coordena cinco campeões).

### Primitivas adicionadas / aprimoradas

| Família compartilhada | Campeões e habilidades | Comportamento de tabuleiro demonstrado |
|---|---|---|
| `m22Magazine` | Corki R | Munição máxima 7, reposição por tempo, Big One periódico no terceiro disparo, rejeição de 0 cargas. |
| `m22ArtilleryShots` + `m22_artillery_channel` | Xerath R | Canal de tiros direcionáveis, 3/4/5 conforme rank, intervalo mínimo, interrupção por CC/movimento, expiração e uma cobrança inicial. |
| `m22_zilean_bomb` | Zilean Q e sinergia W | Bomba serializada com atraso; pode seguir um campeão inimigo; sobreposição detona a anterior, atordoa e agenda a segunda; sem duplo tick. |
| `createdAt` de efeitos temporais | Gragas Q | Barril acumula dano por tempo antes de detonação manual ou automática. |
| `m22SecondStage` + `m22SecondaryV453` | Lee Sin W2/E2; Zac Q2 | Autorização por slot, TTL e alvo, sem cobrar novamente mana/CD. W2 ganha cura por dano, E2 usa ledger da primeira etapa e reduz movimento, Zac Q2 desloca alvos com checagem de Realm/visão/colisores. |

**Aviso de escopo:** o quadro não comprova paridade integral com a versão oficial de League of Legends. Existem aproximações deliberadas e estados exclusivos ainda ausentes; por exemplo: custos de energia da segunda ativação, Zac Q2 como AA, anexação de bomba do Zilean a aliados, HUD completo de tiros do Xerath, som/partículas, movimento de Kog'Maw P, passiva pós-morte do Karthus, interações de execução/limiares e funcionamento de todas as outras passivas individuais.

### Segurança e integridade

- Os pedidos do cliente só carregam referências e intentos; servidor revalida dono, cooldown, temporizador, alcance, visão/Realm e colisores, conforme aplicável.
- Tiros são explícitos, sem selecionar inimigos automaticamente via fog, nem devolver identidades de alvos ocultos.
- O segundo cast não passa por `performActionV40`; o primeiro registra o consumo único de mana e cooldown, os timers e contadores pertencem ao estado de `Arena`.
- `advanceBoardTemporalV453Dev69` resolve detonações e cancelamentos de canais; `damage()` é a única entrada de dano/heal por acerto.
- `m22SecondStage` é data-driven: outras habilidades podem adquirir novos tipos sem copiar executor inteiro por campeão.

## QA

- [Workflow P1/Skills M22, #40809892471](https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/actions/runs/40809892471): **PASS**.
- [M22 canal/fuse, #40809572197](https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/actions/runs/40809572197): **PASS**, mantido na regressão final.
- `tests/audit/v453_m22_b01_channel_fuse.test.mjs`: **14/14** para Xerath, Zilean, Corki, Gragas nas duas equipes.
- `tests/audit/v453_m22_b01_second_stage.test.mjs`: **14/14** para Lee Sin e Zac nas duas equipes.
- Regressão M21 (3 suítes): **42/42**, M20 matriz **280/280 casts**, M20 especial **16/16**, 70 snapshots de matriz.

Gate de cobertura geral M19 permanece com **173 P**, **692 QWER**, **369 fallback training**, **323 roteados não certificados**, **0 campeões certificados**. Esses contadores não são substituídos por métricas de QA pontual.

## Continuação recomendada

Próxima prioridade é **M23/B01**, aprofundamento em mecanismos de alto risco para grande parte dos kits:
1. **Post-mortem e estados de morte:** Karthus P, Zac P blobs, ressurreições, dano ao morrer, cancelamentos, ordem determinística das mortes.
2. **Recasts e formas:** Fizz E, Jarvan flag-dash+R, Sett Grit, Tahm Kench Devour, Urgot execute, Syndra orb stuns, Heimer upgraded turrets e charges.
3. **Canalização/ataques múltiplos:** Lucian R, Xerath Q charge, Karthus Q delay, Quinn skystrike e Viktor evolução.
4. **Auditoria P+QWER por kit completo**, matriz 2 lados, fog/colisão/realm, undo/replay/snapshot, habilidades multi-alvo e todos os invariantes PvP.
5. **Integração reservada:** somente integrador pode atualizar `engine.browser.js`, `version.json` ou `dev69/integration`; conferir UI real do novo fluxo Q2/W2/E2/R-shot antes da certificação.

**Não declarar COMPLETE/CERTIFIED** até resolver todos os efeitos únicos, a entrada UI do jogador e QA de integração. Manter PR #9 aberto como Draft, sem merge.
