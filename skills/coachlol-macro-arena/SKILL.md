---
name: coachlol-macro-arena
description: Desenvolvimento e auditoria incremental do CoachLOL Macro Arena, motor de turnos simultâneos e UI offline, com regressões, fórmulas rastreáveis e visão por time.
---

# Skill local de produção — CoachLOL Macro Arena V4.4+

Esta skill é **arquivo local reutilizável no ZIP**, não afirma estar instalada automaticamente no ChatGPT, Codex ou MCP.

## Contexto técnico permanente

- Projeto: **CoachLOL Macro Arena**, jogo de tabuleiro tático para treinar macro em formato de turnos simultâneos, com modo offline baseado em IA. Atual: **V4.4**. Não confundir com projeto BTA Motion.
- Preservar todas as versões anteriores: nenhum rewrite/remoção de subsistemas existentes sem auditoria e contrato de regressão.
- Componentes fonte: `engine.mjs` (regras/autoridade), `app.js` (UI e interação), `index.html` e `styles-v38.css`, `data/` para mapas, `assets/` para UI.
- Arquitetura: comandos validados por equipe, movimentação world coordinates, fog de visão, mensagens da perspectiva do time, sem premiação artificial de recursos.
- Estética: UI flat escura/carvão, ouro para ações, azul/vermelho para equipes, HUD compacta, SVG local e responsividade; ícones verdadeiros e barras HP/Mana no contexto.

## Ritual obrigatório por alteração

1. Identificar linha/causa no ZIP atual e checar contratos históricos.
2. Construir ou atualizar teste que reproduza o sintoma. Nunca mascarar falha retirando testes.
3. Atualizar o motor como fonte de verdade; só depois a interface. Evitar regras duplicadas em JS visual.
4. Validar visão (inimigos invisíveis), time de posse, privacidade de ordens, ações simultâneas, cooldown, recursos e ausência de deslocamento de câmera por Shift.
5. Executar `npm test`, `npm run test:v38`, QA no navegador, e 300s+ de simulação com diferentes seeds.
6. Atualizar changelog/auditoria; distinguir implementado, testado, parcial, planejado.
7. Fontes de LoL: patch vigente Riot + Wiki, versão/data, licença e divergências adaptadas documentadas. Não alegar compatibilidade 1:1 sem testes em cada campeão.

## Contratos V38 imutáveis

- Shift + botão esquerdo seleciona múltiplos campeões aliados e não move câmera; clique comum volta ao foco único.
- Comandos de grupo validados e aplicados atomica/consistentemente; combos configurados por aliado no mesmo modal.
- Não enviar combo oculto ao cliente adversário em multiplayer; modo offline atual não é seguro contra inspeção de estado local.
- Loja e sentinelas: um trinket por campeão, sem ouro extra e sem duplicar wards; varredura de lente acompanha campeão por um turno adaptado.
- Auto-level EWQ/WQE etc, R nos níveis legais (Udyr exceção).
- HP Nexus, abates, torres vivas com indicadores; MR e nível corretamente apresentados.
- CS requer morte verdadeira de minion com presença/ação válida; XP/gold determinísticos e auditáveis.
- Qualquer fórmula aproximada deve ter etiqueta `abstração` e teste de teto/alcance/cooldown.

## Próxima backlog

Detalhamento em `../../docs/AUDITORIA_V38_MOTOR_UI_ECONOMIA.md`: telemetria jungle/economia, fonte de dados de campeões/itens por patch, geometria de bloqueio, servidor PVP, Farsight e UX.


## Decisões persistentes da V38.1 (26/10/2026)

- Shift+clique esquerdo **acumula/alterna aliados**; Shift+arrastar desenha um retângulo visível de seleção no mapa, sem mover a câmera. Seleção de múltiplos aliados deve impactar movimento e comandos de grupo; seleção não deve conceder visão de inimigos.
- Ações ofensivas **não exigem consentimento** do alvo. Defesa/fuga/contracombo são respostas táticas, não permitem cancelar a primeira agressão já resolvida.
- Reações devem oferecer o mesmo editor de combos por etapas, com feitiços equipados, HP, mana, ícones e personagem; não sobrescreva automaticamente a ordem macro persistente do defensor.
- Perseguir deve usar pathfinding e informações visíveis/conhecidas, sem consultar posição atual sob névoa de guerra. Permitir `attack`, `chase`, `attack` com `chase:true`.
- `Barreira`/`Curar` são autocasts e funcionam mesmo quando o atacante deixa a visão; demais etapas exigem alcance e visibilidade. Evoluir para dados de kits individualizados e servidor autoritativo quando houver PVP.

