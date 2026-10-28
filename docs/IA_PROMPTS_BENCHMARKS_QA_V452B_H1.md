# QA / Avaliação do Tactical Prompt Engine — baseline inicial

**Status:** PLAN, ainda não realizado. A V4.5.2b permanece o pacote jogável. Separar `PASS`, `FAIL` e `NOT_RUN` sem interpolar valores.

## Camadas de teste

1. Lexer + aliases PT-BR: nomes campeões, abreviações (`jg`, `bot`, `ult`, `flash`), variações gráficas, pontuação e sequência.
2. AST: validação estrutural, versão, enums, alvo, controle de tamanho, zero código arbitrário, serialização round-trip.
3. Intenção: mapeamento comando livre -> AST esperada; cuidado com comandos múltiplos, implicações temporais e semântica de `se`/`senão`.
4. Regras: skill em cooldown, mana insuficiente, CC, range, skillshot ao chão, recast, trinket, casts reativos; nenhuma recusa arbitrária do motor por nome de alvo.
5. Fog e autorização: nunca incluir `target_id` oculto ou plano privado rival; gank por local conhecido pode acontecer sem notificação antecipada.
6. Desempenho: CPU+iGPU+dGPU, Safari/Firefox/Chrome suportados; cold download/cache, cold/warm startup, inferência p50/p95, fps, energia e footprint; sem WebGPU => modo manual.
7. Multiplayer: sincronização 1×/2× em tempo simulado e simultaneidade; mutação e ações duplicadas, reconexão, limites de payload, flood/protocolo fora de ordem.
8. Motor: snapshot/replay determinístico do **plano confirmado**, independente do output textual do LLM.

## Corpus mínimo sugerido

- Primeiro conjunto manual: 30 exemplos JSONL incluídos neste handoff, cada qual etiquetado como ``proposto``; ampliar para >=500 para aprovação.
- Classes: alias simples, target inimigo/aliado, direção chão/linha/área, defesa, farm, freeze/push, múltiplos atores, foco, dependência, chance de habilidade, condição por HP, waypoint na fog, recast, revogar ordem.
- Contraexemplos: personagem oculto, alvos ambíguos, habilidade inexistente, feitiço não equipado, ataque a aliado, instrução de ignorar cooldown, scripts arbitrários, flood.
- Rotulagem humana: 2 revisores para exemplos ambíguos; congelar conjunto de teste antes do ajuste fino; fixtures versionadas por patch.

## Critérios de aceite propostos (NÃO medidos)

- Parser determinístico cobre 100% de comandos básicos formalmente aceitos; fallbacks explícitos em casos incertos.
- Em conjunto balanceado >=500 prompts novos: >=95% exact match de AST/intenção no hardware/idioma alvo; medir acurácia *por classe*, não apenas média.
- Sem execução ilegal: 100% de ações que violam auth/fog/regras são rejeitadas pelo match actor; `0` disclosure de informação secreta nos payloads de testes.
- UI nunca fica bloqueada enquanto modelo infere: worker, timeout, cancelamento, fallback.
- Primeiro benchmark de desempenho define budgets de MB/latência/FPS; não assumir modelo "leve" baseado só em parâmetros ou quantização.
- Sem modelo carregado por padrão; jogo base executa totalmente offline mesmo sem servidor de IA, exceto serviços PvP normais.

## Matriz de equipamentos para benchmark

- Windows 10/11 Chrome/Edge com GPU dedicada: baseline desempenho.
- Windows iGPU comum: performance e warm-up.
- Laptop modesto sem WebGPU suportado: parser/manual, sem erro.
- Android midrange (se suportado): benchmark de aquecimento, bateria e memória.
- Rede lenta: UX ao baixar modelo por opção, tamanho total real, pause/retry, cache e CDN com integridade.

## Comandos CLI sugeridos para Codex após criar módulos

```bash
npm run test:v452b
npm run test:v38-1
npm run test:v451
npm run test:v452
npm test  # deve registrar falha conhecida P0 de farm até resolver
# criar npm run test:prompt-contract, test:prompt-safety, test:prompt-corpus
# cargo test -p arena_protocol -p arena_core -p match_server (somente quando existirem)
```

## Acompanhamento

Em cada versão atualizar `docs/IA_PROMPTS_QA_RESULTS.json` somente com medições reais (hardware, navegador, modelo, dtype, tamanhos, seed, result). Nunca simular logs de perf.
