# PROMPT OPERACIONAL PARA CODEX / OPUS — IA Tactical Prompt Engine (NÃO EXECUTAR REWRITE)

Você está trabalhando sobre **CoachLOL Macro Arena V4.5.2b**, a única base canônica do ZIP extraído. Siga `AGENTS.md` e `docs/ROADMAP_MESTRE_V452B.md`. Novo handoff documental H1 inclui `docs/ROADMAP_CANONICO_V452B_H1_PROMPTS.md`, `docs/IA_PROMPTS_ARQUITETURA_V452B_H1.md`, `docs/IA_PROMPTS_CONTRATOS_V452B_H1.json`, `docs/IA_PROMPTS_EXEMPLOS_V452B_H1.jsonl` e `docs/IA_PROMPTS_BENCHMARKS_QA_V452B_H1.md`.

**Prioridade atual:** corrigir P0 FARM V4.5.2c com last hit real; o teste histórico ainda está em ~23 CS no TOP/5 minutos e não pode ser removido. Trabalho em IA deve ocorrer em branch paralela **sem alterar `engine.mjs`, `app.js` ou gameplay por acidente** até contratos aprovados.

Sprints da IA:

1. Criar ADR do `PlanV1` com campos `schema_version`, `patch_id`, `actors`, `steps` (action/target/condition/fallback) e IDs por time autorizados, e catálogo de intents por patch. Contrato imutável e migrations planejadas.
2. Implementar parser deterministic PT-BR para 20 comandos mais frequentes, com aliases (campeões, spells, lanes, comandos de wave), sem LLM e sem backend de IA. **Sempre retorna AST ou `NEEDS_DISAMBIGUATION`**, jamais ação improvisada.
3. Validar AST por JSON Schema, constraints de complexidade/step/depth, ownership/fog, bans de URLs/scripts/expressões arbitrárias. Cross-language fixture JS ↔ Rust no `arena_protocol` quando pronto.
4. Implementar preview e edição no modal atual de combo; multi-champion e targeting de mapa com confirmação, mantendo seleção Shift/retarget de reação.
5. Só depois criar feature flag `tactical_prompt_llm=false` padrão. Worker + Qwen3-0.6B ONNX/WebGPU quantizado sob demanda, testes cold/warm/memória/FPS e fallbacks. Avaliar WebLLM e SmolLM2 sem instalar múltiplos modelos por padrão.
6. Testar >=500 exemplos PT-BR rotulados; mudanças em pesos/fine tuning só com métricas comparáveis e dataset autorizado. Não anexar pesos ao ZIP sem auditoria de licença e banda.
7. Integrar com match actor Rust autoritativo quando existir: os eventos/resultados são determinados somente pelo servidor. A IA não enxerga adversários fora de visão nem executa código.

Entregue em cada sprint: diff, testes novos, comandos de reprodução, resultados PASS/FAIL/NOT_RUN, evolução da matriz de cobertura, sem esconder dívida técnica. Confirme qual arquivo versionado passa a ser fonte de verdade e não regreda para ZIPs históricos.
