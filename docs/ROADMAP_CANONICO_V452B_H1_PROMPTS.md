# ROADMAP CANÔNICO V4.5.2b-H1 — Handoff IA / Tactical Prompt Engine

**Status:** revisão somente de arquitetura/documentação (H1). **Build jogável permanece V4.5.2b**; sem claim de integração de LLM, Rust ou multiplayer concluídos.
**Baseline imutável:** ZIP V4.5.2b, derivado apenas de V4.5.2; nenhum arquivo de gameplay foi alterado neste handoff.
**Missão:** treinar tomada de decisão em jogo de turnos simultâneos inspirado nas mecânicas de LoL, com input por UI e linguagem natural, validação autoritativa, fog privada e paridade de referência auditada por patch.

## Ordem dos marcos e dependências obrigatórias

| Marco | Entregáveis | Gate mínimo (não marcar como concluído sem evidência) |
|---|---|---|
| **V4.5.2c — P0** | IA de last-hit REAL; previsão de dano aliado, pathing, cooldown AA, telemetria CS TOP/MID/ADC | >=35–62 CS/5min em lane livre nas seeds acordadas, **sem CS fake**, e perdas por rotação; o teste histórico V38 deixa de falhar sem afrouxar a meta |
| V4.5.2d | Baron com aura por portador e minion-type; drakes/souls, Elder burn/execute; Herald/Voidgrubs/Smite | contratos por patch, duração/morte, 1v1→5v5 e fog |
| V4.5.3a–d | Loja total auditada: stats, buffs, builds, filtros, ativos/passivas, runas/árvores e spells | manifestos por patch, comportamento individual, cooldowns e custos/cap, regressão |
| V4.5.4a–z | Kits individuais por lotes: base/growth, passivas, QWER, skillshots, recasts, CC, colisões e alvos | nenhuma certificação 1:1 sem testes de kit completo, interações e cobertura |
| **V4.5.5a — iniciar gramática cedo** | `arena_protocol` Rust, AST de ações tipadas, schemas/IDs por patch, parser **determinístico** PT-BR, normalizador de aliases, golden tests JS/Rust | nenhum LLM requerido; 100% dos comandos suportados cobertos, invalidos rejeitados, snapshot/fog seguros |
| V4.5.5b | Rust core determinístico + snapshots + replay causal; WebAssembly apenas de regras públicas | golden parity por seed/patch; autoridade singular no servidor, sem segredos no WASM |
| V4.5.6 | Conta/login, autenticação, perfil, nível de conta != nível de campeão, amigos, loadouts e dados | QA auth, LGPD, restore, roles e autorização; back-end Ubuntu |
| V4.6a–d | Lobbies, filas, draft, spells fixos, filtros velocidade 1×/2×, PvP Rust/WS push, rejoin, ranking e testes de carga | separação de fog, nenhuma leitura de combinação oculta; medir 100/1000/5000 conexões, p95 e memória |
| **V4.9-A — iniciável após AST** | adaptador de modelo local sob demanda (Qwen3-0.6B ONNX/WebGPU), Worker, cache, JSON Schema, UI preview/confirm | avaliação contra corpus; sem regressão FPS; feature flag desligada por padrão |
| **V4.9-B** | comandos complexos condicionais/multi-champion, macros, recompilação de plano ao mudar estado, feedback ao usuário | cenários determinísticos de combos e fog, 0 execução ilegítima mesmo com saída errada |
| V4.9-C | comparação SmolLM2-360M e variantes Qwen quantizadas; avaliação/fine-tuning opcional por dataset autoral | ganho comprovado em teste cego; licença de pesos/dados verificada; regressões de inferência |
| V4.7 | VFX/skillshots/câmera sobre eventos resolvidos, sem alterar dano | visibilidade/privacidade/tempo determinísticos |
| V4.8 | Blender/Tripo autoral, GLB/KTX2/textura otimizada, audio/timeline | FPS, RAM, rede e direitos de assets; 3D não bloqueia core |
| V5.x | certificação por patch e plano de publicação | cobertura real, QA multicampeão e revisão Riot/IP |

**Nota de sequência:** os números V4.7–V4.9 são *trilhas* planejadas, não ordem cega. A gramática e seu AST precisam nascer **antes** do LLM, ainda na V4.5.5a; a integração da IA pode avançar em branch independente após o contrato estabilizar, sem atrasar farm, conteúdo e multiplayer.

## Arquitetura do prompt (regra normativa)

