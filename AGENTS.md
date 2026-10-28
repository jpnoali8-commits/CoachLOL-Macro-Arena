> **MARCO DE PRODUÇÃO ATUAL — V4.5.3-dev69 candidata, NÃO release.** Base canônica de origem V4.5.3-dev68; usar somente `dev69/integration` como integração após PRs #6 e #7. Ler `docs/parallel/FAST_LANE_DEV69.md`, `STATUS_DEV69.md`, `QA_DEV69_INTEGRACAO.md`. `main` intocada. Kits e itens parciais, assets GitHub pendentes. Adendos abaixo são históricos, não substituem esta base.

> **MARCO CANÔNICO — V4.5.3-dev67.** Base única: ZIP dev67. Ler `README_CONTINUAR_DEV67.md`, `QA_V453_DEV67.md`, `ROADMAP_V453_DEV67.md`, `MEMORIA_CONTINUIDADE_V453_DEV67.md`. Preserve `.git`, PvP 1x1 e regra Desfazer da fonte.

> **MARCO CANÔNICO — V4.5.3-dev66.** Base única: pacote mestre dev66. Ler `README_CONTINUAR_DEV66.md`, `QA_V453_DEV66.md`, `ROADMAP_V453_DEV66.md`, `MEMORIA_CONTINUIDADE_V453_DEV66.md`. Nunca retornar a versões antigas; preservar `.git`, PvP 1×1/5 campeões por pessoa e Desfazer da fonte.

> **Marco canônico atual: V4.5.3-dev65.** Ler `README_CONTINUAR_DEV65.md`, `QA_V453_DEV65.md`, `ROADMAP_V453_DEV65.md` e `MEMORIA_CONTINUIDADE_V453_DEV65.md`. Preservar `.git` e Desfazer; não retornar à dev64.

# BASE CANÔNICA — V4.5.3-dev64

Dev64 substitui dev63 como base. Leia `README_CONTINUAR_DEV64.md`, `MEMORIA_CONTINUIDADE_V453_DEV64.md`, `QA_V453_DEV64.md`, `ROADMAP_V453_DEV64.md` e `CHANGELOG_V453_DEV64.md`. Combate em PvP: ambos os lados respondem manualmente após o impacto; replay idempotente por recibo canônico; 1 humano por equipe controlando cinco campeões. Nunca alterar a invalidação de Desfazer na saída física da fonte. Preservar Git e assets.

---

# BASE CANÔNICA — V4.5.3-dev63

**Dev63 é a versão atual**. Inicie em `README_CONTINUAR_DEV63.md`, `MEMORIA_CONTINUIDADE_V453_DEV63.md`, `QA_V453_DEV63.md`, `ROADMAP_V453_DEV63.md`, `CHANGELOG_V453_DEV63.md`. Históricos abaixo são apenas históricos; não voltar à dev62. Preservar Git e catálogo, 1 jogador humano por lado controla 5 campeões; desfazer ao sair da fonte segue proibido.

---

**ATUALIZAÇÃO CANÔNICA V4.5.3-dev62:** inicie pelos documentos `README_CONTINUAR_DEV62.md` e `QA_V453_DEV62.md`. A loja PvP agora é overlay do HUD, preço confirmado pelo servidor e campeão da loja separado da seleção múltipla. Dev61 Undo irrevogável ao sair da fonte. Manter PvP 1×1 com 5 campeões controlados por humano; motores e 100 reference_only inalterados. Não declarar partida PvP humana completa certificada.

**ATUALIZAÇÃO V4.5.3-dev31:** leia `docs/MEMORIA_V453_DEV31.md` e `docs/QA_V453_DEV31.md`; priorizar catalogação oficial sem inventar passivas, Mordekaiser R precisa clone fiel do tabuleiro no futuro, Golpear visual no topo.

> **ATUAL — V4.5.3-dev29.** Ler `README_PRODUCAO_V453_DEV29.md`, `docs/{QA,MEMORIA,ROADMAP}_V453_DEV29.md`. Novo catálogo de 8 itens e efeitos funcionais; testes e browser. 10/10 vitórias naturais, média 27:22. `npm test` histórico preservado. Não alegar hashes iguais à dev28: só 4/10. Preservar `.git` sujo, máscaras, ícones CC0.

