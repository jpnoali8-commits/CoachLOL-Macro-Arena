# CoachLOL Macro Arena — PLANO MESTRE DE MIGRAÇÃO TOTAL PARA RUST/WASM

**Decisão M45 (2026-10-30). Status: plano aprovado como objetivo; MIGRAÇÃO AINDA NÃO CONCLUÍDA.**
**Ordem do usuário:** concluir a migração e auditoria de TODO o gameplay produzido até agora ANTES de voltar à produção de novas skills e itens.
**Fontes normativas:** docs/ADR-001-rust-migration.md; docs/ADR_ARQUITETURA_RUST_WASM.md; docs/parallel/FAST_LANE_DEV69.md. Se existir conflito, preservar invariantes de produto e autoridade; registrar ADR de revisão explícita em vez de sobrescrever silenciosamente.

## 0. Resultado obrigatório (Definition of Done global)

1. TODAS as regras de simulação e mutação autoritativa devem residir em crates Rust, executadas em servidor Rust nativo por partida: turnos, relógio, intenções, comandos validados, caminho e colisão, mapa e fog, waves/farm/XP, economia/itens/runas/spells, objetivos, jungle, efeitos, skills/passivas/transformações, combate, mortes, torres, Nexus e pós-jogo.
2. O WASM compila os MESMOS crates puros adequados a cliente, mas recebe somente **perspectiva pública** já filtrada pelo servidor. Nunca enviar informações escondidas, RNG privado, ordens inimigas, segredos do servidor ou autoridade para o navegador. Não existe resolução de combate no cliente.
3. A interface continuará web: HTML/CSS e TypeScript/JavaScript de apresentação, câmera, HUD, renderização, draft e controles visuais. A lógica de gameplay NÃO poderá depender de engine.mjs, engine.browser.js, commands.mjs ou de simulação autoritativa em app.js.
4. Servidor PvP e transporte migrados para Rust, com vínculo conexão autenticada/sessão -> seat -> team; dois humanos, um controla exatamente cinco campeões de um time. Fluxo order -> ACK/receipt -> turn seal -> resolução simultânea -> snapshot visível -> replay determinístico. Evitar 10 controladores humanos e bots como autoridade.
5. Toda funcionalidade **existente e implementada** em QUALQUER branch histórica escolhida no baseline precisa ser migrada ou formalmente registrada como defeito/escopo interrompido; nenhuma habilidade, item ou componente existente pode sumir por trocar o motor. Funcionalidade parcial continua marcada parcial; NÃO exigir inventar todo o elenco ainda faltante para declarar migração completa do legado.
6. Build, testes, comparação golden, segurança, fog, reconexão, browser real, assets binários, snapshots e replays passam nos gates de certificação. Não chamar release enquanto a Issue #1 de assets remotos estiver pendente.
7. Skills e itens futuros passam a ser implementados em Rust/data versionados, não em engine.mjs. A expansão de conteúdo só reabre após gate **MIGRATION_CERTIFIED**, que não equivale a FULL_CHAMPION_CATALOG.

## 1. Congelamento de expansão e salvamento

- A partir desta decisão, **suspender novas implementações de skills/itens em JS**. Só permitir correções de referência para congelamento, instrumentação golden e bugs bloqueadores de migração, documentados. Os chats de skills e itens não são automações; devem receber o comando de congelamento no respectivo chat antes de qualquer novo lote.
- Não apagar B33A nem commits de itens. Preservar remotos, PRs, testes, dados, registros, ZIP mestre e hashes. Não rebase/force-push/merge em main.
- As três linhas atuais não são iguais. Baselines inspecionados em 2026-10-30:
  - integração: dev69/integration @ 374d87d5f49b52514ec68bbe666df086363c1ec5
  - skills: dev69/skills-batch2 @ f0b1147ac46e585a1d5374a178b1ea462f5dc278; PR #9 Draft
  - itens: dev69/items-batch2 @ 182e592fc27cc9516cf6d52ef2fabc17ee1e1b7d
  - migração: dev69/rust-core-m45 @ 7d344d2fac16b05a6e81c8984e38ce6ad2c907c3; PR #19 Draft (HEAD inicial; conferir sempre)
- B33B tinha apenas blobs candidatos não commitados. NÃO tratar como código publicado nem apagar o registro de pendência; incluir apenas após revisão e salvamento explícito.
- Estabelecer baseline de **união de contratos**: inventário por branch + diff de métodos/efeitos/testes, matriz canonical / implemented / partial / reference-only / absent; golden de cada sem fusão destrutiva. Incorporar conteúdo com migração semântica e proveniência, não substituir engine.js da integração pela cópia maior da skills.

