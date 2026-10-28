> **MARCO CANÔNICO — V4.5.3-dev67.** Base única: ZIP dev67. Ler `README_CONTINUAR_DEV67.md`, `QA_V453_DEV67.md`, `ROADMAP_V453_DEV67.md`, `MEMORIA_CONTINUIDADE_V453_DEV67.md`. Preserve `.git`, PvP 1x1 e regra Desfazer da fonte.

> **MARCO CANÔNICO — V4.5.3-dev66.** Base única: pacote mestre dev66. Ler `README_CONTINUAR_DEV66.md`, `QA_V453_DEV66.md`, `ROADMAP_V453_DEV66.md`, `MEMORIA_CONTINUIDADE_V453_DEV66.md`. Nunca retornar a versões antigas; preservar `.git`, PvP 1×1/5 campeões por pessoa e Desfazer da fonte.

> **Marco canônico atual: V4.5.3-dev65.** Ler `README_CONTINUAR_DEV65.md`, `QA_V453_DEV65.md`, `ROADMAP_V453_DEV65.md` e `MEMORIA_CONTINUIDADE_V453_DEV65.md`. Preservar `.git` e Desfazer; não retornar à dev64.

# BASE CANÔNICA — V4.5.3-dev64

Dev64 substitui dev63 como base. Leia `README_CONTINUAR_DEV64.md`, `MEMORIA_CONTINUIDADE_V453_DEV64.md`, `QA_V453_DEV64.md`, `ROADMAP_V453_DEV64.md` e `CHANGELOG_V453_DEV64.md`. Combate em PvP: ambos os lados respondem manualmente após o impacto; replay idempotente por recibo canônico; 1 humano por equipe controlando cinco campeões. Nunca alterar a invalidação de Desfazer na saída física da fonte. Preservar Git e assets.

---

# BASE CANÔNICA — V4.5.3-dev63

**Dev63 é a versão atual**. Inicie em `README_CONTINUAR_DEV63.md`, `MEMORIA_CONTINUIDADE_V453_DEV63.md`, `QA_V453_DEV63.md`, `ROADMAP_V453_DEV63.md`, `CHANGELOG_V453_DEV63.md`. Históricos abaixo são apenas históricos; não voltar à dev62. Preservar Git e catálogo, 1 jogador humano por lado controla 5 campeões; desfazer ao sair da fonte segue proibido.

---

---
name: coachlol-producao
description: Auditorar e evoluir incrementalmente o CoachLOL Macro Arena V4.5.2c para motor determinístico Rust, web PvP e conteúdo versionado, preservando testes e privacidade por equipe.
---

> **BASE CANÔNICA — V4.5.2d-4-dev28.** A dev27 errou ao exigir linha de visão para o Radar Oracle. Dev28 corrige: Oracle detecta e suprime wards atrás de paredes; pink exige LOS. O radar não dá visão de terreno nem ataque através de paredes. Consultar `README_PRODUCAO_V452D4_DEV28.md`, `docs/QA_V452D4_DEV28.md` e `docs/MEMORIA_V452D4_DEV28.md`. `npm test` PASS, Chromium full 5v5 bot-driven Nexus 33:10, dez perfis/seeds Nexus naturais. Preservar máscaras, SVGs CC0, `.git` sujo herdado.

> **Nova base canônica: V4.5.2d-4-dev27.** Ler `README_PRODUCAO_V452D4_DEV27.md` e `docs/MEMORIA_V452D4_DEV27.md` antes de alterações. Detecção Oracle/pink respeita LOS; perspectiva sanitiza wards inimigas e compartilha fontes só por chamada. 8/8 contratos, `npm test` PASS, 10/10 Nexus e hash igual à dev26. Preservar Git herdado, máscaras e SVGs CC0.

## Continuidade V4.5.2d-4-dev26 (versão mais recente)

A base canônica é dev26, não dev25. Leia `docs/MEMORIA_V452D4_DEV26.md`, `docs/QA_V452D4_DEV26.md`, `docs/ROADMAP_V452D4_DEV26.md`. Control pinks não suprimem pinks; wards comuns e faelight bonus usam mesmo predicado de supressão e LOS, inclusive na UI. Preservar testes históricos, 9 contratos novos, .git herdado e vitória natural por Nexus.

---