1. **Fast path sem IA:** parser de comandos frequentes (``Jinx e Nami focar Caitlyn``, ``puxar wave bot``, ``Ward no rio``) com dicionário versionado de aliases em PT-BR, sem download de modelo.
2. **Fallback sob demanda:** inferência local no navegador em Worker; primeira opção para benchmarking: `onnx-community/Qwen3-0.6B-ONNX` via Transformers.js, `webgpu` e `q4f16`, sujeito a capacidade e licença; comparar alternativas (ex. SmolLM2-360M). WebLLM é **runtime alternativo**, não um segundo modelo a carregar junto.
3. **Saída apenas em AST tipada:** JSON Schema versionado, enums fechados, IDs escolhidos entre entidades visíveis/autorizadas; aliases resolvidos fora do modelo; sem `eval`, JavaScript arbitrário, chamadas shell ou código do jogador.
4. **Validação dupla:** validação sintática e semântica local apenas para feedback; **match actor Rust revalida** ownership, fog, alcance, recursos, cooldowns, fase, tempo, target selector e anti-replay. Ignorar claims ou IDs inventados pela IA.
5. **Preview e confirmação:** sequência editável por campeão/steps; se houver ambiguidade, apresentar opções para usuário; não assumir execução automática silenciosa de prompt de baixa confiança.
6. **Commit de turno simultâneo:** confirmação envia apenas plano aceito, com `client_command_id` idempotente; execução autoritativa e retorno de eventos observáveis pelo usuário via WebSocket push, não polling.
7. **Sem vazamento de informação:** contexto enviado ao modelo contém só observações autorizadas na tela/visão do time; nenhum hidden champion, HP, cooldown adversário secreto, ward oculta, intent inimigo; não confiar no cache ou UI para enforcement PvP.
8. **Fallback universal:** sem WebGPU, modelo indisponível, timeout, pouca memória, schema inválido ou FPS ruim => parser normal/manual; nunca bloquear uma partida por IA.

## Gates de qualidade e performance a estabelecer com benchmark

- Cobrir >=500 exemplos de comandos PT-BR rotulados, inclusive ambiguidades, typos, múltiplos campeões, combinações, cancels, fog, prompts maliciosos e nomes sobrepostos. Meta inicial de validação offline **>=95% exact match em intenção/AST** para casos suportados, e **100% de rejeição de ações não autorizadas** pelo servidor. Metas são propostas, não medição atual.
- Latências-alvo propostas (medir hardware representativo, incluindo iGPU): parser p95 <20 ms; IA local p95 <2500 ms após warm-up em hardware de referência; não travar thread UI; uso de memória/energia/VRAM sujeitos a profiling e threshold configurável.
- Registrar distribuição de inferência, tokens, tempos de download/cache e falhas sem armazenar texto privado por padrão; observabilidade anonimizada e opt-in para dataset.
- Testar 1× e 2× em **wall-clock**, nunca multiplicar cooldown em segundos simulados; recompilar ordens se alvos se moverem/saírem da visão.
- Reprodutibilidade: o **resultado da partida** depende somente de AST confirmada e simulação deterministicamente versionada; texto livre e inferência não entram no replay autoritativo.

## Documentos deste handoff

- `docs/IA_PROMPTS_ARQUITETURA_V452B_H1.md`: ADR e segurança técnica.
- `docs/IA_PROMPTS_BENCHMARKS_QA_V452B_H1.md`: avaliação e gates.
- `docs/IA_PROMPTS_CONTRATOS_V452B_H1.json`: AST/JSON Schema proposta.
- `docs/IA_PROMPTS_EXEMPLOS_V452B_H1.jsonl`: corpus inicial ilustrativo (não dados de treinamento certificados).
- `docs/PROMPT_CODEX_OPUS_IA_V452B_H1.md`: execução local em sprints.
- `AGENTS.md`, `README_CONTINUAR_CODEX.md`, skill local atualizados.
- `docs/CODEX_HANDOFF/ADENDO_TACTICAL_PROMPT_ENGINE_V452B_H1.docx`: complemento editável.

## Referências de implantação (verificar versões no dia da codificação)

- Qwen3 ONNX + Transformers.js: https://huggingface.co/onnx-community/Qwen3-0.6B-ONNX
- Transformers.js WebGPU: https://huggingface.co/docs/transformers.js/en/guides/webgpu
- WebLLM e JSON mode: https://github.com/mlc-ai/web-llm
- Segurança OWASP API/Authorization: https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/
- Motor autoritativo Rust e WebSocket: https://docs.rs/axum/latest/axum/extract/ws/