> **BASE CANÔNICA — V4.5.2d-4-dev28.** A dev27 errou ao exigir linha de visão para o Radar Oracle. Dev28 corrige: Oracle detecta e suprime wards atrás de paredes; pink exige LOS. O radar não dá visão de terreno nem ataque através de paredes. Consultar `README_PRODUCAO_V452D4_DEV28.md`, `docs/QA_V452D4_DEV28.md` e `docs/MEMORIA_V452D4_DEV28.md`. `npm test` PASS, Chromium full 5v5 bot-driven Nexus 33:10, dez perfis/seeds Nexus naturais. Preservar máscaras, SVGs CC0, `.git` sujo herdado.

> **Nova base canônica: V4.5.2d-4-dev27.** Ler `README_PRODUCAO_V452D4_DEV27.md` e `docs/MEMORIA_V452D4_DEV27.md` antes de alterações. Detecção Oracle/pink respeita LOS; perspectiva sanitiza wards inimigas e compartilha fontes só por chamada. 8/8 contratos, `npm test` PASS, 10/10 Nexus e hash igual à dev26. Preservar Git herdado, máscaras e SVGs CC0.

## Continuidade V4.5.2d-4-dev26 (versão mais recente)

A base canônica é dev26, não dev25. Leia `docs/MEMORIA_V452D4_DEV26.md`, `docs/QA_V452D4_DEV26.md`, `docs/ROADMAP_V452D4_DEV26.md`. Control pinks não suprimem pinks; wards comuns e faelight bonus usam mesmo predicado de supressão e LOS, inclusive na UI. Preservar testes históricos, 9 contratos novos, .git herdado e vitória natural por Nexus.

---

## BASE CANÔNICA — V4.5.2d-4-dev25
Ler `NOVO_CHAT_COMECE_AQUI.md` e `docs/{MEMORIA,QA,ROADMAP}_V452D4_DEV25.md` antes de trabalhar. Não resetar o Git. A dev25 otimiza índice espacial de minions e projeta bloqueadores de estrutura uma vez por lane/time durante movimento. Resultados reproduzidos em 30 partidas Nexus reais. Não confundir média 26:17 com paridade de kits e não aplicar balanceamento global sem estatísticas auditadas.

---
## Base mais recente — V4.5.2d-4-dev24
Antes de iniciar qualquer trabalho, ler `NOVO_CHAT_COMECE_AQUI.md` e a tríade `docs/MEMORIA_V452D4_DEV24.md`, `docs/QA_V452D4_DEV24.md` e `docs/ROADMAP_V452D4_DEV24.md`. A dev24 é AUDITORIA, não patch de dano: dez cenários, sete Nexus naturais, três CPU-censored; conclusão 30min multi-draft NÃO certificada. Nunca calcular média populacional omitindo censura. Preservar engine/Smite/Barão e Git herdado.

---
> **BASE CANÔNICA ATUAL: CoachLOL V4.5.2d-4-dev21**. Ler README_PRODUCAO_V452D4_DEV21.md, docs/QA_V452D4_DEV21.md e docs/MEMORIA_V452D4_DEV21.md antes de alterações. Motor JS offline: ataque ao Arauto invocado com olho traseiro 40% HP máximo verdadeiro e 3s CD; bots escoltam wave após 780s. Nexus orgânico não certificado. Preservar Git herdado e não regredir farm/Smite/CC0. Registros históricos abaixo não substituem esta base.

> **BASE dev20 (CoachLOL)**: escolha de portador, deslocamento e invocação do Arauto, dano 26.1 por investida; `npm test` aprovado e Nexus natural pendente. Seguir `docs/MEMORIA_V452D4_DEV20.md`. Não limpar Git herdado.