## Atualização V3.9 — invariantes de engenharia

- Trabalhe **sobre a V3.9**; jamais substitua `engine.mjs`/`app.js` por V3.7 cinematográfica.
- Antes de alterar habilidades, leia `docs/ROADMAP_CANONICO_V39.md`, `docs/AUDITORIA_V39_ENGENHARIA.md` e `docs/DATA_ACTION_BANK_V39.json`.
- Toda habilidade ainda não auditada por campeão/patch deve ser rotulada *training*; 1:1 exige manifestos, testes de cobertura e source timestamp.
- `gameTime`, `skillCds`, cc/debuffs, item actives e spawns usam apenas segundos simulados; `speedFactor` mexe em timers de UI e playback.
- Migre gradualmente casts legados por `castGateV39` + `commitCastV39`; exija idem para reações e itens ativos antes de declarar V4.0 pronta.
- Mantenha `engine.mjs` e `engine.browser.js` idênticos em regras. Adicione testes para fog por perspectiva, duplicidade de recursos, save/load, efeitos de recast e colisões.

## Marco V4.0 (atual)

- Base canônica: **V4.0.0**, derivada da V3.9. Não substituir por ZIP V3.7/38.
- Consumo de mana/CD/charges deve passar por `Arena.performActionV40`, não por atribuições soltas. Novos efeitos em V4.1 exigem resolvedor próprio e rollback completo; não inventar 1:1.
- `actionJournalV40` é fonte de observabilidade local. `journalForV40(team)` omite intenções inimigas e coordenadas. Em PvP nunca enviar snapshot/cópia do objeto Arena ao cliente; ter servidor autoritativo e sanitização.
- `snapshotV40` e `Arena.fromSnapshotV40` permitem continuar uma simulação com RNG. Checksum é diagnóstico, não anti-cheat; gravar arquivo de save explícito fica para a API de persistência.
- Em cada alteração executar `npm test`, `npm run test:v40`, Chromium smoke e testes de fog/range/CD; manter `engine.mjs` e `engine.browser.js` idênticos em semântica.
- O roadmap vigente é `docs/ROADMAP_CANONICO_V40.md`. Próximo V4.1 centraliza efeitos/CC/escudos e replay causal end-to-end.

## Marco V4.1 — status ledger universal

- `EFFECT_TYPES_V41` descreve 24 efeitos, inclusive tipos de escudo, CC e DoT/HoT, sem vincular regras a um campeão por padrão.
- Não editar HP/escudos diretamente nos novos handlers: usar `arena.effectResolverV41().heal`, `.absorb` via `arena.damage`, e `.apply` para CC/escudo/DoT. Manter adaptadores legados apenas com testes.
- `applyEffectV41` recebe `source`, `duration`, `power`, `damageType`, `interval`, `stack`, `key`; `effectJournalForV41(team)` redige `sourceId`/`targetId` ocultos.
- Antes de skills, AA, flash e movimento: `canAct` e validação de alcance/visibilidade/recarga; CC não pode consumir mana em ação rejeitada.
- Nunca creditar completude 1:1: `charm/fear/taunt` atualmente bloqueiam movimentação voluntária, mas sem movimentos forçados; `Ignite` ainda tem tick legado para compatibilidade.
- Seguir `docs/ROADMAP_CANONICO_V41.md`; V4.2 exige manifestos por campeão/patch e transições de kit certificadas. Não regredir para ZIP antigo.


## Marco V4.2 — kits por patch (base atual canônica)