## 2. Fases e dependências

| Fase | Pacotes | Escopo e entregável principal | Gate que encerra a fase |
|---|---|---|---|
| F0 — salvamento | B02–B03 | inventário por branch, freeze verificável, toolchain Rust/wasm32, corpo de testes, assets/proveniência; unificar manifesto sem sobrescritas | G0 inventário + G1 compilação + fixtures |
| F1 — protocolos | B04–B06 | schema versionado de input/estado/event/receipt, Rust core-state/clock/replay; match actor determinístico; conexão/assento | G2 estado/ordens/replay, G3 ownership/idempotência |
| F2 — interface e comandos | B07–B08 | parser PT-BR/gírias e planos persistentes portados em Rust; boundary de input seguro; clientes traduzem voz/texto em intenção, servidor valida | G3 inputs/undo/fog, G4 paridade do parser |
| F3 — mundo | B09–B11 | mapa/atlas/bounds, plantas, walls, pathfinding, collision, brush, visão, wards, Rift Elemental; ticks e movimentação | G2/G5 trajetória+visão e golden multi-seed |
| F4 — macro | B12–B15 | waves 3/3+canhão, last-hit/XP, recall/respawn, estruturas, jungle, timers, objetivos, Smite, Barão, Dragão, Arauto, buffs | G5 equivalência de objetivos, CS e Nexus |
| F5 — combate | B16–B19 | stats, cálculos, ataque/kite, targeting, projéteis, CC, efeitos, interrupções, paredes e recasts compartilhados | G6 identidade e ordem causal |
| F6 — catálogo legado | B20–B25+ | migrar TODAS skills/passivas/itens/runas/spells já implementados em integration + skills + items, incluindo Viego/Sylas/Neeko/Morde e legados; registrar incompletos | G6 matriz do legado 100% reconciliada |
| F7 — produto completo | B26–B29 | loja e draft end-to-end, sessão PvP HTTP/WS/SSE, reconexão/Undo, browser WASM/TS, visual 2 jogadores, pós-jogo e deploy | G3/G7 rede/privacidade/web |
| F8 — certificação | B30–B33+ | 100% testes golden inventariados, dual-run auditado sem dupla autoridade, stress multi-seed, segurança, assets, packaging e rollback testado | G8 MIGRATION_CERTIFIED / release separada |

Os números B são **ordem de fila**, não estimativas de esforço ou promessa de concluir em 33 turnos. Dividir cada B em BxxA/BxxB/BxxC se necessário, sem pular gate. O escopo real será ajustado pelos contratos descobertos, sempre com ledger auditável.

## 3. Congelamento / retomada de produção

- Enquanto F0–F8: STATUS = MIGRATION_ONLY. Nenhum novo lote autoral de QWER/passivas/itens em engine.mjs.
- É permitido migrar e corrigir skills/itens legados para preservar função real e passar golden; isso NÃO conta como produção de kits inéditos.
- Reabrir "produção de skills em Rust" somente se TODAS as linhas da matriz de código existente estiverem DONE/APPROVED ou divergência documentada aprovada, e server Rust estiver ativo e certificado para gameplay; se houver blocker real, continuar migração, não inventar atalho JS.
- O jogo ainda NÃO terá automaticamente todos os campeões do LoL certificados após migração. Esse é o marco seguinte (M46+): produção autoral Rust de 25–40 campeões por lote sob executor comum, de acordo com QA e capacidade.

## 4. Estratégia anti-regressão — nunca Big Bang

1. Preservar motores JS legados como **oráculos congelados e executáveis**. Inventariar todas as divergências entre branches e fixtures; código legado não é referência de verdade se tiver bug documentado.
2. Extrair protocolo e entradas/saídas estáveis antes de migrar; contratos de "ação" não podem ser copiados acriticamente se vazarem fog.
3. Escrever a versão Rust de UM subsistema, testar offline contra golden (state/seed/inputs/events/checksum) e snapshots azuis/vermelhos; executá-la em shadow sem mutação de partida.
4. Se divergir: guardar diff, identificar bug Rust/JS ou mudança semântica intencional com decisão registrada; NÃO mascarar divergência via tolerância que mude vencedor, CS, gold, cooldown, alvo, visão, status, RNG ou eventos.
5. Integrar por fronteiras confiáveis no servidor: enquanto não certificado, mantém autoridade JS. Transição do servidor inteiro para Rust somente após regras necessárias estarem portadas; NUNCA dividir a mesma ação entre duas autoridades.
6. Remover dependência do JS de gameplay do runtime de produção apenas após backup recuperável, replay, rollback e auditoria final. Manter oráculo JS arquivado para testes/regressão históricos.
7. Evolução autoral futura de skills: definition-data + Rust executor único e efeitos reutilizáveis; Sylas invoca R original, Viego executa P/Q/W/E originais com forma/skin/controle preservados. Proibir fallback genérico silencioso.