> **BASE ATUAL V4.5.2d-4-dev19**: leia `README_PRODUCAO_V452D4_DEV19.md` e `docs/QA_V452D4_DEV19.md`. Auditoria: 14 campeões, 5 stats/growth, 0 kits completos; 41 itens, 9 stats básicos auditados. Importador Data Dragon 16.21.1 é REFERENCE_ONLY; download externo bloqueado, não afirmar catálogo completo. Long match chega a 40m e 4 estruturas, mas 0 dragões/Nexus. Próximo dev20 estabilizar bots/objetivos e vitória natural; depois itens e kits por lotes. Preservar Git herdado e toda dev18.

> **VERSÃO ATUAL V4.5.2d-4-dev18:** usar `README_PRODUCAO_V452D4_DEV18.md`, `docs/QA_V452D4_DEV18.md` e `docs/MEMORIA_V452D4_DEV18.md`. Elder microticks e fog por variante testados. Preservar dev17, masks, SVG CC0 e Git herdado.

> **ESTADO ATUAL dev17:** ver `README_PRODUCAO_V452D4_DEV17.md` e `docs/QA_V452D4_DEV17.md`. Validar minion vs torre em unidades do atlas com raio de colisão; testes 8/8 e npm test PASS. Histórico Git preservado.

> BASE ATUAL V4.5.2d-4-dev14: consultar `README_PRODUCAO_V452D4_DEV14.md` e `docs/QA_V452D4_DEV14.md` antes de alterações. Barão AD/AP individuais temporários e Ancião 180s. Os adendos antigos abaixo são históricos; preservar os arquivos Git herdados e os sistemas de máscaras, D/F e Golpear.

> **ADENDO DEV11 (mais recente):** Leia `README_PRODUCAO_V452D4_DEV11.md`, `docs/QA_V452D4_DEV11.md`, `docs/MEMORIA_V452D4_DEV11.md`. Preservar D/F por campeão, jungler Smite obrigatório, overlay 16:9 com mídia futura e os arquivos Git herdados. Outros adendos abaixo são históricos.

> **ADENDO DEV10 (mais recente):** Leia `README_PRODUCAO_V452D4_DEV10.md`, `docs/QA_V452D4_DEV10.md`, `docs/MEMORIA_V452D4_DEV10.md`. Base canônica dev10. Smite D/F definido no draft; preservar CC, recarga, range e testes de 5v5, além dos arquivos herdados no Git sujo. Atualizações históricas abaixo NÃO descrevem a versão atual.

# Regras permanentes do Codex — CoachLOL Macro Arena

## Identidade e base
- Produto: CoachLOL Macro Arena (não confundir com BTA Motion).
- ÚNICA linha de engenharia: este checkout, iniciado do ZIP `CoachLOL_MacroArena_v452_Buffs_Draft_Ghost_FarmAuditoria_Offline.zip` e do handoff V4.5.2b-H1 verificado; estado atual V4.5.2c. Não substituir por ZIP histórico.
- Não substituir o motor atual por arquivos históricos V3.7/V38/V4.4/V4.5.0. Preservar evolução por mudanças pequenas, versionadas e testadas.
- Antes de tocar no código, ler `docs/ROADMAP_MESTRE_V452B.md`, `docs/MEMORIA_CONTINUIDADE_V452B.md`, `docs/CODEX_HANDOFF/PLANO_MESTRE_COACHLOL_V452.md`, auditorias originais V4.5.2 e `package.json`.
- Este `AGENTS.md` pode ser copiado para a RAIZ do repositório extraído; não sobregravar orientações locais sem reconciliar diferenças.

## Estado honesto
- Farm normal V4.5.2c: `PASS_BOUNDED_LOCAL`; 3 seeds/lineups alcançam 35–47 CS por rota em cinco minutos, com CS somente no last hit real. Freeze continua farmando e segura a wave local com zero AA não letal, mas sua eficiência segue `partial` (16/22/46 CS no seed36 e uma morte no TOP). Telemetria interna limitada a 512 eventos, snapshotada e fora da perspectiva adversária. Isso não certifica balanceamento universal nem paridade 1:1.
- 14 campeões registrados, 5 manifestos, 0 kits certificados 1:1; 41 itens (9 basicamente auditados), 3 runas protótipo. Não anunciar paridade que não existe.
- O legado é offline; esconder dados na UI não protege um futuro PvP. Estado adversário privado nunca pode chegar ao cliente.

