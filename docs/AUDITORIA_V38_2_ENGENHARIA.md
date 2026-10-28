# CoachLOL Macro Arena — Auditoria de engenharia e integração (V38.2)

**Data:** 26/10/2026 | **Código-base:** V38.1 | **Fonte de integração:** V3.7 Cinematic Foundation, **somente** módulos cinematográficos | **Modo:** protótipo offline, regras de Summoner's Rift PC referenciadas separadamente.

## Decisão arquitetural: nunca rebaixar o motor para V3.7

- Mantidos `engine.mjs`, `engine.browser.js`, `app.js`, `index.html`, estilos v38/v38-1, dados, UI, seleção, loja, perseguição e combos da V38.1.
- Migrados de v3.7 cinematográfica como add-on **não autoritativo**: `cinematics-core.mjs`, `cinematics-core.browser.js`, `cinematics.js`, `cinematics.css`, `data/cinematic_event_manifest_v37.json`, `data/cinematic_manifest.browser.js`, 8 testes de eventos e fog.
- NÃO substituídos arquivos legados `engine.mjs` e `app.js` pela cópia v3.7. A versão resultante é V38.2 (3.8.2), não 3.7 nem 4.0.
- A fundação cinematográfica funciona como `WorldEvent → ViewerEvent → CinematicCue → Presentation` com `id`, `tick`, `round`, `observedBy` capturado quando evento nasce e `public` para anúncios verificáveis. O player visual não pode aplicar danos.
- `cinematics.js` permite fila/ordem, pular, reduced motion, fallback e vídeos locais opcionalmente. **Renderizador real de GLB não incluído.**

## Causa e correções dos defeitos

| Bug ou dívida | Evidência V38.1 | Correção V38.2 | Limite ainda aberto |
|---|---|---|---|
| Nami W alcançava longe | `dist(u,primary)>.100` em coordenadas 0..1 equivalia a ~1500 unidades do atlas | Regra explícita de **725** unidades. Intenção persistente com `lastSeen`, pathfinding e caminhada antes de gastar mana ou iniciar CD | Bounce simplificado, escala do atlas e valores de efeitos requerem calibração por patch |
| Cooldown W por turnos | `skillCds.W` simulado em segundos, mas havia rotas distintas de cast de W | Custo/CD em registry por campeão e rank, conferência no pedido, durante cast e nos combos. Início do CD após cast válido | W de Nami tem **10 s** oficiais. Uma rodada de 10 s pode legitimamente permitir W a cada rodada; não impor bloqueio arbitrário de turnos |
| Todos QWER compartilhavam range de AA | `resolveQueuedCombos` usava `u.range` e `Math.max(...,.035)` para habilidades ofensivas | Registry de range por habilidade; Lux R **3400**, Nami R **2750**, W **725**; outros slots usam limite provisório e caminho automático | **A maioria dos kits NÃO é fiel a LoL**: cada habilidade precisa targeting próprio, colisão, tipos, recursos, CC, marca, reset, passivas |
| Ultimates sem visualização | Casting no motor não gerava VFX local de geometria | Lux R e Nami R iniciais emitiem evento de linha com geometria e overlay desenhado no tabuleiro, mais eventos cinematográficos | Lux R é laser não-projétil; Nami R precisa viajar com velocidade/duração, colisão projetil e animação real; atualmente hit simplificado/imediato |
| Gank avisava cedo | Alertas poderiam depender de mensagem genérica e eventos incompletos | Eventos privados filtrados por equipe, `observedBy` no instante de emissão e eventos de gank como ordens privadas por ponto. Reação do defensor somente após o primeiro ataque real | Multiplayer só tem privacidade real se cada cliente receber apenas um snapshot autorizado do servidor; bot offline compartilha processo |
| Dados de CD fragmentados | Skills em combos eram valores genéricos 9/12/13/65; W específica tinha 10 | Registry usa dados específicos dos três casts acima no mesmo `skillCds` do ator | Levar **todos** os caminhos (`queued`, automação, escape, especial, itens, reações) ao mesmo resolver em V3.9/4.0 |
| V3.7 cinema sobrepôs versão nova | `app.js` e `engine.mjs` da v3.7 tinham menos sistemas | Migração seletiva, preservando V38.1, compatibilidade dos scripts do navegador e fallback | Replay, GLB, vídeo real, cache, LOD e bibliotecas de assets seguem pendentes |

## Contrato-alvo de habilidades (obrigatório antes de afirmar que um campeão está finalizado)

`AbilityDefinition(champion,slot,patch,rank)` inclui: `id`, `targeting` (`self`, `unit_ally`, `unit_enemy`, `point`, `direction`, `area`, `global`), `targetMask`, `originSocket`, `range`, `minRange`, `collisionRadius`, `hitbox`, `travelSpeed`, `castTime`, `channelTime`, `manaCost`, `charges`, `cooldown`, `cooldownStart`, `timeScaling`, `damageType`, `scalings`, `effects[]`, `onHit`, `onCast`, `visionPolicy`, `revealPolicy`, `interruptRules`, `castLocks`, `projectilePolicy`, `vfxCue`, `audioCue`, `dataSource` e `confidence`.

Pipeline normativo:

```text
CommandIntent (privado, assinado por equipe)
  -> Queue/Validate (aprendido, equipamento, silêncio, mana/CD)
  -> AcquireTarget (visão, memória, localização ALVO; sem wallhack)
  -> NavigateToRange (A*, colisão, trajetória e range REAL da habilidade)
  -> RevalidateAtCast (tempo da simulação, visão, range, recursos, status, direção)
  -> CommitCast (cobrar recurso uma única vez, CD absoluto em gameTime)
  -> SpawnResolvedObject (área, projétil, escudo, DoT ou canalização)
  -> TickEffects & Collision (hitboxes, prioridades e CC autoritativos)
  -> WorldEvent(id, tick, round, observedByAtEvent, public, payload)
  -> TeamSnapshot/ViewerEvent (filtragem autoritativa)
  -> Presentation (VFX, HUD, áudio, cinematic; sem modificar jogo)
```

**Invariantes:** (1) nenhum feitiço lança acima do alcance; (2) movimento em direção a alvo oculto usa **última posição conhecida**, nunca coordenada verdadeira; (3) cooldown não zera por transição de turno, recarregar UI ou câmera; (4) custo de mana/CD apenas quando ocorre cast válido; (5) reação não cancela dano passado; (6) feitiço de área pode atingir unidades não visíveis após cálculo independente sem o jogador ganhar mira automática; (7) informação sobre ataque oculto só é exposta quando regra de visão/cast/hit permitir; (8) um evento gerado deve ser observável por mesma equipe sob replay e multiplayer.

## Escopo atual e limites observáveis

**Implementado na V38.2:** seleção múltipla V38.1; combate não consensual; aproximação programada Nami W; registry inicial de Nami W/R e Lux R; range e cooldown em combos; caminho para combos fora do alcance; gank por ponto sem target lock na fog; VFX de linha simplificado; envelope de evento por time; módulo cinematográfico com manifesto seguro e fallback; testes automatizados.

**NÃO implementado:** todas as passivas/QWER de todos os campeões, LoL 1:1, projéteis com velocidade e hitboxes individuais, skillshots por ponto e direção genéricos na UI, recasts, cancelamento de conjuração completo, tenacidade, imunidades, ativos de todos os itens, runas oficiais, authoritative PvP, parser seguro completo de comandos em rede, reprodução GLB real e vídeo/assets autorais, simulações extensivas de benchmark após mudança de motor, equivalência interplataformas Rust/WASM.

## Riscos que permanecem (prioridade)

1. **P0 — skill resolver fragmentado.** `resolveTargetedCasts`, `resolveQueuedCombos`, `resolveSpecialUltimates`, `castEscape`, `resolveSummonerCasts` e lógica de auto-ataque ainda usam mecanismos separados. Migrar para único `AbilityExecutor` e ledger de custos/CD.
2. **P0 — fog no multiplayer.** `Arena` completa no mesmo processo do cliente offline, e o cliente ainda contém estado inimigo em memória. Não disponibilizar como PvP competitivo até usar servidor autoritativo com projeção por time.
3. **P0 — skills incompletas.** Só Nami W, Nami R e Lux R receberam regras especificadas nesta entrega; o resto é uma aproximação didática, NÃO representação fiel de LoL.
4. **P1 — mecânicas de CC.** Knockup Nami R é estimado em 1 tick; slows e outros estados precisam vencimento, stacking e prioridades consistentes. Shields e curas automáticas precisam contratos de range, duração e cooldown.
5. **P1 — trajectory/replay.** VFX é efeito visual de linha instantânea; sem frames de viagem e sem replay persistente/idempotência de arquivo de eventos.
6. **P1 — atlas.** Um mapa normalizado e `worldWidth` linear aproximam o SR, mas hitbox/range devem ser calibrados com a projeção 2D/2.5D e altura e obstáculos.
7. **P1 — economia/objetivos/estruturas.** Regras de farm, jungle e gold ainda são simplificadas e exigem testes longos, divergências por patch e aleatoriedade controlada.
8. **P2 — UI/data.** O modal precisa exibir range exato/cast type/CC e recursos, e disponibilizar mira por direção/ponto, preview VFX projetado e motivos de espera.
9. **P2 — licenças.** Riot Data Dragon/wikis podem ser referência de dados, mas não concedem automaticamente licença de copiar campeões, arte, sons, modelos, vídeos ou marcas comerciais em um jogo distribuído.

## Evidências de validação

- `npm test`: suíte histórica V16–V38.1 preservada + 8 testes originais cinematográficos da v3.7 + novos contratos V38.2 aprovados.
- `node tests/v38_2_skill_range_cinematic.test.mjs`: range, cooldown, movimento Nami W, Lux R, fog e isolamento visual.
- Chromium headless com scripts/estilos locais embutidos: aplicação abriu sem exceções de página, módulo cinematográfico criado e overlay de evento exibido. Servidor `http://127.0.0.1` bloqueado pelo sandbox; cenário de arquivos/recursos reais em Windows não foi validado.

## Fontes públicas consultadas (Summoner's Rift PC, conferir patch selecionado ao consolidar dataset)

- Nami: https://wiki.leagueoflegends.com/en-us/Nami (W range 725, mana 70–90 e CD 10; R range 2750 e CD 120/110/100)
- Lux: https://wiki.leagueoflegends.com/en-us/Lux (R Final Spark range 3400 e CD 60/50/40; **não** projétil bloqueável como Nami R)

*Este relatório documenta o estado comprovado do código inspecionado e testado; não certifica ausência total de bugs nem fidelidade completa ao patch oficial.*