- Trabalhar **somente sobre V4.2.0**. Nunca substituir `engine.mjs` com artefatos V3.7/V38/V39/V4.0/V4.1.
- `CHAMPION_KITS_V42` é o registro de runtime e `data/champion_kits_v42.json` é snapshot gerado (recriar com `node tools/export_kits_v42.mjs`). Toda habilidade usa `kind`, `range`, `mana`, `cooldown`, `damage`, `effects`, metadados de implementação e patch.
- Declarar sem ambiguidades `planned`, `training`, `legacy_adapter`, `prototype`, `certified`; kits completos ainda **não** certificados. Não mover habilidades para `certified` sem teste da passiva + Q/W/E/R + recast + colisões + fog + snapshot + items/runes.
- `queueKitSkillV42` recebe ordem privada, valida cast e navega até range; `resolveKitSkillsV42` usa `performActionV40` somente ao conjurar. Se falhar mana/CD/CC, não aplicar dano.
- Reutilizar `skillshotHitsV42`, `areaHitsV42`, `EffectResolverV41` e journal. A regra de personagem é configurável, o handler compartilha componentes geométricos, mas NÃO deve apagar diferenças individuais.
- VFX sempre derivam de eventos, nunca decidem hits nem revelam fog; `vfx.at/radius` é distinto de `vfx.from/to`.
- Source pin atual Summoner's Rift PC 26.21 (21/10/2026). Atualização de patch exige comparação com notas Riot e páginas por skill, não misturar Arena/Wild Rift.
- Antes de entregar: `npm test` + `python tests/browser_v42_kits.py`, fazer smoke visual de AoE, checar ZIP/manifesto e documentar limitações na auditoria V4.2.
- Próxima versão V4.3 conforme `docs/ROADMAP_CANONICO_V42.md`; futuras AST/actions no `data/action_grammar_v42.json` são especificação, **não** engine executável.

- `data/champion_stats_v42.json` guarda os valores base/nível para cinco campeões; quando mudar `CHAMPION_STATS_V38` ou `CHAMPION_GROWTH_V38`, reexportar com `node tools/export_champion_stats_v42.mjs`.

## Marco V4.3 — base canônica atual de itens/runas/economia

- ZIP base atual **V4.3.0**, nunca carregar um core V3.7/V38–V4.2 sobre a árvore atual.
- `engine.mjs` é autoridade de ouro, stats, runas e combat event; `engine.browser.js` deve ser **gerado** a partir do mesmo código (`python tools/sync_browser_v43.py`), nunca corrigir só a versão de navegador.
- Itens: `catalog`, `ITEM_RECIPES`, `ITEM_EFFECTS_V43`, `ECONOMY_RULES_V43`; atualizações exigem fonte, data, modo, recipe, uniqueness, active/passive e cap.
- `sellItemV43`: só na fonte, devolução de 70%; missões/pets sem venda. Ao alterar AP com Rabadon, remover bonus derivado, aplicar delta, recalcular uma única vez.
- `chooseRunePageV43`: só preparação; atual tem **três keystones protótipo** e shards simplificados, nunca alegar runas completas.
- Runa procs: não duplicar kill, gold, XP, damageContributors, journal; tempos em segundos simulados e per-team fog.
- Economia ainda **parcial**: ledger de compra/venda/minion/takedown, outras fontes não cobertas; atualizar ao expandir V4.4–V4.5.
- Gates: `npm test`, `python tests/browser_v43_shop_runes.py`, stress 300s+, comparação Node/browser e ZIP CRC.
- Consultar `docs/ROADMAP_CANONICO_V43.md`; próximo marco V4.4 jungle/objetivos/teamfights, NÃO novo rewrite do sistema de skills.


## Marco V4.4 — objetivos e disputa (canônico atual)