## Ciclo de execução
1. Conferir git status, ZIP de origem, versão e hash. Gerar teste de reprodução antes do patch.
2. Pequeno escopo: 1 módulo, 1 conjunto de invariantes, contratos novos; não reescrever o jogo inteiro.
3. Cálculo de regras no motor determinístico; interface apresenta eventos; client não é fonte autoritativa.
4. Testar custo/cooldown/range/CC/visão/dupla conjuração/last hit, ordem simultânea, snapshots e regressão.
5. Rodar `npm test` e testes relevantes; registrar falhas reais sem falsificar QA. Sincronizar Node/browser conforme scripts originais.
6. Documentar mudanças, status exato (`implemented`, `partial`, `tested`, `planned`, `blocked`), fontes por patch e licenças.
7. Para migração Rust, gerar fixtures golden JS e comparar com engine Rust; migrar por contrato e feature flag.
8. Nunca publicar endpoint de partidas com estado de fog ou combos inimigos expostos; fazer threat model, testes de payload, reconexão e controle por time.

## Arquitetura de referência
- `arena_core` Rust nativo puro é autoridade; `wasm_public` é opcional para preview/cálculos públicos.
- WebSocket evento/push sem polling constante do estado; timers orientados a fase/ação; sem consulta SQL por frame.
- PostgreSQL para contas, perfil, compras de conta, resultados e dados transacionais; match state em atores separados.
- Nível da conta é persistente; nível do campeão pertence à partida; speed 1×/2× não muda regras em segundos simulados.
- Identificadores por patch, serialização versionada, snapshot, replay causal, logs de eventos e controle de escopo.

## Legal e distribuição
- A referência de LoL serve a auditoria técnica; não assumir direito de distribuir cópia com nomes, arte e assets da Riot. Plano de IP autoral ou autorização formal como gate do beta público.

## Próxima mudança obrigatória
- `V4.5.2c` entregue localmente para benchmark normal; freeze/slow push/fast push têm regressões próprias, e freeze continua `partial` em eficiência. Inclui correção de last hit real, telemetria/QA e ADR de migração Rust; `engine.mjs` continua sendo o core ativo. Próxima trilha do roadmap: V4.5.2d, objetivos.

## Correções V4.5.2b já entregues
- Janela de resposta mantém agressor original, mas permite escolher outro inimigo visível até 1800 unidades do defensor; nunca receber IDs pela fog.
- Wave inicial: 3 melee + 3 caster; na terceira, +canhão. Depois 14/30 min valem exceções do patch 26.1.
- Scripts: `npm run test:v38`, `npm run test:v38-1`, `npm run test:v451`, `npm run test:v452`, `npm run test:v452b`, `npm run test:v452c` e `npm test` passam no estado V4.5.2c registrado em `docs/QA_SUMMARY_V452C.md`.
- Preservar os fixes V4.5.2b e os invariantes de CS real; qualquer mudança na engine exige sincronizar `engine.browser.js`.

## H1 — Tactical Prompt Engine (orientação de Codex/Opus)

- Leia `docs/ROADMAP_CANONICO_V452B_H1_PROMPTS.md` e `docs/IA_PROMPTS_ARQUITETURA_V452B_H1.md` antes de mudanças em prompts.
- **Não introduza LLM antes da AST + parser determinístico + validação de ownership/fog**. Criar gramática antecipada em V4.5.5a, adaptador WebGPU opcional sob demanda em V4.9-A e corpus/testes em V4.9-B/C.
- O modelo (benchmark inicial Qwen3-0.6B ONNX/WebGPU quantizado) NUNCA executa lógica, não define cooldown/dano/visão e não gera código para rodar. LLM apenas propõe `PlanV1` estruturado; match actor Rust valida e resolve ações confirmadas.
- Sem WebGPU, modelo lento, payload inválido ou insuficiência de memória: parser/manual, sem bloquear partida. Nenhum download de pesos é requisito para abrir o jogo.
- Medir FPS, memória, latência, exact-match PT-BR, falhas de validação e segurança. Fixtures, schemas e corpus no H1 são **documentos de proposta**, não implementações ativas.