## 5. Invariantes do produto (bloqueio automático)

- 1 humano × 1 humano; 5 campeões sob cada equipe; duas confirmações, mesma janela de turno, prioridade excepcional de reação a gank/roam; combate com defensor respondendo; ida e volta aos mesmos resultados em replay.
- Ward, fog, visão, brush e camouflage/invisibilidade não podem vazar IDs/posições/intenções ocultas; cliente não determina resultado.
- Skills exigem rank, custo, range, cooldown, alvo, projéteis, colisão e status; morte/recast/realm/interrupções corretos.
- Wave 6 minions (3+3) ou 7 com canhão, farm apenas last hit real, XP por proximidade, jungle independente; minion block e pathing.
- Loja e itens componentes/recibos/receitas; Undo válido somente na fonte **sem sair fisicamente** desde compra; vedado após sair mesmo retornando.
- Runas só no champ select; spells 2 por campeão, jungle Smite obrigatório, sem troca na partida; sem duplicar cobrança e casts.
- Monstros, torres, inibidores, Nexus, dragões, Barão, Arauto, Ancião, Voidgrubs, plantas, Rift Elemental, buffs e timings preservados.
- Parser PT-BR/gírias, voz, ordens persistentes e confirmação Enter; o texto jamais ganha privilégios de server seat.
- Duração alvo ~30 min; medir sem normalizar perdas/censura ou falsificar média.
- Não alterar paleta preta/dourada e UI/board como consequência colateral da migração; teste visual 16:9.

## 6. Governança, Git e QA

- Integrador decide contratos de rede, serialização, replay, APIs e promoção. Especialistas migrarão o legado **por domínio Rust** em worktrees/branches específicas, sem alterar a autoridade do JS nem arquivos de outros especialistas.
- Trabalhar a partir da branch dev69/rust-core-m45 (PR #19) até um marco de consolidação. PR Draft; sem merge prematuro para integration, skills ou items. Registrar SHA base e HEAD de cada operação.
- Se dependências de um especialista necessitarem schema novo, propor primeiro contrato mínimo; nunca duplicar lógica em JS e Rust sem golden.
- GitHub Actions/Codespaces apenas quando os gates exigirem compilação/teste que o ambiente atual não oferece; antes disso preferir ferramentas locais. Não declarar PASS por código revisado sem execução.
- Garantir acesso à versão textual, assets binários originais e evidências (Issue #1); preservar copyright/licenças e hashes. Nenhum placeholder inventado para passar QA.
- Registrar comandos de teste, resultados numerados, sistemas não executados, hash das fixtures e commit. Ver docs/m45_rust_wasm/GATES_QA_E_CERTIFICACAO.md.

## 7. Como continuar com apenas "próxima prioridade"

1. Ler docs/m45_rust_wasm/START_HERE.md, STATUS_LEDGER.md, FILA_PRIORIDADES.md e os contratos/gates citados.
2. Verificar em tempo real HEADs/PRs do GitHub, status de branches e qual QA já foi realmente executado.
3. Selecionar **primeiro item elegível não aprovado** na fila (respeitando dependências), sem perguntar ao usuário o óbvio.
4. Implementar código/testes de verdade; caso o objetivo exija Rust nativo mas não exista toolchain, criar código+goldens e bloquear a certificação, sem fingir compilação. Buscar ambiente alternativo só quando necessário.
5. Salvar commit isolado, atualizar ledger+handoff+evidências, manter PR Draft sem merge e relatar SHA/QA.
6. Não avançar para nova fase sem o gate da anterior. Se impedido, próxima prioridade é remover o bloqueador.
7. Quando MIGRATION_CERTIFIED, mudar modo para RUST_CONTENT_PRODUCTION com decisão explícita e iniciar produção de skills/itens Rust.

**Próxima execução selecionada: M45 B02 — instalar/disponibilizar toolchain, executar cargo test/wasm32 e consolidar matriz de inventário triple-branch; registrar bloqueios reais.**