- Base **V4.4.0**, herdada de V4.3.0. Não restaurar versões antigas do jogo.
- `OBJECTIVE_PHASES_V44` e `CAMP_RULES_2026` regem spawns e durações; Vastilarvas e Arauto compartilham o pit com o Barão por fase, não devem coexistir em jogo.
- `useSmite` exige distância ≤500 e só consome carga após commit válido. Ataque de selva/Smite são operações independentes, com disputa determinística sobre o HP inicial do tick.
- Journal de objetivos (`objectiveLedgerV44`) é privilegiado da equipe capturadora. Evento global informa só a conquista; não compartilhar hits, rota, Smite intent ou IDs ocultos com o oponente.
- `teamfightLedgerV44` tem agregados limitados e não é o simulador completo de teamfights. Usar apenas dados de perspectiva ao renderizar.
- Migrar fixtures antigos de Smite para posição válida sem perder asserts; testar de forma negativa Smite fora de alcance, snapshot, tempo de respawn, CC e cenário misto 2v2.
- Para V4.5: simular buffs de objetivo corretamente (Arauto invocado, stack Vastilarvas, Barão/Ancião, alma), torres, Nexus, XP, ouro e waves sem duplicar recompensa.
- Referências fontes: `docs/AUDITORIA_V44_JUNGLE_OBJETIVOS_TEAMFIGHTS.md`; patch PC 26.21 e modo padrão. É **proibido** classificar como 1:1 kits/buffs ainda não certificados.


## Continuidade canônica V4.5 (26/10/2026)
- Use exclusivamente o ZIP V4.5.0 como próxima base. Nunca regredir para arquivos V3.7.
- Antes de ampliar campeões/itens/runas, execute `node tools/audit_content_v45.mjs` e leia `data/content_coverage_v45.json`.
- Vastilarvas/Olho do Arauto funcionais em protótipo, não certificadas; scripts de regressão `tests/v45_void_herald_parity.test.mjs` e `tests/browser_v45_objectives.py`.
- Próximos gates obrigatórios V4.5.1 (macro/estrutura/endgame), V4.5.2 (buffs dos objetivos), V4.6 (PvP).
- Certifique cada champ com dados patch, base/growth, passiva, QWER, cast geometry, recursos, cooldown e VFX independentes.


## V4.5.1 — Continuidade (26/10/2026)

BASE EXCLUSIVA V4.5.1; documentação canônica em docs/ROADMAP_CANONICO_V451.md. Priorizar calibração de CS real (sem crédito artificial), sistemas universais completos, kits individuais registrados por patch, seleção normal/Shift e ataque combinado. Garantir `npm test`, `test:v451`, `engine.browser.js` gerado pelo mesmo `engine.mjs`; não afirmar paridade 1:1.


## Continuidade V4.5.2c (26/10/2026)
- O core ativo segue `engine.mjs`; sincronize `engine.browser.js` via `python tools/sync_browser_v43.py`.
- Farm P0: `PASS_BOUNDED_LOCAL` em três seeds/lineups (TOP 43/47/44, MID 35/35/35, ADC 41/46/46). O teste V38 e `npm test` passam. CS continua condicionado a um golpe letal real; não conceder por proximidade nem alterar o limite 35–62.
- `farmTelemetryV452.events` registra até 512 eventos por minion, com causa, HP/dano removido, farmer/range/cooldown/path e dano iminente; o snapshot preserva os eventos e `perspective()` não os expõe ao adversário. QA visual/performance e paridade de campeões continuam `NOT_RUN`/não certificados.
- Barão/Ancião são buffs por portador vivo e de tempo de simulação; Barão fortalece minion somente com portador próximo. Alma elemental é permanente, mas efeitos 1:1 ainda pendentes.
- Feitiços agora são escolhidos no Champ Select, `setSecondarySummoner` sempre recusa alteração pós-início. Fantasma é protótipo funcional, não certificação Riot por patch.
- Nunca marcar skill/item/runa como 1:1 sem testes de comportamento, valores, interação, passiva, estado, CD, geometria, fog e recast. Próximas prioridades: V4.5.2d objetivos, V4.5.3 catalogação e V4.5.4+ kits por lotes.

## H1 — Gramática de ordens (recomendação)

O projeto planeja um parser híbrido PT-BR: fast path determinístico + possível modelo Qwen3-0.6B ONNX/WebGPU opcional, saída AST `PlanV1`, schema/validação/fog em Rust autoritativo. Leia `docs/IA_PROMPTS_ARQUITETURA_V452B_H1.md`. **Nenhum LLM ativo no jogo V4.5.2c; não declarar integrado.**