## Adendo V4.5.2d-dev1
- Leia `README_PRODUCAO_V452D.md` e `docs/QA_V452D_OBJECTIVE_INCREMENT.md`. A implementação do Barão por categoria e o burn do Ancião são incrementos PARCIAIS testados; não declarar objetivo completo nem release aprovado.
- `npm run test:v452d` roda sete contratos novos; preservar V4.5.2c e todos os fixes de farm. Não modificar os testes para esconder regressões.

## Atualização V4.5.2d-dev2
O pacote atual integra seis Almas com cooldowns simulados, anti-recursão e Recall Barão (4s), mantendo farm real e trabalho do Codex. Consulte `docs/QA_V452D2_SOULS.md`. `npm test` integral: TIMEOUT nesta execução; não declarar aprovação. Próximo escopo V4.5.2d-3 objetivos e passivos faltantes.

## Handoff para próximo chat (26/10/2026, atual V4.5.2d-dev2)

O índice prioritário para continuação é `NOVO_CHAT_COMECE_AQUI.md` e `docs/HANDOFF_NOVO_CHAT/INDEX.md`. Próxima etapa a implementar: V4.5.2d-3 conforme `docs/HANDOFF_NOVO_CHAT/PLANO_V452D3.md`. Este ZIP contém ADENDO DE DOCUMENTAÇÃO; **nenhuma V4.5.2d-3 foi implementada aqui**. Se notas antigas chamarem a V4.5.2c de versão atual, considerar `version.json` e os arquivos V4.5.2d-dev2 como mais recentes.

## Atualização V4.5.2d-3A (26/10/2026)

A versão executável deste ZIP é `4.5.2d-3A` com passivos de seis dragões por stack/equipe, não d3-B/C. Leia `CHANGELOG_V452D3A.md`, `docs/QA_V452D3A_ELEMENTAL_PASSIVES.md`, `docs/MEMORIA_V452D3A_CONTINUIDADE.md` e `docs/ROADMAP_V452D3A_CONTINUIDADE.md` antes de continuar. Motor `engine.mjs` autoridade; `engine.browser.js` gerado. Suíte `npm run test:v452d3`: 10/10; `npm test` global PASS nesta execução; Chromium timeout/não certificado.

**Próxima mudança:** d3-B atributos Barão individuais e aura/movimento por minion. Não mudar o estado de buffs de dragão por mutação cumulativa de AD/AP/armor: derive sempre de `teams[team].dragons`. Preservar `dragonCaptureLedgerV452d3`, snapshots e `.git` sujo herdado sem commits automáticos de outras alterações.

## V4.5.2d-4-dev1 — contrato Rift Elemental (26/10/2026)
- A base oficial que suporta Rift Elemental é V4.5.2d-3A, preservando passivos dos 6 dragões e testes. Não regredir para a V4.5.2d-dev2.
- `riftV452d4` controla a transformação; `riftBundlesV452d4` recebe somente máscaras certificadas, sem modelagem conjectural.
- Não alterar `data/masks_128.json` nem colapsar máscaras dinâmicas numa só textura do Blender.
- Em SR padrão transformar após 2 dragões; Swiftplay regra diferente. Infernal pós-14.1 NÃO destrói paredes.
- Nunca alegar que GLB, Cinders, plantas Quimtec, Faelights ou Hexgate com canalização estão completos antes de implementar + testar.
- Comandos: `npm test`, `npm run test:v452d4`, `python tools/sync_browser_v43.py`.
- Leitura obrigatória: `README_RIFT_V452D4_DEV1.md`, `docs/ROADMAP_RIFT_ELEMENTAL_V452D4.md`, `docs/QA_RIFT_ELEMENTAL_V452D4.md`.

## Handoff V4.5.2d-4-dev2 (26/10/2026) — REGRA ATUAL, SUPERA REFERÊNCIAS DE VERSÃO ANTIGA