# Adendo dev24 — auditoria multi-draft de pacing.
Base correta: v4.5.2d-4-dev24, após dev23. A média 30min multi-draft NÃO está certificada: 7/10 Nexus, 3 censuras por tempo real do teste. Leitura obrigatória: docs/QA_V452D4_DEV24.md + docs/MEMORIA_V452D4_DEV24.md. Não alterar engine por este harness, nem limpar Git herdado.

> Dev20: consulte `docs/QA_V452D4_DEV20.md` e o roadmap; não declare full LoL parity nem fim de partida natural certificado.

> **dev19**: importar dados Riot somente como referência isolada. 14 champions/41 itens locais, kits incompletos; `npm test` e `npm run test:long:dev19` são gates. Prioridade dev20: bots contestarem objetivos e fecharem Nexus, antes de adicionar Nidalee/Elise/Shyvana/Mordekaiser.

> **Atualização dev18:** micro-ticks Elder (t+0,25 / 1,25 / 2,25 e execução t+0,5) + regressão fog/ward 6 variantes. Consultar README_PRODUCAO_V452D4_DEV18.md.

> BASE ATUAL V4.5.2d-4-dev14: consultar `README_PRODUCAO_V452D4_DEV14.md` e `docs/QA_V452D4_DEV14.md` antes de alterações. Barão AD/AP individuais temporários e Ancião 180s. Os adendos antigos abaixo são históricos; preservar os arquivos Git herdados e os sistemas de máscaras, D/F e Golpear.

> BASE DEV11: usar `README_PRODUCAO_V452D4_DEV11.md`. D/F escolhidos no Champ Select por campeão, Golpear obrigatório JG; overlay 16:9; testes dev11 10/10 e npm test. Florividentes provisórias sem novas máscaras.

> **Estado executável atual: V4.5.2d-4-dev10.** Antes de programar, leia `README_PRODUCAO_V452D4_DEV10.md`, `docs/MEMORIA_V452D4_DEV10.md` e `docs/QA_V452D4_DEV10.md`. Preservar máscara provisória da Florividente, os 12 Faelights e Gold/CS; Smite D/F só no Champ Select e limite de CC/range.



**Base dev17:** manter `minionCanHitStructureV452d4Dev17` alinhado com dano preditivo e colisão de torre. Consultar `README_PRODUCAO_V452D4_DEV17.md` e `docs/QA_V452D4_DEV17.md`; continuar produção sem alterar Git herdado.


# Workflow local de produção CoachLOL (Codex)

Use esta skill quando for solicitado implementar versões, corrigir farm, adicionar kits/itens, migrar para Rust, construir perfis ou multiplayer no projeto CoachLOL.

1. Leia `AGENTS.md`, `docs/CODEX_HANDOFF/PLANO_MESTRE_COACHLOL_V452.md` e o roadmap atual antes de codificar. Verifique `git status`, versão e hash do ZIP de origem; não use ZIP histórico.
2. Defina um contrato pequeno com sinais de aceite e fontes do patch. Gere caso de regressão que falhe antes de alterar a implementação.
3. Corrija só a fonte canônica do motor e faça integração incremental. Para efeitos de UI, só renderizar eventos já resolvidos; para PvP, nunca transmitir informações de fog ou intents adversárias.
4. Preserve last hit real, tempos simulados, intervalo de cooldown, attack ranges, consumos uma única vez, ultimates com recast, alcance por habilidade e perfis separados do nível de campeão.
   - Use os termos de LoL: freeze mantém a wave local e ainda farma CS com last hits; slow push não dá AA não letal; fast push limpa a wave com prioridade e dano não letal permitido.
5. Rodar testes existentes e novos, cenários simultâneos, fixtures snapshot e QA visual. Relatar `PASS`, `FAIL` e `NOT_RUN` explicitamente.
6. Atualizar matriz de maturidade de conteúdo e o roadmap, registrar patches e fontes, produzir changelog e plano de rollback.
7. Antes de prosseguir ao próximo milestone, verificar os gates do plano mestre; evitar otimização especulativa, reescrita cega e promessas de 1:1.

## H1 — Fluxo de prompts (proposto)

Ao desenvolver linguagem natural, seguir `docs/IA_PROMPTS_ARQUITETURA_V452B_H1.md` e `docs/ROADMAP_CANONICO_V452B_H1_PROMPTS.md`: 1) AST/JSON Schema Rust+JS com golden tests; 2) parser determinístico PT-BR por aliases; 3) validação de fog, ownership, range, cooldown e recursos; 4) editor de etapas preview/confirm; 5) LLM WebGPU/Worker opcional apenas como parser para casos complexos; 6) benchmark/perf/fallback sem GPU; 7) não confundir planos sugeridos com eventos resolvidos. Não comprometer tarefa P0 farm.

