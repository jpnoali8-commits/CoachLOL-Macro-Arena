# Contexto adicional salvo no handoff — Tactical Prompt Engine (26/10/2026)

Decisão do projeto: construir um treinador tático por turnos simultâneos, com comandos livres em português para movimentação, foco, gank, combate, habilidades, auto-farm, economia, macros, multi-seleção, condições e combos multi-champion. IA opcional **executada no navegador** para interpretar texto, enquanto o servidor Rust é a única fonte de legalidade e resultados.

- **Stack preferida:** Rust nativo no backend/match actor; WASM somente lógica pública; PostgreSQL; WebSocket push (sem polling de estado); UI web preta/dourada, flat, compacta; 3D Blender/GLB só após gameplay/perfis/PvP.
- **Parser híbrido recomendado:** regras/aliases determinísticas sempre disponíveis; sob demanda modelo leve Qwen3-0.6B quantizado no Web Worker + WebGPU; comparar alternativas/compatibilidade e permitir fallback manual.
- **Contrato de dados:** `PlanV1` AST versionada (ações/condições/seletores/patch/atores), output de modelo validado, nunca ações livres no motor; preview/confirm e revalidação autoritativa por fog, recursos, fase, distância, alvo, CC e cooldown.
- **Plano de marcos:** criar gramática e schema cedo em V4.5.5a paralelamente ao Rust; desenvolver adaptador LLM/benchmarks em trilha V4.9-A, ações complexas V4.9-B, possível fine tuning V4.9-C **após** datasets testados. IA é assistiva, não uma dependência de jogar.
- **Performance:** carregar apenas por pedido, cache local, worker, validar WebGPU, fallback sem GPU, benchmark downloads/memória/FPS/latência; não impor downloads enormes a todos os jogadores.
- **Privacidade:** a IA só recebe informações observáveis, nunca chaves/estado secreto. O cliente PvP só recebe eventos/visão filtrados; requests WS com AST confirmada e idempotência. Replay guarda ações confirmadas, não inferências.
- **Estado real imutável:** V4.5.2b jogável; P0 farm legado ~23 CS TOP/5min; kits, itens e runas ainda parciais. H1 **não implementa o Tactical Prompt Engine**, só especifica a engenharia para Codex/Opus.