A versão de trabalho deste pacote é **V4.5.2d-4-dev2**, construída exclusivamente do ZIP V4.5.2d-4-dev1 + máscaras enviadas pelo usuário. Ler `README_PRODUCAO_V452D4_DEV2.md`, `docs/MEMORIA_RIFT_V452D4_DEV2.md`, `docs/QA_RIFT_ELEMENTAL_V452D4_DEV2.md` e `docs/ROADMAP_RIFT_V452D4_DEV2.md` antes de continuar. Não usar o d3A ou o dev2 antigo como base. Guardar `.git` sem git reset/clean (histórico sujo herdado). A importação real dos mapas está em `tools/import_user_rift_maps_v452d4.py` / `data/rift_user_manifest_v452d4.json` / `data/rift_bundles/`. Transformar apenas uma vez por jogo: SR após duas capturas, surgimento terceiro; Swiftplay depois de uma. Infernal não cria/remove paredes. Preservar `data/masks_128.json`, farm V4.5.2c, passivos e almas e snapshots. Testes novos `npm run test:v452d4:masks` **10/10**, `npm test` PASS; Chromium TIMEOUT/NOT_CERTIFIED. Faelights, Quimtec e vento usam parâmetros aproximados, TOP revisada está como asset sem aplicação na navegação. Próximo marco d4-dev3, não declarar paridade 1:1.

## Continuidade V4.5.2d-4-dev3 (26/10/2026)

Base única: pacote completo d4-dev3. Consultar `docs/MEMORIA_RIFT_V452D4_DEV3.md`, `docs/QA_RIFT_ELEMENTAL_V452D4_DEV3.md` e roadmap. Faelights têm 8 locais iniciais + 4 liberados após Rift, mas há apenas 11 marcadores autorais e um 12º inferido NÃO certificado. Os polígonos atuais são aproximações diferentes por ponto, nunca anunciar paridade oficial. Manter supressão de ward, canalização/cooldown Hexgates e bloom de aliados com tempo simulado, preservando `npm test` e farm. Após importar imagens, rodar `tools/refine_faelights_v452d4_dev3.py` para manter esse contrato. Não tocar em geometria TOP sem validação do centro de rota e regressão 5 min.

## Continuidade V4.5.2d-4-dev6 (26/10/2026)
A nova base única é o ZIP completo dev6; manter git histórico sujo. A UI do pós-jogo foi reorganizada em cinco abas com `postgame.js` e `postgame.css`, alimentada por dados autoritativos já presentes: KDA, CS, ouro **em mãos**, níveis, runas configuradas, wards **ativas**, objetivos ledger V44 e eventos recentes. Não fingir dano por jogador, ouro total ou timeline de ouro: ainda não existem. `test:v452d4:dev6` 5/5; `npm test` PASS; screenshots Chromium são de fixture isolada, não e2e. Próximo incremento: instrumentar contadores de dano/ouro/visão e só depois expandir gráficos + Scryers/Barão/Elder.

## Continuidade V4.5.2d-4-dev7 (26/10/2026)

A ÚNICA base atual é o ZIP dev7. `engine.mjs` instrumenta dano real a HP de campeões, ouro ganho/gasto/reembolsado e sentinelas colocadas/destruídas. Telemetria `postgameV452d4Dev7` por campeão + timeline `postgameTimelineV452d4Dev7` por minuto; snapshots antigos `complete:false` nunca geram histórico falso. UI `postgame.js` pode apenas ler métricas, sem inventá-las. Preserve farm 43/47/44 TOP, 35/35/35 MID, 41/46/46 ADC, máscaras 12 Faelights (8+4), Rift, buffs/souls, fog, freeze parcial, snapshots e Git sujo. Novos 7 contratos e npm test PASS; Chromium fixture PASS_LIMITED, Nexus e2e NOT_RUN. Próximos: Scryer Bloom, navegador end-to-end, Barão d3-B, Elder d3-C. Consulte `README_PRODUCAO_V452D4_DEV7.md`, `docs/QA_V452D4_DEV7_TELEMETRY.md` e `docs/ROADMAP_V452D4_DEV7.md`.

