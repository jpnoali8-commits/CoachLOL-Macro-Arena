# CoachLOL Macro Arena — M44 B14D: reutilização da habilidade original (Sylas/Viego)

Data: 2026-10-29. Branch: `dev69/skills-batch2`, PR #9 Draft para `dev69/integration`, sem merge.

## Decisão arquitetural definitiva

**Sylas não possui implementações paralelas das ultimates roubadas.** Ele chama a **mesma execução autoral da ultimate original** e permanece dono do comando, recurso, equipe, evento, efeito e crédito de abate. **Viego não possui uma lista manual de campeões copiáveis.** Ele troca temporariamente a identidade ativa e a aparência para o campeão morto, usando as passivas P já conectadas à identidade e os mesmos contratos Q/W/E do motor. Sua ultimate **R permanece sempre Viego.R (Heartbreaker)** e reverte a possessão ao ser usada.

O motor é um jogo estratégico PvP em turnos (um humano controla 5 campeões por lado), portanto não copiamos software de um MOBA realtime; reaproveitamos a execução autoral determinística do próprio tabuleiro.

### Catálogo único

`m44B14DOriginalBoardRuleV453(champ,slot,u,gnarMega)` é a **única ordem de precedência** dos contratos board que já são registrados nos catálogos M16, M44, BOARD, M20, M15 e FORM. `abilityRule` e `boardKitForV453Dev69` usam esse mesmo registro, assim como Sylas e Viego.

Quando uma nova habilidade Q/W/E/R for registrada em um catálogo autoral **integrado a essa precedência**, Sylas verá a nova R automaticamente se for um contrato board executável, e Viego utilizará as Q/W/E se possuir o campeão. **Não é necessário adicionar esse campeão a uma segunda lista de Sylas ou Viego**, nem reescrever as habilidades copiadas. Skills `training`, somente passivas, legadas sem adaptador board ou ainda ausentes **não são substituídas por efeitos falsos**; uma habilidade sem adaptador deve ser implementada pelo proprietário primeiro.

A tabela `M44_B14C_VIEGO_COPY_V453` foi **removida** da engine: a limitação a Hwei/Azir/Bard não existe mais na lógica de possessão.

### Sylas: Hijack / original R

- `queueSylasHijackV453M14`: visão, distância 950, Reino, elegibilidade da R, mana e cooldown são verificados antes de enviar ordem privada.
- `resolveSylasHijacksV453M14`: revalida o campeão real, paga o Hijack **uma vez**, trava a origem e guarda a ultimate no estado serializável do Sylas.
- `executeBoardSkillV453Dev69`: realiza um **dispatch síncrono ao mesmo executor** com a identidade da origem em escopo limitado; restaura Sylas em `finally`. Não muda ID, dono, equipe ou roster.
- Trilha M16 e efeitos board de R não gastam recursos duas vezes. A R é consumida uma vez, apenas em execução aceita.
- `damage` isola a identidade base para **passivas e crédito de abate**: uma R de Viego roubada por Sylas **não gera almas de Viego**.
- Contra um Viego possuído, Hijack lê `m44B14CPossession.originalChamp`, portanto rouba **Viego.R**, não a R do disfarce.
- Testes executaram R reais de 15 campeões nos dois lados, inclusive Bard, Malzahar, Volibear, Nocturne, Diana, Lissandra, Ryze, Skarner, Ekko, Yorick, Viego, Anivia, Talon, Rengar e Kalista. Não declarar 15 como teto: qualquer R board autoral futura é candidata.

### Viego: Sovereign's Domination real P/Q/W/E + aparência

