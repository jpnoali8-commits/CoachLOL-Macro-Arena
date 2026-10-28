# Roadmap de produção — V4.5.2d-dev2

**Única base permitida:** este pacote, incluindo alterações locais Git herdadas do Codex. Não reverter para V4.5.2d-dev1 ou V4.5.2b.

| Marco | Gate | Maturidade |
|---|---|---|
| V4.5.2c | last hit real e farm normal 35–62 CS/5min, freeze monitorado | passed normal; freeze parcial |
| V4.5.2d-dev1 | tipos minion Barão, 3 ticks Elder, snapshots | tested partial |
| **V4.5.2d-dev2** | seis almas com procs independentes, anti-recursão, recall Barão | tested partial |
| V4.5.2d-3 | buffs permanentes completos por drake, stats Barão por minuto, speed/aggro de minions, revisit Elder, 5v5 Smite, Arauto/Vastilarvas | próxima entrega |
| V4.5.2e | windup/tempo de projétil/attack speed por campeão, minion aggro, freeze TOP/MID; não fabricar CS | pendente |
| V4.5.3 | todos os itens, receitas, ativos, runas, 2 spells travadas no draft; certificação por patch | pendente por lotes |
| V4.5.4+ | campeões base/growth/passivas QWER/recasts/targets/colisão, famílias reutilizáveis, testes por kit | pendente por lotes |
| V4.5.5/4.6 | Rust nativo server-authoritative, golden JS→Rust, Wasm público opcional, login/contas, perfil, lobby, match actors, fila, WebSocket push, PostgreSQL, milhares de sessões sob carga | pendente |
| V4.7–4.9 | VFX, GLB low-poly, vídeo/áudio, AST/gramática PT-BR, Qwen local opcional WebGPU | pendente |
| V5.x | matriz de paridade por patch, QA escalável, observabilidade e gates legais | pendente |

**Regras invariantes:** relógio simulado não muda no modo 2×; fog e intents no servidor; zero duplo gold, zero CD/mana duplicados, critérios de maturidade explícitos (`training`,`partial`,`tested`,`certified`); resultados dos benchmarks legados nunca mascarados.

**Comandos:** `npm run test:v452d2`, `npm run test:v452d`, `npm run test:v452c`, `npm test`, `python tools/sync_browser_v43.py`. A próxima tarefa não é implementar tudo em uma tacada: é fechar os passivos restantes com golden tests e simulação de teamfight.