## Atualização V4.5.2d-4-dev8 (26/10/2026)
Esta é a base atual. Leia `CHANGELOG_V452D4_DEV8.md`, `docs/QA_V452D4_DEV8.md` e `docs/MEMORIA_V452D4_DEV8.md`. Scryer Bloom com 10 novos locais por categoria 26.1, coordenadas provisórias NÃO certificadas; persistência, cooldown e detecção testados. `npm test` PASS. Chromium endgame 2/2 via harness com Nexus acelerado; partida orgânica NOT_RUN. Preservar tudo e não substituir o motor.

## Continuidade V4.5.2d-4-dev9
A base atual é V4.5.2d-4-dev9; consultar `README_PRODUCAO_V452D4_DEV9.md`, `docs/QA_V452D4_DEV9.md`, `docs/MEMORIA_V452D4_DEV9.md`. O duelo D/F só abre na janela final com **2 Golpeares prontos**. Sem ambos, não aparece duelo, mas o tick letal sorteia dono do objetivo usando proporção de campeões vivos presentes (seed determinística; regra autoral CoachLOL). Preservar as coordenadas provisórias das Florividentes até receber máscara do usuário; preservar farm e Git local.


## V4.5.2d-4-dev12 canon
- Usar máscara autoral Scryer (`Florividentes.jpg`) para 15 posições, não 12 sites sintéticos, nem plantação exclusiva Quimtec.
- 5 sites base e 10 late 15:00/Rift **provisórios**, validar tiers no futuro.
- Cone pintado tem ponta esquerda, abertura direita, rotacionar com ângulo selecionável.
- Honeyfruits são globais; Quimtec só buffa; não duplique versões da mesma planta.
- Moita base e oceano novos; não regressar `data/masks_128.json`, manter baseline dev11 somente para auditoria.
- Preservar Git sujo, não fazer reset/clean/commit não solicitados.


### Marco V4.5.2d-4-dev16
Nova base: ícones vetoriais autorais CC0 somente em `assets/ui/map_cc0_v452d4_dev16/`. Minions com Baron VFX roxo sem texto; Blast Cone com raio projetado. Antes de novo ZIP, rodar `npm test` e Chromium local em fixture; não alegar partida orgânica sem teste. Documentos: `docs/MEMORIA_V452D4_DEV16.md`.


## V4.5.2d-4-dev23 — ritmo real de partida
- Nova base de produção: dev23; média-alvo SR aproximadamente 30 minutos, NÃO hard cap.
- Manter HP exterior de torre=9000 e decaimento de resistências 11–15min; nunca acelerar por dano fantasma.
- Sem concluir partida enquanto Nexus não for destruído pelo motor.
- Medição inicial: 5 partidas naturais, média 28:07, pequena amostra; revalidar após alterar conteúdos.
- Arquivos: `docs/QA_V452D4_DEV23.md`, `docs/MEMORIA_V452D4_DEV23.md`.

## V4.5.3-dev30 — loja e requisitos Realm
- Receita navegável com compra direta de ingredientes e desconto recursivo verificado.
- Fonte oficial do catálogo 26.21 indisponível no ambiente: 49 cadastrados, importador pendente de JSON original; não afirmar cobertura completa.
- Mordekaiser V4.5.4: overlay 1v1 canto superior esquerdo com círculo + os mesmos colisores/brushes/terreno elemental da área do tabuleiro principal, motor autoritativo, retorno por coordenadas de mundo.
- QA: 9/9 contratos novos, npm test integral PASS, Chromium compra Rabadon PASS, 4 partidas/pacing hashes idênticos dev29.


## V4.5.3-dev33 — Patch Center
Antes de alterar custo, receita, crescimento, passivas, ativos ou Q/W/E/R, verificar `data/patch_center/current.json` e `docs/PATCH_CENTER_V453_DEV33.md`. Executar `npm run patch:check` se a rede permitir, importar snapshots completos e revisar diffs. Não tratar texto descritivo como mecânica, não ativar regras automaticamente. `npm test` inclui 7 contratos da central.


