# Roadmap canônico CoachLOL — V4.5.2b até certificação

## Definição de conclusão (gates)
Um marco **não está concluído** por conter UI, JSON ou testes isolados. Precisa: regras por patch documentadas, contratos, regressão Node/browser, fixtures determinísticas, salvamento, fog/privacidade, performance e revisão de QA. Classificar `missing/data_only/training/partial/behavior_tested/certified` por conteúdo. Atualizar cobertura por script.

| Sprint | Entrega mínima mensurável | Dependência / gate |
|---|---|---|
| **V4.5.2b — feita** | Seleção de novo alvo de reação; waves iniciais 6, terceira 7, regras 2026 tardias documentadas | 7 contratos novos e regressões v38.1/v451/v452 |
| **V4.5.2c — gate normal concluído; freeze parcial, bounded local** | Last hit determinístico; telemetria por minion; snapshot/fog; regressão V38; estratégias de wave | Benchmark normal em 3 seeds/lineups, TOP/MID/ADC em 35–47 CS/5min; freeze e demais estratégias avaliados separadamente, sem afirmar equilíbrio universal |
| **V4.5.2d** | Todos os dragões, stacks e almas, Elder burn+execute fiel, Baron por tipo de minion, Herald, Vastilarvas, Smite e disputas | Casos 1v1 a 5v5 por objetivo, morte, expiração e fog |
| **V4.5.3a–d** | Catálogo versionado de itens/receitas/status por patch, passivas/ativos, runas de árvores inteiras, summoner spells, builds e UI filtros/ícones | Não confundir item registrado com efeito funcional |
| **V4.5.4a–z** | Campeões por pequenos lotes com atributos base/growth, passiva, QWER, rank, recast, colisão, CC, VFX descritor, sinergia e testes | Nenhum campeão certificado sem kit inteiro |
| **V4.5.5** | Consolidação do core Rust determinístico com golden tests contra JS, modelos de ação/eventos e isolamento fog | Match server escolhe uma autoridade; dual run para comparação |
| **V4.5.6** | Login/cadastro, recuperação, autenticação, conta XP/level, perfil, amigos, configurações e loja cosmética | Backend Ubuntu com segurança e LGPD |
| **V4.6a–c** | Lobby/filas, draft, roles/runes/spells, jogo 1×/2×, WS push, match actors, reconexão, arbitragem, resultado/ranked | Nenhum cliente recebe fog/combos privados, sem polling contínuo |
| **V4.6d** | Load tests 100/1000/5000 conexões, limites de memória/CPU, autoscaling medido, filas Redis se realmente necessário | Latência p95, memória/partida, custo/VPS medidos |
| **V4.7** | VFX, trajectories/collisions, camera/UI clean, indicadores de area/alcance/missiles, observabilidade | Motor autoritativo emite eventos, não o VFX |
| **V4.8** | Blender/Tripo → GLB otimizado, LOD, instancing, compressed KTX2, vídeo/áudio/timeline opcional | FPS/memória/banda em dispositivos alvo |
| **V4.9** | AST de prompts, múltiplos campeões/ações, condicionais e fallback seguro | Contexto limitado à visão do jogador, sem LLM controlar servidor |
| **V5.x** | Auditoria exaustiva por patch e autorização de IP/publicação | Relatório de cobertura real + termo de licença |

### Evidência V4.5.2c

O gate normal de cinco minutos passou em três seeds/lineups. TOP: 43/47/44; MID: 35/35/35; ADC: 41/46/46. Todos os CS e eventos de ouro correspondem a ataques letais reais; o caso ADC fora da lane ficou em 0 CS. A matriz seed36 também valida freeze com dano de AA só em last hit e wave na faixa local: 16/22/46 CS, sem AA não letal e com uma morte no TOP; a eficiência de freeze permanece parcial. slow push deu 43/35/41 CS e nenhum AA não letal. `npm test`, regressões V38/V4.5.1/V4.5.2/V4.5.2b/V4.5.2c, sincronização Node/browser, snapshot e privacidade da telemetria passaram. QA visual e medição de performance seguem `NOT_RUN`; não há aceitação global de release ou paridade 1:1. Detalhes e hashes em `docs/QA_SUMMARY_V452C.md`.

## Sistemas transversais NÃO adiáveis
1. Modelo determinístico: ações tipadas + status ledger + fog por time + snapshots, replay causal, transações idempotentes, testes de rollback.
2. Motor LoL por patch: stats, crescimento, recursos, MS/AS/AH/CDR, resistência, dano, shield, cura, DoT/HoT, tenacidade, CC, prio de collision, LOS, range, target selectors, re-casts, channel, toggles, pet, clones, transform, stealth, minions/monstros/torres, passive/active item/runa.
3. Sistemas táticos: combate independente de aceite, focus multi, respostas para outro inimigo, wave control, gank fog, jungle pathing, visão, rotação, camp respawn, objetivos contestados, endgame e surrender.
4. App/web: registro, perfil, level de conta, inventário cosmético, login seguro, champ select, loadout, salas, convidar/bloquear amigos, filas, elo/ranked, histórico/replay, moderação, rejoin e dashboard operacional.
5. Deploy Ubuntu: Caddy/TLS, PostgreSQL, backups, métricas, Linux systemd ou containers, firewall, autenticação, CI e staging; escalar verticalmente primeiro, sharding match actors conforme perfilagem.

## Sugestão Rust/WebAssembly
- Rust nativo (Axum/Actix escolhidos após benchmark): `arena_core`, `arena_protocol`, `match_actor`, `web_api`; Postgres/SQLx, tokio.
- WASM do Rust para UI/predições **somente públicas**, sem segredos adversários; dados de itens/ruleset imutáveis por patch.
- Transporte WS orientado a mensagens de fase/deltas; heartbeat controlado e reconexão, **não polling do estado**; pub/sub entre servidores somente ao distribuir instâncias.
- Não introduzir Godot antes da paridade funcional/perf. Usar web render (Canvas/WebGL/WebGPU após benchmark); 3D depois com assets otimizados.

## Política Riot/treinamento
O produto foi definido pelo criador como **treinador, não jogo comercial**. Apesar disso, política geral e Riot Dev Portal proíbem reproduções não autorizadas de jogos ou IP Riot. O gate de lançamento exige avaliação/contato formal e alternativa licenciada/autoral, não pressuposição de permissão automática.

## H1 — Tactical Prompt Engine (adendo canônico, 26/10/2026)

**Decisão:** criar `arena_protocol` AST + parser PT-BR sem IA na V4.5.5a; adicionar Qwen3-0.6B ONNX/WebGPU local **opcional** em V4.9-A (Web Worker + cache + comparação WebLLM/SmolLM2), ampliar condições e sincronização em V4.9-B, fine tuning condicionado à avaliação em V4.9-C. A IA só traduz texto para **planos tipados**, o motor Rust valida e resolve; sem acesso a fog oculta, sem polling constante, sem backend LLM obrigatório. Ver **`docs/ROADMAP_CANONICO_V452B_H1_PROMPTS.md`**, **`docs/IA_PROMPTS_ARQUITETURA_V452B_H1.md`** e `docs/IA_PROMPTS_BENCHMARKS_QA_V452B_H1.md`. **Nenhuma função de IA foi implementada neste handoff.**
