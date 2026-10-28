# PROMPT DE INÍCIO — NOVO CHAT / CODEX / CLAUDE OPUS

Continue **o CoachLOL Macro Arena** diretamente do ZIP anexo `CoachLOL_MacroArena_V452d2_Handoff_NovoChat_V452d3.zip`. Este pacote contém o jogo completo V4.5.2d-dev2 + documentação portátil de handoff; **NÃO** é o código da V4.5.2d-3 já implementado. Não utilize ZIPs antigos para substituir os fontes atuais.

**Antes de codificar:** leia `NOVO_CHAT_COMECE_AQUI.md`, `AGENTS.md`, `.agents/skills/coachlol-producao/SKILL.md`, `docs/HANDOFF_NOVO_CHAT/INDEX.md`, `MEMORIA_COMPLETA_V452D2.md`, `PLANO_V452D3.md`, `DECISOES_ARQUITETURA.md`, `GATES_DE_QA.md`, `ROADMAP_PLATAFORMA_E_PARIDADE.md` e `docs/QA_V452D2_SOULS.md`. Inspecione `version.json`, `engine.mjs`, `engine.browser.js`, testes e `git status`.

**Prioridade IMEDIATA:** desenvolver **V4.5.2d-3**, começando por um incremento pequeno de **passivos elementais permanentes dos seis dragões por stack/equipe** (Hextech AS/AH, Quimtec tenacity/healing-shield power etc.) com números verificados para LoL PC patch 26.21. Depois evoluir atributos Barão por campeão + movimentação e aura por tipo de minion, Elder com timing e Smite/objetivos 5v5 determinísticos. Não é necessário tentar concluir tudo simultaneamente: progrida até o maior incremento testável que caiba nesta execução, documentando pendências honestamente.

**Restrições inegociáveis:** preservar farm real V4.5.2c (35–47 CS/5min nas seeds registradas), freeze parcial, seleção múltipla, alvo alternativo em contra-combo, buffs da V4.5.2d-dev2, snapshots, fog, jogo offline; não duplicar ouro/kills/custos; sem alterar cooldowns por velocidade de UI 2×; nenhum buff 1:1 sem auditoria. Motor JS atual é autoridade offline, Rust/WebAssembly/backend são futuros e devem ser migrados por contratos, não reescrita total.

**Testes:** rodar `npm run test:v452c`, `npm run test:v452d`, `npm run test:v452d2`, novos contratos V4.5.2d-3, `node --check engine.mjs`, `python tools/sync_browser_v43.py`, `npm test` (relatar status real) e, se possível, visual Chromium. `npm test` histórico nesta versão ficou INCONCLUSIVO por timeout; não afirmar aprovado sem nova execução completa.

**Entrega:** jogo completo em ZIP derivado deste exato repositório, changelog, memória, QA com PASS/FAIL/NOT_RUN, roadmap, skills e instruções de próximo marco. Atualize Git somente após verificar estado; não apague alterações locais. Faça o trabalho na resposta atual em vez de somente planejar; responda em português do Brasil. Depois indique o avanço e a próxima tarefa executável.