- Um abate ou assistência genuínos gera alma **individual, por vítima, dono e sequência de morte**; não há concessão global.
- `queueViegoPossessV453M44B14C` e `resolveViegoPossessV453M44B14C` revalidam alma, corpse, timer, mapa, visão, Realm, colisão e controle antes da possessão.
- A unidade **continua com o mesmo `id`, `team` e controlador**. Durante a possessão, `u.champ` é o **campeão copiado**, ativando seus hooks de passiva já implementados e Q/W/E originais, sem criar uma unidade extra.
- `m44B14DAppearanceV453` publica o campeão, duração e `effect:'viego_possession'`; a perspectiva visível do inimigo recebe `champ` e `visualEffect` sem revelar planos ocultos. O efeito de partículas/skin no navegador ainda depende de integração de renderização: **não está certificado visualmente**.
- Rank Q/W/E é derivado de ranks próprios de Viego para o modelo tático; mantém seus itens, ouro e feitiços. Range/klass temporários seguem o campeão copiado e são restaurados.
- R sempre roteia `Viego.R` e encerra a possessão depois do cast. Após oito segundos ou morte, reverte campeão, Q/W/E ranks, cooldowns, alcance, classe e aparência. O ledger temporário é serializável.
- O código existente das passivas é reutilizado quando já implementado (verificado com **Twitch e Teemo**); novas passivas próprias devem continuar sendo criadas no motor original, não em uma duplicação de Viego.
- Quando um campeão ainda não possui Q/W/E board autorais, o slot fica bloqueado **sem fallback genérico**. Ser capaz de possuir sua aparência **não garante kit completo**.

## QA — HEAD engine blob `143cc192269a2a678677aeb8462e56adc2b4ab12`

| Escopo | Suítes | Cenários | Resultado |
| --- | ---: | ---: | --- |
| M44 B01 até B14C | 27 | 1.006 | **PASS 1006/1006** |
| M44 B14D, `tests/audit/v453_m44_b14d_shared_original_sylas_viego_pvp.test.mjs` | 1 | 78 | **PASS 78/78** |
| **Todos os M44** | **28** | **1.084** | **PASS 1084/1084** |

Todas as 28 suítes foram reexecutadas após o **último commit no motor**, em JavaScript V8 local ao ChatGPT, contra `engine.mjs` real e seus mapas/máscaras JSON, com fixtures explícitos de visão/LOS. Verificações espelhadas blue/red, 15 ultimates Sylas, 12 fontes Viego, P Twitch/Teemo, Viego R, expiração, morte, roubo Viego por Sylas, sem passiva do doador, propriedade de soldados, snapshots `checksumV40`, anti-fog e ausência de fallback.

**Não certifica**: testes nativos `node --check`/Node e `npm test`; `engine.browser.js`; browser/UI GLB/VFX; partida real entre dois clientes; 17 eixos de paridade LoL; todos os kits P+QWER, todos os coeficientes Riot 26.21, itens, todas as condições de passivas especiais; privacy/anti-cheat completo ou gates de release. **Zero kits novos completos certificados.**

## Histórico de commits B14D

1. `f9379654739f3e339cfc87a33174365d009f395c` — contrato único de catálogo de habilidades originais.
2. `4782e3cb3c0e9e3e543a04d74c1d4988ec69b279` — Sylas executa código original da R.
3. `67b741961e18e03df73eea8eae22ec06e1e314c5` — Viego copia identidade/P/QWE/aparência, mantém e usa própria R.
4. `e1dd3a9ea438e55ae7ae0dbda20d4d2e7670495e` — atualiza suite B14C à nova regra.
5. `16a7452cdcce8e778bfa620566222901fdf13972` — Sylas rouba Viego R mesmo se Viego estiver possuindo alguém.
6. `9527b77a36451a67c76136c98bf42fee8982df9a` — suite B14D 76 cenários.
7. `bfeb15a29d9c2882175b8f3c0fe547a8313ff068` — isola passivas e crédito do proprietário durante ultimates roubadas.
8. `35bd000584ff4d5f923007d798d57ad6724019d8` — suite B14D atualizada para 78 cenários.
9. Este handoff.

## Próximo marco técnico

**M44 B15**: aumentar produção em lotes de 25–40 campeões segundo complexidade, começando pelos slots autorais pendentes e passivas exclusivas, sem implementar cópias para Sylas/Viego. Novos autores integram seus contratos na única precedência `m44B14DOriginalBoardRuleV453`, com testes de owner/forma/passiva e PvP espelhados. Rastrear especificamente kits ainda somente V42/legados, formas e exceções de estado para migrá-los ao executor board quando necessário.

Depois, a integração de `engine.browser.js`, UI de Viego/sinal de possessão e efeitos GLB/VFX deverá ocorrer em uma fase coordenada separada, **não** neste PR isolado. O MVP continua PvP, não bot AI. Não alterar `main`, `dev69/integration`, workflows, GitHub Actions, Codespaces ou workers; **não fazer merge do PR #9**.