### Continuidade V4.5.2d-dev1
Ver `docs/ROADMAP_V452D_CONTINUIDADE.md`: buff de minions por tipo e Elder burn temporal integrados; sete testes. Próximas ações: 6 Souls e objetivos, ataque/aggro por campeão, depois itens e kits. Preservar V4.5.2c.

### Continuidade V4.5.2d-dev2
Ver `docs/ROADMAP_V452D2_CONTINUIDADE.md`. Almas e Recall Barão foram migrados para adapters no motor canônico; novos efeitos são identificados por `soul_v452d2` e nunca podem recursar ou recompensar mortes duas vezes. Preservar base e testes.

## Handoff novo chat V4.5.2d-dev2 → V4.5.2d-3

Leia `docs/HANDOFF_NOVO_CHAT/INDEX.md`, `MEMORIA_COMPLETA_V452D2.md`, `PLANO_V452D3.md` e `GATES_DE_QA.md` antes de executar qualquer modificação. Não alegar que o handoff documental implementou V4.5.2d-3.

## Recorte V4.5.2d-3A concluído

- Para novas intervenções, ler `docs/MEMORIA_V452D3A_CONTINUIDADE.md`, `docs/QA_V452D3A_ELEMENTAL_PASSIVES.md` e `docs/ROADMAP_V452D3A_CONTINUIDADE.md` antes do handoff dev2.
- A técnica canônica de passivos é `elementalDragonStatsV452d3` (cálculo puro) com fonte de stacks no time e ledger versionado. Nunca aplicar item/growth/dragão cumulativamente sobre os campos-base por frame.
- Proteger o farm normal V4.5.2c, os 10 contratos d3, snapshots e o restante de `npm test`.
- Próximo incremento pequeno: d3-B (Barão individual e seus minions), depois d3-C (Elder/Smite competitivo). Medir performance.

## Contrato complementar: Rift Elemental V4.5.2d-4-dev1
Ler `README_RIFT_V452D4_DEV1.md` e `docs/ROADMAP_RIFT_ELEMENTAL_V452D4.md` antes de trabalhar em mapas e ambientes 3D. As máscaras originais são imutáveis; gerar deltas somente a partir de PNG binário certificado, após validar pixel→mundo e a integridade da colisão. Não mover paredes ou brushes jogáveis para atender à arte. A engine JS é a autoridade offline por enquanto, Rust será migrado incrementalmente. Reexecutar `npm run test:v452d4` e `npm test` sem alterar as metas de CS. As seis variantes artísticas NÃO estão prontas.

## Marco operacional V4.5.2d-4-dev2 — mapas do usuário

- Ponto de partida: `README_PRODUCAO_V452D4_DEV2.md`, `docs/MEMORIA_RIFT_V452D4_DEV2.md`, `docs/QA_RIFT_ELEMENTAL_V452D4_DEV2.md`; não retornar à base d3A/dev2.
- Regerar máscaras com `tools/import_user_rift_maps_v452d4.py` e validar hashes do manifesto. O atlas base `data/masks_128.json` é imutável, deltas variant em `data/rift_bundles/`.
- Contratos: apenas uma transformação após duas capturas em SR/uma em Swiftplay; Montanha paredes/LoS, Oceano brushes/fog, Nuvens vento, Hextech pares/canais, Quimtec plantas, Infernal apenas tinta leve.
- Manter números não certificados rotulados `approximation`; conferir Faelight 12º ponto, áreas pós-transformação e TOP revisada **antes** de promover.
- Antes de empacotar, rodar `npm run test:v452d4:masks`, `npm run test:v452d4`, `npm run test:v452c`, `npm test`, checks de sintaxe, `python tools/sync_browser_v43.py`. Se Chromium timeout, marque NOT_CERTIFIED e não fabrique screenshots.

## Continuidade V4.5.2d-4-dev3 (26/10/2026)

