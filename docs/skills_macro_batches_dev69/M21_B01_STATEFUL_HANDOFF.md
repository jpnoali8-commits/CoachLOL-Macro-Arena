# M21/B01 — execução de estados, passivas e alvos duais (Skills dev69)

**Estado:** `dev69/skills-batch2`, PR #9 **Draft**, sem merge em `dev69/integration`; não é release e **nenhum kit está certificado**.

## Escopo estável, sem micropacotes

B01 continua com **35 campeões** e **140 QWER** do M19. Todos os 140 agora roteiam para adaptações jogáveis de tabuleiro em `BOARD_M20_B01_V453`; **adaptação executável não equivale a skill fiel ou kit completo**. O planejador conserva identidades estáveis de B01–B05 mesmo depois de reduzir fallbacks.

Todos os **173 P** ainda carecem de certificação oficial por kit; o roteamento de `abilityRule` de 173 × 4 tem **369** slots `training`, **323** slots roteados porém sem certificação, **0** campeões certificados. A contagem original dos 509 fallbacks caiu 140 no M20, não foi reduzida adicionalmente pelo M21.

## Novos contratos de execução autoritativa

- **Reativações/fuse:** Lee Sin Q1→Q2 permite apenas a vítima originalmente marcada e visível; verifica alcance, Realm e rota, conserva mana/CD da primeira ativação; Gragas Q agenda barril em área e resolve exatamente uma vez por ativação ou relógio. Recasts não furam o lock do primeiro cast.
- **Dano letal/death:** Zilean R arma ressurreição consumível, intercepta dano fatal, aplica estase por 1,5 segundos e cura pelo relógio. Kog'Maw P agenda uma única explosão 4 segundos após a morte, sem criar campeão extra.
- **Marcas/acúmulo:** Braum P avança com ataques aliados básicos reais até quatro hits, atordoa e respeita lockout; Varus W acumula até 3 Blight, consumidos pelo acerto das suas habilidades; Sejuani W e ataques próprios formam quatro stacks Frost para habilitar E.
- **Eventos de ataque e cura:** Lucian P arma segundo disparo após cast; Quinn consome Harrier no ataque e ganha velocidade; Cassiopeia acelera após aplicar veneno; Alistar P cura aliados próximos quando um inimigo campeão morre (adaptação incompleta).
- **Alvo duplo:** `target_any` permite Zilean E e Lulu W/E em aliados ou campeões inimigos. Revalidação de fog, Realm, range e propriedade no queue e no executor. Milio R limpa CC removível, não suppression/knockup. Seraphine W cura caso a própria Seraphine estivesse escudada **antes** da ativação. Habilidades não são carteiras de buffs arbitrários contra entidades não-campeãs.

Tudo utiliza o mesmo relógio/estado `Arena`, `EffectResolverV41`, `damage()`, `performActionV40()` e `boardCombatEnemyPoolV453Dev69()`. Efeitos persistentes, marcas e countdowns são serializáveis pelo snapshot V40. **Não criar sistemas paralelos individuais por campeão.**

## Evidência de CI

[Workflow Skills P1/M21 #40808348213](https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/actions/runs/40808348213) **PASS** em Node 22.

| Gate | Resultado |
|---|---:|
| M20 B01 QWER duas equipes | 280 / 280 |
| M20 especiais | 16 / 16 |
| M21 recasts, mortes, temporais, replay | 16 / 16 |
| M21 passivas de evento (6 famílias × 2 equipes) | 12 / 12 |
| M21 aliados/inimigos, CC, shield-heal, fog | 14 / 14 |
| M20 snapshots | 70 / 70 |
| M19 173 campeões e lotes fixos | PASS |
| Campeões declarados COMPLETE/CERTIFIED | **0** |

Outros workflows de Skills e Logic no mesmo HEAD também ficaram verdes; integração continua bloqueada na verificação Node ↔ `engine.browser.js`. Este browser bundle pertence exclusivamente ao integrador: **não gerar na branch Skills**.

## Dívida específica de B01 e próxima prioridade

**Não basta que QWER sejam executáveis.** Fechar, na mesma branch e PR #9, contratos por campeão para cada P, cada QWER e suas variantes, sem chamar `m20Status:'partial_executable'` de certificado. O risco de maior impacto restante inclui:

1. **Recasts e canais** — Lee Sin W2/E2, Zilean Q com bombas duplas, Gragas Q crescimento e W/E colisão, Fizz E/R, Lucian R bullets, Xerath R tiros, Karthus P post-mortem e Q delay; interrupção, estados e reatividade de PvP.
2. **Entidades, armadilhas e terreno** — Zac P blobs, Heimer turret IA/cargas/R upgrades, Syndra esferas e E stun, Jarvan IV R arena/flag combo, Sett Grit e slam, Galio R impacto, Tahm Kench R devour, Viktor upgrades, Urgot R execução.
3. **Passivas e recursos** — completar individualmente as 35 P, incluindo stacks, 4º hit, tiros duplos, regeneração, on-hit, buffs e condições de AA, sem criar poderes genéricos indevidos.
4. **Contrato client/PvP** — validar caminhos de entrada/UI para `target_any`, componentes `point`, modal de reação e fog com dois jogadores humanos; execução headless **não prova** que todos os controles do cliente apresentam as opções corretas.
5. **Gates finais** — duas sessões Chromium, snapshots, replay determinístico e idempotência de recibo, undo/redo, disconnect, timers, fog, Smite e compatibilidade com Itens; integrador gera browser e faz QA antes de merge/release.

Arquivos de QA novos: `tests/audit/v453_m21_b01_stateful_primitives.test.mjs`, `v453_m21_b01_passive_events.test.mjs`, `v453_m21_b01_dual_target_support.test.mjs`; matriz M20 mantida. Contratos de produção em `engine.mjs`, workflow de especialista em `.github/workflows/skills-entity-targetability-p1.yml`.

**Proibições:** não modificar `main`, `dev69/integration`, `engine.browser.js`, `version.json`, branch de Items, não abrir PR concorrente de Skills, não fazer merge, não declarar kits incompletos certificados.
