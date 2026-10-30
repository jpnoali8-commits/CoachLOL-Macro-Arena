# M45 — Procedimento obrigatório para qualquer pedido "próxima prioridade"

Este é o contrato de continuidade entre chats. Não há execução automática em background: o pedido do usuário aciona o trabalho atual.

1. Leia, nesta ordem: START_HERE.md -> STATUS_LEDGER.md -> FILA_PRIORIDADES.md -> GATES_QA_E_CERTIFICACAO.md -> PLANO_MESTRE_MIGRACAO_TOTAL.md -> arquitetura/inventário.
2. Leia docs/ADR-001-rust-migration.md, docs/ADR_ARQUITETURA_RUST_WASM.md e docs/parallel/FAST_LANE_DEV69.md conforme precisar. Regras de gameplay existentes têm precedência sobre simplificações não certificadas.
3. Consulte o repositório GitHub ao vivo: dev69/integration, dev69/skills-batch2, dev69/items-batch2, dev69/rust-core-m45, PRs #9/#19. Se HEAD divergir, verifique antes de escrever para não perder trabalho paralelo.
4. Selecione primeiro item READY em FILA_PRIORIDADES.md, respeitando G0–G8. Se o item BLOCKED ou parcialmente implementado, execute a ação que elimina o bloqueio, sem iniciar kits inéditos.
5. **Faça o trabalho de verdade**: implementar/testar código e fixtures na branch de migração ou subbranch por domínio. Não responder somente com plano quando o usuário pede para prosseguir.
6. Use ferramentas disponíveis para compilar Rust/wasm real; se não houver toolchain, NÃO marque resultado como PASS. Asserções em V8 não certificam Rust. Instrumente testes e, quando inevitável, use Actions/Codespaces com justificativa clara; não executar CI de custo elevado por conveniência.
7. Aplique gatilho QA antes de mudar estado: unit Rust, rustfmt/clippy, fixture equivalência, dual-view blue/red, privacy, snapshots, interações e regressão da área.
8. Atualize STATUS_LEDGER.md, FILA_PRIORIDADES.md e manifest.json na MESMA revisão, crie recibo docs/m45_rust_wasm/receipts/M45_Bxx_*.md com commit/QA; nunca auto-promova o próximo B.
9. Faça commit GitHub na branch de migração, atualize PR Draft, sem merge em main/integration/skills/items e sem force-push. Se ferramenta falhar, registre precisamente o que não foi publicado.
10. Responda em PT-BR: prioridade executada, alterações reais, SHA/PR, QA PASS/FAIL/NOT_RUN, possíveis divergências, bloqueio e próxima prioridade. Não inventar número de testes.
11. **Critério de parada:** se a tarefa exigir decisão externa indispensável, apresente melhor progresso possível sem fabricar prova; próxima prioridade elimina o bloqueio.
12. Ao alcançar G8, auditar TODO o legado encontrado nas 3 branches; somente então retomar conteúdo M46+ em Rust.

## Resposta mínima de execução

~~~text
CoachLOL — M45 Bxx
Fonte: branch + SHA
Alterações: ...
Rust: ...
WASM: ...
QA: passados / falhados / não executados
Gates: G0...G8
Git: novo commit SHA + PR Draft (ou não publicado)
Status: ... próximo item READY ...
~~~

## Prompt de retomada em chat novo

~~~text
Continue o projeto CoachLOL Macro Arena no programa M45 de MIGRAÇÃO TOTAL RUST/WASM. O objetivo definido é portar todo gameplay autoritativo, servidor PvP, comandos, mapa, economia, itens, combate, kits PASSADOS e integrações existentes para Rust antes de adicionar novos kits. UI permanece TypeScript/HTML/CSS; WASM só cálculo público seguro. Consulte o GitHub jpnoali8-commits/CoachLOL-Macro-Arena, branch dev69/rust-core-m45, PR #19 Draft. Comece lendo docs/m45_rust_wasm/START_HERE.md, STATUS_LEDGER.md, FILA_PRIORIDADES.md, GATES_QA_E_CERTIFICACAO.md e PROTOCOLO_PROXIMA_PRIORIDADE.md. Confira branch HEAD em tempo real, selecione primeira prioridade elegível e EXECUTE de fato com código/testes/commit; atualize ledger e recibo. Preserve PR #9 skills, items e integration; sem merge/force-push, sem Actions/Codespaces salvo necessidade. Nunca declare Rust/WASM testado se o binário não foi compilado/executado. Não abra expansão de novas skills/itens antes do gate G8 MIGRATION_CERTIFIED.
~~~

## Regra de economia GitHub Actions — vigente após M45 B02A7

A quota de Actions está próxima do limite. **Padrão operacional obrigatório: zero execuções de GitHub Actions por próxima prioridade.** Preferir conector GitHub para blobs/commits/diffs, V8/Node local do ChatGPT, testes estáticos com SHA e scripts de golden preparados. Registrar `NOT_RUN` quando o executor real não estiver disponível; **jamais disfarçar simulação como Rust nativo/WASM ou E2E**.

Autorizar excepcionalmente CI somente em **gate significativo de integração/certificação** (por exemplo novo crate/contrato P0 finalizado, G1 conjunto de crates, G3 ACL de rede ou G8), e somente quando o mesmo teste não puder rodar no ambiente atual. Documentar previamente **por que vale os minutos, número esperado de jobs, timeout e gatilho restrito**. Não criar workflows de `push` amplo, não editar `qa/trigger_b02a5.txt` e não reexecutar job antigo sem bug corrigido e motivo técnico. **Não iniciar uma Action para confirmar mera formatação, documentação ou inventário.** Usar receipts de execuções anteriores somente para o mesmo SHA verificado; novo código Rust exige nova prova quando chegar o gate relevante.

Sem consentimento do usuário para expansão de custos, escolher alternativa sem CI sempre que possível. Esta regra vale para Chats 1–4 e preserva branches originais, PR #9 e PR #19 Draft.