## Continuidade obrigatória — V4.5.3-dev34 (27/10/2026)
- Base de produção canônica **V4.5.3-dev34**, derivada da dev33, patch PC **26.21 ativo**; Data Dragon de referência 16.21.1.
- Próximos patches **26.22 / 26.23 / 26.24** previstos em **04/11, 18/11, 09/12** (alteráveis). **26.22 ainda não lançado no momento desta etapa**; feed/PBE NÃO autoriza mudança de jogo.
- Novo `tools/patch_release_v453_dev34.mjs`: auditoria de receitas, SHA item/champion/detalhes QWER, gates de revisão e QA; relatório de prontidão autoriza SOMENTE implementação humana, nunca muda engine automaticamente. `tools/check_riot_patch_v453_dev33.mjs` separa preview de referência após release.
- `npm test` PASS e **20/20 contratos dev34**; engine/browser/app byte-idênticos à dev33; seeds 26,36,42 terminaram pelo Nexus e mantiveram vencedores, duração e hashes.
- A meta de duração é ~30 minutos; usuário **aceita duração um pouco abaixo**, sem qualquer encerramento artificial.
- Loja com **67 itens locais**, catálogo completo e todos os ativos/passivos ainda NÃO certificados. Compra direta por componente na árvore de receita obrigatória.
- **Mordekaiser R V4.5.4**: HUD quadrado canto superior esquerdo; arena circular real interna com colisão e movimentação, mundo 1v1 de região clonada do tabuleiro ATUAL, mesmas moitas/colisores e modificações elementais, fecha sozinho no fim, retorna ao plano principal em posições coerentes. Overlay R de Mordekaiser e Golpear sempre acima de UI comum.
- Próximo Dev35: arquivos oficiais completos quando disponíveis, revisão por versão e implementação real em lotes; ver `docs/PATCH_CENTER_V453_DEV34.md`, `docs/QA_V453_DEV34.md`, `docs/ROADMAP_V453_DEV34.md`.


## Continuidade V4.5.3-dev35
- Nova base canônica dev35, substitui versões antigas como base, mas todo histórico/arquivos herdados permanecem.
- 67 itens locais, **catálogo oficial integral ainda indisponível neste ambiente**; não declarar obtido.
- Novo `tools/catalog_unified_v453_dev35.mjs`, `tools/acquire_riot_catalog_v453_dev35.mjs`, `data/patch_center/unit_balance_26_21_local_baseline_dev35.json`; itens internos de minions/torres têm status de modificadores de unidades, não loja.
- QA `npm test` PASS, 16/16 contratos, 3/3 matches Nexus e hashes idênticos dev34. Consultar `docs/QA_V453_DEV35.md` e `docs/CATALOGO_UNIFICADO_UNIDADES_V453_DEV35.md`.
- O motor de jogo não foi alterado nesta etapa. Mordekaiser R e catálogo completo permanecem marcos futuros.


## V4.5.3-dev36 — pacote de referência offline verificado
- **Base canônica**: dev36. ZIP fornecido pelo usuário com 366 arquivos verificáveis por hash contra manifesto, 863 itens, 173 detalhes por idioma.
- Fontes preservadas em `data/riot_reference/source_16_21_1/`; visualização consultiva em `catalogo_riot_26_21.html` acessível pela loja.
- Cruzamento 67/67 itens locais ↔ Data Dragon, 3 diferenças de preço e 5 de receita não aplicadas.
- Testes `npm run test:v453:dev36`, `npm test`, `python tests/browser_v453_dev36_catalog.py` concluídos com sucesso.
- NÃO considerar o catálogo estático como implementação funcional completa. Nenhuma alteração em motor, combate ou stats de unidades.
- Patch 26.22 futuro exige nova coleta e gates de QA. Mordekaiser overlay e clone do mapa continuam planejamento V4.5.4.

## Continuidade oficial dev68 (2026-10-28)
Base única V4.5.3-dev68. Consultar README_CONTINUAR_DEV68.md e QA_V453_DEV68.md. Lux Q tem projétil real temporizado; testes V4.2 agora aguardam impacto. Não alegar paridade Riot 1:1. Preservar .git e desfazer por visita física à fonte.
