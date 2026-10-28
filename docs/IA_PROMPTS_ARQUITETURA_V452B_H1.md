# ADR-008 — Interpretação local de prompts táticos (PROPOSTA, NÃO IMPLEMENTADA)

**Data:** 2026-10-26. **Status:** PROPOSTA; decisão recomendada para Codex/Opus; baseline de código V4.5.2b mantida.

## Contexto

CoachLOL precisa entender português coloquial e instruções de multi-action/multi-champion, incluindo condições (`se`, `quando`, `até`) e sincronização de turns. O jogo já possui UI de combos, mas a interface não é uma AST completa. Rodar um LLM no servidor a cada comando escala custos e vazamentos; permitir que a IA execute diretamente um motor é inseguro.

## Decisão recomendada

**Priorizar parser híbrido.** (1) gramática determinística e ação tipada em Rust/TypeScript; (2) geração estruturada por modelo **no navegador e sob demanda**; (3) validação estrita com JSON Schema/AST; (4) feedback visual e confirmação do plano pelo usuário; (5) verificação autoritativa no servidor em cada turno. IA não define verdade de mundo e não recebe estado privado adversário. UI sem suporte ainda opera pelo fluxo manual.

**Primeiro candidato para prova de conceito:** `onnx-community/Qwen3-0.6B-ONNX` em Transformers.js com `device: 'webgpu'`, `dtype: 'q4f16'` em Web Worker. **Alternativa:** WebLLM com JSON mode se runtime/modelo disponível forem melhores na medição. **Baseline leve:** SmolLM2-360M-Instruct quantizado e parser somente, analisados em benchmark. O nome do candidato não é compromisso definitivo com browser/VRAM/latência. Não copiar arquivos de modelo ao ZIP de jogo por enquanto. Avaliar termos/licenças no momento de distribuir pesos.

### Componentes e limites

```text
prompt_ptbr -> lexer/normalizer + alias resolver -> deterministic parser
                                | (unsupported/ambiguous)
                                v
                  optional LLM inference (Web Worker)
                                v
                    JSON schema -> semantic validator
                                v
                preview/edit + user confirmation
                                v
       Rust match actor: authorize -> plan -> simulate -> WS event
```

- Entrada do parser: texto, `patch_id`, `actor_ids` autorizados, observações visíveis, habilidades/itens/runas de loadout próprio, limite de passos, versão do schema.
- Nunca enviar ao modelo tokens de autenticação, banco, conteúdo oculto da fog, prompts de outros usuários ou estados de combate não observáveis.
- A saída deve conter `intent`, `actors`, `steps`, `target`, `when`, `fallback`, `order`, `schema_version`, `patch_id`. Sem campo de código arbitrário. Nunca confiar em `confidence` emitido pelo LLM sem calibração externa.
- Um plano condicionado não autoriza o cliente a decidir regras: o servidor reavalia `when` na resolução, usando somente estado legal, e registra resultado num journal observável.
- Para comandos que mencionam alvo invisível: permitir waypoint geográfico conhecido (sem `target_id` oculto); não inventar rastreamento ou detecção.
- Condicionais de evento: `target_visible`, `target_in_range`, `skill_ready`, `ally_hp_below`, `enemy_enters_zone`, `after_step_success`, com limite máximo de ramificações/steps por turno.
- Comandos de defesa/reação podem trocar foco, mas não demandam aceite do agressor; ataque coordenado agrega dano de atacantes válidos.

## Segurança / determinismo

- Schema validado na borda, `client_command_id` idempotente, assinatura de sessão e ownership; taxa-limite de submissões e tamanho máximo de AST; timestamps e deadlines de fase.
- O modelo é **não confiável**: nomes de campeões/usuários, mensagens, documentação acessível e resultados de prompt podem conter injection. Dados nunca viram instruções de sistema.
- LLM processa exclusivamente texto fornecido pelo usuário e observações visíveis; UI não recebe estado oculto para "ajudar a IA".
- O servidor não executa HTML/JS gerado, e não recebe tokens modelo a modelo; recebe JSON tipado e normalizado.
- Replay guarda ação confirmada, seed, versão do patch, checksums/eventos; não gera novamente com LLM no replay.

## Decisões adiantadas para Rust

`arena_protocol` Rust deve aceitar `PlanV1`, `StepV1`, `ConditionV1`, `SelectorV1`, `OutcomeV1` e versionamento (`schema_version`, `patch_id`). Gerar JSON Schema do Rust (ex.: schemars, se escolhido) ou fonte de verdade JSON Schema e testes cross-language. Não permitir divergência silenciosa JS/Rust.

Ações genéricas são reutilizáveis (`move`, `attack`, `cast`, `wait`, `hold`, `place_ward`, `farm`, `objective`, `use_item`, `summoner_spell`), mas os efeitos são resolvidos exclusivamente por manifestos de habilidades, itens e runas individuais por patch. Vex R2, Lux R, Nami W e outras skills similares partilham **geometria**, não comportamento idêntico.

## Estratégia para milhares de jogadores

A inferência ocorre **no cliente por escolha do usuário**, não por tick nem por servidor. WebSocket push em fases/observações e apenas uma submissão no commit. Match actors Rust isolados; WS com backpressure, reconexão e snapshots filtrados por time. Não usar polling de estado a cada segundo; heartbeats WebSocket têm função de saúde da conexão, não de sincronização por polling.

## Fora do escopo do handoff H1

Nenhum pacote, modelo ou dependência JS/Rust foi instalado; nenhum LLM executado; nenhuma gramática alterou o jogo. Este documento especifica decisões, contratos e testes para produção futura.