Base única: pacote completo d4-dev3. Consultar `docs/MEMORIA_RIFT_V452D4_DEV3.md`, `docs/QA_RIFT_ELEMENTAL_V452D4_DEV3.md` e roadmap. Faelights têm 8 locais iniciais + 4 liberados após Rift, mas há apenas 11 marcadores autorais e um 12º inferido NÃO certificado. Os polígonos atuais são aproximações diferentes por ponto, nunca anunciar paridade oficial. Manter supressão de ward, canalização/cooldown Hexgates e bloom de aliados com tempo simulado, preservando `npm test` e farm. Após importar imagens, rodar `tools/refine_faelights_v452d4_dev3.py` para manter esse contrato. Não tocar em geometria TOP sem validação do centro de rota e regressão 5 min.

## Continuação dev6 — pós-jogo
O novo módulo `postgame.js` é puro na leitura de `match` e renderiza cinco abas. `postgame.css` mantém estilo. Não inventar damage dealt, gold earned ou histórico de visão. Usar labels explícitas (`ouro disponível`, `sentinelas ativas`) e proteger snapshots e ledgers em qualquer instrumentação futura. Evidências em `docs/QA_V452D4_DEV6_POSTGAME.md`. A partir de dev6, preservar máscaras v2 dos 12 Faelights (8 early + 4 desbloqueados na transformação ou 15:00 conforme contrato deste branch). Testar o navegador real quando ambiente permitir; distinguir fixture de e2e.

## Continuidade V4.5.2d-4-dev7 (26/10/2026)

A ÚNICA base atual é o ZIP dev7. `engine.mjs` instrumenta dano real a HP de campeões, ouro ganho/gasto/reembolsado e sentinelas colocadas/destruídas. Telemetria `postgameV452d4Dev7` por campeão + timeline `postgameTimelineV452d4Dev7` por minuto; snapshots antigos `complete:false` nunca geram histórico falso. UI `postgame.js` pode apenas ler métricas, sem inventá-las. Preserve farm 43/47/44 TOP, 35/35/35 MID, 41/46/46 ADC, máscaras 12 Faelights (8+4), Rift, buffs/souls, fog, freeze parcial, snapshots e Git sujo. Novos 7 contratos e npm test PASS; Chromium fixture PASS_LIMITED, Nexus e2e NOT_RUN. Próximos: Scryer Bloom, navegador end-to-end, Barão d3-B, Elder d3-C. Consulte `README_PRODUCAO_V452D4_DEV7.md`, `docs/QA_V452D4_DEV7_TELEMETRY.md` e `docs/ROADMAP_V452D4_DEV7.md`.

### Dev8 / Florividente e pós-jogo
Priorizar `docs/MEMORIA_V452D4_DEV8.md`, testes `npm run test:v452d4:dev8` e `docs/QA_V452D4_DEV8.md`. Atualizar Scryers por máscaras reais sem alegar paridade de coordenadas derivadas. Testar `npm test` e Chromium controlado antes de release.

## Continuidade V4.5.2d-4-dev9
A base atual é V4.5.2d-4-dev9; consultar `README_PRODUCAO_V452D4_DEV9.md`, `docs/QA_V452D4_DEV9.md`, `docs/MEMORIA_V452D4_DEV9.md`. O duelo D/F só abre na janela final com **2 Golpeares prontos**. Sem ambos, não aparece duelo, mas o tick letal sorteia dono do objetivo usando proporção de campeões vivos presentes (seed determinística; regra autoral CoachLOL). Preservar as coordenadas provisórias das Florividentes até receber máscara do usuário; preservar farm e Git local.


## V4.5.2d-4-dev12, próximas modificações
A geometria do cone Florividente usa `data/rift_user_manifest_v452d4.json.scryerConeMask` e seus 15 POIs globais. Nunca bloquear Scryer normal com `riftV452d4.element==='chemtech'`. Quimtec apenas amplifica efeito; fruits comuns sempre existem. Teste `npm run test:v452d4:dev12`, `npm test`, `python tools/test_dev12_scryer_browser.py`. Tier de 10 extras inferido: permanecer como não certificado.

## Continuidade V4.5.2d-4-dev21
Base dev21: ler README_PRODUCAO_V452D4_DEV21.md e docs/QA_V452D4_DEV21.md. Preservar olho traseiro do Arauto invocado (40% máximo HP, 3s), alcance e fog, bot push escoltando minions e 10 novos contratos. Não anunciar Nexus orgânico até haver simulação vitoriosa.


### Continuidade dev23
Base atual dev23, 5 seeds orgânicas com Nexus, média de 28:07. Nunca adotar cronômetro de vitória; reavaliar 30+ seeds, drafts e modos antes de certificar paridade.
